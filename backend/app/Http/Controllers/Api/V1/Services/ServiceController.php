<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Services;

use App\Domains\AuditLogs\Actions\RecordAuditLogAction;
use App\Domains\Organizations\Services\OrganizationScopeService;
use App\Domains\Services\Models\Service;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Services\CreateServiceRequest;
use App\Http\Requests\Api\V1\Services\SyncOfferingOrganizationsRequest;
use App\Http\Requests\Api\V1\Services\SyncServiceDocumentsRequest;
use App\Http\Requests\Api\V1\Services\UpdateServiceRequest;
use App\Http\Resources\Api\V1\ServiceResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ServiceController extends Controller
{
    public function __construct(
        private readonly OrganizationScopeService $scopeService,
        private readonly RecordAuditLogAction $auditLogAction
    ) {}

    /**
     * List services and subservices with search, organization scoping, and hierarchical tree support.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user() ?? auth('sanctum')->user();
        $isSuperAdmin = $user && $user->isSuperAdmin();
        $targetOrgIds = null;

        if ($isSuperAdmin) {
            // Super Admin: sees all services across the entire platform by default.
            // Can optionally filter down to any specific organization if provided in the request.
            if ($request->filled('organization_id')) {
                $targetOrgIds = [(int) $request->input('organization_id')];
            }
        } elseif ($user && $user->organization_id) {
            // Organization-level user (Subcity Admin, Bureau Admin, Woreda Admin, Staff):
            // Scoped strictly to their assigned organization and all child descendant offices.
            $allowedOrgIds = $this->scopeService->getAllowedOrganizationIds($user, includeDescendants: true) ?? [];
            if ($request->filled('organization_id')) {
                $requestedOrgId = (int) $request->input('organization_id');
                $targetOrgIds = in_array($requestedOrgId, $allowedOrgIds, true) ? [$requestedOrgId] : [-1];
            } else {
                $targetOrgIds = $allowedOrgIds;
            }
        } elseif ($request->filled('organization_id')) {
            // Public citizen filtering by an organization / sub-city
            $targetOrgIds = [(int) $request->input('organization_id')];
        }

        $subservicesLoader = function ($sq) use ($targetOrgIds, $user) {
            if ($targetOrgIds !== null) {
                $sq->where(function ($subQ) use ($targetOrgIds) {
                    $subQ->whereIn('organization_id', $targetOrgIds)
                        ->orWhereHas('offeringOrganizations', fn ($o) => $o->whereIn('organizations.id', $targetOrgIds));
                });
            }
            if (! $user || ! $user->hasPermission('services.update')) {
                $sq->where('is_active', true);
            }
            $sq->with([
                'organization',
                'parent',
                'steps.organization',
                'requiredDocuments',
                'offeringOrganizations.type',
            ])->withCount(['requiredDocuments', 'offeringOrganizations', 'steps'])
            ->orderBy('name');
        };

        $query = Service::with([
            'organization',
            'parent',
            'steps.organization',
            'requiredDocuments',
            'offeringOrganizations.type',
            'subservices' => $subservicesLoader,
        ])->withCount(['subservices', 'requiredDocuments', 'offeringOrganizations', 'steps']);

        // Public citizens only see active services unless caller has management rights
        if (! $user || ! $user->hasPermission('services.update')) {
            $query->where('is_active', true);
        } elseif ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        // Apply organization scoping
        if ($targetOrgIds !== null) {
            $query->where(function ($q) use ($targetOrgIds) {
                $q->whereIn('organization_id', $targetOrgIds)
                    ->orWhereHas('offeringOrganizations', fn ($o) => $o->whereIn('organizations.id', $targetOrgIds))
                    ->orWhereHas('subservices', function ($sq) use ($targetOrgIds) {
                        $sq->whereIn('organization_id', $targetOrgIds)
                            ->orWhereHas('offeringOrganizations', fn ($o) => $o->whereIn('organizations.id', $targetOrgIds));
                    });
            });
        }

        // Search
        if ($request->filled('search')) {
            $search = (string) $request->input('search');
            $like = \Illuminate\Support\Facades\DB::connection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';
            $query->where(function ($q) use ($search, $like) {
                $q->where('name', $like, "%{$search}%")
                    ->orWhere('code', $like, "%{$search}%")
                    ->orWhere('description', $like, "%{$search}%")
                    ->orWhereHas('subservices', function ($sq) use ($search, $like) {
                        $sq->where('name', $like, "%{$search}%")
                            ->orWhere('code', $like, "%{$search}%");
                    });
            });
        }

        // Tree view mode: return master root services with their child subservices nested
        if ($request->boolean('tree') || $request->input('view') === 'tree') {
            $query->whereNull('parent_id');
        } elseif ($request->has('parent_id')) {
            $parentId = $request->input('parent_id');
            if ($parentId === 'null' || $parentId === 'root') {
                $query->whereNull('parent_id');
            } elseif ($parentId === 'subservices') {
                $query->whereNotNull('parent_id');
            } else {
                $query->where('parent_id', (int) $parentId);
            }
        }

        // Filter by fee
        if ($request->filled('fee')) {
            $feeType = (string) $request->input('fee');
            if ($feeType === 'free') {
                $query->where('fee_amount', 0);
            } elseif ($feeType === 'paid') {
                $query->where('fee_amount', '>', 0);
            }
        }

        $perPageInput = $request->input('per_page');
        if ($perPageInput === 'all' || $request->boolean('all') || $request->boolean('tree') || $request->input('view') === 'tree') {
            $perPage = 250;
        } else {
            $perPage = min(max((int) ($perPageInput ?? 100), 1), 250);
        }

        $paginator = $query->orderBy('name')->paginate($perPage);

        return ApiResponse::paginated(
            paginator: $paginator,
            message: 'Services retrieved successfully.',
            resourceClass: ServiceResource::class
        );
    }

    /**
     * Show detailed service profile (lookup by ID or unique code slug).
     */
    public function show(Request $request, string $identifier): JsonResponse
    {
        $query = Service::with([
            'parent',
            'organization',
            'subservices.requiredDocuments',
            'requiredDocuments',
            'offeringOrganizations.type',
            'steps.organization',
        ])->withCount(['subservices', 'requiredDocuments', 'offeringOrganizations', 'steps']);

        $service = is_numeric($identifier)
            ? $query->where('id', (int) $identifier)->first()
            : $query->where('code', $identifier)->first();

        if (! $service) {
            return ApiResponse::error(
                message: 'Service not found.',
                statusCode: 404
            );
        }

        if (! $service->is_active) {
            $user = $request->user() ?? auth('sanctum')->user();
            if (! $user || ! $user->hasPermission('services.update')) {
                return ApiResponse::error(
                    message: 'Service not found.',
                    statusCode: 404
                );
            }
        }

        return ApiResponse::success(
            data: new ServiceResource($service),
            message: 'Service retrieved successfully.'
        );
    }

    /**
     * Create a new service or subservice.
     */
    public function store(CreateServiceRequest $request): JsonResponse
    {
        $data = $request->validated();
        $documents = $data['documents'] ?? null;
        unset($data['documents']);

        $data['is_active'] = $data['is_active'] ?? true;
        $data['fee_amount'] = $data['fee_amount'] ?? 0.00;
        $data['fee_currency'] = $data['fee_currency'] ?? 'ETB';

        $service = Service::create($data);

        if (is_array($documents) && count($documents) > 0) {
            $syncData = [];
            foreach ($documents as $doc) {
                $docId = is_array($doc) ? ($doc['document_id'] ?? null) : (int) $doc;
                if ($docId) {
                    $syncData[$docId] = [
                        'is_mandatory' => is_array($doc) ? ($doc['is_mandatory'] ?? true) : true,
                        'order_column' => is_array($doc) ? ($doc['order_column'] ?? 1) : 1,
                        'notes' => is_array($doc) ? ($doc['notes'] ?? null) : null,
                    ];
                }
            }
            if (!empty($syncData)) {
                $service->requiredDocuments()->sync($syncData);
            }
        }

        $service->load(['parent', 'organization', 'requiredDocuments']);

        $this->auditLogAction->execute(
            action: 'created',
            entity: $service,
            actor: $request->user(),
            newValues: $service->toArray(),
            request: $request
        );

        return ApiResponse::success(
            data: new ServiceResource($service),
            message: 'Service created successfully.',
            statusCode: 201
        );
    }

    /**
     * Update an existing service.
     */
    public function update(UpdateServiceRequest $request, Service $service): JsonResponse
    {
        $oldValues = $service->toArray();
        $data = $request->validated();

        if (array_key_exists('documents', $data)) {
            $documents = $data['documents'];
            unset($data['documents']);
            if (is_array($documents)) {
                $syncData = [];
                foreach ($documents as $doc) {
                    $docId = is_array($doc) ? ($doc['document_id'] ?? null) : (int) $doc;
                    if ($docId) {
                        $syncData[$docId] = [
                            'is_mandatory' => is_array($doc) ? ($doc['is_mandatory'] ?? true) : true,
                            'order_column' => is_array($doc) ? ($doc['order_column'] ?? 1) : 1,
                            'notes' => is_array($doc) ? ($doc['notes'] ?? null) : null,
                        ];
                    }
                }
                $service->requiredDocuments()->sync($syncData);
            }
        }

        $service->update($data);
        $service->load(['parent', 'organization', 'requiredDocuments']);

        $this->auditLogAction->execute(
            action: 'updated',
            entity: $service,
            actor: $request->user(),
            oldValues: $oldValues,
            newValues: $service->toArray(),
            request: $request
        );

        return ApiResponse::success(
            data: new ServiceResource($service),
            message: 'Service updated successfully.'
        );
    }

    /**
     * Soft-delete a service.
     */
    public function destroy(Request $request, Service $service): JsonResponse
    {
        // Prevent deleting a master service that still has active subservices
        if ($service->subservices()->exists()) {
            return ApiResponse::error(
                message: 'Cannot delete service with active subservices. Delete or reassign subservices first.',
                statusCode: 422
            );
        }

        $oldValues = $service->toArray();
        $service->delete();

        $this->auditLogAction->execute(
            action: 'deleted',
            entity: $service,
            actor: $request->user(),
            oldValues: $oldValues,
            request: $request
        );

        return ApiResponse::success(
            data: null,
            message: 'Service deleted successfully.'
        );
    }

    /**
     * Link/sync required documents for a service.
     */
    public function syncDocuments(SyncServiceDocumentsRequest $request, Service $service): JsonResponse
    {
        $syncData = [];
        foreach ($request->validated('documents') as $doc) {
            $syncData[$doc['document_id']] = [
                'is_mandatory' => $doc['is_mandatory'] ?? true,
                'order_column' => $doc['order_column'] ?? 1,
                'notes' => $doc['notes'] ?? null,
            ];
        }

        DB::transaction(function () use ($service, $syncData, $request) {
            $service->requiredDocuments()->sync($syncData);
            $service->load('requiredDocuments');

            $this->auditLogAction->execute(
                action: 'synced_documents',
                entity: $service,
                actor: $request->user(),
                newValues: $syncData,
                request: $request
            );
        });

        return ApiResponse::success(
            data: new ServiceResource($service),
            message: 'Required documents updated successfully.'
        );
    }

    /**
     * Assign/sync organizations offering this service.
     */
    public function syncOrganizations(SyncOfferingOrganizationsRequest $request, Service $service): JsonResponse
    {
        $syncData = [];
        foreach ($request->validated('organizations') as $org) {
            $syncData[$org['organization_id']] = [
                'is_available' => $org['is_available'] ?? true,
            ];
        }

        DB::transaction(function () use ($service, $syncData, $request) {
            $service->offeringOrganizations()->sync($syncData);
            $service->load('offeringOrganizations');

            $this->auditLogAction->execute(
                action: 'synced_organizations',
                entity: $service,
                actor: $request->user(),
                newValues: $syncData,
                request: $request
            );
        });

        return ApiResponse::success(
            data: new ServiceResource($service),
            message: 'Offering organizations updated successfully.'
        );
    }
}
