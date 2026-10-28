<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class HealthController extends Controller
{
    /**
     * Check platform health, API version, and database status.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $databaseStatus = 'disconnected';
        $databaseDetails = [];

        try {
            DB::connection()->getPdo();
            $databaseStatus = 'connected';
            $driver = DB::connection()->getDriverName();
            $databaseDetails = [
                'driver' => $driver,
                'database' => DB::connection()->getDatabaseName(),
            ];
        } catch (Throwable $e) {
            $databaseDetails = [
                'error' => $e->getMessage(),
            ];
        }

        $data = [
            'service' => config('app.name', 'Government Platform'),
            'api_version' => 'v1',
            'environment' => config('app.env'),
            'timestamp' => now()->toIso8601String(),
            'database' => [
                'status' => $databaseStatus,
                'details' => $databaseDetails,
            ],
        ];

        return ApiResponse::success(
            data: $data,
            message: 'Government Platform API v1 is active and healthy.'
        );
    }
}
