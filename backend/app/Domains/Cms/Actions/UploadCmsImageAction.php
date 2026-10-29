<?php

declare(strict_types=1);

namespace App\Domains\Cms\Actions;

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadCmsImageAction
{
    /**
     * Store an uploaded image on the public disk under cms/hero/ and return the URL and metadata.
     *
     * @return array{url: string, filename: string, path: string}
     */
    public function execute(UploadedFile $file, ?Request $request = null): array
    {
        $extension = $file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'jpg';
        $filename = sprintf('%s_%s.%s', date('Ymd_His'), Str::random(10), $extension);

        $path = $file->storeAs('cms/hero', $filename, 'public');

        $storageUrl = Storage::disk('public')->url($path);
        $absoluteUrl = str_starts_with($storageUrl, 'http://') || str_starts_with($storageUrl, 'https://')
            ? $storageUrl
            : url($storageUrl);

        return [
            'url' => $absoluteUrl,
            'filename' => $filename,
            'path' => $path,
        ];
    }
}
