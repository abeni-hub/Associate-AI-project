<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationTypeResource extends JsonResource
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
            'name' => ['eng' => $this->name, 'amh' => $this->name_amh, 'oro' => $this->name_oro],
            'code' => $this->code,
            'description' => ['eng' => $this->description, 'amh' => $this->description_amh, 'oro' => $this->description_oro],
            'level' => (int) $this->level,
            'can_be_root' => (bool) $this->can_be_root,
            'is_active' => (bool) $this->is_active,
            'allowed_parent_types' => $this->whenLoaded('allowedParentTypes', function () {
                return $this->allowedParentTypes->map(fn ($parent) => [
                    'id' => $parent->id,
                    'name' => ['eng' => $parent->name, 'amh' => $parent->name_amh, 'oro' => $parent->name_oro],
                    'code' => $parent->code,
                ]);
            }),
        ];
    }
}
