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
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'eligibility_criteria' => $this->eligibility_criteria,
            'estimated_duration_minutes' => $this->estimated_duration_minutes,
            'fee_amount' => (float) $this->fee_amount,
            'fee_currency' => $this->fee_currency,
            'fee_notes' => $this->fee_notes,
            'is_active' => (bool) $this->is_active,
            'is_master' => $this->isMaster(),
            'parent' => $this->parent ? [
                'id' => $this->parent->id,
                'name' => $this->parent->name,
                'code' => $this->parent->code,
            ] : null,
            'organization' => $this->organization ? [
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
