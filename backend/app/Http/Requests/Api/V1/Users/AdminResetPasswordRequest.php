<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Users;

use App\Domains\Organizations\Services\OrganizationScopeService;
use App\Domains\Users\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class AdminResetPasswordRequest extends FormRequest
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
        return [
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
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

            if ($targetUser->isSuperAdmin() && ! $actor?->isSuperAdmin()) {
                $validator->errors()->add('user', 'Only Super Admins can reset a Super Admin account password.');

                return;
            }

            if ($actor && ! $actor->isSuperAdmin()) {
                if ($targetUser->organization_id && ! $scopeService->canAccessOrganization($actor, $targetUser->organization_id, allowDescendants: true)) {
                    $validator->errors()->add('user', 'You do not have permission to reset passwords for users in this organization.');
                }
            }
        });
    }
}
