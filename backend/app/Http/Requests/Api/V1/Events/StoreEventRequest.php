<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Events;

use App\Domains\Organizations\Services\OrganizationScopeService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'organization_id' => ['required', 'integer', 'exists:organizations,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'location_name' => ['required', 'string', 'max:255'],
            'event_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:event_date'],
            'audience' => ['nullable', 'string', 'max:150'],
            'status' => ['nullable', 'string', 'in:draft,published,cancelled'],
            'images' => ['nullable', 'array', 'max:10'],
            'images.*.image_url' => ['required', 'string', 'url', 'max:2048'],
            'images.*.caption' => ['nullable', 'string', 'max:255'],
            'images.*.order_column' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $user = $this->user();
            $scopeService = app(OrganizationScopeService::class);
            $orgId = (int) $this->input('organization_id');

            if ($user && ! $user->isSuperAdmin() && ! $scopeService->canAccessOrganization($user, $orgId, allowDescendants: true)) {
                $validator->errors()->add(
                    'organization_id',
                    'You cannot create an event for an organization outside your administrative hierarchy.'
                );
            }
        });
    }
}
