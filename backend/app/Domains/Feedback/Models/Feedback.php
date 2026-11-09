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
        'status',
        'response',
        'resolved_at',
        'full_name',
        'phone_number',
    ];

    protected function casts(): array
    {
        return [
            'resolved_at' => 'datetime',
        ];
    }

    /**
     * The organization this feedback is directed to.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'feedback_for_organization');
    }

    /**
     * Retrieve the model for a bound value, supporting id or tracking_number safely with PostgreSQL bigint casting.
     */
    public function resolveRouteBinding($value, $field = null): ?Model
    {
        if ($field) {
            return parent::resolveRouteBinding($value, $field);
        }

        $clean = preg_replace('/^[#A-Za-z_-]+/', '', (string) $value);

        return $this->where(function ($query) use ($value, $clean) {
            if (is_numeric($value)) {
                $query->where('id', (int) $value);
            }
            if ($clean !== '' && is_numeric($clean) && (string) $clean !== (string) $value) {
                $query->orWhere('id', (int) $clean);
            }
            $query->orWhere('tracking_number', (string) $value);
            if ($clean !== '' && (string) $clean !== (string) $value) {
                $query->orWhere('tracking_number', $clean);
            }
        })->first();
    }
}
