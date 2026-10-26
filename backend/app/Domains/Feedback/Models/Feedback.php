<?php

declare(strict_types=1);

namespace App\Domains\Feedback\Models;

use App\Domains\Organizations\Models\Organization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feedback extends Model
{
    use HasFactory;

    protected $table = 'feedbacks';

    protected $fillable = [
        'feedback_for_organization',
        'feedback_content',
        'feedback_type',
        'tracking_number',
        'full_name',
        'phone_number',
        'email',
    ];

    /**
     * The organization this feedback is directed to.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'feedback_for_organization');
    }
}
