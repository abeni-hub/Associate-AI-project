<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Authorization;

use App\Domains\Authorization\Models\Permission;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\PermissionResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
    /**
     * List all system permissions.
     */
    public function index(): JsonResponse
    {
        $permissions = Permission::orderBy('group')
            ->orderBy('name')
            ->get();

        return ApiResponse::success(
            data: PermissionResource::collection($permissions),
            message: 'Permissions retrieved successfully.'
        );
    }
}
