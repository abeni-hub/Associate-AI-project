<?php

declare(strict_types=1);

namespace App\Domains\Services\Models;

use App\Domains\Documents\Models\Document;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Traits\HasOrganizationScope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, HasOrganizationScope, SoftDeletes;

    protected $table = 'services';

    protected $fillable = [
        'organization_id',
        'parent_id',
        'name',
        'code',
        'description',
        'eligibility_criteria',
        'estimated_duration_minutes',
        'fee_amount',
        'fee_currency',
        'fee_notes',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'estimated_duration_minutes' => 'integer',
            'fee_amount' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Parent service category (null if top-level master service).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * Nested subservices under this master service.
     */
    public function subservices(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('name');
    }

    /**
     * Physical room-by-room navigation steps for citizens.
     */
    public function steps(): HasMany
    {
        return $this->hasMany(ServiceStep::class, 'service_id')->orderBy('step_number');
    }

    /**
     * The specific bureau or organization that owns/manages this service (null for platform-wide service).
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'organization_id');
    }

    /**
     * Documents required for citizens to obtain this service.
     */
    public function requiredDocuments(): BelongsToMany
    {
        return $this->belongsToMany(
            Document::class,
            'service_documents',
            'service_id',
            'document_id'
        )
            ->withPivot(['is_mandatory', 'order_column', 'notes'])
            ->withTimestamps()
            ->orderByPivot('order_column', 'asc');
    }

    /**
     * Government organizations and bureaus where this service is actively offered.
     */
    public function offeringOrganizations(): BelongsToMany
    {
        return $this->belongsToMany(
            Organization::class,
            'organization_services',
            'service_id',
            'organization_id'
        )
            ->withPivot(['is_available', 'specific_instructions'])
            ->withTimestamps();
    }

    /**
     * Scope to only active services.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to top-level master services.
     */
    public function scopeMasterOnly(Builder $query): Builder
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope to subservices.
     */
    public function scopeSubservicesOnly(Builder $query): Builder
    {
        return $query->whereNotNull('parent_id');
    }

    /**
     * Check if this service is a master service.
     */
    public function isMaster(): bool
    {
        return $this->parent_id === null;
    }
}
