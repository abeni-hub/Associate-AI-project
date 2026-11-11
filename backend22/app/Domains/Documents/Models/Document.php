<?php

declare(strict_types=1);

namespace App\Domains\Documents\Models;

use App\Domains\Services\Models\Service;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'documents';

    protected $fillable = [
        'name',
        'code',
        'description',
        'sample_file_url',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Services that require this document.
     */
    public function services(): BelongsToMany
    {
        return $this->belongsToMany(
            Service::class,
            'service_documents',
            'document_id',
            'service_id'
        )
            ->withPivot(['is_mandatory', 'order_column', 'notes'])
            ->withTimestamps();
    }

    /**
     * Scope to active documents.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
