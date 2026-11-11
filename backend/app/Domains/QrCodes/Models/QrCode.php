<?php

declare(strict_types=1);

namespace App\Domains\QrCodes\Models;

use App\Domains\Organizations\Models\Organization;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QrCode extends Model
{
    use HasFactory;

    protected $table = 'qr_codes';

    protected $fillable = [
        'organization_id',
        'code',
        'label',
        'target_url',
        'scan_count',
        'last_scanned_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'scan_count' => 'integer',
            'last_scanned_at' => 'datetime',
        ];
    }

    /**
     * Government office or bureau that owns this QR code poster.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'organization_id');
    }

    /**
     * Scope query to only active QR codes.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /**
     * Increment the scan counter and stamp the latest scan time.
     */
    public function recordScan(): void
    {
        $this->increment('scan_count');
        $this->updateQuietly(['last_scanned_at' => now()]);
    }
}
