<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['conversation_id', 'sender_id', 'receiver_id', 'subject', 'text', 'status'])]
class Message extends Model
{
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function attachments()
    {
        return $this->hasMany(MessageAttachment::class);
    }
}
