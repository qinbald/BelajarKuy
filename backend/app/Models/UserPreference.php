<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'education_level',
        'interests',
        'favorite_visual_styles',
        'favorite_topics',
        'study_preferences',
        'tags',
    ];

    protected function casts(): array
    {
        return [
            'interests' => 'array',
            'favorite_visual_styles' => 'array',
            'favorite_topics' => 'array',
            'study_preferences' => 'array',
            'tags' => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
