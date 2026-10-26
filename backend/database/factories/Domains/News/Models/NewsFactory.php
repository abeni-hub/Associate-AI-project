<?php

declare(strict_types=1);

namespace Database\Factories\Domains\News\Models;

use App\Domains\News\Models\News;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<News>
 */
class NewsFactory extends Factory
{
    protected $model = News::class;

    public function definition(): array
    {
        $subCity = OrganizationType::updateOrCreate(
            ['code' => 'sub_city'],
            [
                'name' => 'Sub-City',
                'description' => 'Higher-level municipal division / administrative sub-city.',
                'level' => 1,
                'can_be_root' => true,
                'is_active' => true,
            ]
        );

        return [
            'organization_id' => Organization::firstOrCreate(
                ['code' => 'test-sub-city'],
                ['organization_type_id' => $subCity->id, 'name' => 'Test Sub-City', 'status' => 'active']
            )->id,
            'news_title' => fake()->sentence(),
        ];
    }
}
