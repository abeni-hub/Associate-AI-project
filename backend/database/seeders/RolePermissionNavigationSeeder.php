<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Authorization\Models\Permission;
use App\Domains\Authorization\Models\Role;
use App\Domains\Navigation\Models\NavigationItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolePermissionNavigationSeeder extends Seeder
{
    /**
     * Unified seeder for platform permissions, governance roles, and dynamic navigation items.
     * Uses standardized static definitions matching the portal RBAC specifications.
     */
    public function run(): void
    {
        DB::transaction(function () {
            // =========================================================================
            // 1. SEED SYSTEM PERMISSIONS (38 Platform Authorities)
            // =========================================================================
            $permissionsData = [
                // Organizations & Hierarchy
                ['key' => 'organizations.view', 'name' => 'View Organizations', 'group' => 'organizations', 'description' => 'View organization profiles, municipal structure, and hierarchy.'],
                ['key' => 'organizations.create', 'name' => 'Create Organizations', 'group' => 'organizations', 'description' => 'Create new government organizations, sub-cities, and bureaus.'],
                ['key' => 'organizations.update', 'name' => 'Update Organizations', 'group' => 'organizations', 'description' => 'Edit organization details, contact info, and leadership.'],
                ['key' => 'organizations.delete', 'name' => 'Delete Organizations', 'group' => 'organizations', 'description' => 'Deactivate or soft-delete organizational units.'],

                // User Accounts & Access
                ['key' => 'users.view', 'name' => 'View Users', 'group' => 'users', 'description' => 'View user lists, staff profiles, and assigned administrative scopes.'],
                ['key' => 'users.create', 'name' => 'Create Users', 'group' => 'users', 'description' => 'Provision staff or administrative accounts with credentials.'],
                ['key' => 'users.update', 'name' => 'Update Users', 'group' => 'users', 'description' => 'Modify user profiles, email addresses, and account status.'],
                ['key' => 'users.delete', 'name' => 'Delete Users', 'group' => 'users', 'description' => 'Deactivate or remove administrative user accounts.'],
                ['key' => 'users.reset_password', 'name' => 'Reset User Password', 'group' => 'users', 'description' => 'Initiate administrative password resets and temporary OTPs.'],

                // Roles & Permissions Governance
                ['key' => 'roles.view', 'name' => 'View Roles', 'group' => 'roles', 'description' => 'View role definitions, governance scopes, and permission catalogs.'],
                ['key' => 'roles.manage', 'name' => 'Manage Roles', 'group' => 'roles', 'description' => 'Create custom administrative roles and synchronize policy permissions.'],

                // Public Services Catalog
                ['key' => 'services.view', 'name' => 'View Services', 'group' => 'services', 'description' => 'Browse government public services, subservices, and citizen guides.'],
                ['key' => 'services.create', 'name' => 'Create Services', 'group' => 'services', 'description' => 'Add new public services or subservices to the service catalog.'],
                ['key' => 'services.update', 'name' => 'Update Services', 'group' => 'services', 'description' => 'Update service prerequisites, turnaround times, and details.'],
                ['key' => 'services.delete', 'name' => 'Delete Services', 'group' => 'services', 'description' => 'Deactivate or archive public services from citizen view.'],
                ['key' => 'services.manage', 'name' => 'Manage Service Access', 'group' => 'services', 'description' => 'Configure organizational service assignments and access tiers.'],

                // Required Documents
                ['key' => 'documents.view', 'name' => 'View Required Documents', 'group' => 'documents', 'description' => 'Inspect citizen required document templates and criteria.'],
                ['key' => 'documents.manage', 'name' => 'Manage Required Documents', 'group' => 'documents', 'description' => 'Create, edit, and link required document checklists to services.'],

                // Service Room Steps
                ['key' => 'service_steps.view', 'name' => 'View Service Steps', 'group' => 'service_steps', 'description' => 'View physical room-by-room navigation steps for office visitors.'],
                ['key' => 'service_steps.manage', 'name' => 'Manage Service Steps', 'group' => 'service_steps', 'description' => 'Configure and reorder physical room numbers and visitor instructions.'],

                // News Management
                ['key' => 'news.view', 'name' => 'View News', 'group' => 'news', 'description' => 'View official municipal notices, draft announcements, and articles.'],
                ['key' => 'news.create', 'name' => 'Create News', 'group' => 'news', 'description' => 'Draft civic notices, news articles, and citizen announcements.'],
                ['key' => 'news.update', 'name' => 'Update News', 'group' => 'news', 'description' => 'Edit news content, illustrations, headlines, and summaries.'],
                ['key' => 'news.publish', 'name' => 'Publish News', 'group' => 'news', 'description' => 'Publish announcements directly to the citizen app feed or archive them.'],
                ['key' => 'news.delete', 'name' => 'Delete News', 'group' => 'news', 'description' => 'Remove public notices and announcements from the system.'],

                // Events Management
                ['key' => 'events.view', 'name' => 'View Events', 'group' => 'events', 'description' => 'View scheduled town halls, public consultations, and civic events.'],
                ['key' => 'events.create', 'name' => 'Create Events', 'group' => 'events', 'description' => 'Schedule new public gatherings, venues, and calendar items.'],
                ['key' => 'events.update', 'name' => 'Update Events', 'group' => 'events', 'description' => 'Modify event dates, venue locations, times, and agendas.'],
                ['key' => 'events.publish', 'name' => 'Publish Events', 'group' => 'events', 'description' => 'Publish events to citizen calendars or cancel them.'],
                ['key' => 'events.delete', 'name' => 'Delete Events', 'group' => 'events', 'description' => 'Delete public event entries and historical records.'],

                // Citizen Feedback
                ['key' => 'feedback.view_own', 'name' => 'View Own Feedback', 'group' => 'feedback', 'description' => 'Inspect feedback, complaints, and ratings submitted to own organization.'],
                ['key' => 'feedback.view_descendants', 'name' => 'View Descendant Feedback', 'group' => 'feedback', 'description' => 'Supervisory visibility into feedback submitted to child sub-cities or woredas.'],
                ['key' => 'feedback.update_status', 'name' => 'Update Feedback Status', 'group' => 'feedback', 'description' => 'Update complaint resolution status (under_review, resolved, closed).'],

                // QR Codes
                ['key' => 'qr_codes.view', 'name' => 'View QR Codes', 'group' => 'qr_codes', 'description' => 'View office QR tokens, assigned service desks, and feedback routing.'],
                ['key' => 'qr_codes.manage', 'name' => 'Manage QR Codes', 'group' => 'qr_codes', 'description' => 'Generate, download, activate, and deactivate physical office QR codes.'],

                // Dashboard Metrics & Audit Logs
                ['key' => 'dashboard.view', 'name' => 'View Dashboard', 'group' => 'dashboard', 'description' => 'Access role-aware and organization-scoped metrics and activity charts.'],
                ['key' => 'audit_logs.view', 'name' => 'View Audit Logs', 'group' => 'audit_logs', 'description' => 'Inspect immutable system security trails, logins, and audit changes.'],

                // CMS Landing Page Management
                ['key' => 'cms.manage', 'name' => 'Manage Landing Page CMS', 'group' => 'cms', 'description' => 'Manage citizen portal landing page CMS, hero banner, and announcements.'],
            ];

            $permissionModels = [];
            foreach ($permissionsData as $permData) {
                $permission = Permission::updateOrCreate(
                    ['key' => $permData['key']],
                    [
                        'name' => $permData['name'],
                        'group' => $permData['group'],
                        'description' => $permData['description'],
                    ]
                );
                $permissionModels[$permData['key']] = $permission;
            }

            // =========================================================================
            // 2. SEED SYSTEM ROLES & ASSIGN PERMISSIONS
            // =========================================================================
            $rolesDefinitions = [
                'super_admin' => [
                    'name' => 'Super Admin',
                    'scope_level' => 'global',
                    'description' => 'Platform-wide administrator with full authority across all modules.',
                    'is_system' => true,
                    'is_active' => true,
                    'permissions' => array_keys($permissionModels), // All 38 permissions
                ],
                'sub_city_admin' => [
                    'name' => 'Sub-City Admin',
                    'scope_level' => 'sub_city',
                    'description' => 'Sub-City level administrator managing own organization and descendant Woredas/Bureaus.',
                    'is_system' => true,
                    'is_active' => true,
                    'permissions' => [
                        'organizations.view', 'organizations.create', 'organizations.update',
                        'users.view', 'users.create', 'users.update', 'users.delete', 'users.reset_password',
                        'services.view', 'services.manage',
                        'documents.view', 'documents.manage',
                        'service_steps.view', 'service_steps.manage',
                        'news.view', 'news.create', 'news.update', 'news.publish', 'news.delete',
                        'events.view', 'events.create', 'events.update', 'events.publish', 'events.delete',
                        'feedback.view_own', 'feedback.view_descendants', 'feedback.update_status',
                        'qr_codes.view', 'qr_codes.manage',
                        'dashboard.view',
                        'audit_logs.view',
                    ],
                ],
                'woreda_admin' => [
                    'name' => 'Woreda Admin',
                    'scope_level' => 'woreda',
                    'description' => 'Woreda level administrator managing Woreda operations and descendant Bureaus.',
                    'is_system' => true,
                    'is_active' => true,
                    'permissions' => [
                        'organizations.view',
                        'users.view', 'users.create', 'users.update', 'users.reset_password',
                        'services.view',
                        'documents.view',
                        'service_steps.view', 'service_steps.manage',
                        'news.view', 'news.create', 'news.update', 'news.publish',
                        'events.view', 'events.create', 'events.update', 'events.publish',
                        'feedback.view_own', 'feedback.view_descendants', 'feedback.update_status',
                        'qr_codes.view', 'qr_codes.manage',
                        'dashboard.view',
                    ],
                ],
                'bureau_admin' => [
                    'name' => 'Bureau Admin',
                    'scope_level' => 'bureau',
                    'description' => 'Bureau level administrator managing Bureau staff, service steps, and own feedback.',
                    'is_system' => true,
                    'is_active' => true,
                    'permissions' => [
                        'organizations.view',
                        'users.view',
                        'services.view',
                        'documents.view',
                        'service_steps.view', 'service_steps.manage',
                        'news.view', 'news.create', 'news.update', 'news.publish',
                        'events.view', 'events.create', 'events.update', 'events.publish',
                        'feedback.view_own', 'feedback.update_status',
                        'qr_codes.view',
                        'dashboard.view',
                    ],
                ],
                'staff' => [
                    'name' => 'Operational Staff',
                    'scope_level' => 'staff',
                    'description' => 'Operational government staff member with service navigation and feedback viewing rights.',
                    'is_system' => true,
                    'is_active' => true,
                    'permissions' => [
                        'services.view',
                        'documents.view',
                        'service_steps.view',
                        'feedback.view_own',
                        'dashboard.view',
                    ],
                ],
            ];

            $roleModels = [];
            foreach ($rolesDefinitions as $slug => $def) {
                $role = Role::updateOrCreate(
                    ['slug' => $slug],
                    [
                        'name' => $def['name'],
                        'scope_level' => $def['scope_level'],
                        'description' => $def['description'],
                        'is_system' => $def['is_system'],
                        'is_active' => $def['is_active'],
                    ]
                );

                $pivotData = [];
                foreach ($def['permissions'] as $permKey) {
                    if (isset($permissionModels[$permKey])) {
                        $pId = $permissionModels[$permKey]->id;
                        $pivotData[$pId] = [
                            'can_create' => str_contains($permKey, '.create') || str_contains($permKey, '.manage') || $slug === 'super_admin',
                            'can_read' => true,
                            'can_update' => str_contains($permKey, '.update') || str_contains($permKey, '.manage') || $slug === 'super_admin',
                            'can_delete' => str_contains($permKey, '.delete') || $slug === 'super_admin',
                        ];
                    }
                }
                $role->permissions()->sync($pivotData);
                $roleModels[$slug] = $role;
            }

            // =========================================================================
            // 3. SEED DYNAMIC NAVIGATION ITEMS & MAP TO ROLES
            // =========================================================================
            $navigationItemsData = [
                [
                    'label' => 'Overview',
                    'route' => '/admin/overview',
                    'icon' => 'LayoutDashboard',
                    'display_order' => 1,
                    'required_permission' => 'dashboard.view',
                    'roles' => ['super_admin', 'sub_city_admin', 'woreda_admin', 'bureau_admin', 'staff'],
                ],
                [
                    'label' => 'Offices & Directory',
                    'route' => '/admin/subcities',
                    'icon' => 'Building2',
                    'display_order' => 2,
                    'required_permission' => 'organizations.view',
                    'roles' => ['super_admin', 'sub_city_admin'],
                ],
                [
                    'label' => 'Organization Levels',
                    'route' => '/admin/levels',
                    'icon' => 'Layers',
                    'display_order' => 3,
                    'required_permission' => 'organizations.view',
                    'roles' => ['super_admin'],
                ],
                [
                    'label' => 'Accounts',
                    'route' => '/admin/accounts',
                    'icon' => 'Users',
                    'display_order' => 4,
                    'required_permission' => 'users.view',
                    'roles' => ['super_admin', 'sub_city_admin', 'woreda_admin', 'bureau_admin'],
                ],
                [
                    'label' => 'Roles & Permissions',
                    'route' => '/admin/roles',
                    'icon' => 'ShieldCheck',
                    'display_order' => 5,
                    'required_permission' => 'roles.view',
                    'roles' => ['super_admin'],
                ],
                [
                    'label' => 'Services',
                    'route' => '/admin/services',
                    'icon' => 'Briefcase',
                    'display_order' => 6,
                    'required_permission' => 'services.view',
                    'roles' => ['super_admin', 'sub_city_admin', 'woreda_admin', 'bureau_admin', 'staff'],
                ],
                [
                    'label' => 'Required Documents',
                    'route' => '/admin/documents',
                    'icon' => 'FileText',
                    'display_order' => 7,
                    'required_permission' => 'documents.view',
                    'roles' => ['super_admin', 'sub_city_admin', 'woreda_admin', 'bureau_admin'],
                ],
                [
                    'label' => 'Room Routes',
                    'route' => '/admin/routes',
                    'icon' => 'MapPin',
                    'display_order' => 7,
                    'required_permission' => 'service_steps.view',
                    'roles' => ['super_admin', 'sub_city_admin', 'woreda_admin', 'bureau_admin', 'staff'],
                ],
                [
                    'label' => 'Citizen Feedback',
                    'route' => '/admin/feedback',
                    'icon' => 'MessageSquareQuote',
                    'display_order' => 8,
                    'required_permission' => 'feedback.view_own',
                    'roles' => ['super_admin', 'sub_city_admin', 'woreda_admin', 'bureau_admin', 'staff'],
                ],
                [
                    'label' => 'Feedback QR Codes',
                    'route' => '/admin/qr',
                    'icon' => 'QrCode',
                    'display_order' => 9,
                    'required_permission' => 'qr_codes.view',
                    'roles' => ['super_admin', 'sub_city_admin', 'woreda_admin', 'bureau_admin'],
                ],
                [
                    'label' => 'News & Events',
                    'route' => '/admin/news',
                    'icon' => 'Megaphone',
                    'display_order' => 10,
                    'required_permission' => 'news.view',
                    'roles' => ['super_admin', 'sub_city_admin', 'woreda_admin'],
                ],
                [
                    'label' => 'Landing Page CMS',
                    'route' => '/admin/cms',
                    'icon' => 'FileText',
                    'display_order' => 11,
                    'required_permission' => 'cms.manage',
                    'roles' => ['super_admin'],
                ],
                [
                    'label' => 'Activity Log',
                    'route' => '/admin/activity',
                    'icon' => 'Activity',
                    'display_order' => 12,
                    'required_permission' => 'audit_logs.view',
                    'roles' => ['super_admin'],
                ],
            ];

            foreach ($navigationItemsData as $navData) {
                $navItem = NavigationItem::updateOrCreate(
                    ['route' => $navData['route']],
                    [
                        'label' => $navData['label'],
                        'icon' => $navData['icon'],
                        'display_order' => $navData['display_order'],
                        'is_active' => true,
                        'required_permission' => $navData['required_permission'],
                    ]
                );

                $targetRoleIds = [];
                foreach ($navData['roles'] as $roleSlug) {
                    if (isset($roleModels[$roleSlug])) {
                        $targetRoleIds[] = $roleModels[$roleSlug]->id;
                    }
                }
                $navItem->roles()->sync($targetRoleIds);
            }
        });
    }
}

