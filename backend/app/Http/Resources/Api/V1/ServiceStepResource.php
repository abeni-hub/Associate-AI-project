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
            'title' => [
                'eng' => $this->title,
                'amh' => $this->title_amh ?? '',
                'oro' => $this->title_oro ?? '',
            ],
            'instruction' => [
                'eng' => $this->instruction,
                'amh' => $this->instruction_amh ?? '',
                'oro' => $this->instruction_oro ?? '',
            ],
            'room_number' => $this->room_number,
            'floor' => $this->floor,
            'building' => [
                'eng' => $this->building,
                'amh' => $this->building_amh,
                'oro' => $this->building_oro,
            ],
            'department_name' => [
                'eng' => $this->department_name,
                'amh' => $this->department_name_amh,
                'oro' => $this->department_name_oro,
            ],
            'responsible_title' => [
                'eng' => $this->responsible_title,
                'amh' => $this->responsible_title_amh,
                'oro' => $this->responsible_title_oro,
            ],
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
