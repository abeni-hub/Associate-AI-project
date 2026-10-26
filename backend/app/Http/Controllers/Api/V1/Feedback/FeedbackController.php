<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Feedback;

use App\Domains\Feedback\Models\Feedback;
use App\Domains\Organizations\Services\OrganizationScopeService;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    /**
     * List feedback visible to the authenticated user along with its organization.
     *
     * Scoped to the user's own organization, plus descendant organizations
     * when the user holds the view-descendants permission.
     */
    public function index(Request $request, OrganizationScopeService $scopeService): JsonResponse
    {
        $user = $request->user();

        $includeDescendants = $user->hasPermission('feedback.view_descendants');

        $query = Feedback::query()->with('organization');

        $scopeService->applyScope(
            $query,
            $user,
            'feedback_for_organization',
            $includeDescendants
        );

        $feedback = $query->orderByDesc('created_at')->get();

        return ApiResponse::success(
            data: $feedback,
            message: 'Feedback retrieved successfully.'
        );
    }

    /**
     * Store a publicly submitted feedback entry.
     *
     * Publicly accessible without authentication.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'feedback_for_organization' => ['required', 'integer', 'exists:organizations,id'],
            'feedback_content' => ['required', 'string', 'max:5000'],
            'feedback_type' => ['required', 'in:feedback,complaint,satisfaction'],
            'full_name' => ['nullable', 'string', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
        ], [
            'feedback_for_organization.required' => 'Please select the organization this feedback is for.',
            'feedback_for_organization.integer' => 'The selected organization is invalid.',
            'feedback_for_organization.exists' => 'The selected organization does not exist.',
            'feedback_content.required' => 'Please enter your feedback.',
            'feedback_content.string' => 'The feedback must be a valid text.',
            'feedback_content.max' => 'The feedback may not be greater than 5000 characters.',
            'feedback_type.required' => 'Please select a feedback type.',
            'feedback_type.in' => 'The feedback type must be one of: feedback, complaint, satisfaction.',
            'full_name.string' => 'The full name must be a valid text.',
            'full_name.max' => 'The full name may not be greater than 255 characters.',
            'phone_number.string' => 'The phone number must be a valid text.',
            'phone_number.max' => 'The phone number may not be greater than 255 characters.',
            'email.email' => 'Please enter a valid email address.',
            'email.max' => 'The email may not be greater than 255 characters.',
        ]);

        if ($validated['feedback_type'] === 'complaint') {
            $validated['tracking_number'] = $this->generateTrackingNumber();
        }

        $feedback = Feedback::create($validated);

        return ApiResponse::success(
            data: $feedback,
            message: 'Feedback submitted successfully.',
            statusCode: 201
        );
    }

    /**
     * Generate a unique random 10-digit tracking number.
     */
    private function generateTrackingNumber(): string
    {
        do {
            $trackingNumber = (string) random_int(1_000_000_000, 9_999_999_999);
        } while (Feedback::where('tracking_number', $trackingNumber)->exists());

        return $trackingNumber;
    }
}
