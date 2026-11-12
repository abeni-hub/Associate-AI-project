<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Documents;

use App\Domains\Documents\Models\Document;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDocumentRequest extends FormRequest
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
        /** @var Document $targetDoc */
        $targetDoc = $this->route('document');
        $docId = $targetDoc instanceof Document ? $targetDoc->id : (int) $targetDoc;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'name_amh' => ['sometimes', 'nullable', 'string', 'max:255'],
            'name_oro' => ['sometimes', 'nullable', 'string', 'max:255'],
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('documents', 'code')->ignore($docId),
                'regex:/^[a-z0-9\-]+$/',
            ],
            'description' => ['nullable', 'string'],
            'description_amh' => ['nullable', 'string'],
            'description_oro' => ['nullable', 'string'],
            'sample_file_url' => ['nullable', 'url', 'max:500'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
