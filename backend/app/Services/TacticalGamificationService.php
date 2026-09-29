<?php

namespace App\Services;

use App\Models\User;
use App\Models\Subject;

class TacticalGamificationService
{
    public const RANKS = [
        0 => 'Prajurit',
        500 => 'Sersan',
        1500 => 'Letnan',
        3000 => 'Kapten',
        6000 => 'Komandan',
        12000 => 'Jenderal',
        25000 => 'Panglima Besar'
    ];

    public function awardExp(User $user, int $amount): array
    {
        $user->exp += $amount;
        $newRank = $this->calculateRank($user->exp);
        
        $rankUp = false;
        if ($user->tactical_rank !== $newRank) {
            $user->tactical_rank = $newRank;
            $rankUp = true;
        }
        
        $user->save();
        
        return [
            'exp' => $user->exp,
            'rank' => $user->tactical_rank,
            'rank_up' => $rankUp
        ];
    }

    public function advanceConquest(Subject $subject, int $progressAmount): int
    {
        $subject->conquest_progress = min(100, $subject->conquest_progress + $progressAmount);
        $subject->last_activity_at = now();
        $subject->save();
        
        return $subject->conquest_progress;
    }

    private function calculateRank(int $exp): string
    {
        $currentRank = 'Prajurit';
        foreach (self::RANKS as $threshold => $rank) {
            if ($exp >= $threshold) {
                $currentRank = $rank;
            } else {
                break;
            }
        }
        return $currentRank;
    }
}
