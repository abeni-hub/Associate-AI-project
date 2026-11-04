<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceStepResource extends JsonResource
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
            'service_id' => $this->service_id,
            'organization_id' => $this->organization_id,
            'step_number' => (int) $this->step_number,
            'title' => $this->title,
            'instruction' => $this->instruction,
            'room_number' => $this->room_number,
            'floor' => $this->floor,
            'building' => $this->building,
            'department_name' => $this->department_name,
            'responsible_title' => $this->responsible_title,
            'estimated_duration_minutes' => $this->estimated_duration_minutes,
            'is_active' => (bool) $this->is_active,
            'organization' => $this->organization ? [
                'id' => $this->organization->id,
                'name' => $this->organization->name,
                'code' => $this->organization->code,
            ] : null,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
