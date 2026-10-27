<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Dashboard;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RecentActivityRequest extends FormRequest
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
            'limit' => ['nullable', 'integer', 'min:1', 'max:50'],
            'entity_type' => ['nullable', 'string', 'max:50'],
            'action' => ['nullable', 'string', 'max:50'],
        ];
    }
}
