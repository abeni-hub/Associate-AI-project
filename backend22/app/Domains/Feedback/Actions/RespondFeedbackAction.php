<?php

declare(strict_types=1);

namespace App\Domains\Feedback\Actions;

use App\Domains\Feedback\Models\Feedback;
use Illuminate\Support\Facades\DB;

class RespondFeedbackAction
{
    /**
     * Record an official response to a feedback record within a database transaction.
     */
    public function execute(Feedback $feedback, string $responseText): Feedback
    {
        return DB::transaction(function () use ($feedback, $responseText) {
            $feedback->load('organization');
            $feedback->setAttribute('response', $responseText);

            return $feedback;
        });
    }
}
