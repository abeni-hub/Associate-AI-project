<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Cms;

use Illuminate\Foundation\Http\FormRequest;

class UploadCmsImageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        if (! $user) {
            return false;
        }

        return $user->isSuperAdmin() || $user->hasPermission('cms.manage');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'image' => [
                'required',
                'file',
                'image',
                'mimes:jpeg,png,jpg,webp',
                'max:5120',
            ],
        ];
    }
}
