<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Organizations;

use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use App\Domains\Organizations\Services\OrganizationScopeService;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class CreateOrganizationRequest extends FormRequest
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:100', 'unique:organizations,code', 'regex:/^[a-z0-9\-]+$/'],
            'organization_type_id' => ['required', 'integer', 'exists:organization_types,id'],
            'parent_organization_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'description' => ['nullable', 'string', 'max:1000'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'status' => ['nullable', 'string', 'in:active,inactive,suspended'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $user = $this->user();
            $scopeService = app(OrganizationScopeService::class);

            $typeId = (int) $this->input('organization_type_id');
            $parentId = $this->input('parent_organization_id') !== null ? (int) $this->input('parent_organization_id') : null;

            $type = OrganizationType::find($typeId);
            if (! $type) {
                return;
            }

            // 1. Root organization checks
            if ($parentId === null) {
                if (! $type->can_be_root) {
                    $validator->errors()->add(
                        'parent_organization_id',
                        "Organizations of type '{$type->name}' cannot be root organizations. A parent organization is required."
                    );
                }

                // Only Super Admin can create root organizations
                if ($user && ! $user->isSuperAdmin()) {
                    $validator->errors()->add(
                        'parent_organization_id',
                        'Only Super Admins can create root-level organizations.'
                    );
                }
            } else {
                $parent = Organization::with('type')->find($parentId);
                if ($parent) {
                    // Check hierarchy rules
                    $dummyOrg = new Organization(['organization_type_id' => $type->id]);
                    if (! $dummyOrg->canHaveParent($parent)) {
                        $validator->errors()->add(
                            'parent_organization_id',
                            "An organization of type '{$type->name}' cannot have '{$parent->type?->name}' as its parent."
                        );
                    }

                    // Scope check: Actor must have management scope over the parent organization
                    if ($user && ! $user->isSuperAdmin() && ! $scopeService->canManageOrganization($user, $parent)) {
                        $validator->errors()->add(
                            'parent_organization_id',
                            'You do not have permission to create an organization under this parent organization.'
                        );
                    }
                }
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'code.regex' => 'The code format is invalid. Use lowercase alphanumeric characters and hyphens (e.g., subcity-bole, woreda-01).',
        ];
    }
}
