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

        $defaultPayload = DefaultLandingPageContent::payload();

        if ($config && ! empty($config->content) && is_array($config->content)) {
            // Auto-heal: If existing database row is missing sections (e.g. only announcement), merge with full 8-section schema
            if (count(array_keys($config->content)) < 8) {
                $merged = array_replace_recursive($defaultPayload, $config->content);
                try {
                    $config->content = $merged;
                    $config->save();
                } catch (\Throwable) {
                    // ignore
                }
                return $merged;
            }

            return $config->content;
        }

        try {
            $created = LandingPageConfig::create([
                'version' => 'v1',
                'is_published' => true,
                'content' => $defaultPayload,
            ]);

            return $created->content;
        } catch (\Throwable) {
            return $defaultPayload;
        }
    }
}
