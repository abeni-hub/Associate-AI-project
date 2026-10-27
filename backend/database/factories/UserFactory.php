<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Domains\Authorization\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'username' => fake()->unique()->userName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('Secret123!'),
            'role_id' => Role::firstOrCreate(
                ['slug' => 'staff'],
                ['name' => 'Staff', 'description' => 'Staff member', 'is_system' => true, 'is_active' => true]
            )->id,
            'organization_id' => null,
            'status' => 'active',
            'must_change_password' => false,
            'remember_token' => Str::random(10),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
