<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudySession extends Model
{
    protected $fillable = [
        'user_id',
        'subject_id',
        'start_time',
        'end_time',
        'duration_seconds',
        'completed',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'end_time' => 'datetime',
            'duration_seconds' => 'integer',
            'completed' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
}
