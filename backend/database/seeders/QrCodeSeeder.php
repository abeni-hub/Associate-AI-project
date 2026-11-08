<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use App\Domains\QrCodes\Models\QrCode;
use Illuminate\Database\Seeder;

class QrCodeSeeder extends Seeder
{
    /**
     * Seed initial government office QR poster tokens.
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
                'description' => 'Bole municipal and public service administration center.',
            ]
        );

        $lemiKuraSubCity = Organization::firstOrCreate(
            ['code' => 'subcity-lemi-kura'],
            [
                'name' => 'Lemi Kura Sub-City Administration',
                'organization_type_id' => $subCityType->id,
                'status' => 'active',
                'description' => 'Lemi Kura municipal and community services center.',
            ]
        );

        $posters = [
            [
                'organization_id' => $boleSubCity->id,
                'code' => 'QR-BOLE-MAIN-001',
                'label' => 'Main Public Service Block Reception',
                'target_url' => 'https://civiclink.et/guide/subcity-bole/reception',
                'scan_count' => 142,
                'last_scanned_at' => now()->subHours(2),
                'status' => 'active',
            ],
            [
                'organization_id' => $boleSubCity->id,
                'code' => 'QR-BOLE-REV-002',
                'label' => 'Revenues & Tax Assessment Counter Desk 4',
                'target_url' => 'https://civiclink.et/guide/subcity-bole/revenues',
                'scan_count' => 89,
                'last_scanned_at' => now()->subMinutes(45),
                'status' => 'active',
            ],
            [
                'organization_id' => $lemiKuraSubCity->id,
                'code' => 'QR-LEMI-LAND-001',
                'label' => 'Land Administration & Building Permits Reception',
                'target_url' => 'https://civiclink.et/guide/subcity-lemi-kura/land',
                'scan_count' => 67,
                'last_scanned_at' => now()->subDay(),
                'status' => 'active',
            ],
        ];

        foreach ($posters as $poster) {
            QrCode::updateOrCreate(
                ['code' => $poster['code']],
                $poster
            );
        }
    }
}
