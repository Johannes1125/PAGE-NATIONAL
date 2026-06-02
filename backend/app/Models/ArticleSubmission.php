<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['user_id', 'title', 'author', 'abstract', 'keywords', 'file_path', 'file_name', 'status', 'reviewer_id', 'due_date'])]
class ArticleSubmission extends Model
{
    protected function casts(): array
    {
        return [
            'keywords' => 'array',
            'due_date' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}
