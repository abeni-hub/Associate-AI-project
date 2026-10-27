<?php

declare(strict_types=1);

namespace App\Domains\Feedback\Actions;

use App\Domains\Feedback\Models\Feedback;
use Illuminate\Support\Facades\DB;

class UpdateFeedbackAction
{
    /**
     * Update a feedback record within a database transaction.
     *
     * @param  array<string, mixed>  $validatedData
     */
    public function execute(Feedback $feedback, array $validatedData): Feedback
    {
        return DB::transaction(function () use ($feedback, $validatedData) {
            $feedback->update($validatedData);
            $feedback->load('organization');

            return $feedback;
        });
    }
}
