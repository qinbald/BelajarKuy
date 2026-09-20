<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    protected $fillable = [
        'user_id',
        'subject_id',
        'title',
        'type',
        'score',
        'max_score',
        'date',
    ];

    protected $casts = [
        'score' => 'float',
        'max_score' => 'float',
        'date' => 'date',
    ];

    protected $appends = ['percentage'];

    public function getPercentageAttribute(): float
    {
        if ($this->max_score > 0) {
            return round(($this->score / $this->max_score) * 100, 2);
        }
        return 0;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function learningResults()
    {
        return $this->hasMany(LearningResult::class);
    }
}
