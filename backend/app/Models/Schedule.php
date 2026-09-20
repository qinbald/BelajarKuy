<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = [
        'user_id',
        'subject_id',
        'title',
        'day',
        'start_time',
        'end_time',
        'type',
        'location',
    ];

    protected function casts(): array
    {
        return [
            'day' => 'integer',
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
