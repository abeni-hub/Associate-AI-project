<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Authorization;

use App\Domains\Authorization\Models\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Authorization\SyncRolePermissionsRequest;
use App\Http\Resources\Api\V1\RoleResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    /**
     * List all platform roles with search and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Role::withCount('permissions')
            ->orderBy('id');

        if ($request->filled('search')) {
            $search = (string) $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('slug', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);
        $paginator = $query->paginate($perPage);

        return ApiResponse::paginated(
            paginator: $paginator,
            message: 'Roles retrieved successfully.',
            resourceClass: RoleResource::class
        );
    }

    /**
     * Show a single role with its assigned permissions.
     */
    public function show(Role $role): JsonResponse
    {
        $role->load('permissions');

        return ApiResponse::success(
            data: new RoleResource($role),
            message: 'Role retrieved successfully.'
        );
    }

    /**
     * Synchronize permissions for a role.
     */
    public function updatePermissions(SyncRolePermissionsRequest $request, Role $role): JsonResponse
    {
        if ($role->slug === 'super_admin') {
            return ApiResponse::error(
                message: 'Super Admin permissions cannot be modified.',
                statusCode: 422
            );
        }

        DB::transaction(function () use ($role, $request) {
            $role->permissions()->sync($request->validated('permission_ids'));
            $role->load('permissions');
        });

        return ApiResponse::success(
            data: new RoleResource($role),
            message: 'Role permissions updated successfully.'
        );
    }
}
