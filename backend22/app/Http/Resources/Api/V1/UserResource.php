<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'username' => $this->username,
            'email' => $this->email,
            'phone' => $this->phone,
            'status' => $this->status,
            'must_change_password' => (bool) $this->must_change_password,
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'organization' => $this->organization ? [
                'id' => $this->organization->id,
                'name' => $this->organization->name,
                'code' => $this->organization->code,
                'type' => $this->organization->type ? [
                    'id' => $this->organization->type->id,
                    'name' => $this->organization->type->name,
                    'code' => $this->organization->type->code,
                ] : null,
            ] : null,
            'role' => $this->role ? [
                'id' => $this->role->id,
                'name' => $this->role->name,
                'slug' => $this->role->slug,
            ] : null,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
