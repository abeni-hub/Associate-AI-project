<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Cms;

use App\Domains\Cms\Actions\GetLandingPageCmsAction;
use App\Domains\Cms\Actions\UpdateLandingPageCmsAction;
use App\Domains\Cms\Actions\UploadCmsImageAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Cms\UpdateLandingPageCmsRequest;
use App\Http\Requests\Api\V1\Cms\UploadCmsImageRequest;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CmsController extends Controller
{
    /**
     * Retrieve the landing page CMS configuration.
     * Accessible publicly by citizen app, preview iframe, and unauthenticated guests.
     */
    public function show(Request $request, GetLandingPageCmsAction $action): JsonResponse
    {
        $content = $action->execute();

        return ApiResponse::success(
            data: $content,
            message: 'Landing page CMS configuration retrieved successfully.'
        );
    }

    /**
     * Update the landing page CMS configuration.
     * Restricted to authenticated Super Admins with cms.manage permission.
     */
    public function update(
        UpdateLandingPageCmsRequest $request,
        UpdateLandingPageCmsAction $action
    ): JsonResponse {
        $config = $action->execute(
            payload: $request->validated(),
            actor: $request->user(),
            request: $request
        );

        return ApiResponse::success(
            data: $config->content,
            message: 'Landing page CMS configuration updated successfully.'
        );
    }

    /**
     * Upload a hero or carousel image for CMS usage.
     * Restricted to authenticated Super Admins with cms.manage permission.
     */
    public function uploadImage(
        UploadCmsImageRequest $request,
        UploadCmsImageAction $action
    ): JsonResponse {
        $result = $action->execute(
            file: $request->file('image'),
            request: $request
        );

        return ApiResponse::success(
            data: $result,
            message: 'CMS image uploaded successfully.',
            statusCode: 201
        );
    }
}
