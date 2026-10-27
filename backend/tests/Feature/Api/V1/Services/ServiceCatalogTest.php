<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1\Services;

use App\Domains\Documents\Models\Document;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use App\Domains\Services\Models\Service;
use Database\Seeders\OrganizationTypeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceCatalogTest extends TestCase
{
    use RefreshDatabase;

    private Service $masterService;

    private Service $subservice;

    private Document $kebeleIdDoc;

    private Organization $boleSubCity;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(OrganizationTypeSeeder::class);

        $subCityType = OrganizationType::where('code', 'sub_city')->firstOrFail();
        $this->boleSubCity = Organization::create([
            'organization_type_id' => $subCityType->id,
            'name' => 'Bole Sub-City',
            'code' => 'subcity-bole',
        ]);

        $this->masterService = Service::create([
            'name' => 'Vital Events Registration',
            'code' => 'vital-events',
            'description' => 'Comprehensive civil status registration services.',
            'is_active' => true,
        ]);

        $this->subservice = Service::create([
            'parent_id' => $this->masterService->id,
            'name' => 'Birth Certificate Issuance',
            'code' => 'birth-certificate',
            'description' => 'Official registration of newborn births.',
            'eligibility_criteria' => 'Child must be born in the sub-city jurisdiction.',
            'estimated_duration_minutes' => 45,
            'fee_amount' => 50.00,
            'fee_currency' => 'ETB',
            'fee_notes' => 'Free for infants under 90 days; 50 ETB thereafter.',
            'is_active' => true,
        ]);

        $this->kebeleIdDoc = Document::create([
            'name' => 'Kebele Resident ID Card',
            'code' => 'kebele-id',
            'description' => 'Valid Ethiopian resident identification card.',
            'is_active' => true,
        ]);

        // Link document to subservice
        $this->subservice->requiredDocuments()->attach($this->kebeleIdDoc->id, [
            'is_mandatory' => true,
            'order_column' => 1,
            'notes' => 'Original and one photocopy required.',
        ]);

        // Link organization offering
        $this->subservice->offeringOrganizations()->attach($this->boleSubCity->id, [
            'is_available' => true,
            'specific_instructions' => 'Window 4 on 2nd Floor',
        ]);
    }

    public function test_citizens_can_browse_services_without_authentication(): void
    {
        $response = $this->getJson('/api/v1/services');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Services retrieved successfully.',
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'code',
                        'description',
                        'fee_amount',
                        'fee_currency',
                        'is_active',
                        'subservices_count',
                        'required_documents_count',
                    ],
                ],
                'meta' => ['current_page', 'total'],
            ]);
    }

    public function test_can_filter_services_by_search_keyword(): void
    {
        $response = $this->getJson('/api/v1/services?search=birth');

        $response->assertStatus(200);
        $data = $response->json('data');

        $this->assertCount(1, $data);
        $this->assertEquals('birth-certificate', $data[0]['code']);
    }

    public function test_can_filter_to_master_services_only(): void
    {
        $response = $this->getJson('/api/v1/services?parent_id=root');

        $response->assertStatus(200);
        $data = $response->json('data');

        $this->assertCount(1, $data);
        $this->assertEquals('vital-events', $data[0]['code']);
        $this->assertTrue($data[0]['is_master']);
    }

    public function test_can_view_single_service_by_slug_with_required_documents(): void
    {
        $response = $this->getJson('/api/v1/services/birth-certificate');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'Birth Certificate Issuance',
                    'code' => 'birth-certificate',
                    'fee_amount' => 50,
                    'required_documents' => [
                        [
                            'code' => 'kebele-id',
                            'is_mandatory' => true,
                            'notes' => 'Original and one photocopy required.',
                        ],
                    ],
                    'offering_organizations' => [
                        [
                            'code' => 'subcity-bole',
                        ],
                    ],
                ],
            ]);
    }

    public function test_browsing_non_existent_service_returns_404(): void
    {
        $response = $this->getJson('/api/v1/services/non-existent-code');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Service not found.',
            ]);
    }
}
