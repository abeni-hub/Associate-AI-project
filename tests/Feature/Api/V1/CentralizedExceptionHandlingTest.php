<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use Tests\TestCase;

class CentralizedExceptionHandlingTest extends TestCase
{
    public function test_non_existent_api_route_returns_standard_404_json(): void
    {
        $response = $this->getJson('/api/v1/non-existent-route-for-testing');

        $response->assertStatus(404)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
                'errors',
            ])
            ->assertJson([
                'success' => false,
                'data' => null,
            ]);
    }

    public function test_disallowed_http_method_returns_standard_405_json(): void
    {
        // /api/v1/health only supports GET
        $response = $this->postJson('/api/v1/health');

        $response->assertStatus(405)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
                'errors',
            ])
            ->assertJson([
                'success' => false,
                'data' => null,
            ]);
    }
}
