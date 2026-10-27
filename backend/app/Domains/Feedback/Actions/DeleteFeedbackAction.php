<?php

declare(strict_types=1);

namespace App\Domains\Feedback\Actions;

use App\Domains\Feedback\Models\Feedback;
use Illuminate\Support\Facades\DB;

class DeleteFeedbackAction
{
    /**
     * Delete a feedback record within a database transaction.
     */
    public function execute(Feedback $feedback): void
    {
        DB::transaction(function () use ($feedback) {
            $feedback->delete();
        });
    }
}
