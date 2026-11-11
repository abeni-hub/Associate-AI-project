<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Events;

use App\Domains\AuditLogs\Actions\RecordAuditLogAction;
use App\Domains\Events\Models\Event;
use App\Domains\Events\Models\EventImage;
use App\Domains\Organizations\Services\OrganizationScopeService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Events\StoreEventRequest;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventController extends Controller
{
    public function __construct(
        private readonly OrganizationScopeService $scopeService,
        private readonly RecordAuditLogAction $auditLogger
    ) {}

    /**
     * List events (public / authenticated).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Event::with(['organization:id,name,code', 'images'])->latest('event_date');

        if (! $user) {
            $query->published()->upcoming();
        } elseif (! $user->isSuperAdmin()) {
            $this->scopeService->applyScope($query, $user, 'organization_id', includeDescendants: true);
        }

        $events = $query->paginate(15);

        return ApiResponse::success(
            data: $events,
            message: 'Events retrieved successfully.'
        );
    }

    /**
     * Show single event details with full photo gallery.
     */
    public function show(Event $event): JsonResponse
    {
        $event->load(['organization:id,name,code', 'images']);

        return ApiResponse::success(
            data: $event,
            message: 'Event details retrieved successfully.'
        );
    }

    /**
     * Create event with multiple gallery photos.
     */
    public function store(StoreEventRequest $request): JsonResponse
    {
        $data = $request->validated();
        $imagesData = $data['images'] ?? [];
        unset($data['images']);

        $event = DB::transaction(function () use ($data, $imagesData, $request) {
            $event = Event::create($data);

            foreach ($imagesData as $index => $img) {
                EventImage::create([
                    'event_id' => $event->id,
                    'image_url' => $img['image_url'],
                    'caption' => $img['caption'] ?? null,
                    'order_column' => $img['order_column'] ?? ($index + 1),
                ]);
            }

            $this->auditLogger->execute(
                action: 'created',
                entity: $event,
                actor: $request->user(),
                newValues: $event->toArray(),
                request: $request
            );

            return $event;
        });

        return ApiResponse::created(
            data: $event->load(['organization:id,name,code', 'images']),
            message: 'Community event created successfully.'
        );
    }

    /**
     * Delete event and associated photos.
     */
    public function destroy(Event $event, Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user && ! $user->isSuperAdmin() && ! $this->scopeService->canAccessOrganization($user, $event->organization_id, allowDescendants: true)) {
            return ApiResponse::forbidden('You do not have permission to delete this event.');
        }

        $oldValues = $event->toArray();
        $event->delete();

        $this->auditLogger->execute(
            action: 'deleted',
            entity: $event,
            actor: $user,
            oldValues: $oldValues,
            request: $request
        );

        return ApiResponse::success(
            data: null,
            message: 'Event deleted successfully.'
        );
    }
}
