<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['message_id', 'file_path', 'file_name'])]
class MessageAttachment extends Model
{
    public function message()
    {
        return $this->belongsTo(Message::class);
    }
}
