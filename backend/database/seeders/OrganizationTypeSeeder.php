<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Organizations\Models\OrganizationType;
use Illuminate\Database\Seeder;

class OrganizationTypeSeeder extends Seeder
{
    /**
     * Seed standard Ethiopian Government organization types and statutory hierarchy levels.
     */
    public function run(): void
    {
        OrganizationType::updateOrCreate(
            ['code' => 'sub_city'],
            [
                'name' => 'Sub-City',
                'name_amh' => 'ክፍለ ከተማ',
                'name_oro' => 'Kutaa Magaalaa',
                'description' => 'Higher-level municipal division / administrative sub-city.',
                'description_amh' => 'የከፍተኛ ደረጃ የማዘጋጃ ቤት አስተዳደር ክፍለ ከተማ።',
                'description_oro' => 'Qaama bulchiinsa magaalaa sadarkaa olaanaa / kutaa magaalaa.',
                'level' => 1,
                'can_be_root' => true,
                'is_active' => true,
            ]
        );

        OrganizationType::updateOrCreate(
            ['code' => 'woreda'],
            [
                'name' => 'Woreda',
                'name_amh' => 'ወረዳ',
                'name_oro' => 'Aanaa',
                'description' => 'Local administrative district governed under a Sub-City.',
                'description_amh' => 'በክፍለ ከተማ ስር የሚተዳደር የአካባቢ አስተዳደር ወረዳ።',
                'description_oro' => 'Kutaa bulchiinsa naannoo kan kutaa magaalaa jalatti bulu.',
                'level' => 2,
                'can_be_root' => false,
                'is_active' => true,
            ]
        );

        OrganizationType::updateOrCreate(
            ['code' => 'bureau'],
            [
                'name' => 'Bureau',
                'name_amh' => 'ቢሮ',
                'name_oro' => 'Biiroo',
                'description' => 'Department, sector office, or public service delivery bureau.',
                'description_amh' => 'የህዝብ አገልግሎት መስጫ ሴክተር መሥሪያ ቤት ወይም ቢሮ።',
                'description_oro' => 'Kutaa damee tajaajila hawaasaa yookiin biiroo dhiyeessaa.',
                'level' => 3,
                'can_be_root' => false,
                'is_active' => true,
            ]
        );
    }
}
