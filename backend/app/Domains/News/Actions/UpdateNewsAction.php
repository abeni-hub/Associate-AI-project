<?php

declare(strict_types=1);

namespace App\Domains\News\Actions;

use App\Domains\News\Models\News;
use Illuminate\Support\Facades\DB;

class UpdateNewsAction
{
    /**
     * Update a news article and optionally replace its content blocks within a database transaction.
     *
     * @param  array<string, mixed>  $validatedData
     */
    public function execute(News $news, array $validatedData): News
    {
        return DB::transaction(function () use ($news, $validatedData) {
            if (array_key_exists('organization_id', $validatedData)) {
                $news->organization_id = (int) $validatedData['organization_id'];
            }

            if (array_key_exists('news_title', $validatedData)) {
                $news->news_title = (string) $validatedData['news_title'];
            }

            $news->save();

            if (array_key_exists('contents', $validatedData)) {
                $news->contents()->delete();

                foreach ($validatedData['contents'] as $index => $block) {
                    $news->contents()->create([
                        'content' => $block['content'],
                        'content_type' => $block['content_type'] ?? 'text',
                        'order' => $block['order'] ?? $index + 1,
                    ]);
                }
            }

            $news->load([
                'organization',
                'contents' => fn ($builder) => $builder->orderBy('order'),
            ]);

            return $news;
        });
    }
}
