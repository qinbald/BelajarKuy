<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'code',
        'teacher',
        'description',
        'color',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
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
}
