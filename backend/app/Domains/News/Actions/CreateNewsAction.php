<?php

declare(strict_types=1);

namespace App\Domains\News\Actions;

use App\Domains\News\DTOs\NewsData;
use App\Domains\News\Models\News;
use Illuminate\Support\Facades\DB;

class CreateNewsAction
{
    /**
     * Create a news article and its ordered content blocks within a database transaction.
     */
    public function execute(NewsData $data): News
    {
        return DB::transaction(function () use ($data) {
            $news = News::create([
                'organization_id' => $data->organizationId,
                'news_title' => $data->newsTitle,
            ]);

            foreach ($data->contents as $index => $block) {
                $news->contents()->create([
                    'content' => $block['content'],
                    'content_type' => $block['content_type'] ?? 'text',
                    'order' => $block['order'] ?? $index + 1,
                ]);
            }

            $news->load([
                'organization',
                'contents' => fn ($builder) => $builder->orderBy('order'),
            ]);

            return $news;
        });
    }
}
