<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['post_id', 'file_path', 'file_type', 'file_name'])]
class PostAttachment extends Model
{
    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
