<?php

declare(strict_types=1);

namespace App\Domains\Dashboard\Services;

use App\Domains\AuditLogs\Models\AuditLog;
use App\Domains\Documents\Models\Document;
use App\Domains\Feedback\Models\Feedback;
use App\Domains\News\Models\News;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use App\Domains\Organizations\Services\OrganizationScopeService;
use App\Domains\Services\Models\Service;
use App\Domains\Services\Models\ServiceStep;
use App\Domains\Users\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardMetricsService
{
    public function __construct(
        private readonly OrganizationScopeService $scopeService
    ) {}

    /**
     * Generate high-level KPI overview metrics scoped to the user's hierarchy.
     *
     * @return array<string, mixed>
     */
    public function getOverview(User $user): array
    {
        $allowedOrgIds = $this->scopeService->getAllowedOrganizationIds($user, includeDescendants: true);
        $isGlobal = $user->isSuperAdmin();

        // 1. Scope metadata
        $user->loadMissing(['role', 'organization']);
        $scope = [
            'role' => $user->role?->slug ?? 'unknown',
            'organization_id' => $user->organization_id,
            'organization_name' => $user->organization?->name,
            'is_global' => $isGlobal,
            'accessible_organizations_count' => $isGlobal
                ? Organization::count()
                : count($allowedOrgIds ?? []),
        ];

        // 2. Organizations summary
        $orgQuery = Organization::query();
        if (! $isGlobal) {
            $orgQuery->whereIn('id', $allowedOrgIds ?? []);
        }
        $orgStats = (clone $orgQuery)
            ->selectRaw("
                count(*) as total,
                sum(case when status = 'active' then 1 else 0 end) as active,
                sum(case when status != 'active' then 1 else 0 end) as inactive
            ")
            ->first();
        $totalOrgs = (int) ($orgStats->total ?? 0);
        $activeOrgs = (int) ($orgStats->active ?? 0);
        $inactiveOrgs = (int) ($orgStats->inactive ?? 0);

        // Group by organization_type_id to eliminate N+1 query loop
        $countsByType = (clone $orgQuery)
            ->groupBy('organization_type_id')
            ->select('organization_type_id', DB::raw('count(*) as count'))
            ->pluck('count', 'organization_type_id')
            ->toArray();

        $orgTypes = OrganizationType::all(['id', 'code']);
        $byType = [];
        foreach ($orgTypes as $type) {
            $byType[$type->code] = (int) ($countsByType[$type->id] ?? 0);
        }

        $organizationsSummary = [
            'total' => $totalOrgs,
            'active' => $activeOrgs,
            'inactive' => $inactiveOrgs,
            'by_type' => $byType,
        ];

        // 3. Users summary
        $userQuery = User::query();
        $this->scopeService->applyScope($userQuery, $user, 'organization_id', includeDescendants: true);

        $userStats = (clone $userQuery)
            ->selectRaw("
                count(*) as total,
                sum(case when status = 'active' then 1 else 0 end) as active,
                sum(case when status != 'active' then 1 else 0 end) as inactive,
                sum(case when must_change_password = true then 1 else 0 end) as must_change_password
            ")
            ->first();
        $totalUsers = (int) ($userStats->total ?? 0);
        $activeUsers = (int) ($userStats->active ?? 0);
        $inactiveUsers = (int) ($userStats->inactive ?? 0);
        $mustChangePassword = (int) ($userStats->must_change_password ?? 0);

        $byRole = (clone $userQuery)
            ->join('roles', 'users.role_id', '=', 'roles.id')
            ->groupBy('roles.slug')
            ->select('roles.slug', DB::raw('count(users.id) as user_count'))
            ->pluck('user_count', 'slug')
            ->toArray();

        $usersSummary = [
            'total' => $totalUsers,
            'active' => $activeUsers,
            'inactive' => $inactiveUsers,
            'must_change_password' => $mustChangePassword,
            'by_role' => $byRole,
        ];

        // 4. Services summary
        $serviceStats = Service::query()
            ->selectRaw('
                count(*) as total_services,
                sum(case when is_active = true then 1 else 0 end) as active_services,
                sum(case when parent_id is null then 1 else 0 end) as master_services,
                sum(case when parent_id is not null then 1 else 0 end) as subservices
            ')
            ->first();
        $totalServices = (int) ($serviceStats->total_services ?? 0);
        $activeServices = (int) ($serviceStats->active_services ?? 0);
        $masterServices = (int) ($serviceStats->master_services ?? 0);
        $subservices = (int) ($serviceStats->subservices ?? 0);

        $offeredQuery = DB::table('organization_services');
        if (! $isGlobal) {
            $offeredQuery->whereIn('organization_id', $allowedOrgIds ?? []);
        }
        $offeredCount = (clone $offeredQuery)->distinct('service_id')->count('service_id');

        $servicesSummary = [
            'total_catalog' => $totalServices,
            'active_catalog' => $activeServices,
            'master_services' => $masterServices,
            'subservices' => $subservices,
            'offered_services_in_scope' => $offeredCount,
        ];

        // 5. Documents summary
        $docStats = Document::query()
            ->selectRaw('
                count(*) as total_docs,
                sum(case when is_active = true then 1 else 0 end) as active_docs
            ')
            ->first();
        $totalDocs = (int) ($docStats->total_docs ?? 0);
        $activeDocs = (int) ($docStats->active_docs ?? 0);
        $mandatoryDocsCount = DB::table('service_documents')->where('is_mandatory', true)->count();

        $documentsSummary = [
            'total' => $totalDocs,
            'active' => $activeDocs,
            'mandatory_links_count' => $mandatoryDocsCount,
        ];

        // 6. Feedback summary
        $feedbackQuery = Feedback::query();
        $this->scopeService->applyScope($feedbackQuery, $user, 'feedback_for_organization', includeDescendants: true);

        $feedbackStats = (clone $feedbackQuery)
            ->selectRaw("
                count(*) as total,
                sum(case when feedback_type = 'complaint' then 1 else 0 end) as complaints,
                sum(case when feedback_type = 'feedback' then 1 else 0 end) as general_feedback,
                sum(case when feedback_type = 'satisfaction' then 1 else 0 end) as satisfaction,
                sum(case when created_at >= ? then 1 else 0 end) as recent
            ", [now()->subDays(30)])
            ->first();

        $totalFeedback = (int) ($feedbackStats->total ?? 0);
        $complaints = (int) ($feedbackStats->complaints ?? 0);
        $generalFeedback = (int) ($feedbackStats->general_feedback ?? 0);
        $satisfaction = (int) ($feedbackStats->satisfaction ?? 0);
        $recentFeedback = (int) ($feedbackStats->recent ?? 0);

        $feedbackSummary = [
            'total' => $totalFeedback,
            'by_type' => [
                'feedback' => $generalFeedback,
                'complaint' => $complaints,
                'satisfaction' => $satisfaction,
            ],
            'recent_last_30_days' => $recentFeedback,
        ];

        // 7. News summary
        $newsQuery = News::query();
        $this->scopeService->applyScope($newsQuery, $user, 'organization_id', includeDescendants: true);

        $newsStats = (clone $newsQuery)
            ->selectRaw('
                count(*) as total,
                sum(case when created_at >= ? then 1 else 0 end) as recent
            ', [now()->subDays(30)])
            ->first();

        $totalNews = (int) ($newsStats->total ?? 0);
        $recentNews = (int) ($newsStats->recent ?? 0);

        $newsSummary = [
            'total' => $totalNews,
            'recent_last_30_days' => $recentNews,
        ];

        return [
            'scope' => $scope,
            'organizations' => $organizationsSummary,
            'users' => $usersSummary,
            'services' => $servicesSummary,
            'documents' => $documentsSummary,
            'feedback' => $feedbackSummary,
            'news' => $newsSummary,
        ];
    }

    /**
     * Generate detailed citizen feedback analytics and trends report.
     *
     * @return array<string, mixed>
     */
    public function getFeedbackReport(
        User $user,
        ?string $startDate = null,
        ?string $endDate = null,
        ?int $organizationId = null
    ): array {
        $feedbackQuery = Feedback::query()->with('organization:id,name,code');

        if ($organizationId !== null) {
            $feedbackQuery->where('feedbacks.feedback_for_organization', $organizationId);
        } else {
            $this->scopeService->applyScope($feedbackQuery, $user, 'feedbacks.feedback_for_organization', includeDescendants: true);
        }

        if ($startDate) {
            $feedbackQuery->whereDate('feedbacks.created_at', '>=', Carbon::parse($startDate)->toDateString());
        }

        if ($endDate) {
            $feedbackQuery->whereDate('feedbacks.created_at', '<=', Carbon::parse($endDate)->toDateString());
        }

        $stats = (clone $feedbackQuery)
            ->selectRaw("
                count(*) as total,
                sum(case when feedback_type = 'complaint' then 1 else 0 end) as complaints,
                sum(case when feedback_type = 'feedback' then 1 else 0 end) as general,
                sum(case when feedback_type = 'satisfaction' then 1 else 0 end) as satisfaction
            ")
            ->first();

        $total = (int) ($stats->total ?? 0);
        $complaints = (int) ($stats->complaints ?? 0);
        $general = (int) ($stats->general ?? 0);
        $satisfaction = (int) ($stats->satisfaction ?? 0);

        $typeBreakdown = [
            [
                'type' => 'complaint',
                'label' => 'Complaints',
                'count' => $complaints,
                'percentage' => $total > 0 ? round(($complaints / $total) * 100, 1) : 0,
            ],
            [
                'type' => 'feedback',
                'label' => 'General Feedback',
                'count' => $general,
                'percentage' => $total > 0 ? round(($general / $total) * 100, 1) : 0,
            ],
            [
                'type' => 'satisfaction',
                'label' => 'Satisfaction Ratings',
                'count' => $satisfaction,
                'percentage' => $total > 0 ? round(($satisfaction / $total) * 100, 1) : 0,
            ],
        ];

        // Top organizations by feedback volume (join to eliminate N+1 queries)
        $orgBreakdown = (clone $feedbackQuery)
            ->join('organizations', 'feedbacks.feedback_for_organization', '=', 'organizations.id')
            ->select(
                'feedbacks.feedback_for_organization as organization_id',
                'organizations.name as organization_name',
                'organizations.code as organization_code',
                DB::raw('count(feedbacks.id) as count')
            )
            ->groupBy('feedbacks.feedback_for_organization', 'organizations.name', 'organizations.code')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->map(fn ($item) => [
                'organization_id' => (int) $item->organization_id,
                'organization_name' => $item->organization_name ?? 'Unknown',
                'organization_code' => $item->organization_code ?? 'unknown',
                'count' => (int) $item->count,
            ])
            ->all();

        // Recent 10 feedback items with eager loaded organization
        $recent = (clone $feedbackQuery)
            ->with('organization:id,name,code')
            ->latest('feedbacks.created_at')
            ->limit(10)
            ->get()
            ->map(fn (Feedback $fb) => [
                'id' => $fb->id,
                'tracking_number' => $fb->tracking_number,
                'feedback_type' => $fb->feedback_type,
                'content_snippet' => mb_substr((string) $fb->feedback_content, 0, 100).(mb_strlen((string) $fb->feedback_content) > 100 ? '...' : ''),
                'full_name' => $fb->full_name,
                'organization' => [
                    'id' => $fb->organization?->id,
                    'name' => $fb->organization?->name,
                    'code' => $fb->organization?->code,
                ],
                'created_at' => $fb->created_at?->toIso8601String(),
            ])
            ->all();

        return [
            'summary' => [
                'total_feedback' => $total,
                'complaints_count' => $complaints,
                'general_feedback_count' => $general,
                'satisfaction_count' => $satisfaction,
                'complaints_percentage' => $total > 0 ? round(($complaints / $total) * 100, 1) : 0,
            ],
            'type_breakdown' => $typeBreakdown,
            'top_organizations' => $orgBreakdown,
            'recent_feedback' => $recent,
        ];
    }

    /**
     * Generate service catalog analytics and delivery metrics report.
     *
     * @return array<string, mixed>
     */
    public function getServicesReport(User $user): array
    {
        $allowedOrgIds = $this->scopeService->getAllowedOrganizationIds($user, includeDescendants: true);
        $isGlobal = $user->isSuperAdmin();

        $serviceStats = Service::query()
            ->selectRaw('
                count(*) as total_services,
                sum(case when parent_id is null then 1 else 0 end) as master_services,
                sum(case when parent_id is not null then 1 else 0 end) as subservices,
                sum(case when is_active = true then 1 else 0 end) as active_services,
                sum(case when fee_amount is null or fee_amount = 0 then 1 else 0 end) as free_count,
                sum(case when fee_amount > 0 then 1 else 0 end) as paid_count,
                avg(case when fee_amount > 0 then fee_amount else null end) as avg_fee,
                max(case when fee_amount > 0 then fee_amount else null end) as max_fee,
                avg(estimated_duration_minutes) as avg_duration,
                min(estimated_duration_minutes) as min_duration,
                max(estimated_duration_minutes) as max_duration
            ')
            ->first();

        $totalServices = (int) ($serviceStats->total_services ?? 0);
        $masterServices = (int) ($serviceStats->master_services ?? 0);
        $subservices = (int) ($serviceStats->subservices ?? 0);
        $activeServices = (int) ($serviceStats->active_services ?? 0);
        $freeCount = (int) ($serviceStats->free_count ?? 0);
        $paidCount = (int) ($serviceStats->paid_count ?? 0);
        $avgFee = $serviceStats->avg_fee;
        $maxFee = $serviceStats->max_fee;
        $avgDuration = $serviceStats->avg_duration;
        $minDuration = $serviceStats->min_duration;
        $maxDuration = $serviceStats->max_duration;

        // Service steps metrics
        $totalSteps = ServiceStep::count();
        $avgStepsPerService = $totalServices > 0 ? round($totalSteps / $totalServices, 1) : 0;

        // Top services offered across the most organizations
        $topOfferedQuery = DB::table('organization_services')
            ->join('services', 'organization_services.service_id', '=', 'services.id');

        if (! $isGlobal) {
            $topOfferedQuery->whereIn('organization_services.organization_id', $allowedOrgIds ?? []);
        }

        $topOffered = $topOfferedQuery
            ->select('services.id', 'services.name', 'services.code', DB::raw('count(organization_services.organization_id) as offering_count'))
            ->groupBy('services.id', 'services.name', 'services.code')
            ->orderByDesc('offering_count')
            ->limit(10)
            ->get()
            ->map(fn ($item) => [
                'service_id' => $item->id,
                'name' => $item->name,
                'code' => $item->code,
                'offering_organizations_count' => (int) $item->offering_count,
            ])
            ->all();

        return [
            'summary' => [
                'total_services' => $totalServices,
                'master_services' => $masterServices,
                'subservices' => $subservices,
                'active_services' => $activeServices,
                'total_steps' => $totalSteps,
                'average_steps_per_service' => $avgStepsPerService,
            ],
            'fees_analysis' => [
                'free_services_count' => $freeCount,
                'paid_services_count' => $paidCount,
                'average_fee' => $avgFee !== null ? round((float) $avgFee, 2) : 0,
                'max_fee' => $maxFee !== null ? (float) $maxFee : 0,
                'currency' => 'ETB',
            ],
            'duration_analysis' => [
                'average_duration_minutes' => $avgDuration !== null ? round((float) $avgDuration, 1) : 0,
                'min_duration_minutes' => $minDuration !== null ? (int) $minDuration : 0,
                'max_duration_minutes' => $maxDuration !== null ? (int) $maxDuration : 0,
            ],
            'top_offered_services' => $topOffered,
        ];
    }

    /**
     * Generate organization hierarchy structure and coverage report.
     *
     * @return array<string, mixed>
     */
    public function getOrganizationsReport(User $user): array
    {
        $allowedOrgIds = $this->scopeService->getAllowedOrganizationIds($user, includeDescendants: true);
        $isGlobal = $user->isSuperAdmin();

        $orgQuery = Organization::query();
        if (! $isGlobal) {
            $orgQuery->whereIn('id', $allowedOrgIds ?? []);
        }

        $orgStats = (clone $orgQuery)
            ->selectRaw("
                count(*) as total,
                sum(case when status = 'active' then 1 else 0 end) as active,
                sum(case when status = 'inactive' then 1 else 0 end) as inactive,
                sum(case when status = 'suspended' then 1 else 0 end) as suspended,
                sum(case when parent_organization_id is null then 1 else 0 end) as root_units,
                sum(case when parent_organization_id is not null then 1 else 0 end) as child_units
            ")
            ->first();

        $total = (int) ($orgStats->total ?? 0);
        $active = (int) ($orgStats->active ?? 0);
        $inactive = (int) ($orgStats->inactive ?? 0);
        $suspended = (int) ($orgStats->suspended ?? 0);
        $rootUnits = (int) ($orgStats->root_units ?? 0);
        $childUnits = (int) ($orgStats->child_units ?? 0);

        // Group by organization_type_id in 1 query instead of looping N count queries
        $countsByType = (clone $orgQuery)
            ->groupBy('organization_type_id')
            ->select('organization_type_id', DB::raw('count(*) as count'))
            ->pluck('count', 'organization_type_id')
            ->toArray();

        $typeDistribution = OrganizationType::all(['id', 'name', 'code'])->map(function (OrganizationType $type) use ($countsByType, $total) {
            $count = (int) ($countsByType[$type->id] ?? 0);

            return [
                'type_id' => $type->id,
                'name' => $type->name,
                'code' => $type->code,
                'count' => $count,
                'percentage' => $total > 0 ? round(($count / $total) * 100, 1) : 0,
            ];
        })->all();

        // Top organizations by user / staff count
        $topByUsers = (clone $orgQuery)
            ->withCount('users')
            ->orderByDesc('users_count')
            ->limit(10)
            ->get()
            ->map(fn (Organization $org) => [
                'id' => $org->id,
                'name' => $org->name,
                'code' => $org->code,
                'users_count' => $org->users_count,
            ])
            ->all();

        return [
            'summary' => [
                'total_organizations' => $total,
                'active' => $active,
                'inactive' => $inactive,
                'suspended' => $suspended,
                'root_units' => $rootUnits,
                'child_units' => $childUnits,
            ],
            'type_distribution' => $typeDistribution,
            'top_by_users' => $topByUsers,
        ];
    }

    /**
     * Retrieve recent administrative activity scoped to the user's hierarchy.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getRecentActivity(
        User $user,
        int $limit = 15,
        ?string $entityType = null,
        ?string $action = null
    ): array {
        $limit = max(1, min(50, $limit));

        $query = AuditLog::query()
            ->with(['user:id,name,email,username', 'organization:id,name,code']);

        $this->scopeService->applyScope($query, $user, 'organization_id', includeDescendants: true);

        if ($entityType) {
            $query->where('entity_type', $entityType);
        }

        if ($action) {
            $query->where('action', $action);
        }

        return $query->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (AuditLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'entity_type' => $log->entity_type,
                'entity_id' => $log->entity_id,
                'actor' => [
                    'id' => $log->user?->id,
                    'name' => $log->user?->name ?? 'System',
                    'username' => $log->user?->username,
                    'email' => $log->user?->email,
                ],
                'organization' => [
                    'id' => $log->organization?->id,
                    'name' => $log->organization?->name,
                    'code' => $log->organization?->code,
                ],
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at?->toIso8601String(),
            ])
            ->all();
    }
}
