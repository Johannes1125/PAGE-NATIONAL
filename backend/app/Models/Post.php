<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['user_id', 'title', 'category', 'author', 'excerpt', 'content_html', 'status', 'feedback', 'scheduled_at', 'published_at', 'assigned_members'])]
class Post extends Model
{
    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'published_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function attachments()
    {
        return $this->hasMany(PostAttachment::class);
    }
}
