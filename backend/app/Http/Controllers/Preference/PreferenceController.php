<?php

namespace App\Http\Controllers\Preference;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PreferenceController extends Controller
{
    public function show(Request $request)
    {
        $preference = $request->user()->preference;

        return response()->json([
            'success' => true,
            'data' => [
                'preference' => $preference,
                'has_completed_survey' => $preference !== null && (
                    $preference->education_level !== null ||
                    !empty($preference->interests) ||
                    !empty($preference->tags)
                ),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'education_level' => 'nullable|string|max:50',
            'interests' => 'nullable|array',
            'interests.*' => 'string|max:50',
            'favorite_visual_styles' => 'nullable|array',
            'favorite_visual_styles.*' => 'string|max:50',
            'favorite_topics' => 'nullable|array',
            'favorite_topics.*' => 'string|max:50',
            'study_preferences' => 'nullable|array',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        $preference = $request->user()->preference()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return response()->json([
            'success' => true,
            'message' => 'Preferensi berhasil disimpan.',
            'data' => $preference,
        ]);
    }
}
