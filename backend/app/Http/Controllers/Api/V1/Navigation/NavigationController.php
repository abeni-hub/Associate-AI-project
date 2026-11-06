<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Navigation;

use App\Domains\Navigation\Actions\GetSidebarNavigationAction;
use App\Domains\Navigation\Models\NavigationItem;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NavigationController extends Controller
{
    public function __construct(
        private readonly GetSidebarNavigationAction $getSidebarNavigationAction
    ) {}

    /**
     * List all available navigation menu items in the platform.
     */
    public function index(): JsonResponse
    {
        $items = NavigationItem::active()->ordered()->get();

        return ApiResponse::success(
            data: $items,
            message: 'Navigation items retrieved successfully.'
        );
    }

    /**
     * Retrieve authorized sidebar navigation items for the authenticated user.
     */
    public function sidebar(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return ApiResponse::unauthorized();
        }

        $items = $this->getSidebarNavigationAction->execute($user);

        return ApiResponse::success(
            data: $items,
            message: 'Sidebar navigation items retrieved successfully.'
        );
    }
}
