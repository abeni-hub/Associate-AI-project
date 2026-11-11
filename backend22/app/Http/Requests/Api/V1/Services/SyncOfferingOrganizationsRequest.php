<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Services;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SyncOfferingOrganizationsRequest extends FormRequest
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
            'organizations' => ['required', 'array'],
            'organizations.*.organization_id' => ['required', 'integer', 'exists:organizations,id'],
            'organizations.*.is_available' => ['nullable', 'boolean'],
            'organizations.*.specific_instructions' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
