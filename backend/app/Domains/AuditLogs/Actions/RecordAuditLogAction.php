<?php

declare(strict_types=1);

namespace App\Domains\AuditLogs\Actions;

use App\Domains\AuditLogs\Models\AuditLog;
use App\Domains\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class RecordAuditLogAction
{
    /**
     * Record an administrative audit log.
     *
     * @param  array<string, mixed>|null  $oldValues
     * @param  array<string, mixed>|null  $newValues
     */
    public function execute(
        string $action,
        Model $entity,
        ?User $actor = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?Request $request = null
    ): AuditLog {
        $actor = $actor ?? $request?->user();

        // Strip sensitive fields (passwords, tokens)
        $sanitizedOld = $oldValues ? $this->sanitizePayload($oldValues) : null;
        $sanitizedNew = $newValues ? $this->sanitizePayload($newValues) : null;

        // Context organization: target's organization if available, else actor's organization
        $orgId = null;
        if (isset($entity->organization_id)) {
            $orgId = (int) $entity->organization_id;
        } elseif ($entity instanceof \App\Domains\Organizations\Models\Organization) {
            $orgId = (int) $entity->id;
        } elseif ($actor && isset($actor->organization_id)) {
            $orgId = (int) $actor->organization_id;
        }

        return AuditLog::create([
            'user_id' => $actor?->id,
            'organization_id' => $orgId,
            'action' => $action,
            'entity_type' => class_basename($entity),
            'entity_id' => (string) $entity->getKey(),
            'old_values' => $sanitizedOld,
            'new_values' => $sanitizedNew,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'created_at' => now(),
        ]);
    }

    /**
     * Filter out secret attributes like passwords and tokens.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function sanitizePayload(array $payload): array
    {
        $sensitiveKeys = ['password', 'remember_token', 'token', 'secret'];

        foreach ($sensitiveKeys as $key) {
            if (array_key_exists($key, $payload)) {
                $payload[$key] = '[REDACTED]';
            }
        }

        return $payload;
    }
}
