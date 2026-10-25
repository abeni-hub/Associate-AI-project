<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    public function test_health_check_endpoint_returns_success_status_and_version(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'service',
                    'api_version',
                    'environment',
                    'timestamp',
                    'database' => [
                        'status',
                    ],
                ],
                'errors',
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'api_version' => 'v1',
                ],
                'errors' => null,
            ]);
    }
}
