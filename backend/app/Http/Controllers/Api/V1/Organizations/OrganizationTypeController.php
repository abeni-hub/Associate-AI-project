<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Organizations;

use App\Domains\Organizations\Models\OrganizationType;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\OrganizationTypeResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationTypeController extends Controller
{
    /**
     * List all available organization types and their allowed parent relationships.
     */
    public function index(): JsonResponse
    {
        $types = OrganizationType::with('allowedParentTypes')
            ->orderBy('level')
            ->get();

        return ApiResponse::success(
            data: OrganizationTypeResource::collection($types),
            message: 'Organization types retrieved successfully.'
        );
    }

    /**
     * Create a new organization level / tier.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:organization_types,name'],
            'code' => ['required', 'string', 'max:100', 'unique:organization_types,code'],
            'description' => ['nullable', 'string', 'max:1000'],
            'level' => ['required', 'integer', 'min:1', 'max:20'],
            'can_be_root' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $type = OrganizationType::create($validated);

        return ApiResponse::success(
            data: new OrganizationTypeResource($type),
            message: 'Organization level created successfully.',
            statusCode: 201
        );
    }

    /**
     * Update an existing organization level / tier.
     */
    public function update(Request $request, OrganizationType $organizationType): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255', 'unique:organization_types,name,' . $organizationType->id],
            'code' => ['sometimes', 'string', 'max:100', 'unique:organization_types,code,' . $organizationType->id],
            'description' => ['nullable', 'string', 'max:1000'],
            'level' => ['sometimes', 'integer', 'min:1', 'max:20'],
            'can_be_root' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $organizationType->update($validated);

        return ApiResponse::success(
            data: new OrganizationTypeResource($organizationType->fresh()),
            message: 'Organization level updated successfully.'
        );
    }

    /**
     * Delete an organization level / tier.
     */
    public function destroy(OrganizationType $organizationType): JsonResponse
    {
        if ($organizationType->organizations()->exists()) {
            return ApiResponse::error(
                message: 'Cannot delete this organization level because active offices are currently assigned to it.',
                statusCode: 422
            );
        }

        $organizationType->delete();

        return ApiResponse::success(
            data: null,
            message: 'Organization level deleted successfully.'
        );
    }
}
