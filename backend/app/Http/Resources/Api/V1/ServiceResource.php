<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => [
                'eng' => $this->name,
                'amh' => $this->name_amh ?? '',
                'oro' => $this->name_oro ?? '',
            ],
            'code' => $this->code,
            'description' => [
                'eng' => $this->description,
                'amh' => $this->description_amh,
                'oro' => $this->description_oro,
            ],
            'eligibility_criteria' => $this->eligibility_criteria,
            'estimated_duration_minutes' => $this->estimated_duration_minutes,
            'fee_amount' => (float) $this->fee_amount,
            'fee_currency' => $this->fee_currency,
            'fee_notes' => $this->fee_notes,
            'is_active' => (bool) $this->is_active,
            'organization_id' => $this->organization_id,
            'parent_id' => $this->parent_id,
            'is_master' => $this->isMaster(),
            'parent' => $this->relationLoaded('parent') && $this->parent ? [
                'id' => $this->parent->id,
                'name' => [
                    'eng' => $this->parent->name,
                    'amh' => $this->parent->name_amh ?? '',
                    'oro' => $this->parent->name_oro ?? '',
                ],
                'code' => $this->parent->code,
            ] : null,
            'organization' => $this->relationLoaded('organization') && $this->organization ? [
                'id' => $this->organization->id,
                'name' => $this->organization->name,
                'code' => $this->organization->code,
            ] : null,
            'subservices_count' => $this->whenCounted('subservices'),
            'required_documents_count' => $this->whenCounted('requiredDocuments'),
            'offering_organizations_count' => $this->whenCounted('offeringOrganizations'),
            'steps_count' => $this->whenCounted('steps'),
            'subservices' => self::collection($this->whenLoaded('subservices')),
            'required_documents' => DocumentResource::collection($this->whenLoaded('requiredDocuments')),
            'offering_organizations' => OrganizationResource::collection($this->whenLoaded('offeringOrganizations')),
            'steps' => ServiceStepResource::collection($this->whenLoaded('steps')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
