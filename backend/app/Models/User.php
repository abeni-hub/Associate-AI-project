<?php

declare(strict_types=1);

namespace App\Models;

use App\Domains\Users\Models\User as DomainUser;

class User extends DomainUser
{
    // Inherits all domain configuration, relationships, and casts
}
