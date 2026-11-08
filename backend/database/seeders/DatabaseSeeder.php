<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            OrganizationTypeSeeder::class,
            RolePermissionNavigationSeeder::class,
            ServiceSeeder::class,
            NewsSeeder::class,
            EventSeeder::class,
            QrCodeSeeder::class,
            LandingPageCmsSeeder::class,
            UserSeeder::class,
        ]);
    }
}