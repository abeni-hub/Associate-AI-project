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
     * @param  array<string, mixed>|null  $requestPayload
     * @param  array<string, mixed>|null  $responsePayload
     */
    public function execute(
        string $action,
        Model $entity,
        ?User $actor = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?Request $request = null,
        string $status = 'success',
        ?int $statusCode = null,
        ?string $errorMessage = null,
        ?array $requestPayload = null,
        ?array $responsePayload = null
    ): AuditLog {
        $actor = $actor ?? $request?->user();

        // Strip sensitive fields (passwords, tokens)
        $sanitizedOld = $oldValues ? $this->sanitizePayload($oldValues) : null;
        $sanitizedNew = $newValues ? $this->sanitizePayload($newValues) : null;

        // Auto-capture request payload if request object provided and not explicitly given
        if ($requestPayload === null && $request !== null) {
            $rawInput = $request->except(['password', 'password_confirmation', 'token', 'access_token']);
            $requestPayload = ! empty($rawInput) ? $this->sanitizePayload($rawInput) : null;
        } elseif ($requestPayload !== null) {
            $requestPayload = $this->sanitizePayload($requestPayload);
        }

        if ($responsePayload !== null) {
            $responsePayload = $this->sanitizePayload($responsePayload);
        }

        return AuditLog::create([
            'user_id' => $actor?->id,
            'action' => $action,
            'entity_type' => class_basename($entity),
            'entity_id' => (string) $entity->getKey(),
            'status' => $status,
            'status_code' => $statusCode,
            'error_message' => $errorMessage,
            'request_payload' => $requestPayload,
            'response_payload' => $responsePayload,
            'old_values' => $sanitizedOld,
            'new_values' => $sanitizedNew,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'created_at' => now(),
        ]);
    }

    /**
     * Sanitize sensitive key-value pairs from logged payloads.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    protected function sanitizePayload(array $payload): array
    {
        $sensitiveKeys = ['password', 'password_confirmation', 'secret', 'token', 'access_token', 'api_key'];

        $sanitized = [];
        foreach ($payload as $key => $value) {
            if (in_array(strtolower((string) $key), $sensitiveKeys, true)) {
                $sanitized[$key] = '********';
            } elseif (is_array($value)) {
                $sanitized[$key] = $this->sanitizePayload($value);
            } elseif (is_object($value) || is_resource($value)) {
                // Uploads/objects are not JSON-encodable; keep the type name.
                $sanitized[$key] = is_object($value) ? class_basename($value) : '[resource]';
            } else {
                $sanitized[$key] = $value;
            }
        }

        return $sanitized;
    }
}
