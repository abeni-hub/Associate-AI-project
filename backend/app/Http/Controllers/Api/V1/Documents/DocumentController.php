<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Documents;

use App\Domains\AuditLogs\Actions\RecordAuditLogAction;
use App\Domains\Documents\Models\Document;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Documents\CreateDocumentRequest;
use App\Http\Requests\Api\V1\Documents\UpdateDocumentRequest;
use App\Http\Resources\Api\V1\DocumentResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function __construct(
        private readonly RecordAuditLogAction $auditLogAction
    ) {}

    /**
     * List required documents catalog with search.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Document::withCount('services');

        $user = $request->user();
        if (! $user || ! $user->hasPermission('documents.manage')) {
            $query->where('is_active', true);
        } elseif ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('search')) {
            $search = (string) $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('code', 'ilike', "%{$search}%")
                    ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        $perPage = min(max((int) $request->input('per_page', 20), 1), 100);
        $paginator = $query->orderBy('name')->paginate($perPage);

        return ApiResponse::paginated(
            paginator: $paginator,
            message: 'Documents retrieved successfully.',
            resourceClass: DocumentResource::class
        );
    }

    /**
     * Show single document profile by ID or code slug.
     */
    public function show(string $identifier): JsonResponse
    {
        $query = Document::with(['services' => fn ($q) => $q->where('is_active', true)])
            ->withCount('services');

        $document = is_numeric($identifier)
            ? $query->where('id', (int) $identifier)->first()
            : $query->where('code', $identifier)->first();

        if (! $document) {
            return ApiResponse::error(
                message: 'Document not found.',
                statusCode: 404
            );
        }

        return ApiResponse::success(
            data: new DocumentResource($document),
            message: 'Document retrieved successfully.'
        );
    }

    /**
     * Create a new document in the catalog.
     */
    public function store(CreateDocumentRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['is_active'] = $data['is_active'] ?? true;

        $document = Document::create($data);

        $this->auditLogAction->execute(
            action: 'created',
            entity: $document,
            actor: $request->user(),
            newValues: $document->toArray(),
            request: $request
        );

        return ApiResponse::success(
            data: new DocumentResource($document),
            message: 'Document created successfully.',
            statusCode: 201
        );
    }

    /**
     * Update an existing document.
     */
    public function update(UpdateDocumentRequest $request, Document $document): JsonResponse
    {
        $oldValues = $document->toArray();
        $document->update($request->validated());

        $this->auditLogAction->execute(
            action: 'updated',
            entity: $document,
            actor: $request->user(),
            oldValues: $oldValues,
            newValues: $document->toArray(),
            request: $request
        );

        return ApiResponse::success(
            data: new DocumentResource($document),
            message: 'Document updated successfully.'
        );
    }

    /**
     * Soft-delete a document.
     */
    public function destroy(Request $request, Document $document): JsonResponse
    {
        $oldValues = $document->toArray();
        $document->delete();

        $this->auditLogAction->execute(
            action: 'deleted',
            entity: $document,
            actor: $request->user(),
            oldValues: $oldValues,
            request: $request
        );

        return ApiResponse::success(
            data: null,
            message: 'Document deleted successfully.'
        );
    }
}
