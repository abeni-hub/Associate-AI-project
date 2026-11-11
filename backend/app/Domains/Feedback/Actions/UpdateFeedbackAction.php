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
            if (isset($validatedData['status'])) {
                $status = strtolower((string) $validatedData['status']);
                if ($status === 'in_review') {
                    $validatedData['status'] = 'under_review';
                } elseif ($status === 'open') {
                    $validatedData['status'] = 'submitted';
                }
            }

            $isResolvedOrClosed = isset($validatedData['status']) && in_array($validatedData['status'], ['resolved', 'closed'], true);
            $hasResponse = ! empty($validatedData['response']);

            if (($isResolvedOrClosed || $hasResponse) && ! isset($validatedData['resolved_at'])) {
                $validatedData['resolved_at'] = now();
            }

            $feedback->update($validatedData);
            $feedback->load('organization');

            return $feedback;
        });
    }
}
