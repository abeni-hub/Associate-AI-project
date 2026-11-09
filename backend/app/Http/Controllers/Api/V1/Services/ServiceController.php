<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Services;

use App\Domains\AuditLogs\Actions\RecordAuditLogAction;
use App\Domains\Organizations\Services\OrganizationScopeService;
use App\Domains\Services\Models\Service;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Services\CreateServiceRequest;
use App\Http\Requests\Api\V1\Services\SyncOfferingOrganizationsRequest;
use App\Http\Requests\Api\V1\Services\SyncServiceDocumentsRequest;
use App\Http\Requests\Api\V1\Services\UpdateServiceRequest;
use App\Http\Resources\Api\V1\ServiceResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ServiceController extends Controller
{
    public function __construct(
        private readonly OrganizationScopeService $scopeService,
        private readonly RecordAuditLogAction $auditLogAction
    ) {}

    /**
     * List services and subservices with search, organization scoping, and hierarchical tree support.
     */
    /**
     * Display a listing of services with hierarchical relationships,
     * backend search, sub-city filtering, bureau/organization filtering,
     * category filtering, and role-based scoping.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user() ?? auth('sanctum')->user();
        $isSuperAdmin = $user && $user->isSuperAdmin();
        $like = \Illuminate\Support\Facades\DB::connection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';

        // 1. Resolve Sub-city Organization Filter
        $subCityInput = $request->input('sub_city') ?? $request->input('sub_city_id');
        $subCityOrgIds = null;
        if ($subCityInput && $subCityInput !== 'all' && $subCityInput !== '') {
            if (is_numeric($subCityInput)) {
                $subCityOrgIds = [(int) $subCityInput];
            } else {
                $cleanSubCity = strtolower(trim(preg_replace('/sub-city|sub city|subcity/i', '', (string) $subCityInput)));
                $subCityOrgIds = \App\Domains\Organizations\Models\Organization::where(function ($q) use ($cleanSubCity, $like) {
                    $q->where('name', $like, "%{$cleanSubCity}%")
                        ->orWhere('code', $like, "%{$cleanSubCity}%");
                })->pluck('id')->all();
            }
        }

        // 2. Resolve Bureau / Organization Filter
        $bureauInput = $request->input('organization_id') ?? $request->input('bureau_id');
        $bureauOrgIds = null;
        if ($bureauInput && $bureauInput !== 'all' && $bureauInput !== '') {
            if (is_numeric($bureauInput)) {
                $bureauOrgIds = [(int) $bureauInput];
            } else {
                $bureauOrgIds = \App\Domains\Organizations\Models\Organization::where('code', (string) $bureauInput)->pluck('id')->all();
            }
        }

        // 3. User Permission Scoping
        $staffOrgIds = null;
        if ($user && ! $isSuperAdmin && $user->organization_id) {
            $staffOrgIds = $this->scopeService->getAllowedOrganizationIds($user, includeDescendants: true) ?? [];
        }

        // 4. Resolve Category Filter
        $categoryInput = strtolower(trim((string) $request->input('category', 'all')));
        $hasCategoryFilter = $categoryInput !== '' && $categoryInput !== 'all';

        // 5. Resolve Search Filter
        $searchInput = trim((string) $request->input('search', ''));
        $hasSearchFilter = $searchInput !== '';

        // Helper filter closure to apply common criteria to subservices relation
        $subservicesLoader = function ($sq) use (
            $subCityOrgIds,
            $bureauOrgIds,
            $staffOrgIds,
            $user,
            $hasCategoryFilter,
            $categoryInput,
            $hasSearchFilter,
            $searchInput,
            $like
        ) {
            if (! $user || ! $user->hasPermission('services.update')) {
                $sq->where('is_active', true);
            }

            if ($staffOrgIds !== null) {
                $sq->where(function ($q) use ($staffOrgIds) {
                    $q->whereIn('organization_id', $staffOrgIds)
                        ->orWhereHas('offeringOrganizations', fn ($o) => $o->whereIn('organizations.id', $staffOrgIds));
                });
            }

            if ($subCityOrgIds !== null) {
                $sq->where(function ($q) use ($subCityOrgIds) {
                    $q->whereIn('organization_id', $subCityOrgIds)
                        ->orWhereHas('offeringOrganizations', fn ($o) => $o->whereIn('organizations.id', $subCityOrgIds));
                });
            }

            if ($bureauOrgIds !== null) {
                $sq->where(function ($q) use ($bureauOrgIds) {
                    $q->whereIn('organization_id', $bureauOrgIds)
                        ->orWhereHas('offeringOrganizations', fn ($o) => $o->whereIn('organizations.id', $bureauOrgIds));
                });
            }

            if ($hasCategoryFilter) {
                $sq->where(function ($q) use ($categoryInput, $like) {
                    if ($categoryInput === 'vital') {
                        $q->where('code', $like, 'CIV%')
                            ->orWhere('name', $like, '%vital%')
                            ->orWhere('name', $like, '%birth%')
                            ->orWhere('name', $like, '%marriage%')
                            ->orWhere('name', $like, '%death%')
                            ->orWhere('name', $like, '%civil%')
                            ->orWhere('name', $like, '%residen%');
                    } elseif ($categoryInput === 'tax') {
                        $q->where('code', $like, 'REV%')
                            ->orWhere('name', $like, '%tax%')
                            ->orWhere('name', $like, '%tin%')
                            ->orWhere('name', $like, '%revenue%')
                            ->orWhere('name', $like, '%clearance%');
                    } elseif ($categoryInput === 'business') {
                        $q->where('code', $like, 'TRD%')
                            ->orWhere('name', $like, '%business%')
                            ->orWhere('name', $like, '%license%')
                            ->orWhere('name', $like, '%trade%')
                            ->orWhere('name', $like, '%commercial%');
                    } elseif ($categoryInput === 'land') {
                        $q->where('code', $like, 'LND%')
                            ->orWhere('name', $like, '%land%')
                            ->orWhere('name', $like, '%property%')
                            ->orWhere('name', $like, '%lease%')
                            ->orWhere('name', $like, '%cadastre%')
                            ->orWhere('name', $like, '%deed%');
                    } elseif ($categoryInput === 'plan') {
                        $q->where('code', $like, 'PLN%')
                            ->orWhere('name', $like, '%plan%')
                            ->orWhere('name', $like, '%urban%')
                            ->orWhere('name', $like, '%building%')
                            ->orWhere('name', $like, '%permit%')
                            ->orWhere('name', $like, '%construction%');
                    } else {
                        $q->where('name', $like, "%{$categoryInput}%")
                            ->orWhere('code', $like, "%{$categoryInput}%");
                    }
                });
            }

            if ($hasSearchFilter) {
                $sq->where(function ($q) use ($searchInput, $like) {
                    $q->where('name', $like, "%{$searchInput}%")
                        ->orWhere('code', $like, "%{$searchInput}%")
                        ->orWhere('description', $like, "%{$searchInput}%");
                });
            }

            $sq->with([
                'organization',
                'parent',
                'steps.organization',
                'requiredDocuments',
                'offeringOrganizations.type',
            ])->withCount(['requiredDocuments', 'offeringOrganizations', 'steps'])
            ->orderBy('name');
        };

        $query = Service::with([
            'organization',
            'parent',
            'steps.organization',
            'requiredDocuments',
            'offeringOrganizations.type',
            'subservices' => $subservicesLoader,
        ])->withCount(['subservices', 'requiredDocuments', 'offeringOrganizations', 'steps']);

        // Public citizens only see active services unless caller has management rights
        if (! $user || ! $user->hasPermission('services.update')) {
            $query->where('is_active', true);
        } elseif ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        // Apply Staff / Role-based Organization Scoping
        if ($staffOrgIds !== null) {
            $query->where(function ($q) use ($staffOrgIds) {
                $q->whereIn('organization_id', $staffOrgIds)
                    ->orWhereHas('offeringOrganizations', fn ($o) => $o->whereIn('organizations.id', $staffOrgIds))
                    ->orWhereHas('subservices', function ($sq) use ($staffOrgIds) {
                        $sq->whereIn('organization_id', $staffOrgIds)
                            ->orWhereHas('offeringOrganizations', fn ($o) => $o->whereIn('organizations.id', $staffOrgIds));
                    });
            });
        }

        // Apply Sub-city Filter from Request
        if ($subCityOrgIds !== null) {
            $query->where(function ($q) use ($subCityOrgIds) {
                $q->whereIn('organization_id', $subCityOrgIds)
                    ->orWhereHas('offeringOrganizations', fn ($o) => $o->whereIn('organizations.id', $subCityOrgIds))
                    ->orWhereHas('subservices', function ($sq) use ($subCityOrgIds) {
                        $sq->whereIn('organization_id', $subCityOrgIds)
                            ->orWhereHas('offeringOrganizations', fn ($o) => $o->whereIn('organizations.id', $subCityOrgIds));
                    });
            });
        }

        // Apply Bureau / Organization Filter from Request
        if ($bureauOrgIds !== null) {
            $query->where(function ($q) use ($bureauOrgIds) {
                $q->whereIn('organization_id', $bureauOrgIds)
                    ->orWhereHas('offeringOrganizations', fn ($o) => $o->whereIn('organizations.id', $bureauOrgIds))
                    ->orWhereHas('parent', fn ($p) => $p->whereIn('organization_id', $bureauOrgIds))
                    ->orWhereHas('subservices', function ($sq) use ($bureauOrgIds) {
                        $sq->whereIn('organization_id', $bureauOrgIds)
                            ->orWhereHas('offeringOrganizations', fn ($o) => $o->whereIn('organizations.id', $bureauOrgIds));
                    });
            });
        }

        // Apply Category Domain Filter
        if ($hasCategoryFilter) {
            $query->where(function ($q) use ($categoryInput, $like) {
                if ($categoryInput === 'vital') {
                    $q->where('code', $like, 'CIV%')
                        ->orWhereHas('parent', fn ($p) => $p->where('code', $like, 'CIV%'))
                        ->orWhere('name', $like, '%vital%')
                        ->orWhere('name', $like, '%birth%')
                        ->orWhere('name', $like, '%marriage%')
                        ->orWhere('name', $like, '%death%')
                        ->orWhere('name', $like, '%civil%')
                        ->orWhere('name', $like, '%residen%')
                        ->orWhereHas('subservices', function ($sq) use ($like) {
                            $sq->where('code', $like, 'CIV%')->orWhere('name', $like, '%vital%');
                        });
                } elseif ($categoryInput === 'tax') {
                    $q->where('code', $like, 'REV%')
                        ->orWhereHas('parent', fn ($p) => $p->where('code', $like, 'REV%'))
                        ->orWhere('name', $like, '%tax%')
                        ->orWhere('name', $like, '%tin%')
                        ->orWhere('name', $like, '%revenue%')
                        ->orWhere('name', $like, '%clearance%')
                        ->orWhereHas('subservices', function ($sq) use ($like) {
                            $sq->where('code', $like, 'REV%')->orWhere('name', $like, '%tax%');
                        });
                } elseif ($categoryInput === 'business') {
                    $q->where('code', $like, 'TRD%')
                        ->orWhereHas('parent', fn ($p) => $p->where('code', $like, 'TRD%'))
                        ->orWhere('name', $like, '%business%')
                        ->orWhere('name', $like, '%license%')
                        ->orWhere('name', $like, '%trade%')
                        ->orWhere('name', $like, '%commercial%')
                        ->orWhereHas('subservices', function ($sq) use ($like) {
                            $sq->where('code', $like, 'TRD%')->orWhere('name', $like, '%trade%');
                        });
                } elseif ($categoryInput === 'land') {
                    $q->where('code', $like, 'LND%')
                        ->orWhereHas('parent', fn ($p) => $p->where('code', $like, 'LND%'))
                        ->orWhere('name', $like, '%land%')
                        ->orWhere('name', $like, '%property%')
                        ->orWhere('name', $like, '%lease%')
                        ->orWhere('name', $like, '%cadastre%')
                        ->orWhere('name', $like, '%deed%')
                        ->orWhereHas('subservices', function ($sq) use ($like) {
                            $sq->where('code', $like, 'LND%')->orWhere('name', $like, '%land%');
                        });
                } elseif ($categoryInput === 'plan') {
                    $q->where('code', $like, 'PLN%')
                        ->orWhereHas('parent', fn ($p) => $p->where('code', $like, 'PLN%'))
                        ->orWhere('name', $like, '%plan%')
                        ->orWhere('name', $like, '%urban%')
                        ->orWhere('name', $like, '%building%')
                        ->orWhere('name', $like, '%permit%')
                        ->orWhere('name', $like, '%construction%')
                        ->orWhereHas('subservices', function ($sq) use ($like) {
                            $sq->where('code', $like, 'PLN%')->orWhere('name', $like, '%plan%');
                        });
                } else {
                    $q->where('name', $like, "%{$categoryInput}%")
                        ->orWhere('code', $like, "%{$categoryInput}%")
                        ->orWhereHas('subservices', function ($sq) use ($categoryInput, $like) {
                            $sq->where('name', $like, "%{$categoryInput}%")
                                ->orWhere('code', $like, "%{$categoryInput}%");
                        });
                }
            });
        }

        // Apply Keyword Search Filter
        if ($hasSearchFilter) {
            $query->where(function ($q) use ($searchInput, $like) {
                $q->where('name', $like, "%{$searchInput}%")
                    ->orWhere('code', $like, "%{$searchInput}%")
                    ->orWhere('description', $like, "%{$searchInput}%")
                    ->orWhereHas('parent', fn ($p) => $p->where('name', $like, "%{$searchInput}%"))
                    ->orWhereHas('organization', fn ($o) => $o->where('name', $like, "%{$searchInput}%"))
                    ->orWhereHas('subservices', function ($sq) use ($searchInput, $like) {
                        $sq->where('name', $like, "%{$searchInput}%")
                            ->orWhere('code', $like, "%{$searchInput}%")
                            ->orWhere('description', $like, "%{$searchInput}%");
                    });
            });
        }

        // Scope / View Type Handling (Master vs Subservices vs All)
        $scopeInput = $request->input('scope') ?? $request->input('type') ?? $request->input('view');
        if ($request->boolean('tree') || $scopeInput === 'tree' || $scopeInput === 'master') {
            $query->whereNull('parent_id');
        } elseif ($scopeInput === 'subservices' || $request->input('parent_id') === 'subservices') {
            $query->whereNotNull('parent_id');
        } elseif ($request->has('parent_id')) {
            $parentId = $request->input('parent_id');
            if ($parentId === 'null' || $parentId === 'root') {
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', (int) $parentId);
            }
        }

        // Filter by fee
        if ($request->filled('fee')) {
            $feeType = (string) $request->input('fee');
            if ($feeType === 'free') {
                $query->where('fee_amount', 0);
            } elseif ($feeType === 'paid') {
                $query->where('fee_amount', '>', 0);
            }
        }

        $perPageInput = $request->input('per_page');
        if ($perPageInput === 'all' || $request->boolean('all') || $request->boolean('tree') || $scopeInput === 'tree') {
            $perPage = 250;
        } else {
            $perPage = min(max((int) ($perPageInput ?? 100), 1), 250);
        }

        $paginator = $query->orderBy('name')->paginate($perPage);

        return ApiResponse::paginated(
            paginator: $paginator,
            message: 'Services retrieved successfully.',
            resourceClass: ServiceResource::class
        );
    }

    /**
     * Show detailed service profile (lookup by ID or unique code slug).
     */
    public function show(Request $request, string $identifier): JsonResponse
    {
        $query = Service::with([
            'parent',
            'organization',
            'subservices.requiredDocuments',
            'requiredDocuments',
            'offeringOrganizations.type',
            'steps.organization',
        ])->withCount(['subservices', 'requiredDocuments', 'offeringOrganizations', 'steps']);

        $service = is_numeric($identifier)
            ? $query->where('id', (int) $identifier)->first()
            : $query->where('code', $identifier)->first();

        if (! $service) {
            return ApiResponse::error(
                message: 'Service not found.',
                statusCode: 404
            );
        }

        if (! $service->is_active) {
            $user = $request->user() ?? auth('sanctum')->user();
            if (! $user || ! $user->hasPermission('services.update')) {
                return ApiResponse::error(
                    message: 'Service not found.',
                    statusCode: 404
                );
            }
        }

        return ApiResponse::success(
            data: new ServiceResource($service),
            message: 'Service retrieved successfully.'
        );
    }

    /**
     * Create a new service or subservice.
     */
    public function store(CreateServiceRequest $request): JsonResponse
    {
        $data = $request->validated();
        $documents = $data['documents'] ?? null;
        unset($data['documents']);

        $data['is_active'] = $data['is_active'] ?? true;
        $data['fee_amount'] = $data['fee_amount'] ?? 0.00;
        $data['fee_currency'] = $data['fee_currency'] ?? 'ETB';

        $service = Service::create($data);

        if (is_array($documents) && count($documents) > 0) {
            $syncData = [];
            foreach ($documents as $doc) {
                $docId = is_array($doc) ? ($doc['document_id'] ?? null) : (int) $doc;
                if ($docId) {
                    $syncData[$docId] = [
                        'is_mandatory' => is_array($doc) ? ($doc['is_mandatory'] ?? true) : true,
                        'order_column' => is_array($doc) ? ($doc['order_column'] ?? 1) : 1,
                        'notes' => is_array($doc) ? ($doc['notes'] ?? null) : null,
                    ];
                }
            }
            if (!empty($syncData)) {
                $service->requiredDocuments()->sync($syncData);
            }
        }

        $service->load(['parent', 'organization', 'requiredDocuments']);

        $this->auditLogAction->execute(
            action: 'created',
            entity: $service,
            actor: $request->user(),
            newValues: $service->toArray(),
            request: $request
        );

        return ApiResponse::success(
            data: new ServiceResource($service),
            message: 'Service created successfully.',
            statusCode: 201
        );
    }

    /**
     * Update an existing service.
     */
    public function update(UpdateServiceRequest $request, Service $service): JsonResponse
    {
        $oldValues = $service->toArray();
        $data = $request->validated();

        if (array_key_exists('documents', $data)) {
            $documents = $data['documents'];
            unset($data['documents']);
            if (is_array($documents)) {
                $syncData = [];
                foreach ($documents as $doc) {
                    $docId = is_array($doc) ? ($doc['document_id'] ?? null) : (int) $doc;
                    if ($docId) {
                        $syncData[$docId] = [
                            'is_mandatory' => is_array($doc) ? ($doc['is_mandatory'] ?? true) : true,
                            'order_column' => is_array($doc) ? ($doc['order_column'] ?? 1) : 1,
                            'notes' => is_array($doc) ? ($doc['notes'] ?? null) : null,
                        ];
                    }
                }
                $service->requiredDocuments()->sync($syncData);
            }
        }

        $service->update($data);
        $service->load(['parent', 'organization', 'requiredDocuments']);

        $this->auditLogAction->execute(
            action: 'updated',
            entity: $service,
            actor: $request->user(),
            oldValues: $oldValues,
            newValues: $service->toArray(),
            request: $request
        );

        return ApiResponse::success(
            data: new ServiceResource($service),
            message: 'Service updated successfully.'
        );
    }

    /**
     * Soft-delete a service.
     */
    public function destroy(Request $request, Service $service): JsonResponse
    {
        // Prevent deleting a master service that still has active subservices
        if ($service->subservices()->exists()) {
            return ApiResponse::error(
                message: 'Cannot delete service with active subservices. Delete or reassign subservices first.',
                statusCode: 422
            );
        }

        $oldValues = $service->toArray();
        $service->delete();

        $this->auditLogAction->execute(
            action: 'deleted',
            entity: $service,
            actor: $request->user(),
            oldValues: $oldValues,
            request: $request
        );

        return ApiResponse::success(
            data: null,
            message: 'Service deleted successfully.'
        );
    }

    /**
     * Link/sync required documents for a service.
     */
    public function syncDocuments(SyncServiceDocumentsRequest $request, Service $service): JsonResponse
    {
        $syncData = [];
        $docs = $request->validated('documents') ?? [];
        foreach ($docs as $doc) {
            $syncData[$doc['document_id']] = [
                'is_mandatory' => $doc['is_mandatory'] ?? true,
                'order_column' => $doc['order_column'] ?? 1,
                'notes' => $doc['notes'] ?? null,
            ];
        }

        DB::transaction(function () use ($service, $syncData, $request) {
            $service->requiredDocuments()->sync($syncData);
            $service->load('requiredDocuments');

            $this->auditLogAction->execute(
                action: 'synced_documents',
                entity: $service,
                actor: $request->user(),
                newValues: $syncData,
                request: $request
            );
        });

        return ApiResponse::success(
            data: new ServiceResource($service),
            message: 'Required documents updated successfully.'
        );
    }

    /**
     * Assign/sync organizations offering this service.
     */
    public function syncOrganizations(SyncOfferingOrganizationsRequest $request, Service $service): JsonResponse
    {
        $syncData = [];
        $orgs = $request->validated('organizations') ?? [];
        foreach ($orgs as $org) {
            $syncData[$org['organization_id']] = [
                'is_available' => $org['is_available'] ?? true,
            ];
        }

        DB::transaction(function () use ($service, $syncData, $request) {
            $service->offeringOrganizations()->sync($syncData);
            $service->load('offeringOrganizations');

            $this->auditLogAction->execute(
                action: 'synced_organizations',
                entity: $service,
                actor: $request->user(),
                newValues: $syncData,
                request: $request
            );
        });

        return ApiResponse::success(
            data: new ServiceResource($service),
            message: 'Offering organizations updated successfully.'
        );
    }
}
