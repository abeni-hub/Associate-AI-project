<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Users;

use App\Domains\Authorization\Models\Role;
use App\Domains\Organizations\Services\OrganizationScopeService;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class CreateUserRequest extends FormRequest
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
            'username' => ['required', 'string', 'max:50', 'unique:users,username', 'regex:/^[a-zA-Z0-9._\-]+$/'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:50'],
            'role_id' => ['required', 'integer', 'exists:roles,id'],
            'organization_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'status' => ['nullable', 'string', 'in:active,inactive,suspended'],
            'must_change_password' => ['nullable', 'boolean'],
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

            $roleId = (int) $this->input('role_id');
            $orgId = $this->input('organization_id') !== null ? (int) $this->input('organization_id') : null;

            $role = Role::find($roleId);

            // 1. Super Admin role check
            if ($role?->slug === 'super_admin' && ! $actor?->isSuperAdmin()) {
                $validator->errors()->add(
                    'role_id',
                    'Only Super Admins can assign the Super Admin role.'
                );
            }

            // 2. Organization requirement
            if ($role?->slug !== 'super_admin' && $orgId === null) {
                $validator->errors()->add(
                    'organization_id',
                    'An organization assignment is required for this role.'
                );
            }

            // 3. Organization scope check for non-Super Admin actors
            if ($actor && ! $actor->isSuperAdmin() && $orgId !== null) {
                if (! $scopeService->canAccessOrganization($actor, $orgId, allowDescendants: true)) {
                    $validator->errors()->add(
                        'organization_id',
                        'You cannot assign a user to an organization outside of your administrative hierarchy.'
                    );
                }
            }
        });
    }

    /**
     * Custom messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'username.regex' => 'The username may only contain letters, numbers, periods, dashes, and underscores.',
        ];
    }
}
