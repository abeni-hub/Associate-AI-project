<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\QrCodes;

use App\Domains\AuditLogs\Actions\RecordAuditLogAction;
use App\Domains\Organizations\Services\OrganizationScopeService;
use App\Domains\QrCodes\Models\QrCode;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\QrCodes\StoreQrCodeRequest;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QrCodeController extends Controller
{
    public function __construct(
        private readonly OrganizationScopeService $scopeService,
        private readonly RecordAuditLogAction $auditLogger
    ) {}

    /**
     * List QR posters scoped to the actor's administrative domain.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = QrCode::with('organization:id,name,code')->latest();

        if ($user && ! $user->isSuperAdmin()) {
            $this->scopeService->applyScope($query, $user, 'organization_id', includeDescendants: true);
        }

        $qrCodes = $query->paginate(20);

        return ApiResponse::success(
            data: $qrCodes,
            message: 'QR codes retrieved successfully.'
        );
    }

    /**
     * Show single QR code poster.
     */
    public function show(QrCode $qrCode): JsonResponse
    {
        $qrCode->load('organization:id,name,code');

        return ApiResponse::success(
            data: $qrCode,
            message: 'QR code retrieved successfully.'
        );
    }

    /**
     * Create a new QR code token for an organization.
     */
    public function store(StoreQrCodeRequest $request): JsonResponse
    {
        $qrCode = QrCode::create($request->validated());

        $this->auditLogger->execute(
            action: 'created',
            entity: $qrCode,
            actor: $request->user(),
            newValues: $qrCode->toArray(),
            request: $request
        );

        return ApiResponse::created(
            data: $qrCode->load('organization:id,name,code'),
            message: 'QR code generated successfully.'
        );
    }

    /**
     * Public scan tracking endpoint: increments scan counter and returns destination URL.
     */
    public function scan(string $code): JsonResponse
    {
        $qrCode = QrCode::where('code', $code)->first();
        if (! $qrCode) {
            return ApiResponse::notFound('QR poster not found.');
        }

        $qrCode->recordScan();

        return ApiResponse::success(
            data: [
                'target_url' => $qrCode->target_url,
                'scan_count' => $qrCode->scan_count,
                'label' => $qrCode->label,
            ],
            message: 'Scan recorded successfully.'
        );
    }
}
