<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ApiResponseFormatTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Register in-memory test route fixture for API validation contract testing
        Route::post('/api/v1/test-validation-fixture', function (Request $request) {
            $validated = $request->validate([
                'test_field' => ['required', 'string', 'min:3'],
            ]);

            return ApiResponse::success(
                data: $validated,
                message: 'Validation passed successfully.'
            );
        });
    }

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
        $response = $this->postJson('/api/v1/test-validation-fixture', [
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
        $response = $this->postJson('/api/v1/test-validation-fixture', [
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

    public function test_temporary_test_validation_endpoint_is_not_accessible(): void
    {
        $response = $this->postJson('/api/v1/test-validation', [
            'test_field' => 'valid-string',
        ]);

        $response->assertStatus(404);
        $this->assertNull(Route::getRoutes()->getByName('api.v1.test.validation'));
    }
}
