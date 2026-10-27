<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\News;

use App\Domains\AuditLogs\Actions\RecordAuditLogAction;
use App\Domains\News\Actions\CreateNewsAction;
use App\Domains\News\Actions\DeleteNewsAction;
use App\Domains\News\Actions\UpdateNewsAction;
use App\Domains\News\DTOs\NewsData;
use App\Domains\News\Models\News;
use App\Domains\Organizations\Services\OrganizationScopeService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\News\StoreNewsRequest;
use App\Http\Requests\Api\V1\News\UpdateNewsRequest;
use App\Http\Resources\Api\V1\NewsResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NewsController extends Controller
{
    public function __construct(
        private readonly OrganizationScopeService $scopeService,
        private readonly CreateNewsAction $createAction,
        private readonly UpdateNewsAction $updateAction,
        private readonly DeleteNewsAction $deleteAction,
        private readonly RecordAuditLogAction $auditLogAction,
    ) {}

    /**
     * List all news items, newest first.
     *
     * Publicly accessible without authentication.
     */
    public function index(Request $request): JsonResponse
    {
        $query = News::query()
            ->with([
                'organization:id,name,code',
                'contents' => fn ($builder) => $builder->orderBy('order'),
            ]);

        if ($request->filled('search')) {
            $search = (string) $request->input('search');
            $query->where('news_title', 'ilike', "%{$search}%");
        }

        if ($request->filled('organization_id')) {
            $query->where('organization_id', (int) $request->input('organization_id'));
        }

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);
        $paginator = $query->orderByDesc('created_at')->paginate($perPage);

        return ApiResponse::paginated(
            paginator: $paginator,
            resourceClass: NewsResource::class,
            message: 'News retrieved successfully.'
        );
    }

    /**
     * Show a single news item with its ordered content blocks.
     *
     * Publicly accessible without authentication.
     */
    public function show(News $news): JsonResponse
    {
        $news->loadMissing([
            'organization:id,name,code',
            'contents' => fn ($builder) => $builder->orderBy('order'),
        ]);

        return ApiResponse::success(
            data: new NewsResource($news),
            message: 'News retrieved successfully.'
        );
    }

    /**
     * Create a news item with optional ordered content blocks.
     */
    public function store(StoreNewsRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $targetOrgId = $validated['organization_id'] ?? $user->organization_id;

        if (empty($targetOrgId)) {
            return ApiResponse::error(
                message: 'An organization must be assigned to create news.',
                statusCode: 422
            );
        }

        if (! $this->scopeService->canAccessOrganization($user, (int) $targetOrgId, allowDescendants: true)) {
            return ApiResponse::error(
                message: 'You do not have permission to create news for this organization.',
                statusCode: 403
            );
        }

        $newsData = NewsData::fromRequest($request, (int) $targetOrgId);

        $news = DB::transaction(function () use ($newsData, $user, $request) {
            $news = $this->createAction->execute($newsData);

            $this->auditLogAction->execute(
                action: 'created',
                entity: $news,
                actor: $user,
                newValues: $news->toArray(),
                request: $request
            );

            return $news;
        });

        return ApiResponse::success(
            data: new NewsResource($news),
            message: 'News created successfully.',
            statusCode: 201
        );
    }

    /**
     * Update a news item's title and optionally replace its content blocks.
     *
     * Only allowed for the organization that created the news, any
     * ancestor organization above it, or a platform-wide Super Admin.
     */
    public function update(UpdateNewsRequest $request, News $news): JsonResponse
    {
        $user = $request->user();

        if (! $this->scopeService->canAccessOrganization($user, $news->organization_id, allowDescendants: true)) {
            return ApiResponse::error(
                message: 'You do not have permission to update this news item.',
                statusCode: 403
            );
        }

        $validated = $request->validated();

        if (array_key_exists('organization_id', $validated)) {
            if (! $this->scopeService->canAccessOrganization($user, (int) $validated['organization_id'], allowDescendants: true)) {
                return ApiResponse::error(
                    message: 'You do not have permission to reassign news to this organization.',
                    statusCode: 403
                );
            }
        }

        $updated = DB::transaction(function () use ($news, $validated, $user, $request) {
            $oldValues = $news->toArray();
            $updated = $this->updateAction->execute($news, $validated);

            $this->auditLogAction->execute(
                action: 'updated',
                entity: $updated,
                actor: $user,
                oldValues: $oldValues,
                newValues: $updated->toArray(),
                request: $request
            );

            return $updated;
        });

        return ApiResponse::success(
            data: new NewsResource($updated),
            message: 'News updated successfully.'
        );
    }

    /**
     * Delete a news item and its content blocks.
     *
     * Only allowed for the organization that created the news, any
     * ancestor organization above it, or a platform-wide Super Admin.
     */
    public function destroy(Request $request, News $news): JsonResponse
    {
        $user = $request->user();

        if (! $this->scopeService->canAccessOrganization($user, $news->organization_id, allowDescendants: true)) {
            return ApiResponse::error(
                message: 'You do not have permission to delete this news item.',
                statusCode: 403
            );
        }

        DB::transaction(function () use ($news, $user, $request) {
            $oldValues = $news->toArray();
            $this->deleteAction->execute($news);

            $this->auditLogAction->execute(
                action: 'deleted',
                entity: $news,
                actor: $user,
                oldValues: $oldValues,
                request: $request
            );
        });

        return ApiResponse::success(
            data: null,
            message: 'News deleted successfully.'
        );
    }
}
