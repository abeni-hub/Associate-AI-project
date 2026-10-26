<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\News;

use App\Domains\News\Models\News;
use App\Domains\Organizations\Services\OrganizationScopeService;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    /**
     * List all news items, newest first.
     *
     * Publicly accessible without authentication.
     */
    public function index(): JsonResponse
    {
        $news = News::query()
            ->with([
                'organization',
                'contents' => fn ($builder) => $builder->orderBy('order'),
            ])
            ->orderByDesc('created_at')
            ->get();

        return ApiResponse::success(
            data: $news,
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
        $news->load([
            'organization',
            'contents' => fn ($builder) => $builder->orderBy('order'),
        ]);

        return ApiResponse::success(
            data: $news,
            message: 'News retrieved successfully.'
        );
    }

    /**
     * Create a news item with optional ordered content blocks.
     */
    public function store(Request $request, OrganizationScopeService $scopeService): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'news_title' => ['required', 'string'],
            'organization_id' => ['sometimes', 'integer', 'exists:organizations,id'],
            'contents' => ['sometimes', 'array'],
            'contents.*.content' => ['required_with:contents', 'string'],
            'contents.*.content_type' => ['sometimes', 'string'],
            'contents.*.order' => ['sometimes', 'integer', 'min:1'],
        ]);

        if (! $user->isSuperAdmin()) {
            $validated['organization_id'] = $user->organization_id;
        }

        if (empty($validated['organization_id'])) {
            return ApiResponse::error(
                message: 'An organization must be assigned to create news.',
                statusCode: 422
            );
        }

        if (! $scopeService->canAccessOrganization($user, (int) $validated['organization_id'])) {
            return ApiResponse::error(
                message: 'You do not have permission to create news for this organization.',
                statusCode: 403
            );
        }

        $news = News::create([
            'organization_id' => $validated['organization_id'],
            'news_title' => $validated['news_title'],
        ]);

        $this->replaceContents($news, $validated['contents'] ?? []);
        $news->load([
            'organization',
            'contents' => fn ($builder) => $builder->orderBy('order'),
        ]);

        return ApiResponse::success(
            data: $news,
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
    public function update(Request $request, News $news, OrganizationScopeService $scopeService): JsonResponse
    {
        $user = $request->user();

        if (! $scopeService->canAccessOrganization($user, $news->organization_id, allowDescendants: true)) {
            return ApiResponse::error(
                message: 'You do not have permission to update this news item.',
                statusCode: 403
            );
        }

        $validated = $request->validate([
            'news_title' => ['sometimes', 'string'],
            'contents' => ['sometimes', 'array'],
            'contents.*.content' => ['required_with:contents', 'string'],
            'contents.*.content_type' => ['sometimes', 'string'],
            'contents.*.order' => ['sometimes', 'integer', 'min:1'],
        ]);

        if (array_key_exists('news_title', $validated)) {
            $news->news_title = $validated['news_title'];
            $news->save();
        }

        if (array_key_exists('contents', $validated)) {
            $this->replaceContents($news, $validated['contents']);
        }

        $news->load([
            'organization',
            'contents' => fn ($builder) => $builder->orderBy('order'),
        ]);

        return ApiResponse::success(
            data: $news,
            message: 'News updated successfully.'
        );
    }

    /**
     * Delete a news item and its content blocks.
     *
     * Only allowed for the organization that created the news, any
     * ancestor organization above it, or a platform-wide Super Admin.
     */
    public function destroy(Request $request, News $news, OrganizationScopeService $scopeService): JsonResponse
    {
        if (! $scopeService->canAccessOrganization($request->user(), $news->organization_id, allowDescendants: true)) {
            return ApiResponse::error(
                message: 'You do not have permission to delete this news item.',
                statusCode: 403
            );
        }

        $news->contents()->delete();
        $news->delete();

        return ApiResponse::success(
            data: null,
            message: 'News deleted successfully.'
        );
    }

    /**
     * Replace all content blocks of a news item with the given set.
     *
     * @param  array<int, array<string, mixed>>  $contents
     */
    private function replaceContents(News $news, array $contents): void
    {
        $news->contents()->delete();

        foreach ($contents as $index => $block) {
            $news->contents()->create([
                'content' => $block['content'],
                'content_type' => $block['content_type'] ?? 'text',
                'order' => $block['order'] ?? $index + 1,
            ]);
        }
    }
}
