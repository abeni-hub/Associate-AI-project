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
    public function execute(
        Feedback $feedback,
        string $responseText,
        ?string $responseTextAmh = null,
        ?string $responseTextOro = null
    ): Feedback {
        return DB::transaction(function () use ($feedback, $responseText, $responseTextAmh, $responseTextOro) {
            $feedback->update([
                'response' => $responseText,
                'response_amh' => $responseTextAmh,
                'response_oro' => $responseTextOro,
                'status' => 'resolved',
                'resolved_at' => now(),
            ]);
            $feedback->load('organization');

            return $feedback;
        });
    }
}
