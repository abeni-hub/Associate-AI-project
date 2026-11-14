<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class OrganizationResource extends JsonResource
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
                'amh' => $this->name_amh ?: $this->name,
                'oro' => $this->name_oro ?: $this->name,
            ],
            'name_amh' => $this->name_amh,
            'name_oro' => $this->name_oro,
            'code' => $this->code,
            'description' => [
                'eng' => $this->description,
                'amh' => $this->description_amh ?: $this->description,
                'oro' => $this->description_oro ?: $this->description,
            ],
            'description_amh' => $this->description_amh,
            'description_oro' => $this->description_oro,
            'address' => [
                'eng' => $this->address,
                'amh' => $this->address_amh ?: $this->address,
                'oro' => $this->address_oro ?: $this->address,
            ],
            'address_amh' => $this->address_amh,
            'address_oro' => $this->address_oro,
            'phone' => $this->phone,
            'email' => $this->email,
            'logo' => $this->logo_path ? Storage::disk('public')->url($this->logo_path) : null,
            'status' => $this->status,
            'organization_type_id' => $this->organization_type_id,
            'parent_organization_id' => $this->parent_organization_id,
            'is_root' => $this->isRoot(),
            'type' => $this->relationLoaded('type') && $this->type ? [
                'id' => $this->type->id,
                'name' => [
                    'eng' => $this->type->name,
                    'amh' => $this->type->name_amh ?: $this->type->name,
                    'oro' => $this->type->name_oro ?: $this->type->name,
                ],
                'code' => $this->type->code,
                'level' => $this->type->level,
            ] : null,
            'parent' => $this->relationLoaded('parent') && $this->parent ? [
                'id' => $this->parent->id,
                'name' => [
                    'eng' => $this->parent->name,
                    'amh' => $this->parent->name_amh ?: $this->parent->name,
                    'oro' => $this->parent->name_oro ?: $this->parent->name,
                ],
                'code' => $this->parent->code,
            ] : null,
            'children_count' => $this->whenCounted('children'),
            'users_count' => $this->whenCounted('users'),
            'children' => self::collection($this->whenLoaded('children')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
