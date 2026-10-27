<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Organizations;

use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Services\OrganizationScopeService;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateOrganizationRequest extends FormRequest
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
        /** @var Organization $organization */
        $organization = $this->route('organization');
        $orgId = $organization instanceof Organization ? $organization->id : (int) $organization;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('organizations', 'code')->ignore($orgId),
                'regex:/^[a-z0-9\-]+$/',
            ],
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
            /** @var Organization|null $organization */
            $organization = $this->route('organization');
            if (! ($organization instanceof Organization)) {
                $organization = Organization::find($organization);
            }

            if (! $organization) {
                return;
            }

            $user = $this->user();
            $scopeService = app(OrganizationScopeService::class);

            // Check if actor has scope over this organization
            if ($user && ! $user->isSuperAdmin() && ! $scopeService->canManageOrganization($user, $organization)) {
                $validator->errors()->add(
                    'organization',
                    'You do not have permission to manage this organization.'
                );

                return;
            }

            if ($this->has('parent_organization_id')) {
                $newParentId = $this->input('parent_organization_id') !== null ? (int) $this->input('parent_organization_id') : null;

                if ($newParentId !== null) {
                    if ($newParentId === $organization->id) {
                        $validator->errors()->add('parent_organization_id', 'An organization cannot be its own parent.');

                        return;
                    }

                    $candidateParent = Organization::with('type')->find($newParentId);
                    if ($candidateParent) {
                        // Prevent circular ancestry
                        $descendantIds = $organization->allDescendants()->pluck('id')->all();
                        if (in_array($newParentId, $descendantIds, true)) {
                            $validator->errors()->add(
                                'parent_organization_id',
                                'Cannot set a descendant organization as parent (circular hierarchy detected).'
                            );

                            return;
                        }

                        // Check type compatibility
                        if (! $organization->canHaveParent($candidateParent)) {
                            $validator->errors()->add(
                                'parent_organization_id',
                                "Incompatible parent type for {$organization->name}."
                            );
                        }
                    }
                } elseif (! $organization->type?->can_be_root) {
                    $validator->errors()->add(
                        'parent_organization_id',
                        "Organizations of type '{$organization->type?->name}' cannot be root organizations."
                    );
                }
            }
        });
    }
}
