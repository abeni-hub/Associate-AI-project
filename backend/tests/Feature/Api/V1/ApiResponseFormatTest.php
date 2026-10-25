<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use Tests\TestCase;

class ApiResponseFormatTest extends TestCase
{
    public function test_api_success_response_conforms_to_contract(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200);

        $payload = $response->json();
        $this->assertIsArray($payload);
        $this->assertTrue($payload['success']);
        $this->assertIsString($payload['message']);
        $this->assertArrayHasKey('data', $payload);
        $this->assertNull($payload['errors']);
    }

    public function test_api_validation_error_response_conforms_to_contract(): void
    {
        $response = $this->postJson('/api/v1/test-validation', [
            'test_field' => 'ab', // Below min 3
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validation failed.',
                'data' => null,
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data',
                'errors' => [
                    'test_field',
                ],
            ]);
    }

    public function test_api_validation_success_returns_data(): void
    {
        $response = $this->postJson('/api/v1/test-validation', [
            'test_field' => 'valid-string',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Validation passed successfully.',
                'data' => [
                    'test_field' => 'valid-string',
                ],
                'errors' => null,
            ]);
    }
}
