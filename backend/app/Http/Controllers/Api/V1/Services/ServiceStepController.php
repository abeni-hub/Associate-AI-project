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
            $orgId = $request->input('organization_id') !== null ? (int) $request->input('organization_id') : null;
            $query->forOrganization($orgId);
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

        DB::transaction(function () use ($serviceModel, $validated, $targetOrgId) {
            if ($targetOrgId !== null) {
                $serviceModel->steps()->where('organization_id', $targetOrgId)->delete();
            } else {
                $serviceModel->steps()->delete();
            }

            foreach ($validated['steps'] as $idx => $stepData) {
                $serviceModel->steps()->create([
                    'organization_id' => $stepData['organization_id'] ?? $targetOrgId,
                    'step_number' => $stepData['step_number'] ?? ($idx + 1),
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
