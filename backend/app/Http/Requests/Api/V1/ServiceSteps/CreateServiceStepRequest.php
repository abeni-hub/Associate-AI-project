<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\ServiceSteps;

use App\Domains\Organizations\Services\OrganizationScopeService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateServiceStepRequest extends FormRequest
{
    public function authorize(OrganizationScopeService $scopeService): bool
    {
        $organizationId = $this->input('organization_id');

        if ($organizationId !== null) {
            return $scopeService->canManageOrganization($this->user(), (int) $organizationId);
        }

        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'organization_id' => ['nullable', 'integer', Rule::exists('organizations', 'id')->whereNull('deleted_at')],
            'step_number' => ['nullable', 'integer', 'min:1'],
            'title' => ['required', 'string', 'max:255'],
            'instruction' => ['required', 'string'],
            'room_number' => ['nullable', 'string', 'max:100'],
            'floor' => ['nullable', 'string', 'max:100'],
            'building' => ['nullable', 'string', 'max:150'],
            'department_name' => ['nullable', 'string', 'max:255'],
            'responsible_title' => ['nullable', 'string', 'max:150'],
            'estimated_duration_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
