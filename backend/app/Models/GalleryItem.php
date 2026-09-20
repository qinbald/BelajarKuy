<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GalleryItem extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'file_path',
        'type',
        'source',
        'visibility',
    ];

    protected $appends = ['file_url'];

    public function getFileUrlAttribute(): ?string
    {
        return $this->file_path ? asset('storage/' . $this->file_path) : null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tags()
    {
        return $this->belongsToMany(GalleryTag::class, 'gallery_item_tags', 'gallery_item_id', 'gallery_tag_id');
    }
}
