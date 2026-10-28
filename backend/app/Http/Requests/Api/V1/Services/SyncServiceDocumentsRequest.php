<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Services;

use Illuminate\Foundation\Http\FormRequest;

class SyncServiceDocumentsRequest extends FormRequest
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
            'documents' => ['required', 'array'],
            'documents.*.document_id' => ['required', 'integer', 'exists:documents,id'],
            'documents.*.is_mandatory' => ['nullable', 'boolean'],
            'documents.*.order_column' => ['nullable', 'integer', 'min:1'],
            'documents.*.notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
