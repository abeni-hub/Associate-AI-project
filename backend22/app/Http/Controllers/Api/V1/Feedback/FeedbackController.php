<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Feedback;

use App\Domains\AuditLogs\Actions\RecordAuditLogAction;
use App\Domains\Feedback\Actions\DeleteFeedbackAction;
use App\Domains\Feedback\Actions\RespondFeedbackAction;
use App\Domains\Feedback\Actions\SubmitFeedbackAction;
use App\Domains\Feedback\Actions\UpdateFeedbackAction;
use App\Domains\Feedback\DTOs\FeedbackData;
use App\Domains\Feedback\Models\Feedback;
use App\Domains\Organizations\Services\OrganizationScopeService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Feedback\RespondFeedbackRequest;
use App\Http\Requests\Api\V1\Feedback\SubmitFeedbackRequest;
use App\Http\Requests\Api\V1\Feedback\UpdateFeedbackRequest;
use App\Http\Resources\Api\V1\FeedbackResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FeedbackController extends Controller
{
    public function __construct(
        private readonly OrganizationScopeService $scopeService,
        private readonly SubmitFeedbackAction $submitAction,
        private readonly UpdateFeedbackAction $updateAction,
        private readonly RespondFeedbackAction $respondAction,
        private readonly DeleteFeedbackAction $deleteAction,
        private readonly RecordAuditLogAction $auditLogAction,
    ) {}

    /**
     * List feedback visible to the authenticated user along with its organization.
     *
     * Scoped to the user's own organization, plus descendant organizations
     * when the user holds the view-descendants permission.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $includeDescendants = $user->hasPermission('feedback.view_descendants');

        $query = Feedback::query()->with('organization:id,name,code');

        $this->scopeService->applyScope(
            $query,
            $user,
            'feedback_for_organization',
            $includeDescendants
        );

        if ($request->filled('feedback_type')) {
            $query->where('feedback_type', (string) $request->input('feedback_type'));
        }

        if ($request->filled('organization_id')) {
            $query->where('feedback_for_organization', (int) $request->input('organization_id'));
        }

        if ($request->filled('search')) {
            $search = (string) $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('feedback_content', 'ilike', "%{$search}%")
                    ->orWhere('full_name', 'ilike', "%{$search}%")
                    ->orWhere('tracking_number', 'ilike', "%{$search}%");
            });
        }

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);
        $paginator = $query->orderByDesc('created_at')->paginate($perPage);

        return ApiResponse::paginated(
            paginator: $paginator,
            resourceClass: FeedbackResource::class,
            message: 'Feedback retrieved successfully.'
        );
    }

    /**
     * Show a single feedback item.
     *
     * Scoped to the user's permitted organization hierarchy.
     */
    public function show(Request $request, Feedback $feedback): JsonResponse
    {
        $user = $request->user();
        $includeDescendants = $user->hasPermission('feedback.view_descendants');

        if (! $this->scopeService->canAccessOrganization($user, $feedback->feedback_for_organization, allowDescendants: $includeDescendants)) {
            return ApiResponse::error(
                message: 'You do not have permission to view this feedback.',
                statusCode: 403
            );
        }

        $feedback->loadMissing('organization:id,name,code');

        return ApiResponse::success(
            data: new FeedbackResource($feedback),
            message: 'Feedback retrieved successfully.'
        );
    }

    /**
     * Update a feedback item.
     *
     * Scoped to the user's permitted organization hierarchy.
     */
    public function update(UpdateFeedbackRequest $request, Feedback $feedback): JsonResponse
    {
        $user = $request->user();
        $includeDescendants = $user->hasPermission('feedback.view_descendants');

        if (! $this->scopeService->canAccessOrganization($user, $feedback->feedback_for_organization, allowDescendants: $includeDescendants)) {
            return ApiResponse::error(
                message: 'You do not have permission to update this feedback.',
                statusCode: 403
            );
        }

        $validated = $request->validated();

        if (array_key_exists('feedback_for_organization', $validated)) {
            if (! $this->scopeService->canAccessOrganization($user, (int) $validated['feedback_for_organization'], allowDescendants: $includeDescendants)) {
                return ApiResponse::error(
                    message: 'You do not have permission to reassign feedback to this organization.',
                    statusCode: 403
                );
            }
        }

        $updated = DB::transaction(function () use ($feedback, $validated, $user, $request) {
            $oldValues = $feedback->toArray();
            $updated = $this->updateAction->execute($feedback, $validated);

            $this->auditLogAction->execute(
                action: 'updated',
                entity: $updated,
                actor: $user,
                oldValues: $oldValues,
                newValues: $updated->toArray(),
                request: $request
            );

            return $updated;
        });

        return ApiResponse::success(
            data: new FeedbackResource($updated),
            message: 'Feedback updated successfully.'
        );
    }

    /**
     * Respond to a feedback item.
     *
     * Scoped to the user's permitted organization hierarchy.
     */
    public function respond(RespondFeedbackRequest $request, Feedback $feedback): JsonResponse
    {
        $user = $request->user();
        $includeDescendants = $user->hasPermission('feedback.view_descendants');

        if (! $this->scopeService->canAccessOrganization($user, $feedback->feedback_for_organization, allowDescendants: $includeDescendants)) {
            return ApiResponse::error(
                message: 'You do not have permission to respond to this feedback.',
                statusCode: 403
            );
        }

        $responded = DB::transaction(function () use ($feedback, $request, $user) {
            $oldValues = $feedback->toArray();
            $responseText = (string) $request->validated('response');
            $responded = $this->respondAction->execute($feedback, $responseText);

            $this->auditLogAction->execute(
                action: 'responded',
                entity: $responded,
                actor: $user,
                oldValues: $oldValues,
                newValues: array_merge($responded->toArray(), ['response' => $responseText]),
                request: $request
            );

            return $responded;
        });

        return ApiResponse::success(
            data: new FeedbackResource($responded),
            message: 'Feedback response recorded successfully.'
        );
    }

    /**
     * Delete a feedback item.
     *
     * Scoped to the user's permitted organization hierarchy.
     */
    public function destroy(Request $request, Feedback $feedback): JsonResponse
    {
        $user = $request->user();
        $includeDescendants = $user->hasPermission('feedback.view_descendants');

        if (! $this->scopeService->canAccessOrganization($user, $feedback->feedback_for_organization, allowDescendants: $includeDescendants)) {
            return ApiResponse::error(
                message: 'You do not have permission to delete this feedback.',
                statusCode: 403
            );
        }

        DB::transaction(function () use ($feedback, $user, $request) {
            $oldValues = $feedback->toArray();
            $this->deleteAction->execute($feedback);

            $this->auditLogAction->execute(
                action: 'deleted',
                entity: $feedback,
                actor: $user,
                oldValues: $oldValues,
                request: $request
            );
        });

        return ApiResponse::success(
            data: null,
            message: 'Feedback deleted successfully.'
        );
    }

    /**
     * Store a publicly submitted feedback entry.
     *
     * Publicly accessible without authentication.
     */
    public function store(SubmitFeedbackRequest $request): JsonResponse
    {
        $data = FeedbackData::fromRequest($request);

        $feedback = DB::transaction(function () use ($data, $request) {
            $feedback = $this->submitAction->execute($data);

            $this->auditLogAction->execute(
                action: 'submitted',
                entity: $feedback,
                actor: $request->user(),
                newValues: $feedback->toArray(),
                request: $request
            );

            return $feedback;
        });

        return ApiResponse::success(
            data: new FeedbackResource($feedback),
            message: 'Feedback submitted successfully.',
            statusCode: 201
        );
    }
}
