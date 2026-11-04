<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Organizations\Models\OrganizationType;
use Illuminate\Database\Seeder;

class OrganizationTypeSeeder extends Seeder
{
    /**
     * Seed standard Ethiopian Government organization types and allowed parent rules.
     */
    public function run(): void
    {
        $subCity = OrganizationType::updateOrCreate(
            ['code' => 'sub_city'],
            [
                'name' => 'Sub-City',
                'description' => 'Higher-level municipal division / administrative sub-city.',
                'level' => 1,
                'can_be_root' => true,
                'is_active' => true,
            ]
        );

        $woreda = OrganizationType::updateOrCreate(
            ['code' => 'woreda'],
            [
                'name' => 'Woreda',
                'description' => 'Local administrative district governed under a Sub-City.',
                'level' => 2,
                'can_be_root' => false,
                'is_active' => true,
            ]
        );

        $bureau = OrganizationType::updateOrCreate(
            ['code' => 'bureau'],
            [
                'name' => 'Bureau',
                'description' => 'Department, sector office, or public service delivery bureau.',
                'level' => 3,
                'can_be_root' => false,
                'is_active' => true,
            ]
        );

        // Allowed Parent Hierarchy Rules:
        // Woreda may only have a Sub-City as its parent
        $woreda->allowedParents()->syncWithoutDetaching([$subCity->id]);

        // Bureau may have either a Sub-City or a Woreda as its parent
        $bureau->allowedParents()->syncWithoutDetaching([$subCity->id, $woreda->id]);
    }
}
