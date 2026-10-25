<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Organizations;

use App\Domains\Organizations\Models\OrganizationType;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\OrganizationTypeResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

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
}
