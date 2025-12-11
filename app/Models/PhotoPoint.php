<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhotoPoint extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'location', 'is_active'];

    public function entries()
    {
        return $this->hasMany(PhotoQueueEntry::class);
    }
}

