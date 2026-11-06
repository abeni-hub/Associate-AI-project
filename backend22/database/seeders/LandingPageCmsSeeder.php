<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Cms\Models\LandingPageConfig;
use App\Domains\Cms\Support\DefaultLandingPageContent;
use App\Domains\Users\Models\User;
use Illuminate\Database\Seeder;

class LandingPageCmsSeeder extends Seeder
{
    /**
     * Run the landing page CMS seeder.
     */
    public function run(): void
    {
        $superAdmin = User::whereHas('role', function ($q) {
            $q->where('slug', 'super_admin');
        })->first();

        LandingPageConfig::updateOrCreate(
            ['version' => 'v1'],
            [
                'is_published' => true,
                'content' => DefaultLandingPageContent::payload(),
                'updated_by' => $superAdmin?->id,
            ]
        );
    }
}
