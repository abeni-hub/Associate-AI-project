<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Feedback;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateFeedbackRequest extends FormRequest
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
            'feedback_content' => ['sometimes', 'string', 'max:5000'],
            'feedback_type' => ['sometimes', 'in:feedback,complaint,satisfaction'],
            'full_name' => ['nullable', 'string', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'feedback_for_organization' => ['sometimes', 'integer', 'exists:organizations,id'],
        ];
    }
}
