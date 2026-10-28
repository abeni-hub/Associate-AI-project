<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Authorization;

use App\Domains\Authorization\Models\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Authorization\SyncRolePermissionsRequest;
use App\Http\Resources\Api\V1\RoleResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    /**
     * List all platform roles.
     */
    public function index(): JsonResponse
    {
        $roles = Role::withCount('permissions')
            ->orderBy('id')
            ->get();

        return ApiResponse::success(
            data: RoleResource::collection($roles),
            message: 'Roles retrieved successfully.'
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

        $role->permissions()->sync($request->validated('permission_ids'));
        $role->load('permissions');

        return ApiResponse::success(
            data: new RoleResource($role),
            message: 'Role permissions updated successfully.'
        );
    }
}
