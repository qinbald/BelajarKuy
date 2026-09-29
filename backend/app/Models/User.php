<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar',
        'is_active',
        'exp',
        'tactical_rank',
        'default_passing_grade',
    ];

    protected $attributes = [
        'role' => 'user',
        'is_active' => true,
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function preference()
    {
        return $this->hasOne(UserPreference::class);
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    public function studySessions()
    {
        return $this->hasMany(StudySession::class);
    }

    public function grades()
    {
        return $this->hasMany(Grade::class);
    }

    public function learningResults()
    {
        return $this->hasMany(LearningResult::class);
    }

    public function galleryItems()
    {
        return $this->hasMany(GalleryItem::class);
    }
}
