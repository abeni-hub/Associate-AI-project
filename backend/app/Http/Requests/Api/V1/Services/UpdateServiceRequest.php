<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Services;

use App\Domains\Organizations\Services\OrganizationScopeService;
use App\Domains\Services\Models\Service;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateServiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Service $targetService */
        $targetService = $this->route('service');
        $serviceId = $targetService instanceof Service ? $targetService->id : (int) $targetService;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('services', 'code')->ignore($serviceId),
                'regex:/^[a-z0-9\-]+$/',
            ],
            'parent_id' => ['nullable', 'integer', 'exists:services,id'],
            'organization_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'description' => ['nullable', 'string'],
            'eligibility_criteria' => ['nullable', 'string'],
            'estimated_duration_minutes' => ['nullable', 'integer', 'min:0'],
            'fee_amount' => ['nullable', 'numeric', 'min:0'],
            'fee_currency' => ['nullable', 'string', 'max:3'],
            'fee_notes' => ['nullable', 'string', 'max:500'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $actor = $this->user();
            $scopeService = app(OrganizationScopeService::class);

            /** @var Service|null $service */
            $service = $this->route('service');
            if (! ($service instanceof Service)) {
                $service = Service::find($service);
            }

            if (! $service) {
                return;
            }

            // 1. Organization scope check if service has owning organization
            if ($actor && ! $actor->isSuperAdmin() && $service->organization_id) {
                if (! $scopeService->canAccessOrganization($actor, $service->organization_id, allowDescendants: true)) {
                    $validator->errors()->add(
                        'service',
                        'You do not have permission to modify services belonging to this organization.'
                    );
                }
            }

            // 2. Prevent self-parenting and circular nesting
            if ($this->has('parent_id')) {
                $newParentId = $this->input('parent_id') !== null ? (int) $this->input('parent_id') : null;

                if ($newParentId !== null) {
                    if ($newParentId === $service->id) {
                        $validator->errors()->add('parent_id', 'A service cannot be its own parent.');

                        return;
                    }

                    $parentCandidate = Service::find($newParentId);
                    if ($parentCandidate && $parentCandidate->parent_id !== null) {
                        $validator->errors()->add(
                            'parent_id',
                            'Cannot nest a service under another subservice (maximum depth is 2).'
                        );
                    }
                }
            }
        });
    }
}
