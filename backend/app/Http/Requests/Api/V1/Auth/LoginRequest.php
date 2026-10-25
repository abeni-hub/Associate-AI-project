<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'login' => ['required_without:username', 'string'],
            'username' => ['required_without:login', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Get the login identifier (supports login or username parameter).
     */
    public function getIdentifier(): string
    {
        return (string) ($this->input('login') ?? $this->input('username'));
    }
}
