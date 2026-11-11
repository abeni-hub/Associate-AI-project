<?php

declare(strict_types=1);

namespace App\Domains\Events\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventImage extends Model
{
    use HasFactory;

    protected $table = 'event_images';

    protected $fillable = [
        'event_id',
        'image_url',
        'caption',
        'order_column',
    ];

    protected function casts(): array
    {
        return [
            'order_column' => 'integer',
        ];
    }

    /**
     * Parent event this photo belongs to.
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }
}
