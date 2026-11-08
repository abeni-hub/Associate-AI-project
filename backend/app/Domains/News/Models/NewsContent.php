<?php

declare(strict_types=1);

namespace App\Domains\News\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NewsContent extends Model
{
    use HasFactory;

    protected $table = 'news_content';

    protected $fillable = [
        'news_id',
        'content',
        'content_type',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
        ];
    }

    /**
     * The news item this content block belongs to.
     */
    public function news(): BelongsTo
    {
        return $this->belongsTo(News::class, 'news_id');
    }
}
