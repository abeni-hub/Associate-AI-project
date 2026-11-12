<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\News\Models\News;
use Illuminate\Database\Seeder;

class NewsSeeder extends Seeder
{
    /**
     * Seed sample news articles with ordered content blocks.
     */
    public function run(): void
    {
        $articles = News::factory()->count(5)->create();

        foreach ($articles as $article) {
            $article->contents()->create([
                'content' => fake()->paragraph(),
                'content_type' => 'text',
                'order' => 1,
            ]);

            $article->contents()->create([
                'content' => fake()->paragraph(),
                'content_type' => 'text',
                'order' => 2,
            ]);
        }
    }
}
