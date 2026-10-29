<?php

declare(strict_types=1);

namespace Tests\Feature\Database;

use App\Domains\AuditLogs\Actions\RecordAuditLogAction;
use App\Domains\Authorization\Models\Role;
use App\Domains\Feedback\Actions\SubmitFeedbackAction;
use App\Domains\Feedback\DTOs\FeedbackData;
use App\Domains\Feedback\Models\Feedback;
use App\Domains\News\Actions\CreateNewsAction;
use App\Domains\News\DTOs\NewsData;
use App\Domains\News\Models\News;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use App\Domains\Services\Models\Service;
use App\Domains\Users\Models\User;
use Database\Seeders\OrganizationTypeSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Exception;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class TransactionRollbackTest extends TestCase
{
    use RefreshDatabase;

    private Organization $organization;

    private User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(OrganizationTypeSeeder::class);
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);

        $subCityType = OrganizationType::where('code', 'sub_city')->firstOrFail();
        $superAdminRole = Role::where('slug', 'super_admin')->firstOrFail();

        $this->organization = Organization::create([
            'organization_type_id' => $subCityType->id,
            'name' => 'Bole Sub-City',
            'code' => 'subcity-bole',
            'status' => 'active',
        ]);

        $this->adminUser = User::create([
            'name' => 'Super Admin',
            'username' => 'super.admin',
            'email' => 'admin@platform.gov.et',
            'password' => 'Password123!',
            'role_id' => $superAdminRole->id,
            'organization_id' => $this->organization->id,
            'status' => 'active',
        ]);
    }

    public function test_news_creation_rolls_back_when_content_or_audit_fails(): void
    {
        $createAction = app(CreateNewsAction::class);
        $title = 'Transactional Rollback Test Article';

        try {
            DB::transaction(function () use ($createAction, $title) {
                $newsData = new NewsData(
                    organizationId: $this->organization->id,
                    newsTitle: $title,
                    contents: [
                        ['content' => 'First paragraph', 'content_type' => 'text', 'order' => 1],
                    ]
                );

                $news = $createAction->execute($newsData);

                // Simulate unexpected failure during second write (e.g. audit log failure)
                throw new Exception('Simulated database write failure.');
            });
        } catch (Exception $e) {
            $this->assertSame('Simulated database write failure.', $e->getMessage());
        }

        // Prove all related database changes rolled back
        $this->assertDatabaseMissing('news', ['news_title' => $title]);
        $this->assertDatabaseMissing('news_content', ['content' => 'First paragraph']);
    }

    public function test_news_deletion_rolls_back_when_transaction_fails(): void
    {
        $news = News::create([
            'organization_id' => $this->organization->id,
            'news_title' => 'News To Preserve on Rollback',
        ]);

        $content = $news->contents()->create([
            'content' => 'Preserved content block',
            'content_type' => 'text',
            'order' => 1,
        ]);

        try {
            DB::transaction(function () use ($news) {
                $news->contents()->delete();
                $news->delete();

                // Simulate downstream failure before commit
                throw new Exception('Simulated deletion failure.');
            });
        } catch (Exception $e) {
            $this->assertSame('Simulated deletion failure.', $e->getMessage());
        }

        // Prove neither parent news nor child contents were deleted
        $this->assertDatabaseHas('news', ['id' => $news->id]);
        $this->assertDatabaseHas('news_content', ['id' => $content->id]);
    }

    public function test_feedback_submission_rolls_back_when_transaction_fails(): void
    {
        $submitAction = app(SubmitFeedbackAction::class);
        $uniqueContent = 'Unique grievance content to test rollback';

        try {
            DB::transaction(function () use ($submitAction, $uniqueContent) {
                $data = new FeedbackData(
                    feedbackForOrganization: $this->organization->id,
                    feedbackContent: $uniqueContent,
                    feedbackType: 'complaint',
                    fullName: 'Test Citizen',
                );

                $feedback = $submitAction->execute($data);

                // Simulate failure before transaction commit
                throw new Exception('Simulated attachment/audit persistence error.');
            });
        } catch (Exception $e) {
            $this->assertSame('Simulated attachment/audit persistence error.', $e->getMessage());
        }

        // Prove feedback record was rolled back completely
        $this->assertDatabaseMissing('feedbacks', ['feedback_content' => $uniqueContent]);
    }

    public function test_service_documents_sync_rolls_back_when_transaction_fails(): void
    {
        $service = Service::create([
            'name' => 'Trade Registration',
            'code' => 'service-trade-reg',
            'is_active' => true,
        ]);

        $document = \App\Domains\Documents\Models\Document::create([
            'name' => 'National ID',
            'code' => 'doc-nid',
            'is_active' => true,
        ]);

        try {
            DB::transaction(function () use ($service, $document) {
                $service->requiredDocuments()->sync([
                    $document->id => ['is_mandatory' => true, 'order_column' => 1],
                ]);

                // Verify pivot was inserted in-transaction
                $this->assertDatabaseHas('service_documents', [
                    'service_id' => $service->id,
                    'document_id' => $document->id,
                ]);

                // Simulate downstream failure
                throw new Exception('Simulated sync failure.');
            });
        } catch (Exception $e) {
            $this->assertSame('Simulated sync failure.', $e->getMessage());
        }

        // Prove pivot table rollback occurred
        $this->assertDatabaseMissing('service_documents', [
            'service_id' => $service->id,
            'document_id' => $document->id,
        ]);
    }
}
