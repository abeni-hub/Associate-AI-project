<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Domains\Dashboard\Services\DashboardMetricsService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Dashboard\FeedbackReportRequest;
use App\Http\Requests\Api\V1\Dashboard\RecentActivityRequest;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardMetricsService $dashboardService
    ) {}

    /**
     * Retrieve high-level KPI overview metrics.
     */
    public function overview(Request $request): JsonResponse
    {
        $data = $this->dashboardService->getOverview($request->user());

        return ApiResponse::success(
            data: $data,
            message: 'Dashboard overview retrieved successfully.'
        );
    }

    /**
     * Retrieve citizen feedback analytics and trends.
     */
    public function feedbackReport(FeedbackReportRequest $request): JsonResponse
    {
        $data = $this->dashboardService->getFeedbackReport(
            user: $request->user(),
            startDate: $request->input('start_date'),
            endDate: $request->input('end_date'),
            organizationId: $request->filled('organization_id') ? (int) $request->input('organization_id') : null
        );

        return ApiResponse::success(
            data: $data,
            message: 'Feedback report retrieved successfully.'
        );
    }

    /**
     * Retrieve service catalog analytics and delivery metrics.
     */
    public function servicesReport(Request $request): JsonResponse
    {
        $data = $this->dashboardService->getServicesReport($request->user());

        return ApiResponse::success(
            data: $data,
            message: 'Services report retrieved successfully.'
        );
    }

    /**
     * Retrieve organization structure and coverage analytics.
     */
    public function organizationsReport(Request $request): JsonResponse
    {
        $data = $this->dashboardService->getOrganizationsReport($request->user());

        return ApiResponse::success(
            data: $data,
            message: 'Organizations report retrieved successfully.'
        );
    }

    /**
     * Retrieve recent administrative activity within organization scope.
     */
    public function recentActivity(RecentActivityRequest $request): JsonResponse
    {
        $limit = $request->input('limit', 15);
        $entityType = $request->input('entity_type');
        $action = $request->input('action');

        $data = $this->dashboardService->getRecentActivity(
            user: $request->user(),
            limit: (int) $limit,
            entityType: $entityType ? (string) $entityType : null,
            action: $action ? (string) $action : null
        );

        return ApiResponse::success(
            data: $data,
            message: 'Recent activity retrieved successfully.'
        );
    }
}
