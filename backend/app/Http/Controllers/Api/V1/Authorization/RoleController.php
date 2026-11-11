<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Authorization;

use App\Domains\Authorization\Models\Role;
use App\Domains\Navigation\Models\NavigationItem;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Authorization\SyncRolePermissionsRequest;
use App\Http\Resources\Api\V1\RoleResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RoleController extends Controller
{
    /**
     * List all platform roles with search and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Role::withCount('permissions')
            ->orderBy('id');

        if ($request->filled('search')) {
            $search = (string) $request->input('search');
            $like = DB::connection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';
            $query->where(function ($q) use ($search, $like) {
                $q->where('name', $like, "%{$search}%")
                    ->orWhere('slug', $like, "%{$search}%");
            });
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);
        $paginator = $query->paginate($perPage);

        return ApiResponse::paginated(
            paginator: $paginator,
            message: 'Roles retrieved successfully.',
            resourceClass: RoleResource::class
        );
    }

    /**
     * Show a single role with its assigned permissions.
     */
    public function show(Role $role): JsonResponse
    {
        $role->load(['permissions', 'navigationItems']);

        return ApiResponse::success(
            data: new RoleResource($role),
            message: 'Role retrieved successfully.'
        );
    }

    /**
     * Create a new administrative role with permissions and navigation items.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:100', 'unique:roles,slug'],
            'scope_level' => ['nullable', 'string', 'max:32'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['nullable', 'boolean'],
            'permission_ids' => ['nullable', 'array'],
            'permission_ids.*' => ['integer', 'exists:permissions,id'],
            'navigation_items' => ['nullable', 'array'],
        ]);

        $name = trim((string) $validated['name']);
        $slug = !empty($validated['slug'])
            ? Str::slug((string) $validated['slug'], '_')
            : Str::slug($name, '_');

        if (empty($slug)) {
            $slug = 'role_' . time();
        }

        $baseSlug = $slug;
        $counter = 1;
        while (Role::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '_' . $counter++;
        }

        $role = DB::transaction(function () use ($validated, $name, $slug) {
            $role = Role::create([
                'name' => $name,
                'slug' => $slug,
                'scope_level' => $validated['scope_level'] ?? Role::SCOPE_GLOBAL,
                'description' => $validated['description'] ?? null,
                'is_system' => false,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            if (!empty($validated['permission_ids'])) {
                $role->permissions()->sync($validated['permission_ids']);
            }

            if (isset($validated['navigation_items'])) {
                $this->syncNavigationItems($role, $validated['navigation_items']);
            }

            $role->load(['permissions', 'navigationItems']);
            return $role;
        });

        return ApiResponse::success(
            data: new RoleResource($role),
            message: 'Role created successfully.',
            statusCode: 201
        );
    }

    /**
     * Update an existing role and its permissions.
     */
    public function update(Request $request, Role $role): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'scope_level' => ['nullable', 'string', 'max:32'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['nullable', 'boolean'],
            'permission_ids' => ['nullable', 'array'],
            'permission_ids.*' => ['integer', 'exists:permissions,id'],
            'navigation_items' => ['nullable', 'array'],
        ]);

        DB::transaction(function () use ($role, $validated) {
            $updateData = collect($validated)
                ->only(['name', 'scope_level', 'description', 'is_active'])
                ->all();

            if (!empty($updateData)) {
                $role->update($updateData);
            }

            if (isset($validated['permission_ids']) && $role->slug !== 'super_admin') {
                $role->permissions()->sync($validated['permission_ids']);
            }

            if (isset($validated['navigation_items'])) {
                $this->syncNavigationItems($role, $validated['navigation_items']);
            }

            $role->load(['permissions', 'navigationItems']);
        });

        return ApiResponse::success(
            data: new RoleResource($role->fresh(['permissions', 'navigationItems'])),
            message: 'Role updated successfully.'
        );
    }

    /**
     * Delete a custom role.
     */
    public function destroy(Role $role): JsonResponse
    {
        if ($role->is_system || $role->slug === 'super_admin') {
            return ApiResponse::error(
                message: 'System roles are essential to platform governance and cannot be deleted.',
                statusCode: 422
            );
        }

        if ($role->users()->exists()) {
            return ApiResponse::error(
                message: 'Cannot delete role because active users are currently assigned to it. Reassign users first.',
                statusCode: 422
            );
        }

        DB::transaction(function () use ($role) {
            $role->permissions()->detach();
            if (method_exists($role, 'navigationItems')) {
                $role->navigationItems()->detach();
            }
            $role->delete();
        });

        return ApiResponse::success(
            data: null,
            message: 'Role deleted successfully.'
        );
    }

    /**
     * Synchronize permissions for a role.
     */
    public function updatePermissions(SyncRolePermissionsRequest $request, Role $role): JsonResponse
    {
        if ($role->slug === 'super_admin') {
            return ApiResponse::error(
                message: 'Super Admin permissions cannot be modified.',
                statusCode: 422
            );
        }

        DB::transaction(function () use ($role, $request) {
            $role->permissions()->sync($request->validated('permission_ids'));
            $role->load(['permissions', 'navigationItems']);
        });

        return ApiResponse::success(
            data: new RoleResource($role),
            message: 'Role permissions updated successfully.'
        );
    }

    /**
     * Update navigation items assigned to a role.
     */
    public function updateNavigationItems(Request $request, Role $role): JsonResponse
    {
        $validated = $request->validate([
            'navigation_items' => ['required', 'array'],
        ]);

        DB::transaction(function () use ($role, $validated) {
            $this->syncNavigationItems($role, $validated['navigation_items']);
            $role->load(['permissions', 'navigationItems']);
        });

        return ApiResponse::success(
            data: new RoleResource($role->fresh(['permissions', 'navigationItems'])),
            message: 'Role navigation items updated successfully.'
        );
    }

    /**
     * Map arbitrary navigation identifiers (integers, routes, aliases) to navigation_items IDs and sync.
     */
    private function syncNavigationItems(Role $role, array $navInputs): void
    {
        if (!method_exists($role, 'navigationItems')) {
            return;
        }

        $navIds = collect();

        // 1. Direct integer IDs
        $numericIds = array_filter($navInputs, fn ($i) => is_numeric($i));
        if (!empty($numericIds)) {
            $navIds = $navIds->merge(NavigationItem::whereIn('id', array_map('intval', $numericIds))->pluck('id'));
        }

        // 2. String keys, routes, or aliases
        $stringKeys = array_filter($navInputs, fn ($i) => !is_numeric($i) && is_string($i));
        if (!empty($stringKeys)) {
            $aliasMap = [
                'overview' => '/admin/overview',
                'dashboard' => '/admin/overview',
                'offices' => '/admin/subcities',
                'subcities' => '/admin/subcities',
                'subcity' => '/admin/subcities',
                'directory' => '/admin/subcities',
                'levels' => '/admin/levels',
                'accounts' => '/admin/accounts',
                'users' => '/admin/accounts',
                'staff' => '/admin/accounts',
                'roles' => '/admin/roles',
                'permissions' => '/admin/roles',
                'services' => '/admin/services',
                'routes' => '/admin/routes',
                'service_steps' => '/admin/routes',
                'steps' => '/admin/routes',
                'feedback' => '/admin/feedback',
                'feedbacks' => '/admin/feedback',
                'qr' => '/admin/qr',
                'qr_codes' => '/admin/qr',
                'news' => '/admin/news',
                'events' => '/admin/news',
                'cms' => '/admin/cms',
                'landing_page' => '/admin/cms',
                'activity' => '/admin/activity',
                'audit' => '/admin/activity',
                'audit_logs' => '/admin/activity',
            ];

            foreach ($stringKeys as $key) {
                $normalized = strtolower(trim((string) $key, '/'));
                $targetRoute = $aliasMap[$normalized] ?? null;

                $matches = NavigationItem::where(function ($q) use ($normalized, $targetRoute) {
                    if ($targetRoute) {
                        $q->where('route', $targetRoute);
                    }
                    $q->orWhere('route', 'like', "%{$normalized}%")
                      ->orWhere('required_permission', 'like', "%{$normalized}%");
                })->pluck('id');

                $navIds = $navIds->merge($matches);
            }
        }

        $role->navigationItems()->sync($navIds->unique()->values()->all());
    }
}
