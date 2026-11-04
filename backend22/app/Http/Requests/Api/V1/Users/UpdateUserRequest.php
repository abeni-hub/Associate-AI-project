<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Users;

use App\Domains\Authorization\Models\Role;
use App\Domains\Organizations\Services\OrganizationScopeService;
use App\Domains\Users\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateUserRequest extends FormRequest
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
        /** @var User $targetUser */
        $targetUser = $this->route('user');
        $userId = $targetUser instanceof User ? $targetUser->id : (int) $targetUser;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'phone' => ['nullable', 'string', 'max:50'],
            'role_id' => ['sometimes', 'required', 'integer', 'exists:roles,id'],
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

            /** @var User|null $targetUser */
            $targetUser = $this->route('user');
            if (! ($targetUser instanceof User)) {
                $targetUser = User::find($targetUser);
            }

            if (! $targetUser) {
                return;
            }

            // 1. If target is Super Admin, only Super Admin can edit
            if ($targetUser->isSuperAdmin() && ! $actor?->isSuperAdmin()) {
                $validator->errors()->add('user', 'Only Super Admins can modify Super Admin accounts.');

                return;
            }

            // 2. Organization scope check for target user
            if ($actor && ! $actor->isSuperAdmin()) {
                if ($targetUser->organization_id && ! $scopeService->canAccessOrganization($actor, $targetUser->organization_id, allowDescendants: true)) {
                    $validator->errors()->add('user', 'You do not have permission to manage users in this organization.');

                    return;
                }
            }

            // 3. Role escalation check
            if ($this->has('role_id')) {
                $newRoleId = (int) $this->input('role_id');
                $newRole = Role::find($newRoleId);

                if ($newRole?->slug === 'super_admin' && ! $actor?->isSuperAdmin()) {
                    $validator->errors()->add('role_id', 'Only Super Admins can assign the Super Admin role.');
                }

                // Prevent removing last super admin
                if ($targetUser->isSuperAdmin() && $newRole?->slug !== 'super_admin') {
                    $superAdminCount = User::whereHas('role', fn ($q) => $q->where('slug', 'super_admin'))->count();
                    if ($superAdminCount <= 1) {
                        $validator->errors()->add('role_id', 'Cannot demote the last remaining Super Admin in the system.');
                    }
                }
            }

            // Prevent deactivating last active super admin
            if ($this->has('status') && $this->input('status') !== 'active' && $targetUser->isSuperAdmin()) {
                $activeSuperAdminCount = User::whereHas('role', fn ($q) => $q->where('slug', 'super_admin'))
                    ->where('status', 'active')
                    ->count();
                if ($activeSuperAdminCount <= 1) {
                    $validator->errors()->add('status', 'Cannot deactivate the last remaining active Super Admin in the system.');
                }
            }

            // 4. Reassignment organization scope check
            if ($this->has('organization_id')) {
                $newOrgId = $this->input('organization_id') !== null ? (int) $this->input('organization_id') : null;

                if ($actor && ! $actor->isSuperAdmin() && $newOrgId !== null) {
                    if (! $scopeService->canAccessOrganization($actor, $newOrgId, allowDescendants: true)) {
                        $validator->errors()->add('organization_id', 'Target organization is outside of your administrative hierarchy.');
                    }
                }
            }
        });
    }
}
