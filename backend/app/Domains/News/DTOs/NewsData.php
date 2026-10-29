<?php

declare(strict_types=1);

namespace App\Domains\News\DTOs;

use App\Http\Requests\Api\V1\News\StoreNewsRequest;

readonly class NewsData
{
    /**
     * @param array<int, array{content: string, content_type?: string, order?: int}> $contents
     */
    public function __construct(
        public int $organizationId,
        public string $newsTitle,
        public array $contents = [],
    ) {}

    public static function fromRequest(StoreNewsRequest $request, int $targetOrgId): self
    {
        $validated = $request->validated();

        return new self(
            organizationId: $targetOrgId,
            newsTitle: (string) $validated['news_title'],
            contents: $validated['contents'] ?? [],
        );
    }

    /**
     * @param array<string, mixed> $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            organizationId: (int) $data['organization_id'],
            newsTitle: (string) $data['news_title'],
            contents: $data['contents'] ?? [],
        );
    }
}
