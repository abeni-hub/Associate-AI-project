<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\QrCodes;

use App\Domains\Organizations\Services\OrganizationScopeService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreQrCodeRequest extends FormRequest
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
            'code' => ['required', 'string', 'max:64', 'unique:qr_codes,code', 'regex:/^[A-Za-z0-9\-]+$/'],
            'label' => ['required', 'string', 'max:150'],
            'target_url' => ['required', 'string', 'url', 'max:2048'],
            'status' => ['nullable', 'string', 'in:active,inactive'],
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
                    'You cannot generate a QR code for an organization outside your administrative hierarchy.'
                );
            }
        });
    }
}
