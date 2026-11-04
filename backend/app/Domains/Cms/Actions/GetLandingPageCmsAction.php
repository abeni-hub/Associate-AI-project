<?php

declare(strict_types=1);

namespace App\Domains\Cms\Actions;

use App\Domains\Cms\Models\LandingPageConfig;
use App\Domains\Cms\Support\DefaultLandingPageContent;

class GetLandingPageCmsAction
{
    /**
     * Retrieve the active published landing page CMS payload or return the default fallback.
     *
     * @return array<string, mixed>
     */
    public function execute(): array
    {
        $config = LandingPageConfig::where('version', 'v1')
            ->where('is_published', true)
            ->first();

        if ($config && ! empty($config->content)) {
            return $config->content;
        }

        return DefaultLandingPageContent::payload();
    }
}
