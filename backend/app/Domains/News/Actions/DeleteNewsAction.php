<?php

declare(strict_types=1);

namespace App\Domains\News\Actions;

use App\Domains\News\Models\News;
use Illuminate\Support\Facades\DB;

class DeleteNewsAction
{
    /**
     * Delete a news article and all associated content blocks within a database transaction.
     */
    public function execute(News $news): void
    {
        DB::transaction(function () use ($news) {
            $news->contents()->delete();
            $news->delete();
        });
    }
}
