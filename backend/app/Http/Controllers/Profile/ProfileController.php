<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'institution' => 'nullable|string|max:150',
            'default_passing_grade' => 'required|numeric|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update([
            'name' => $request->name,
            'institution' => $request->institution,
            'default_passing_grade' => $request->default_passing_grade,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui',
            'data' => [
                'user' => $user->load('preference')
            ]
        ]);
    }

    public function uploadAvatar(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Simpan gambar
        if ($request->hasFile('avatar')) {
            // Hapus avatar lama jika ada (dan jika bukan default/eksternal)
            if ($user->avatar && str_starts_with($user->avatar, '/storage/')) {
                $oldPath = str_replace('/storage/', 'public/', $user->avatar);
                Storage::delete($oldPath);
            }

            $path = $request->file('avatar')->store('public/avatars');
            $url = Storage::url($path); // Menghasilkan /storage/avatars/xxxx.jpg

            $user->update([
                'avatar' => $url
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Avatar berhasil diperbarui',
            'data' => [
                'user' => $user->load('preference')
            ]
        ]);
    }
}
