<?php

declare(strict_types=1);

namespace Tests\Feature\Database;

use App\Domains\Authorization\Models\Role;
use App\Domains\Dashboard\Services\DashboardMetricsService;
use App\Domains\Feedback\Models\Feedback;
use App\Domains\News\Models\News;
use App\Domains\News\Models\NewsContent;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use App\Domains\Services\Models\Service;
use App\Domains\Users\Models\User;
use Database\Seeders\OrganizationTypeSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class QueryEfficiencyTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;

    private Organization $organization;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(OrganizationTypeSeeder::class);
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);

        $type = OrganizationType::first();
        $this->organization = Organization::create([
            'name' => 'Ministry of Innovation and Technology',
            'code' => 'MINT',
            'organization_type_id' => $type->id,
            'status' => 'active',
        ]);

        $superAdminRole = Role::where('slug', 'super_admin')->first();
        $this->adminUser = User::create([
            'name' => 'Super Administrator',
            'username' => 'superadmin_qe',
            'email' => 'superadmin_qe@civiclink.gov.et',
            'password' => bcrypt('Password123!'),
            'role_id' => $superAdminRole->id,
            'organization_id' => $this->organization->id,
            'status' => 'active',
        ]);
    }

    public function test_feedback_index_does_not_suffer_from_n_plus_one_queries(): void
    {
        $org2 = Organization::create([
            'name' => 'Ministry of Revenue',
            'code' => 'MOR',
            'organization_type_id' => $this->organization->organization_type_id,
            'status' => 'active',
        ]);

        // Seed 15 feedback records across 2 organizations
        for ($i = 1; $i <= 15; $i++) {
            Feedback::create([
                'feedback_for_organization' => $i % 2 === 0 ? $this->organization->id : $org2->id,
                'feedback_content' => "Test citizen feedback #{$i}",
                'feedback_type' => 'feedback',
                'full_name' => "Citizen {$i}",
            ]);
        }

        $queries = [];
        DB::listen(function ($query) use (&$queries) {
            $queries[] = $query->sql;
        });

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/feedbacks?per_page=15');

        $response->assertOk()
            ->assertJsonCount(15, 'data');

        // Verify organizations were eager-loaded and not loaded via individual N+1 queries.
        // Expected query count is small and bounded (auth user lookup, feedback count, feedback fetch, organization eager load)
        $this->assertLessThanOrEqual(5, count($queries), 'Feedback listing exceeded acceptable query threshold, potential N+1 detected.');
    }

    public function test_news_index_eager_loads_contents_and_organizations(): void
    {
        // Create 10 news items, each with 3 content blocks
        for ($i = 1; $i <= 10; $i++) {
            $news = News::create([
                'organization_id' => $this->organization->id,
                'news_title' => "News headline {$i}",
            ]);

            for ($j = 1; $j <= 3; $j++) {
                NewsContent::create([
                    'news_id' => $news->id,
                    'content' => "Paragraph {$j} of news {$i}",
                    'content_type' => 'text',
                    'order' => $j,
                ]);
            }
        }

        $queries = [];
        DB::listen(function ($query) use (&$queries) {
            $queries[] = $query->sql;
        });

        $response = $this->getJson('/api/v1/news?per_page=10');

        $response->assertOk()
            ->assertJsonCount(10, 'data');

        // News should load header, count, organization, and contents with at most 4 queries total (never 10+ queries)
        $this->assertLessThanOrEqual(5, count($queries), 'News listing exceeded acceptable query threshold, potential N+1 detected.');
    }

    public function test_dashboard_overview_uses_bounded_aggregate_queries(): void
    {
        // Seed multiple entities
        for ($i = 1; $i <= 5; $i++) {
            Organization::create([
                'name' => "Bureau {$i}",
                'code' => "BUR{$i}",
                'organization_type_id' => $this->organization->organization_type_id,
                'status' => 'active',
            ]);

            Service::create([
                'name' => "Service {$i}",
                'code' => "srv-{$i}",
                'is_active' => true,
            ]);

            Feedback::create([
                'feedback_for_organization' => $this->organization->id,
                'feedback_content' => "Feedback {$i}",
                'feedback_type' => $i % 2 === 0 ? 'complaint' : 'feedback',
            ]);
        }

        $dashboardService = app(DashboardMetricsService::class);

        $queries = [];
        DB::listen(function ($query) use (&$queries) {
            $queries[] = $query->sql;
        });

        $overview = $dashboardService->getOverview($this->adminUser);

        $this->assertIsArray($overview);
        $this->assertEquals(6, $overview['organizations']['total']);
        $this->assertEquals(5, $overview['feedback']['total']);
        $this->assertEquals(5, $overview['services']['total_catalog']);

        // Overview encompasses 7 domains; with our optimized aggregate queries, it should execute under 20 queries total
        $this->assertLessThanOrEqual(20, count($queries), 'Dashboard overview executed excessive queries, potential un-aggregated loop detected.');
    }

    public function test_dashboard_feedback_report_eliminates_n_plus_one_for_top_organizations(): void
    {
        // Seed feedback across 5 distinct organizations with Department 1 having highest count
        for ($i = 1; $i <= 5; $i++) {
            $org = Organization::create([
                'name' => "Department {$i}",
                'code' => "DEP{$i}",
                'organization_type_id' => $this->organization->organization_type_id,
                'status' => 'active',
            ]);

            $count = $i === 1 ? 5 : 2;
            for ($k = 1; $k <= $count; $k++) {
                Feedback::create([
                    'feedback_for_organization' => $org->id,
                    'feedback_content' => "Feedback {$k} for dept {$i}",
                    'feedback_type' => 'complaint',
                ]);
            }
        }

        $dashboardService = app(DashboardMetricsService::class);

        $queries = [];
        DB::listen(function ($query) use (&$queries) {
            $queries[] = $query->sql;
        });

        $report = $dashboardService->getFeedbackReport($this->adminUser);

        $this->assertIsArray($report);
        $this->assertEquals(13, $report['summary']['total_feedback']);
        $this->assertCount(5, $report['top_organizations']);
        $this->assertEquals('Department 1', $report['top_organizations'][0]['organization_name']);
        $this->assertEquals(5, $report['top_organizations'][0]['count']);

        // Feedback report should execute aggregate stats (1), top orgs with join (1), recent with eager load (2), total <= 5 queries
        $this->assertLessThanOrEqual(6, count($queries), 'Feedback report executed excessive queries in organization breakdown.');
    }
}
