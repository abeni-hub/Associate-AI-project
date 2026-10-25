<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\News\Models\News;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class NewsSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed sample news items with ordered content blocks.
     */
    public function run(): void
    {
        // Ensure organization types exist before creating organizations.
        $this->call(OrganizationTypeSeeder::class);

        $subCityType = OrganizationType::where('code', 'sub_city')->firstOrFail();
        $woredaType = OrganizationType::where('code', 'woreda')->firstOrFail();
        $bureauType = OrganizationType::where('code', 'bureau')->firstOrFail();

        $boleSubCity = Organization::firstOrCreate(
            ['code' => 'bole-sub-city'],
            [
                'organization_type_id' => $subCityType->id,
                'name' => 'Bole Sub-City',
                'email' => 'info@bole.gov.et',
                'phone' => '+251115550101',
                'address' => 'Bole, Addis Ababa',
                'status' => 'active',
            ]
        );

        $woreda03 = Organization::firstOrCreate(
            ['code' => 'bole-woreda-03'],
            [
                'organization_type_id' => $woredaType->id,
                'parent_organization_id' => $boleSubCity->id,
                'name' => 'Woreda 03 Office',
                'email' => 'woreda03@bole.gov.et',
                'phone' => '+251115550203',
                'address' => 'Bole, Woreda 03, Addis Ababa',
                'status' => 'active',
            ]
        );

        $serviceBureau = Organization::firstOrCreate(
            ['code' => 'public-service-bureau'],
            [
                'organization_type_id' => $bureauType->id,
                'parent_organization_id' => $boleSubCity->id,
                'name' => 'Public Service Delivery Bureau',
                'email' => 'contact@service.gov.et',
                'phone' => '+251115550300',
                'address' => 'Kirkos, Addis Ababa',
                'status' => 'active',
            ]
        );

        $newsItems = [
            [
                'organization' => $boleSubCity,
                'news_title' => 'Public Notice: Extended Civil Registration Service Hours from November 2026',
                'days_ago' => 1,
                'contents' => [
                    ['content' => 'Starting Monday, November 2, 2026, the Bole Sub-City Civil Registry counter will operate extended service hours from 8:00 AM to 7:00 PM, Monday through Saturday, to reduce waiting times for identity card and marriage registration services.', 'content_type' => 'text', 'order' => 1],
                    ['content' => 'Citizens can book appointments in advance through the sub-city front desk or walk in during open hours. Priority lanes remain available for elderly residents and persons with disabilities.', 'content_type' => 'text', 'order' => 2],
                ],
            ],
            [
                'organization' => $boleSubCity,
                'news_title' => 'Community Feedback Session: Road and Drainage Improvements in Woreda 03',
                'days_ago' => 4,
                'contents' => [
                    ['content' => 'Residents of Woreda 03 are invited to an open feedback session on planned road rehabilitation and storm drainage works on Saturday, November 7, 2026, at 10:00 AM in the Woreda 03 Community Hall.', 'content_type' => 'text', 'order' => 1],
                    ['content' => 'Attendance is open to all residents. Written feedback can also be submitted at any woreda feedback kiosk until November 20, 2026.', 'content_type' => 'text', 'order' => 2],
                ],
            ],
            [
                'organization' => $serviceBureau,
                'news_title' => 'Government Services Fair 2026: One-Stop Registration for IDs, Utilities and Permits',
                'days_ago' => 9,
                'contents' => [
                    ['content' => 'The Public Service Delivery Bureau will host the annual Government Services Fair from November 17 to 19, 2026 at Meskel Square, bringing more than thirty government offices together in a single location.', 'content_type' => 'text', 'order' => 1],
                    ['content' => 'Visitors will be able to apply for identity cards, utility connections, business permits and land-use clarifications in one visit, with on-site status tracking and feedback kiosks available throughout the fair.', 'content_type' => 'text', 'order' => 2],
                ],
            ],
            [
                'organization' => $woreda03,
                'news_title' => 'Service Update: Land Use and Construction Permit Clarifications Now Available Digitally',
                'days_ago' => 14,
                'contents' => [
                    ['content' => 'Land-use and construction permit clarifications for plots within Woreda 03 can now be requested digitally through the sub-city service desk, removing the need for multiple in-person visits.', 'content_type' => 'text', 'order' => 1],
                    ['content' => 'Approval status updates will be sent by SMS, and physical documents still need to be collected at the sub-city counter within three working days of approval.', 'content_type' => 'text', 'order' => 2],
                ],
            ],
        ];

        foreach ($newsItems as $item) {
            $news = News::firstOrCreate(
                [
                    'organization_id' => $item['organization']->id,
                    'news_title' => $item['news_title'],
                ],
                ['created_at' => now()->subDays($item['days_ago'])]
            );

            if ($news->contents()->exists()) {
                continue;
            }

            $news->contents()->createMany($item['contents']);
        }
    }
}
