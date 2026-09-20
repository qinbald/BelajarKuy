<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Subject;
use App\Models\Task;
use App\Models\GalleryTag;
use App\Models\GalleryItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::firstOrCreate(
            ['email' => 'admin@belajarkuy.test'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('Admin123!'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // Demo User
        $demoUser = User::firstOrCreate(
            ['email' => 'user@belajarkuy.test'],
            [
                'name' => 'Pelajar Demo',
                'password' => Hash::make('User123!'),
                'role' => 'user',
                'email_verified_at' => now(),
            ]
        );

        $demoUser->preference()->firstOrCreate([], [
            'education_level' => 'Perguruan Tinggi',
            'interests' => ['Pemrograman', 'Matematika Diskrit', 'UI/UX'],
            'favorite_visual_styles' => ['Minimalist', 'Clean'],
            'favorite_topics' => ['Web Development', 'Computer Science'],
            'study_preferences' => ['focus_timer' => 25, 'break_timer' => 5],
        ]);

        // Dummy Subjects
        $subject1 = Subject::firstOrCreate(
            ['user_id' => $demoUser->id, 'code' => 'CS101'],
            ['name' => 'Algoritma & Pemrograman', 'teacher' => 'Dr. Budi', 'color' => '#3B82F6']
        );
        $subject2 = Subject::firstOrCreate(
            ['user_id' => $demoUser->id, 'code' => 'CS102'],
            ['name' => 'Struktur Data', 'teacher' => 'Prof. Siti', 'color' => '#10B981']
        );

        // Dummy Tasks
        Task::firstOrCreate(
            ['user_id' => $demoUser->id, 'title' => 'Tugas Sorting Array'],
            [
                'subject_id' => $subject1->id,
                'description' => 'Implementasi Quick Sort dan Merge Sort',
                'priority' => 'high',
                'status' => 'pending',
                'due_date' => now()->addDays(2)->format('Y-m-d'),
            ]
        );
        Task::firstOrCreate(
            ['user_id' => $demoUser->id, 'title' => 'Baca Jurnal Tree'],
            [
                'subject_id' => $subject2->id,
                'description' => 'Baca bab 4 tentang Binary Search Tree',
                'priority' => 'medium',
                'status' => 'completed',
                'completed_at' => now(),
            ]
        );

        // Tags & Gallery Items
        $tagDesk = GalleryTag::firstOrCreate(['slug' => 'minimalist'], ['name' => 'Minimalist']);
        $tagNotes = GalleryTag::firstOrCreate(['slug' => 'clean'], ['name' => 'Clean']);
        $tagCode = GalleryTag::firstOrCreate(['slug' => 'pemrograman'], ['name' => 'Pemrograman']);
        $tagUI = GalleryTag::firstOrCreate(['slug' => 'ui-ux'], ['name' => 'UI/UX']);

        $admin = User::where('role', 'admin')->first();
        if ($admin) {
            $item1 = GalleryItem::firstOrCreate(
                ['title' => 'Minimalist Workspace Setup'],
                [
                    'user_id' => $admin->id,
                    'description' => 'Meja belajar minimalis dengan pencahayaan alami dan tanaman kecil.',
                    'file_path' => 'gallery/admin/seed_minimalist_desk.svg',
                    'type' => 'inspiration',
                    'visibility' => 'public',
                ]
            );
            $item1->tags()->syncWithoutDetaching([$tagDesk->id, $tagNotes->id]);

            $item2 = GalleryItem::firstOrCreate(
                ['title' => 'Aesthetic Study Notes'],
                [
                    'user_id' => $admin->id,
                    'description' => 'Contoh layout catatan rapi dengan highlight warna pastel.',
                    'file_path' => 'gallery/admin/seed_aesthetic_notes.svg',
                    'type' => 'inspiration',
                    'visibility' => 'public',
                ]
            );
            $item2->tags()->syncWithoutDetaching([$tagNotes->id, $tagUI->id]);

            $item3 = GalleryItem::firstOrCreate(
                ['title' => 'Dark Mode Coding Desk'],
                [
                    'user_id' => $admin->id,
                    'description' => 'Setup monitor ganda untuk sesi coding larut malam.',
                    'file_path' => 'gallery/admin/seed_dark_coding.svg',
                    'type' => 'inspiration',
                    'visibility' => 'public',
                ]
            );
            $item3->tags()->syncWithoutDetaching([$tagCode->id, $tagDesk->id]);

            // Seed sample reports
            \App\Models\Report::firstOrCreate(
                [
                    'reporter_id' => $demoUser->id,
                    'reportable_type' => GalleryItem::class,
                    'reportable_id' => $item3->id,
                ],
                [
                    'reason' => 'Konten gambar memiliki link eksternal yang mencurigakan di deskripsi.',
                    'status' => 'pending',
                ]
            );
        }
    }
}
