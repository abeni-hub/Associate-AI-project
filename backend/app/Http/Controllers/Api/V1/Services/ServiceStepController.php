<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Services;

use App\Domains\Organizations\Services\OrganizationScopeService;
use App\Domains\Services\Models\Service;
use App\Domains\Services\Models\ServiceStep;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ServiceSteps\CreateServiceStepRequest;
use App\Http\Requests\Api\V1\ServiceSteps\ReorderServiceStepsRequest;
use App\Http\Requests\Api\V1\ServiceSteps\UpdateServiceStepRequest;
use App\Http\Resources\Api\V1\ServiceStepResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ServiceStepController extends Controller
{
    /**
     * Resolve service model from numeric ID or string slug/code.
     */
    protected function resolveService(string $identifier): Service
    {
        $service = is_numeric($identifier)
            ? Service::find((int) $identifier)
            : Service::where('code', $identifier)->first();

        if (! $service) {
            throw new NotFoundHttpException("The service [{$identifier}] could not be found.");
        }

        return $service;
    }

    /**
     * List physical room-by-room navigation steps for a service.
     * Supports organization-specific routing (e.g. unique rooms per Sub-city office)
     * with graceful fallback to default service templates.
     */
    public function index(Request $request, string $service): JsonResponse
    {
        $serviceModel = $this->resolveService($service);

        $query = $serviceModel->steps()->with('organization');

        // Citizens / unauthenticated users only view active steps
        $user = $request->user();
        if (! $user || ! $user->hasPermission('service_steps.manage')) {
            $query->active();
        }

        // Optional filtering by organization office
        if ($request->has('organization_id')) {
            $rawOrgId = $request->input('organization_id');
            $orgId = ($rawOrgId !== null && $rawOrgId !== 'all' && $rawOrgId !== '') ? (int) $rawOrgId : null;

            if ($orgId !== null) {
                // Check if specific physical steps exist for this organization branch
                $hasBranchSteps = (clone $query)->where('organization_id', $orgId)->exists();
                if ($hasBranchSteps) {
                    $query->where('organization_id', $orgId);
                } else {
                    // Fall back to template steps or primary bureau steps
                    $query->where(function ($q) use ($serviceModel) {
                        $q->whereNull('organization_id')
                            ->orWhere('organization_id', $serviceModel->organization_id);
                    });
                }
            } else {
                $query->whereNull('organization_id');
            }
        }

        $steps = $query->ordered()->get();

        return ApiResponse::success(
            data: ServiceStepResource::collection($steps),
            message: 'Service steps retrieved successfully.'
        );
    }

    /**
     * Show a single service step.
     */
    public function show(Request $request, string $service, ServiceStep $step): JsonResponse
    {
        $serviceModel = $this->resolveService($service);

        if ($step->service_id !== $serviceModel->id) {
            throw new NotFoundHttpException('Step not found for this service.');
        }

        $user = $request->user();
        if (! $step->is_active && (! $user || ! $user->hasPermission('service_steps.manage'))) {
            throw new NotFoundHttpException('Step not found or inactive.');
        }

        $step->loadMissing('organization');

        return ApiResponse::success(
            data: new ServiceStepResource($step),
            message: 'Service step retrieved successfully.'
        );
    }

    /**
     * Create a new room instruction step for a service.
     */
    public function store(CreateServiceStepRequest $request, string $service): JsonResponse
    {
        $serviceModel = $this->resolveService($service);

        $data = $request->validated();

        if (empty($data['step_number'])) {
            $maxStep = $serviceModel->steps()
                ->where('organization_id', $data['organization_id'] ?? null)
                ->max('step_number') ?? 0;
            $data['step_number'] = $maxStep + 1;
        }

        /** @var ServiceStep $step */
        $step = $serviceModel->steps()->create($data);
        $step->load('organization');

        return ApiResponse::success(
            data: new ServiceStepResource($step),
            message: 'Service step created successfully.',
            statusCode: 201
        );
    }

    /**
     * Update an existing service step.
     */
    public function update(UpdateServiceStepRequest $request, string $service, ServiceStep $step): JsonResponse
    {
        $serviceModel = $this->resolveService($service);

        if ($step->service_id !== $serviceModel->id) {
            throw new NotFoundHttpException('Step not found for this service.');
        }

        $step->update($request->validated());
        $step->load('organization');

        return ApiResponse::success(
            data: new ServiceStepResource($step),
            message: 'Service step updated successfully.'
        );
    }

    /**
     * Delete a service step.
     */
    public function destroy(
        Request $request,
        OrganizationScopeService $scopeService,
        string $service,
        ServiceStep $step
    ): JsonResponse {
        $serviceModel = $this->resolveService($service);

        if ($step->service_id !== $serviceModel->id) {
            throw new NotFoundHttpException('Step not found for this service.');
        }

        if ($step->organization_id !== null && ! $scopeService->canManageOrganization($request->user(), $step->organization_id)) {
            return ApiResponse::error(
                message: 'Forbidden. You cannot manage steps for this organization.',
                statusCode: 403
            );
        }

        $step->delete();

        return ApiResponse::success(
            data: null,
            message: 'Service step deleted successfully.'
        );
    }

    /**
     * Reorder steps sequentially for a service.
     */
    public function reorder(ReorderServiceStepsRequest $request, string $service): JsonResponse
    {
        $serviceModel = $this->resolveService($service);
        $stepOrderList = $request->validated('steps');

        DB::transaction(function () use ($serviceModel, $stepOrderList) {
            foreach ($stepOrderList as $item) {
                ServiceStep::where('id', $item['id'])
                    ->where('service_id', $serviceModel->id)
                    ->update(['step_number' => $item['step_number']]);
            }
        });

        $steps = $serviceModel->steps()->with('organization')->ordered()->get();

        return ApiResponse::success(
            data: ServiceStepResource::collection($steps),
            message: 'Service steps reordered successfully.'
        );
    }

    /**
     * Synchronize full sequence of room instruction steps for a service.
     */
    public function sync(Request $request, string $service): JsonResponse
    {
        $serviceModel = $this->resolveService($service);

        // Sanitize incoming organization_id
        $rawOrgId = $request->input('organization_id');
        $sanitizedOrgId = ($rawOrgId !== null && $rawOrgId !== '' && $rawOrgId !== 'all' && is_numeric($rawOrgId) && (int) $rawOrgId > 0)
            ? (int) $rawOrgId
            : null;

        // Sanitize incoming steps list: filter out completely empty entries and autofill missing titles
        $rawSteps = $request->input('steps');
        $cleanSteps = [];
        if (is_array($rawSteps)) {
            $stepCounter = 1;
            foreach ($rawSteps as $st) {
                if (! is_array($st)) continue;

                $room = trim((string) ($st['room_number'] ?? $st['room'] ?? ''));
                $title = trim((string) ($st['title'] ?? ''));
                $instruction = trim((string) ($st['instruction'] ?? $st['detail'] ?? ''));
                $floor = trim((string) ($st['floor'] ?? ''));
                $building = trim((string) ($st['building'] ?? ''));
                $department = trim((string) ($st['department_name'] ?? $st['department'] ?? ''));

                // Skip entirely blank step entries
                if ($room === '' && $title === '' && $instruction === '' && $floor === '') {
                    continue;
                }

                $effectiveTitle = $title !== '' ? $title : ($room !== '' ? $room : "Step {$stepCounter}");

                $cleanSteps[] = [
                    'organization_id' => ! empty($st['organization_id']) ? (int) $st['organization_id'] : $sanitizedOrgId,
                    'step_number' => $stepCounter++,
                    'title' => $effectiveTitle,
                    'instruction' => $instruction,
                    'room_number' => $room !== '' ? $room : null,
                    'floor' => $floor !== '' ? $floor : null,
                    'building' => $building !== '' ? $building : null,
                    'department_name' => $department !== '' ? $department : null,
                    'responsible_title' => ! empty($st['responsible_title']) ? (string) $st['responsible_title'] : null,
                    'estimated_duration_minutes' => isset($st['estimated_duration_minutes']) ? (int) $st['estimated_duration_minutes'] : 15,
                    'is_active' => isset($st['is_active']) ? (bool) $st['is_active'] : true,
                ];
            }
        }

        $request->merge([
            'organization_id' => $sanitizedOrgId,
            'steps' => $cleanSteps,
        ]);

        $validated = $request->validate([
            'organization_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'steps' => ['present', 'array'],
            'steps.*.organization_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'steps.*.step_number' => ['nullable', 'integer'],
            'steps.*.title' => ['required', 'string', 'max:255'],
            'steps.*.instruction' => ['nullable', 'string'],
            'steps.*.room_number' => ['nullable', 'string', 'max:100'],
            'steps.*.floor' => ['nullable', 'string', 'max:100'],
            'steps.*.building' => ['nullable', 'string', 'max:150'],
            'steps.*.department_name' => ['nullable', 'string', 'max:255'],
            'steps.*.responsible_title' => ['nullable', 'string', 'max:150'],
            'steps.*.estimated_duration_minutes' => ['nullable', 'integer'],
            'steps.*.is_active' => ['nullable', 'boolean'],
        ]);

        $targetOrgId = $validated['organization_id'] ?? null;

        DB::transaction(function () use ($serviceModel, $cleanSteps, $targetOrgId) {
            if ($targetOrgId !== null) {
                $serviceModel->steps()->where('organization_id', $targetOrgId)->delete();
            } else {
                $serviceModel->steps()->whereNull('organization_id')->delete();
            }

            foreach ($cleanSteps as $stepData) {
                $serviceModel->steps()->create([
                    'organization_id' => $stepData['organization_id'] ?? $targetOrgId,
                    'step_number' => $stepData['step_number'],
                    'title' => $stepData['title'],
                    'instruction' => $stepData['instruction'] ?? '',
                    'room_number' => $stepData['room_number'] ?? null,
                    'floor' => $stepData['floor'] ?? null,
                    'building' => $stepData['building'] ?? null,
                    'department_name' => $stepData['department_name'] ?? null,
                    'responsible_title' => $stepData['responsible_title'] ?? null,
                    'estimated_duration_minutes' => $stepData['estimated_duration_minutes'] ?? 15,
                    'is_active' => $stepData['is_active'] ?? true,
                ]);
            }
        });

        $steps = $serviceModel->steps()->with('organization')->ordered()->get();

        return ApiResponse::success(
            data: ServiceStepResource::collection($steps),
            message: 'Service steps synchronized successfully.'
        );
    }
}
