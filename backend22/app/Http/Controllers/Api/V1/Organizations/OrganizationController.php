<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Organizations;

use App\Domains\AuditLogs\Actions\RecordAuditLogAction;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Services\OrganizationScopeService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Organizations\CreateOrganizationRequest;
use App\Http\Requests\Api\V1\Organizations\UpdateOrganizationRequest;
use App\Http\Resources\Api\V1\OrganizationResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationController extends Controller
{
    public function __construct(
        private readonly OrganizationScopeService $scopeService,
        private readonly RecordAuditLogAction $auditLogAction
    ) {}

    /**
     * List organizations with filtering, search, and hierarchy data scoping.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Organization::with(['type', 'parent.type'])
            ->withCount(['children', 'users']);

        // 1. Apply organization hierarchy data scoping (Super Admin = all; others = own + descendants)
        $this->scopeService->applyScope($query, $user, 'id', includeDescendants: true);

        // 2. Filters
        if ($request->filled('search')) {
            $search = (string) $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('code', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $typeCode = (string) $request->input('type');
            $query->whereHas('type', fn ($q) => $q->where('code', $typeCode));
        }

        if ($request->filled('type_id')) {
            $query->where('organization_type_id', (int) $request->input('type_id'));
        }

        if ($request->filled('parent_id')) {
            $parentId = $request->input('parent_id');
            if ($parentId === 'null' || $parentId === 'root') {
                $query->whereNull('parent_organization_id');
            } else {
                $query->where('parent_organization_id', (int) $parentId);
            }
        }

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);
        $paginator = $query->orderBy('name')->paginate($perPage);

        return ApiResponse::paginated(
            paginator: $paginator,
            resourceClass: OrganizationResource::class,
            message: 'Organizations retrieved successfully.'
        );
    }

    /**
     * Get the full organizational hierarchy tree scoped to the user.
     */
    public function tree(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isSuperAdmin()) {
            // Root organizations with nested descendants
            $roots = Organization::whereNull('parent_organization_id')
                ->with(['type', 'children.type', 'children.children.type'])
                ->withCount(['children', 'users'])
                ->orderBy('name')
                ->get();
        } else {
            // Start from the user's root in their scope
            $userOrg = $user->organization ?? Organization::find($user->organization_id);

            if (! $userOrg) {
                $roots = collect();
            } else {
                $roots = Organization::where('id', $userOrg->id)
                    ->with(['type', 'children.type', 'children.children.type'])
                    ->withCount(['children', 'users'])
                    ->get();
            }
        }

        return ApiResponse::success(
            data: OrganizationResource::collection($roots),
            message: 'Organization hierarchy tree retrieved successfully.'
        );
    }

    /**
     * Show a single organization profile.
     */
    public function show(Request $request, Organization $organization): JsonResponse
    {
        $user = $request->user();

        if (! $this->scopeService->canAccessOrganization($user, $organization, allowDescendants: true)) {
            return ApiResponse::error(
                message: 'Forbidden. You do not have permission to view this organization.',
                statusCode: 403
            );
        }

        $organization->load(['type', 'parent.type', 'children.type'])
            ->loadCount(['children', 'users']);

        return ApiResponse::success(
            data: new OrganizationResource($organization),
            message: 'Organization retrieved successfully.'
        );
    }

    /**
     * Store a newly created organization.
     */
    public function store(CreateOrganizationRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['status'] = $data['status'] ?? 'active';

        $organization = Organization::create($data);
        $organization->load(['type', 'parent.type']);

        $this->auditLogAction->execute(
            action: 'created',
            entity: $organization,
            actor: $request->user(),
            newValues: $organization->toArray(),
            request: $request
        );

        return ApiResponse::success(
            data: new OrganizationResource($organization),
            message: 'Organization created successfully.',
            statusCode: 201
        );
    }

    /**
     * Update an existing organization.
     */
    public function update(UpdateOrganizationRequest $request, Organization $organization): JsonResponse
    {
        $user = $request->user();

        if (! $this->scopeService->canManageOrganization($user, $organization)) {
            return ApiResponse::error(
                message: 'Forbidden. You do not have permission to modify this organization.',
                statusCode: 403
            );
        }

        $oldValues = $organization->toArray();
        $organization->update($request->validated());
        $organization->load(['type', 'parent.type']);

        $this->auditLogAction->execute(
            action: 'updated',
            entity: $organization,
            actor: $user,
            oldValues: $oldValues,
            newValues: $organization->toArray(),
            request: $request
        );

        return ApiResponse::success(
            data: new OrganizationResource($organization),
            message: 'Organization updated successfully.'
        );
    }

    /**
     * Soft-delete an organization.
     */
    public function destroy(Request $request, Organization $organization): JsonResponse
    {
        $user = $request->user();

        if (! $this->scopeService->canManageOrganization($user, $organization)) {
            return ApiResponse::error(
                message: 'Forbidden. You do not have permission to delete this organization.',
                statusCode: 403
            );
        }

        // Integrity Rule: Cannot delete an organization that has active child organizations
        if ($organization->children()->exists()) {
            return ApiResponse::error(
                message: 'Cannot delete organization because it has existing child units. Reassign or remove child units first.',
                statusCode: 422
            );
        }

        // Integrity Rule: Cannot delete an organization that has active users assigned
        if ($organization->users()->exists()) {
            return ApiResponse::error(
                message: 'Cannot delete organization because active users are assigned to it. Reassign users first.',
                statusCode: 422
            );
        }

        $oldValues = $organization->toArray();
        $organization->delete();

        $this->auditLogAction->execute(
            action: 'deleted',
            entity: $organization,
            actor: $user,
            oldValues: $oldValues,
            request: $request
        );

        return ApiResponse::success(
            data: null,
            message: 'Organization deleted successfully.'
        );
    }
}
