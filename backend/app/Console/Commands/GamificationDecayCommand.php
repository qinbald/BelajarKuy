<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Subject;
use Carbon\Carbon;

class GamificationDecayCommand extends Command
{
    protected $signature = 'gamification:decay';
    protected $description = 'Kurangi 2% progress wilayah jika tidak ada aktivitas selama 7 hari';

    public function handle()
    {
        $threshold = Carbon::now()->subDays(7);

        // Kurangi 2% untuk subject yang idle > 7 hari
        Subject::where('conquest_progress', '>', 0)
            ->where(function ($query) use ($threshold) {
                $query->where('last_activity_at', '<', $threshold)
                      ->orWhereNull('last_activity_at');
            })
            ->decrement('conquest_progress', 2);

        // Cegah nilai minus
        Subject::where('conquest_progress', '<', 0)
            ->update(['conquest_progress' => 0]);

        $this->info('Gamification decay applied successfully.');
    }
}
