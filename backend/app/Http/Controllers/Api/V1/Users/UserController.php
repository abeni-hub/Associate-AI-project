<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Users;

use App\Domains\AuditLogs\Actions\RecordAuditLogAction;
use App\Domains\Organizations\Services\OrganizationScopeService;
use App\Domains\Users\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Users\AdminResetPasswordRequest;
use App\Http\Requests\Api\V1\Users\CreateUserRequest;
use App\Http\Requests\Api\V1\Users\UpdateUserRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function __construct(
        private readonly OrganizationScopeService $scopeService,
        private readonly RecordAuditLogAction $auditLogAction
    ) {}

    /**
     * List users with search, filtering, and organization hierarchy scoping.
     */
    public function index(Request $request): JsonResponse
    {
        $actor = $request->user();
        $query = User::with(['organization.type', 'role']);

        // 1. Scoping: Super Admin sees all; other roles see only users within their organization hierarchy
        if (! $actor->isSuperAdmin()) {
            $allowedOrgIds = $this->scopeService->getAllowedOrganizationIds($actor, includeDescendants: true);
            $query->whereIn('organization_id', $allowedOrgIds ?? []);
        }

        // 2. Filters
        if ($request->filled('search')) {
            $search = (string) $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('username', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('role_id')) {
            $query->where('role_id', (int) $request->input('role_id'));
        }

        if ($request->filled('organization_id')) {
            $query->where('organization_id', (int) $request->input('organization_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);
        $paginator = $query->orderBy('name')->paginate($perPage);

        return ApiResponse::paginated(
            paginator: $paginator,
            resourceClass: UserResource::class,
            message: 'Users retrieved successfully.'
        );
    }

    /**
     * Show single user profile.
     */
    public function show(Request $request, User $user): JsonResponse
    {
        $actor = $request->user();

        // Scope check
        if (! $actor->isSuperAdmin() && $user->organization_id) {
            if (! $this->scopeService->canAccessOrganization($actor, $user->organization_id, allowDescendants: true)) {
                return ApiResponse::error(
                    message: 'Forbidden. You do not have permission to view users in this organization.',
                    statusCode: 403
                );
            }
        }

        $user->loadMissing(['organization.type', 'role']);

        return ApiResponse::success(
            data: new UserResource($user),
            message: 'User retrieved successfully.'
        );
    }

    /**
     * Provision a new administrative or staff user.
     */
    public function store(CreateUserRequest $request): JsonResponse
    {
        $data = $request->validated();

        $data['password'] = Hash::make($data['password']);
        $data['status'] = $data['status'] ?? 'active';
        $data['must_change_password'] = $data['must_change_password'] ?? true;

        $user = User::create($data);
        $user->load(['organization.type', 'role']);

        $this->auditLogAction->execute(
            action: 'created',
            entity: $user,
            actor: $request->user(),
            newValues: $user->toArray(),
            request: $request
        );

        return ApiResponse::success(
            data: new UserResource($user),
            message: 'User created successfully.',
            statusCode: 201
        );
    }

    /**
     * Update an existing user.
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $oldValues = $user->toArray();
        $user->update($request->validated());
        $user->load(['organization.type', 'role']);

        $this->auditLogAction->execute(
            action: 'updated',
            entity: $user,
            actor: $request->user(),
            oldValues: $oldValues,
            newValues: $user->toArray(),
            request: $request
        );

        return ApiResponse::success(
            data: new UserResource($user),
            message: 'User updated successfully.'
        );
    }

    /**
     * Soft-delete a user.
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        $actor = $request->user();

        // 1. Cannot delete self
        if ($user->id === $actor->id) {
            return ApiResponse::error(
                message: 'You cannot delete your own account.',
                statusCode: 422
            );
        }

        // 2. Cannot delete the last remaining Super Admin
        if ($user->isSuperAdmin()) {
            if (! $actor->isSuperAdmin()) {
                return ApiResponse::error(
                    message: 'Forbidden. Only Super Admins can remove a Super Admin.',
                    statusCode: 403
                );
            }

            $superAdminCount = User::whereHas('role', fn ($q) => $q->where('slug', 'super_admin'))->count();
            if ($superAdminCount <= 1) {
                return ApiResponse::error(
                    message: 'Cannot delete the last remaining Super Admin in the system.',
                    statusCode: 422
                );
            }
        }

        // 3. Organization scope check
        if (! $actor->isSuperAdmin() && $user->organization_id) {
            if (! $this->scopeService->canAccessOrganization($actor, $user->organization_id, allowDescendants: true)) {
                return ApiResponse::error(
                    message: 'Forbidden. You do not have permission to delete users in this organization.',
                    statusCode: 403
                );
            }
        }

        $oldValues = $user->toArray();

        // Revoke active personal access tokens
        $user->tokens()->delete();
        $user->delete();

        $this->auditLogAction->execute(
            action: 'deleted',
            entity: $user,
            actor: $actor,
            oldValues: $oldValues,
            request: $request
        );

        return ApiResponse::success(
            data: null,
            message: 'User deleted successfully.'
        );
    }

    /**
     * Administrative password reset for a user.
     */
    public function resetPassword(AdminResetPasswordRequest $request, User $user): JsonResponse
    {
        $actor = $request->user();

        $user->forceFill([
            'password' => Hash::make((string) $request->input('password')),
            'must_change_password' => true,
        ])->save();

        // Revoke tokens on administrative password reset
        $user->tokens()->delete();

        $this->auditLogAction->execute(
            action: 'password_reset',
            entity: $user,
            actor: $actor,
            request: $request
        );

        return ApiResponse::success(
            data: null,
            message: 'User password reset successfully. User will be prompted to change password on next login.'
        );
    }
}
