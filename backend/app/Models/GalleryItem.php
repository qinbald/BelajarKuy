<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Support\Facades\Storage;

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

    protected $appends = ['file_url', 'thumb_url'];

    public function getFileUrlAttribute(): ?string
    {
        return $this->file_path ? Storage::url($this->file_path) : null;
    }

    public function getThumbUrlAttribute(): ?string
    {
        if (!$this->file_path) return null;
        $thumbPath = preg_replace('/(\.[^.]+)$/', '_thumb.webp', $this->file_path);
        return Storage::exists($thumbPath) ? Storage::url($thumbPath) : $this->file_url;
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
