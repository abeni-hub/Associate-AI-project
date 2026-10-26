<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Authorization;

use App\Domains\Authorization\Models\Role;
use App\Support\ApiResponse;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class SyncRolePermissionsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation and guard Super Admin permissions.
     */
    protected function prepareForValidation(): void
    {
        $role = $this->route('role');
        if (! ($role instanceof Role)) {
            $role = Role::find($role);
        }

        if ($role && $role->slug === 'super_admin') {
            throw new HttpResponseException(
                ApiResponse::error(
                    message: 'Super Admin permissions cannot be modified.',
                    statusCode: 422
                )
            );
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'permission_ids' => ['present', 'array'],
            'permission_ids.*' => ['integer', 'exists:permissions,id'],
        ];
    }
}
