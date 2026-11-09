<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Cms\Models\LandingPageConfig;
use App\Domains\Cms\Support\DefaultLandingPageContent;
use Illuminate\Database\Seeder;

class LandingPageCmsSeeder extends Seeder
{
    /**
     * Seed initial landing page CMS configuration into the database.
     */
    public function run(): void
    {
        $config = LandingPageConfig::firstOrNew(['version' => 'v1']);
        $existing = is_array($config->content) ? $config->content : [];
        $fullPayload = array_replace_recursive(DefaultLandingPageContent::payload(), $existing);

        $config->fill([
            'is_published' => true,
            'content' => $fullPayload,
        ]);
        $config->save();
    }
}

