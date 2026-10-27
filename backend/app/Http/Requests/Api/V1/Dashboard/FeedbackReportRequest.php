<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Dashboard;

use App\Domains\Organizations\Services\OrganizationScopeService;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class FeedbackReportRequest extends FormRequest
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
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'organization_id' => ['nullable', 'integer', 'exists:organizations,id'],
        ];
    }

    /**
     * Validate organizational scope for requested organization filter.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($this->filled('organization_id')) {
                $user = $this->user();
                $orgId = (int) $this->input('organization_id');
                $scopeService = app(OrganizationScopeService::class);

                if ($user && ! $scopeService->canAccessOrganization($user, $orgId, allowDescendants: true)) {
                    $validator->errors()->add(
                        'organization_id',
                        'The selected organization is outside your administrative hierarchy.'
                    );
                }
            }
        });
    }
}
