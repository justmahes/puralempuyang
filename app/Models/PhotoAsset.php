<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhotoAsset extends Model
{
    use HasFactory;

    protected $fillable = ['photo_queue_entry_id', 'file_path', 'mime', 'size'];

    public function entry()
    {
        return $this->belongsTo(PhotoQueueEntry::class, 'photo_queue_entry_id');
    }
}

