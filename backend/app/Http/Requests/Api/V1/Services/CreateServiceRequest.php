<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Services;

use App\Domains\Organizations\Services\OrganizationScopeService;
use App\Domains\Services\Models\Service;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class CreateServiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $code = $this->input('code');
        if ($code !== null) {
            $cleaned = strtolower(trim((string) $code));
            $cleaned = preg_replace('/[^a-z0-9\-]+/', '-', $cleaned);
            $cleaned = trim($cleaned, '-');
            $this->merge(['code' => $cleaned]);
        }

        $parentId = $this->input('parent_id');
        if ($parentId === '' || $parentId === 0 || $parentId === '0' || $parentId === 'null') {
            $this->merge(['parent_id' => null]);
        }

        $orgId = $this->input('organization_id');
        if ($orgId === '' || $orgId === 0 || $orgId === '0' || $orgId === 'null') {
            $this->merge(['organization_id' => null]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:100', 'unique:services,code', 'regex:/^[a-z0-9\-]+$/'],
            'parent_id' => ['nullable', 'integer', 'exists:services,id'],
            'organization_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'description' => ['nullable', 'string'],
            'eligibility_criteria' => ['nullable', 'string'],
            'estimated_duration_minutes' => ['nullable', 'integer', 'min:0'],
            'fee_amount' => ['nullable', 'numeric', 'min:0'],
            'fee_currency' => ['nullable', 'string', 'max:3'],
            'fee_notes' => ['nullable', 'string', 'max:500'],
            'is_active' => ['nullable', 'boolean'],
            'documents' => ['nullable', 'array'],
            'documents.*.document_id' => ['required_with:documents', 'integer', 'exists:documents,id'],
            'documents.*.is_mandatory' => ['nullable', 'boolean'],
            'documents.*.order_column' => ['nullable', 'integer', 'min:1'],
            'documents.*.notes' => ['nullable', 'string', 'max:500'],
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

            $parentId = $this->input('parent_id') !== null ? (int) $this->input('parent_id') : null;
            $orgId = $this->input('organization_id') !== null ? (int) $this->input('organization_id') : null;

            // 1. Hierarchy depth check: prevent 3rd level subservice
            if ($parentId !== null) {
                $parentService = Service::find($parentId);
                if ($parentService && $parentService->parent_id !== null) {
                    $validator->errors()->add(
                        'parent_id',
                        'Subservices cannot be nested more than one level deep.'
                    );
                }
            }

            // 2. Organization scoping for service creation
            if ($actor && ! $actor->isSuperAdmin() && $orgId !== null) {
                if (! $scopeService->canAccessOrganization($actor, $orgId, allowDescendants: true)) {
                    $validator->errors()->add(
                        'organization_id',
                        'You cannot create a service for an organization outside of your administrative hierarchy.'
                    );
                }
            }
        });
    }

    /**
     * Custom error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'code.regex' => 'The code format is invalid. Use lowercase letters, numbers, and hyphens (e.g., vital-events, birth-certificate).',
        ];
    }
}
