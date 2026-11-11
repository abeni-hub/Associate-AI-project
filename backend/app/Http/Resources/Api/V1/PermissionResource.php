<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionResource extends JsonResource
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
            'key' => $this->key,
            'name' => $this->name,
            'group' => $this->group,
            'description' => $this->description,
            'pivot' => $this->whenPivotLoaded('role_permissions', function () {
                return [
                    'can_create' => (bool) ($this->pivot->can_create ?? true),
                    'can_read' => (bool) ($this->pivot->can_read ?? true),
                    'can_update' => (bool) ($this->pivot->can_update ?? true),
                    'can_delete' => (bool) ($this->pivot->can_delete ?? true),
                ];
            }),
        ];
    }
}
