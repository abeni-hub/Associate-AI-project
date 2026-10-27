<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Feedback;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SubmitFeedbackRequest extends FormRequest
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
            'feedback_for_organization' => ['required', 'integer', 'exists:organizations,id'],
            'feedback_content' => ['required', 'string', 'max:5000'],
            'feedback_type' => ['required', 'in:feedback,complaint,satisfaction'],
            'full_name' => ['nullable', 'string', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
        ];
    }

    /**
     * Custom validation error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'feedback_for_organization.required' => 'Please select the organization this feedback is for.',
            'feedback_for_organization.integer' => 'The selected organization is invalid.',
            'feedback_for_organization.exists' => 'The selected organization does not exist.',
            'feedback_content.required' => 'Please enter your feedback.',
            'feedback_content.string' => 'The feedback must be a valid text.',
            'feedback_content.max' => 'The feedback may not be greater than 5000 characters.',
            'feedback_type.required' => 'Please select a feedback type.',
            'feedback_type.in' => 'The feedback type must be one of: feedback, complaint, satisfaction.',
            'full_name.string' => 'The full name must be a valid text.',
            'full_name.max' => 'The full name may not be greater than 255 characters.',
            'phone_number.string' => 'The phone number must be a valid text.',
            'phone_number.max' => 'The phone number may not be greater than 255 characters.',
            'email.email' => 'Please enter a valid email address.',
            'email.max' => 'The email may not be greater than 255 characters.',
        ];
    }
}
