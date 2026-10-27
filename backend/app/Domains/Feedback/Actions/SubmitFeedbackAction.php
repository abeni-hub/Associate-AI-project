<?php

declare(strict_types=1);

namespace App\Domains\Feedback\Actions;

use App\Domains\Feedback\DTOs\FeedbackData;
use App\Domains\Feedback\Models\Feedback;
use Illuminate\Support\Facades\DB;

class SubmitFeedbackAction
{
    /**
     * Create a citizen feedback submission, generating a tracking number for complaints.
     */
    public function execute(FeedbackData $data): Feedback
    {
        return DB::transaction(function () use ($data) {
            $payload = [
                'feedback_for_organization' => $data->feedbackForOrganization,
                'feedback_content' => $data->feedbackContent,
                'feedback_type' => $data->feedbackType,
                'full_name' => $data->fullName,
                'phone_number' => $data->phoneNumber,
                'email' => $data->email,
            ];

            if ($data->feedbackType === 'complaint') {
                $payload['tracking_number'] = $this->generateTrackingNumber();
            }

            return Feedback::create($payload);
        });
    }

    /**
     * Generate a unique random 10-digit tracking number.
     */
    private function generateTrackingNumber(): string
    {
        do {
            $trackingNumber = (string) random_int(1_000_000_000, 9_999_999_999);
        } while (Feedback::where('tracking_number', $trackingNumber)->exists());

        return $trackingNumber;
    }
}
