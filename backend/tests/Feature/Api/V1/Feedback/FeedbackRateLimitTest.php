<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1\Feedback;

use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use Database\Seeders\OrganizationTypeSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class FeedbackRateLimitTest extends TestCase
{
    use RefreshDatabase;

    private Organization $organization;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(OrganizationTypeSeeder::class);
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);

        $type = OrganizationType::first();
        $this->organization = Organization::create([
            'name' => 'Ministry of Transport and Logistics',
            'code' => 'MOTL',
            'organization_type_id' => $type->id,
            'status' => 'active',
        ]);

        RateLimiter::clear('feedback-submit');
    }

    public function test_legitimate_feedback_submissions_within_limit_succeed(): void
    {
        $payload = [
            'feedback_for_organization' => $this->organization->id,
            'feedback_content' => 'Bus station cleanliness inquiry.',
            'feedback_type' => 'feedback',
            'full_name' => 'Citizen Dawit',
            'email' => 'dawit@example.com',
        ];

        // Send 3 requests within the 5/min limit
        for ($i = 1; $i <= 3; $i++) {
            $response = $this->withServerVariables(['REMOTE_ADDR' => '192.168.10.1'])
                ->postJson('/api/v1/feedbacks', $payload);

            $response->assertStatus(201)
                ->assertJsonPath('success', true);
        }
    }

    public function test_feedback_submissions_exceeding_limit_are_throttled_with_429(): void
    {
        $payload = [
            'feedback_for_organization' => $this->organization->id,
            'feedback_content' => 'Public transit delay complaint.',
            'feedback_type' => 'complaint',
            'full_name' => 'Citizen Almaz',
        ];

        $clientIp = '192.168.20.1';

        // 5 requests within the limit
        for ($i = 1; $i <= 5; $i++) {
            $response = $this->withServerVariables(['REMOTE_ADDR' => $clientIp])
                ->postJson('/api/v1/feedbacks', $payload);

            $response->assertStatus(201);
        }

        // 6th request from same IP exceeds limit
        $throttledResponse = $this->withServerVariables(['REMOTE_ADDR' => $clientIp])
            ->postJson('/api/v1/feedbacks', $payload);

        $throttledResponse->assertStatus(429)
            ->assertHeader('Retry-After')
            ->assertJson([
                'success' => false,
                'message' => 'Too many feedback submissions. Please try again later.',
                'data' => null,
                'errors' => null,
            ]);
    }

    public function test_rate_limits_are_isolated_between_different_client_ips(): void
    {
        $payload = [
            'feedback_for_organization' => $this->organization->id,
            'feedback_content' => 'Road safety suggestion.',
            'feedback_type' => 'feedback',
            'full_name' => 'Citizen Binyam',
        ];

        $ipA = '192.168.30.1';
        $ipB = '192.168.30.2';

        // Exhaust IP A's allowance
        for ($i = 1; $i <= 5; $i++) {
            $this->withServerVariables(['REMOTE_ADDR' => $ipA])
                ->postJson('/api/v1/feedbacks', $payload)
                ->assertStatus(201);
        }

        // IP A is throttled
        $this->withServerVariables(['REMOTE_ADDR' => $ipA])
            ->postJson('/api/v1/feedbacks', $payload)
            ->assertStatus(429);

        // IP B can still submit normally
        $responseB = $this->withServerVariables(['REMOTE_ADDR' => $ipB])
            ->postJson('/api/v1/feedbacks', $payload);

        $responseB->assertStatus(201)
            ->assertJsonPath('success', true);
    }

    public function test_rate_limiting_tracks_email_identifier(): void
    {
        $payload = [
            'feedback_for_organization' => $this->organization->id,
            'feedback_content' => 'Targeted abuse or spam complaint.',
            'feedback_type' => 'complaint',
            'email' => 'victim@civiclink.gov.et',
        ];

        // 5 submissions with the same email across different client IPs
        for ($i = 1; $i <= 5; $i++) {
            $this->withServerVariables(['REMOTE_ADDR' => "10.0.0.{$i}"])
                ->postJson('/api/v1/feedbacks', $payload)
                ->assertStatus(201);
        }

        // 6th submission with same email from a new IP is throttled
        $response = $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.99'])
            ->postJson('/api/v1/feedbacks', $payload);

        $response->assertStatus(429)
            ->assertJson([
                'success' => false,
                'message' => 'Too many feedback submissions. Please try again later.',
                'data' => null,
                'errors' => null,
            ]);
    }
}
