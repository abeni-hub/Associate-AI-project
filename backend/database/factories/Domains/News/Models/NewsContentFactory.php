<?php

declare(strict_types=1);

namespace Database\Factories\Domains\News\Models;

use App\Domains\News\Models\News;
use App\Domains\News\Models\NewsContent;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NewsContent>
 */
class NewsContentFactory extends Factory
{
    protected $model = NewsContent::class;

    public function definition(): array
    {
        return [
            'news_id' => News::factory(),
            'content' => fake()->paragraph(),
            'content_type' => 'text',
            'order' => 1,
        ];
    }

    /**
     * Place the content block at a specific order position.
     */
    public function atOrder(int $order): static
    {
        return $this->state(fn (array $attributes) => [
            'order' => $order,
        ]);
    }
}
