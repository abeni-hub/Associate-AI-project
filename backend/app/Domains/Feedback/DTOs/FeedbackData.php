<?php

declare(strict_types=1);

namespace App\Domains\Feedback\DTOs;

use App\Http\Requests\Api\V1\Feedback\SubmitFeedbackRequest;

readonly class FeedbackData
{
    public function __construct(
        public int $feedbackForOrganization,
        public string $feedbackContent,
        public string $feedbackType,
        public ?string $fullName = null,
        public ?string $phoneNumber = null,
        public ?string $email = null,
    ) {}

    public static function fromRequest(SubmitFeedbackRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            feedbackForOrganization: (int) $validated['feedback_for_organization'],
            feedbackContent: (string) $validated['feedback_content'],
            feedbackType: (string) $validated['feedback_type'],
            fullName: $validated['full_name'] ?? null,
            phoneNumber: $validated['phone_number'] ?? null,
            email: $validated['email'] ?? null,
        );
    }

    /**
     * @param array<string, mixed> $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            feedbackForOrganization: (int) $data['feedback_for_organization'],
            feedbackContent: (string) $data['feedback_content'],
            feedbackType: (string) $data['feedback_type'],
            fullName: $data['full_name'] ?? null,
            phoneNumber: $data['phone_number'] ?? null,
            email: $data['email'] ?? null,
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return array_filter([
            'feedback_for_organization' => $this->feedbackForOrganization,
            'feedback_content' => $this->feedbackContent,
            'feedback_type' => $this->feedbackType,
            'full_name' => $this->fullName,
            'phone_number' => $this->phoneNumber,
            'email' => $this->email,
        ], fn ($val) => ! is_null($val));
    }
}
