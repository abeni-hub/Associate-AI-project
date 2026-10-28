<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Authorization\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Seed standardized platform permissions.
     */
    public function run(): void
    {
        $permissions = [
            // Organizations
            ['key' => 'organizations.view', 'name' => 'View Organizations', 'group' => 'organizations', 'description' => 'View organization profiles and hierarchy.'],
            ['key' => 'organizations.create', 'name' => 'Create Organizations', 'group' => 'organizations', 'description' => 'Create new government organizations.'],
            ['key' => 'organizations.update', 'name' => 'Update Organizations', 'group' => 'organizations', 'description' => 'Edit organization details.'],
            ['key' => 'organizations.delete', 'name' => 'Delete Organizations', 'group' => 'organizations', 'description' => 'Deactivate or soft-delete organizations.'],

            // Users
            ['key' => 'users.view', 'name' => 'View Users', 'group' => 'users', 'description' => 'View user lists and profiles.'],
            ['key' => 'users.create', 'name' => 'Create Users', 'group' => 'users', 'description' => 'Create staff or administrative users.'],
            ['key' => 'users.update', 'name' => 'Update Users', 'group' => 'users', 'description' => 'Modify user details and account status.'],
            ['key' => 'users.delete', 'name' => 'Delete Users', 'group' => 'users', 'description' => 'Deactivate or remove user accounts.'],
            ['key' => 'users.reset_password', 'name' => 'Reset User Password', 'group' => 'users', 'description' => 'Initiate administrative password resets.'],

            // Roles & Permissions
            ['key' => 'roles.view', 'name' => 'View Roles', 'group' => 'roles', 'description' => 'View roles and permission matrices.'],
            ['key' => 'roles.manage', 'name' => 'Manage Roles', 'group' => 'roles', 'description' => 'Create and modify roles and assigned permissions.'],

            // Services & Subservices
            ['key' => 'services.view', 'name' => 'View Services', 'group' => 'services', 'description' => 'View government services and subservices.'],
            ['key' => 'services.create', 'name' => 'Create Services', 'group' => 'services', 'description' => 'Add new services or subservices to catalog.'],
            ['key' => 'services.update', 'name' => 'Update Services', 'group' => 'services', 'description' => 'Update service catalog information.'],
            ['key' => 'services.delete', 'name' => 'Delete Services', 'group' => 'services', 'description' => 'Deactivate or archive services.'],
            ['key' => 'services.manage', 'name' => 'Manage Service Access', 'group' => 'services', 'description' => 'Configure organizational service access levels.'],

            // Required Documents
            ['key' => 'documents.view', 'name' => 'View Required Documents', 'group' => 'documents', 'description' => 'View required document templates and criteria.'],
            ['key' => 'documents.manage', 'name' => 'Manage Required Documents', 'group' => 'documents', 'description' => 'Create, edit, and link documents to services.'],

            // Service Steps (Room-by-Room Instructions)
            ['key' => 'service_steps.view', 'name' => 'View Service Steps', 'group' => 'service_steps', 'description' => 'View physical room-by-room navigation steps.'],
            ['key' => 'service_steps.manage', 'name' => 'Manage Service Steps', 'group' => 'service_steps', 'description' => 'Create and reorder room instructions.'],

            // News Management
            ['key' => 'news.view', 'name' => 'View News', 'group' => 'news', 'description' => 'View internal and public news articles.'],
            ['key' => 'news.create', 'name' => 'Create News', 'group' => 'news', 'description' => 'Draft news announcements.'],
            ['key' => 'news.update', 'name' => 'Update News', 'group' => 'news', 'description' => 'Edit news drafts and published items.'],
            ['key' => 'news.publish', 'name' => 'Publish News', 'group' => 'news', 'description' => 'Publish or archive news announcements.'],
            ['key' => 'news.delete', 'name' => 'Delete News', 'group' => 'news', 'description' => 'Delete news items.'],

            // Events Management
            ['key' => 'events.view', 'name' => 'View Events', 'group' => 'events', 'description' => 'View scheduled government events.'],
            ['key' => 'events.create', 'name' => 'Create Events', 'group' => 'events', 'description' => 'Create calendar event entries.'],
            ['key' => 'events.update', 'name' => 'Update Events', 'group' => 'events', 'description' => 'Update event times and details.'],
            ['key' => 'events.publish', 'name' => 'Publish Events', 'group' => 'events', 'description' => 'Publish or cancel events.'],
            ['key' => 'events.delete', 'name' => 'Delete Events', 'group' => 'events', 'description' => 'Delete event records.'],

            // Citizen Feedback
            ['key' => 'feedback.view_own', 'name' => 'View Own Feedback', 'group' => 'feedback', 'description' => 'View feedback submitted to own organization.'],
            ['key' => 'feedback.view_descendants', 'name' => 'View Descendant Feedback', 'group' => 'feedback', 'description' => 'Read-only visibility into feedback submitted to descendant organizations.'],
            ['key' => 'feedback.update_status', 'name' => 'Update Feedback Status', 'group' => 'feedback', 'description' => 'Change status of feedback (e.g., under_review, resolved, closed).'],

            // QR Codes
            ['key' => 'qr_codes.view', 'name' => 'View QR Codes', 'group' => 'qr_codes', 'description' => 'View generated QR code tokens and routing.'],
            ['key' => 'qr_codes.manage', 'name' => 'Manage QR Codes', 'group' => 'qr_codes', 'description' => 'Generate, activate, and deactivate QR codes.'],

            // Dashboards
            ['key' => 'dashboard.view', 'name' => 'View Dashboard', 'group' => 'dashboard', 'description' => 'Access role-aware and organization-scoped metrics.'],

            // Audit Logs
            ['key' => 'audit_logs.view', 'name' => 'View Audit Logs', 'group' => 'audit_logs', 'description' => 'Inspect administrative audit trails.'],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['key' => $permission['key']],
                [
                    'name' => $permission['name'],
                    'group' => $permission['group'],
                    'description' => $permission['description'],
                ]
            );
        }
    }
}
