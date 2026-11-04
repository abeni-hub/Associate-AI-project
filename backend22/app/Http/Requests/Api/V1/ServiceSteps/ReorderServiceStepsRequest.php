<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\ServiceSteps;

use Illuminate\Foundation\Http\FormRequest;

class ReorderServiceStepsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'steps' => ['required', 'array', 'min:1'],
            'steps.*.id' => ['required', 'integer', 'exists:service_steps,id'],
            'steps.*.step_number' => ['required', 'integer', 'min:1'],
        ];
    }
}
