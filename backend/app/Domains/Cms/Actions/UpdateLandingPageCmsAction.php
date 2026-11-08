<?php

declare(strict_types=1);

namespace App\Domains\Cms\Actions;

use App\Domains\AuditLogs\Actions\RecordAuditLogAction;
use App\Domains\Cms\Models\LandingPageConfig;
use App\Domains\Users\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UpdateLandingPageCmsAction
{
    public function __construct(
        private readonly RecordAuditLogAction $auditLogAction
    ) {}

    /**
     * Update the landing page CMS configuration and record an audit log.
     *
     * @param  array<string, mixed>  $payload
     */
    public function execute(
        array $payload,
        ?User $actor = null,
        ?Request $request = null
    ): LandingPageConfig {
        return DB::transaction(function () use ($payload, $actor, $request) {
            /** @var LandingPageConfig $config */
            $config = LandingPageConfig::firstOrNew(['version' => 'v1']);

            $oldValues = $config->exists ? $config->toArray() : null;

            $config->fill([
                'version' => 'v1',
                'is_published' => true,
                'content' => $payload,
                'updated_by' => $actor?->id,
            ]);

            $config->save();

            $this->auditLogAction->execute(
                action: 'cms_updated',
                entity: $config,
                actor: $actor,
                oldValues: $oldValues,
                newValues: $config->toArray(),
                request: $request
            );

            return $config;
        });
    }
}
