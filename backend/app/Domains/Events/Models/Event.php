<?php

declare(strict_types=1);

namespace App\Domains\Events\Models;

use App\Domains\Organizations\Models\Organization;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    use HasFactory;

    protected $table = 'events';

    protected $fillable = [
        'organization_id',
        'title',
        'description',
        'location_name',
        'event_date',
        'end_date',
        'audience',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'datetime',
            'end_date' => 'datetime',
        ];
    }

    /**
     * Government organization organizing this civic event.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'organization_id');
    }

    /**
     * Multiple photo gallery images associated with this event.
     */
    public function images(): HasMany
    {
        return $this->hasMany(EventImage::class, 'event_id')->orderBy('order_column', 'asc');
    }

    /**
     * Scope query to published events.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope query to upcoming events starting from today onwards.
     */
    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('event_date', '>=', now()->startOfDay());
    }
}
