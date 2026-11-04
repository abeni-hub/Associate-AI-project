<?php

declare(strict_types=1);

namespace App\Domains\Services\Models;

use App\Domains\Organizations\Models\Organization;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceStep extends Model
{
    use HasFactory;

    protected $table = 'service_steps';

    protected $fillable = [
        'service_id',
        'organization_id',
        'step_number',
        'title',
        'instruction',
        'room_number',
        'floor',
        'building',
        'department_name',
        'responsible_title',
        'estimated_duration_minutes',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'step_number' => 'integer',
            'estimated_duration_minutes' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Service to which this room instruction step belongs.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'service_id');
    }

    /**
     * Specific government organization office offering this step (nullable for global template steps).
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'organization_id');
    }

    /**
     * Scope to active steps only.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope steps in sequential order.
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('step_number')->orderBy('id');
    }

    /**
     * Scope for a specific organization or default template.
     */
    public function scopeForOrganization(Builder $query, ?int $organizationId): Builder
    {
        if ($organizationId === null) {
            return $query->whereNull('organization_id');
        }

        return $query->where(function (Builder $subQuery) use ($organizationId) {
            $subQuery->where('organization_id', $organizationId)
                ->orWhereNull('organization_id');
        });
    }
}
