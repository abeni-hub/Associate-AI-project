<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1\News;

use App\Domains\Authorization\Models\Permission;
use App\Domains\Authorization\Models\Role;
use App\Domains\News\Models\News;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use App\Domains\Users\Models\User;
use Database\Seeders\OrganizationTypeSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NewsApiTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    private User $subCityAdmin;

    private User $woredaAdmin;

    private User $kirkosAdmin;

    private Organization $boleSubCity;

    private Organization $boleWoreda;

    private Organization $kirkosSubCity;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(OrganizationTypeSeeder::class);
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);

        $subCityType = OrganizationType::where('code', 'sub_city')->firstOrFail();
        $woredaType = OrganizationType::where('code', 'woreda')->firstOrFail();

        $this->boleSubCity = Organization::create([
            'organization_type_id' => $subCityType->id,
            'name' => 'Bole Sub-City',
            'code' => 'subcity-bole',
            'status' => 'active',
        ]);

        $this->boleWoreda = Organization::create([
            'organization_type_id' => $woredaType->id,
            'parent_organization_id' => $this->boleSubCity->id,
            'name' => 'Bole Woreda 01',
            'code' => 'woreda-01-bole',
            'status' => 'active',
        ]);

        $this->kirkosSubCity = Organization::create([
            'organization_type_id' => $subCityType->id,
            'name' => 'Kirkos Sub-City',
            'code' => 'subcity-kirkos',
            'status' => 'active',
        ]);

        $superAdminRole = Role::where('slug', 'super_admin')->firstOrFail();
        $subCityAdminRole = Role::where('slug', 'sub_city_admin')->firstOrFail();
        $woredaAdminRole = Role::where('slug', 'woreda_admin')->firstOrFail();

        $this->superAdmin = User::create([
            'name' => 'Super Admin',
            'username' => 'super.admin',
            'email' => 'super@platform.gov.et',
            'password' => 'Password123!',
            'role_id' => $superAdminRole->id,
            'status' => 'active',
        ]);

        $this->subCityAdmin = User::create([
            'name' => 'Bole Admin',
            'username' => 'bole.admin',
            'email' => 'admin@bole.gov.et',
            'password' => 'Password123!',
            'role_id' => $subCityAdminRole->id,
            'organization_id' => $this->boleSubCity->id,
            'status' => 'active',
        ]);

        $this->woredaAdmin = User::create([
            'name' => 'Bole Woreda Admin',
            'username' => 'woreda.admin',
            'email' => 'admin@woreda01.gov.et',
            'password' => 'Password123!',
            'role_id' => $woredaAdminRole->id,
            'organization_id' => $this->boleWoreda->id,
            'status' => 'active',
        ]);

        $this->kirkosAdmin = User::create([
            'name' => 'Kirkos Admin',
            'username' => 'kirkos.admin',
            'email' => 'admin@kirkos.gov.et',
            'password' => 'Password123!',
            'role_id' => $subCityAdminRole->id,
            'organization_id' => $this->kirkosSubCity->id,
            'status' => 'active',
        ]);
    }

    public function test_can_list_public_news_without_authentication(): void
    {
        $news = News::create([
            'organization_id' => $this->boleSubCity->id,
            'news_title' => 'New Public Library Opening in Bole',
        ]);

        $news->contents()->create([
            'content' => 'The modern branch opens this Friday.',
            'content_type' => 'text',
            'order' => 1,
        ]);

        $response = $this->getJson('/api/v1/news');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'News retrieved successfully.',
            ])
            ->assertJsonFragment([
                'news_title' => 'New Public Library Opening in Bole',
            ]);
    }

    public function test_can_view_single_news_item_with_ordered_content_blocks(): void
    {
        $news = News::create([
            'organization_id' => $this->boleSubCity->id,
            'news_title' => 'Tax Filing Deadline Extended',
        ]);

        $news->contents()->create([
            'content' => 'First paragraph explaining extension.',
            'content_type' => 'text',
            'order' => 1,
        ]);

        $response = $this->getJson("/api/v1/news/{$news->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $news->id,
                    'news_title' => 'Tax Filing Deadline Extended',
                    'contents' => [
                        [
                            'content' => 'First paragraph explaining extension.',
                            'order' => 1,
                        ],
                    ],
                ],
            ]);
    }

    public function test_unauthenticated_user_cannot_create_news(): void
    {
        $response = $this->postJson('/api/v1/news', [
            'news_title' => 'Unauthorized News',
        ]);

        $response->assertStatus(401);
    }

    public function test_authorized_user_can_create_news_with_content_blocks(): void
    {
        $response = $this->actingAs($this->subCityAdmin)
            ->postJson('/api/v1/news', [
                'news_title' => 'Clean City Campaign Kickoff',
                'contents' => [
                    [
                        'content' => 'Volunteers are gathering at Bole Square at 8 AM.',
                        'content_type' => 'text',
                        'order' => 1,
                    ],
                ],
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'News created successfully.',
                'data' => [
                    'news_title' => 'Clean City Campaign Kickoff',
                    'organization_id' => $this->boleSubCity->id,
                ],
            ]);

        $this->assertDatabaseHas('news', ['news_title' => 'Clean City Campaign Kickoff']);
    }

    public function test_authorized_user_can_update_news(): void
    {
        $news = News::create([
            'organization_id' => $this->boleSubCity->id,
            'news_title' => 'Original Headline',
        ]);

        $response = $this->actingAs($this->subCityAdmin)
            ->putJson("/api/v1/news/{$news->id}", [
                'news_title' => 'Updated Headline',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'News updated successfully.',
                'data' => [
                    'news_title' => 'Updated Headline',
                ],
            ]);

        $this->assertDatabaseHas('news', ['news_title' => 'Updated Headline']);
    }

    public function test_authorized_user_can_delete_news(): void
    {
        $news = News::create([
            'organization_id' => $this->boleSubCity->id,
            'news_title' => 'News To Delete',
        ]);

        $response = $this->actingAs($this->subCityAdmin)
            ->deleteJson("/api/v1/news/{$news->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'News deleted successfully.',
            ]);

        $this->assertDatabaseMissing('news', ['id' => $news->id]);
    }

    public function test_user_cannot_create_news_for_foreign_organization(): void
    {
        $response = $this->actingAs($this->subCityAdmin)
            ->postJson('/api/v1/news', [
                'news_title' => 'Unauthorized Foreign News',
                'organization_id' => $this->kirkosSubCity->id,
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'You do not have permission to create news for this organization.',
            ]);
    }

    public function test_child_woreda_admin_cannot_create_news_for_parent_subcity(): void
    {
        $response = $this->actingAs($this->woredaAdmin)
            ->postJson('/api/v1/news', [
                'news_title' => 'Unauthorized Parent News',
                'organization_id' => $this->boleSubCity->id,
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'You do not have permission to create news for this organization.',
            ]);
    }

    public function test_parent_sub_city_admin_can_create_news_for_child_woreda(): void
    {
        $response = $this->actingAs($this->subCityAdmin)
            ->postJson('/api/v1/news', [
                'news_title' => 'Sub-City Announcement for Woreda 01',
                'organization_id' => $this->boleWoreda->id,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'news_title' => 'Sub-City Announcement for Woreda 01',
                    'organization_id' => $this->boleWoreda->id,
                ],
            ]);

        $this->assertDatabaseHas('news', [
            'news_title' => 'Sub-City Announcement for Woreda 01',
            'organization_id' => $this->boleWoreda->id,
        ]);
    }

    public function test_super_admin_can_create_news_for_any_organization(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->postJson('/api/v1/news', [
                'news_title' => 'National Announcement for Kirkos',
                'organization_id' => $this->kirkosSubCity->id,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'news_title' => 'National Announcement for Kirkos',
                    'organization_id' => $this->kirkosSubCity->id,
                ],
            ]);
    }

    public function test_user_cannot_update_news_of_foreign_organization(): void
    {
        $boleNews = News::create([
            'organization_id' => $this->boleSubCity->id,
            'news_title' => 'Bole News Item',
        ]);

        $response = $this->actingAs($this->kirkosAdmin)
            ->putJson("/api/v1/news/{$boleNews->id}", [
                'news_title' => 'Tampered Title by Foreign Tenant',
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'You do not have permission to update this news item.',
            ]);
    }

    public function test_child_woreda_admin_cannot_update_parent_subcity_news(): void
    {
        $subCityNews = News::create([
            'organization_id' => $this->boleSubCity->id,
            'news_title' => 'Sub-City Official News',
        ]);

        $response = $this->actingAs($this->woredaAdmin)
            ->putJson("/api/v1/news/{$subCityNews->id}", [
                'news_title' => 'Tampered Title by Child Woreda',
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'You do not have permission to update this news item.',
            ]);
    }

    public function test_user_cannot_reassign_news_to_foreign_organization(): void
    {
        $boleNews = News::create([
            'organization_id' => $this->boleSubCity->id,
            'news_title' => 'Bole News Item',
        ]);

        $response = $this->actingAs($this->subCityAdmin)
            ->putJson("/api/v1/news/{$boleNews->id}", [
                'organization_id' => $this->kirkosSubCity->id,
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'You do not have permission to reassign news to this organization.',
            ]);
    }

    public function test_parent_sub_city_admin_can_update_child_woreda_news(): void
    {
        $woredaNews = News::create([
            'organization_id' => $this->boleWoreda->id,
            'news_title' => 'Woreda 01 Original News',
        ]);

        $response = $this->actingAs($this->subCityAdmin)
            ->putJson("/api/v1/news/{$woredaNews->id}", [
                'news_title' => 'Woreda 01 News Updated by Sub-City Supervisor',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $woredaNews->id,
                    'news_title' => 'Woreda 01 News Updated by Sub-City Supervisor',
                ],
            ]);

        $this->assertDatabaseHas('news', [
            'id' => $woredaNews->id,
            'news_title' => 'Woreda 01 News Updated by Sub-City Supervisor',
        ]);
    }

    public function test_super_admin_can_update_any_news(): void
    {
        $kirkosNews = News::create([
            'organization_id' => $this->kirkosSubCity->id,
            'news_title' => 'Kirkos Original News',
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->putJson("/api/v1/news/{$kirkosNews->id}", [
                'news_title' => 'Kirkos News Updated by Super Admin',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $kirkosNews->id,
                    'news_title' => 'Kirkos News Updated by Super Admin',
                ],
            ]);
    }

    public function test_user_cannot_delete_news_of_foreign_organization(): void
    {
        $boleNews = News::create([
            'organization_id' => $this->boleSubCity->id,
            'news_title' => 'Bole News Item',
        ]);

        $response = $this->actingAs($this->kirkosAdmin)
            ->deleteJson("/api/v1/news/{$boleNews->id}");

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'You do not have permission to delete this news item.',
            ]);

        $this->assertDatabaseHas('news', ['id' => $boleNews->id]);
    }

    public function test_child_woreda_admin_cannot_delete_parent_subcity_news(): void
    {
        $newsDeletePermission = Permission::where('key', 'news.delete')->firstOrFail();
        $this->woredaAdmin->role->permissions()->syncWithoutDetaching([$newsDeletePermission->id]);

        $subCityNews = News::create([
            'organization_id' => $this->boleSubCity->id,
            'news_title' => 'Sub-City Official News',
        ]);

        $response = $this->actingAs($this->woredaAdmin)
            ->deleteJson("/api/v1/news/{$subCityNews->id}");

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'You do not have permission to delete this news item.',
            ]);

        $this->assertDatabaseHas('news', ['id' => $subCityNews->id]);
    }

    public function test_parent_sub_city_admin_can_delete_child_woreda_news(): void
    {
        $woredaNews = News::create([
            'organization_id' => $this->boleWoreda->id,
            'news_title' => 'Woreda News to Remove',
        ]);

        $response = $this->actingAs($this->subCityAdmin)
            ->deleteJson("/api/v1/news/{$woredaNews->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'News deleted successfully.',
            ]);

        $this->assertDatabaseMissing('news', ['id' => $woredaNews->id]);
    }

    public function test_super_admin_can_delete_any_news(): void
    {
        $kirkosNews = News::create([
            'organization_id' => $this->kirkosSubCity->id,
            'news_title' => 'Kirkos News to Remove',
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->deleteJson("/api/v1/news/{$kirkosNews->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'News deleted successfully.',
            ]);

        $this->assertDatabaseMissing('news', ['id' => $kirkosNews->id]);
    }

    public function test_news_creation_validates_required_fields(): void
    {
        $response = $this->actingAs($this->subCityAdmin)
            ->postJson('/api/v1/news', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['news_title']);
    }

    public function test_news_show_returns_api_resource_structure(): void
    {
        $news = News::create([
            'organization_id' => $this->boleSubCity->id,
            'news_title' => 'Structure Verification News',
        ]);

        $news->contents()->create([
            'content' => 'Sample content body block.',
            'content_type' => 'text',
            'order' => 1,
        ]);

        $response = $this->getJson("/api/v1/news/{$news->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'organization_id',
                    'news_title',
                    'organization' => [
                        'id',
                        'name',
                        'code',
                    ],
                    'contents' => [
                        '*' => [
                            'id',
                            'news_id',
                            'content',
                            'content_type',
                            'order',
                            'created_at',
                            'updated_at',
                        ],
                    ],
                    'created_at',
                    'updated_at',
                ],
            ]);
    }

    public function test_news_index_supports_pagination_with_metadata(): void
    {
        News::create(['organization_id' => $this->boleSubCity->id, 'news_title' => 'First Article']);
        News::create(['organization_id' => $this->boleSubCity->id, 'news_title' => 'Second Article']);
        News::create(['organization_id' => $this->boleSubCity->id, 'news_title' => 'Third Article']);

        $response = $this->getJson('/api/v1/news?per_page=2&page=1');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'News retrieved successfully.',
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'news_title', 'organization_id'],
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                    'from',
                    'to',
                ],
            ]);

        $this->assertCount(2, $response->json('data'));
        $this->assertSame(2, $response->json('meta.per_page'));
        $this->assertGreaterThanOrEqual(3, $response->json('meta.total'));
    }

    public function test_news_index_enforces_maximum_page_size(): void
    {
        $response = $this->getJson('/api/v1/news?per_page=500');

        $response->assertStatus(200);
        $this->assertSame(100, $response->json('meta.per_page'));
    }

    public function test_news_index_filters_by_search_query(): void
    {
        $matching = News::create(['organization_id' => $this->boleSubCity->id, 'news_title' => 'Unique Keyword Showcase']);
        $other = News::create(['organization_id' => $this->boleSubCity->id, 'news_title' => 'Regular Item']);

        $response = $this->getJson('/api/v1/news?search=Showcase');

        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id')->all();

        $this->assertContains($matching->id, $ids);
        $this->assertNotContains($other->id, $ids);
    }

    public function test_news_mutations_create_audit_logs(): void
    {
        // 1. Create News produces audit log
        $createResponse = $this->actingAs($this->subCityAdmin)
            ->postJson('/api/v1/news', [
                'news_title' => 'Audited News Article',
                'organization_id' => $this->boleSubCity->id,
            ]);

        $createResponse->assertStatus(201);
        $newsId = $createResponse->json('data.id');

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'created',
            'entity_type' => 'News',
            'entity_id' => (string) $newsId,
            'organization_id' => $this->boleSubCity->id,
            'user_id' => $this->subCityAdmin->id,
        ]);

        // 2. Update News produces audit log
        $updateResponse = $this->actingAs($this->subCityAdmin)
            ->putJson("/api/v1/news/{$newsId}", [
                'news_title' => 'Audited News Article Title Revised',
            ]);

        $updateResponse->assertStatus(200);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'updated',
            'entity_type' => 'News',
            'entity_id' => (string) $newsId,
            'organization_id' => $this->boleSubCity->id,
            'user_id' => $this->subCityAdmin->id,
        ]);

        // 3. Delete News produces audit log
        $deleteResponse = $this->actingAs($this->subCityAdmin)
            ->deleteJson("/api/v1/news/{$newsId}");

        $deleteResponse->assertStatus(200);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'deleted',
            'entity_type' => 'News',
            'entity_id' => (string) $newsId,
            'organization_id' => $this->boleSubCity->id,
            'user_id' => $this->subCityAdmin->id,
        ]);
    }
}
