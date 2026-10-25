<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
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
            'sample_file_url' => $this->sample_file_url,
            'is_active' => (bool) $this->is_active,
            'is_mandatory' => $this->whenPivotLoaded('service_documents', fn () => (bool) $this->pivot->is_mandatory),
            'order_column' => $this->whenPivotLoaded('service_documents', fn () => (int) $this->pivot->order_column),
            'notes' => $this->whenPivotLoaded('service_documents', fn () => $this->pivot->notes),
            'services_count' => $this->whenCounted('services'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
