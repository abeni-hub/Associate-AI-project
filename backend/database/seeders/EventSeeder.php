<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Events\Models\Event;
use App\Domains\Events\Models\EventImage;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    /**
     * Seed community civic events with multi-image galleries.
     */
    public function run(): void
    {
        $subCityType = OrganizationType::where('code', 'sub_city')->first();
        if (! $subCityType) {
            return;
        }

        $boleSubCity = Organization::firstOrCreate(
            ['code' => 'subcity-bole'],
            [
                'name' => 'Bole Sub-City Administration',
                'organization_type_id' => $subCityType->id,
                'status' => 'active',
            ]
        );

        $event1 = Event::updateOrCreate(
            ['title' => 'Annual Taxpayer Consultative Forum 2026'],
            [
                'organization_id' => $boleSubCity->id,
                'description' => 'Open consultative forum discussing municipal trade licensing, tax assessment reforms, and digitized public service delivery.',
                'location_name' => 'Bole Sub-City Assembly Hall',
                'event_date' => now()->addDays(5)->setHour(9)->setMinute(0),
                'end_date' => now()->addDays(5)->setHour(13)->setMinute(30),
                'audience' => 'Business Proprietors and Residents',
                'status' => 'published',
            ]
        );

        EventImage::updateOrCreate(
            ['event_id' => $event1->id, 'order_column' => 1],
            [
                'image_url' => 'https://civiclink.et/storage/events/tax-forum-1.jpg',
                'caption' => 'Opening address by Bole Administration executive panel.',
            ]
        );

        EventImage::updateOrCreate(
            ['event_id' => $event1->id, 'order_column' => 2],
            [
                'image_url' => 'https://civiclink.et/storage/events/tax-forum-2.jpg',
                'caption' => 'Interactive citizen feedback and inquiry session.',
            ]
        );

        $event2 = Event::updateOrCreate(
            ['title' => 'Digital Public Service & Vital Registration Awareness Week'],
            [
                'organization_id' => $boleSubCity->id,
                'description' => 'Community awareness campaign highlighting room-by-room vital registration procedures and required identity documentation.',
                'location_name' => 'Public Service Center Courtyard',
                'event_date' => now()->addWeeks(2)->setHour(10)->setMinute(0),
                'end_date' => now()->addWeeks(2)->setHour(16)->setMinute(0),
                'audience' => 'All Citizens and New Residents',
                'status' => 'published',
            ]
        );

        EventImage::updateOrCreate(
            ['event_id' => $event2->id, 'order_column' => 1],
            [
                'image_url' => 'https://civiclink.et/storage/events/vital-awareness-1.jpg',
                'caption' => 'Information desk staff distributing service guide brochures.',
            ]
        );
    }
}
