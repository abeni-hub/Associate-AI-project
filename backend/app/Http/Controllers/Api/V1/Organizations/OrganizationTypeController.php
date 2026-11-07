<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Organizations;

use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\OrganizationTypeResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
     * If rank exists, shifts it and subsequent tiers +1.
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

        $type = DB::transaction(function () use ($validated) {
            $newRank = (int) $validated['level'];

            // Shift existing levels at or below $newRank forward (+1)
            OrganizationType::where('level', '>=', $newRank)
                ->orderBy('level', 'desc')
                ->each(fn ($t) => $t->increment('level'));

            $validated['can_be_root'] = ($newRank === 1);
            $type = OrganizationType::create($validated);

            $this->resequenceAndNormalize();

            return $type;
        });

        return ApiResponse::success(
            data: new OrganizationTypeResource($type->fresh()),
            message: 'Organization level created successfully.',
            statusCode: 201
        );
    }

    /**
     * Update an existing organization level / tier.
     * Shifts other tiers to the front or back based on the new rank.
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

        DB::transaction(function () use ($organizationType, $validated) {
            $oldRank = (int) $organizationType->level;
            $newRank = isset($validated['level']) ? (int) $validated['level'] : $oldRank;

            if ($newRank !== $oldRank) {
                // Park current level temporarily to prevent collisions
                $organizationType->update(['level' => 9999]);

                if ($newRank < $oldRank) {
                    // Moving toward front (e.g. 3 to 1): shift intermediate tiers forward (+1)
                    OrganizationType::where('id', '!=', $organizationType->id)
                        ->whereBetween('level', [$newRank, $oldRank - 1])
                        ->orderBy('level', 'desc')
                        ->each(fn ($t) => $t->increment('level'));
                } else {
                    // Moving toward back (e.g. 1 to 2): shift intermediate tiers backward (-1)
                    // Makes the second one the first and shifts the rest
                    OrganizationType::where('id', '!=', $organizationType->id)
                        ->whereBetween('level', [$oldRank + 1, $newRank])
                        ->orderBy('level', 'asc')
                        ->each(fn ($t) => $t->decrement('level'));
                }
            }

            $organizationType->update($validated);
            $this->resequenceAndNormalize();
        });

        return ApiResponse::success(
            data: new OrganizationTypeResource($organizationType->fresh()),
            message: 'Organization level updated successfully.'
        );
    }

    /**
     * Delete an organization level / tier and collapse trailing ranks.
     */
    public function destroy(OrganizationType $organizationType): JsonResponse
    {
        if ($organizationType->organizations()->exists()) {
            return ApiResponse::error(
                message: 'Cannot delete this organization level because active offices are currently assigned to it.',
                statusCode: 422
            );
        }

        DB::transaction(function () use ($organizationType) {
            $trashedOrgIds = Organization::withTrashed()
                ->where('organization_type_id', $organizationType->id)
                ->pluck('id');

            if ($trashedOrgIds->isNotEmpty()) {
                Organization::withTrashed()
                    ->whereIn('parent_organization_id', $trashedOrgIds)
                    ->update(['parent_organization_id' => null]);

                Organization::withTrashed()
                    ->whereIn('id', $trashedOrgIds)
                    ->forceDelete();
            }

            $organizationType->delete();
            $this->resequenceAndNormalize();
        });

        return ApiResponse::success(
            data: null,
            message: 'Organization level deleted successfully.'
        );
    }

    /**
     * Ensure ranks are strictly contiguous (1..N) and tier 1 is flagged as root.
     */
    private function resequenceAndNormalize(): void
    {
        $types = OrganizationType::orderBy('level')->orderBy('id')->get();
        foreach ($types as $idx => $t) {
            $rank = $idx + 1;
            $isRoot = ($rank === 1);
            if ($t->level !== $rank || $t->can_be_root !== $isRoot) {
                $t->update([
                    'level' => $rank,
                    'can_be_root' => $isRoot,
                ]);
            }
        }
    }
}
