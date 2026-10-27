<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\News;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreNewsRequest extends FormRequest
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
            'news_title' => ['required', 'string', 'max:255'],
            'organization_id' => ['sometimes', 'integer', 'exists:organizations,id'],
            'contents' => ['sometimes', 'array'],
            'contents.*.content' => ['required_with:contents', 'string'],
            'contents.*.content_type' => ['sometimes', 'string', 'max:50'],
            'contents.*.order' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
