<?php

declare(strict_types=1);

namespace App\Domains\News\Models;

use App\Domains\Organizations\Models\Organization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class News extends Model
{
    use HasFactory;

    protected $table = 'news';

    protected $fillable = [
        'organization_id',
        'news_title',
    ];

    /**
     * The organization that owns this news item.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'organization_id');
    }

    /**
     * Ordered content blocks composing this news item.
     */
    public function contents(): HasMany
    {
        return $this->hasMany(NewsContent::class, 'news_id');
    }
}
