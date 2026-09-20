<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GalleryTag extends Model
{
    protected $fillable = ['name', 'slug'];

    public function galleryItems()
    {
        return $this->belongsToMany(GalleryItem::class, 'gallery_item_tags', 'gallery_tag_id', 'gallery_item_id');
    }
}
