<?php

namespace Tests\Feature;

use App\Models\GalleryItem;
use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_access_admin_endpoints(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user)->getJson('/api/admin/stats');
        $response->assertStatus(403);
    }

    public function test_admin_can_get_global_stats(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->count(3)->create(['role' => 'user', 'is_active' => true]);

        $response = $this->actingAs($admin)->getJson('/api/admin/stats');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_users' => 3,
                    'active_users' => 3,
                ],
            ]);
    }

    public function test_admin_can_view_users_without_passwords(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->create(['role' => 'user', 'email' => 'test@user.com']);

        $response = $this->actingAs($admin)->getJson('/api/admin/users');

        $response->assertStatus(200)
            ->assertJsonMissing(['password']);
    }

    public function test_admin_can_toggle_user_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'user', 'is_active' => true]);

        $response = $this->actingAs($admin)->patchJson("/api/admin/users/{$user->id}/toggle-status");

        $response->assertStatus(200);
        $this->assertFalse($user->fresh()->is_active);
    }

    public function test_user_can_submit_report_and_admin_can_manage_it(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'user']);
        $item = GalleryItem::create([
            'user_id' => $user->id,
            'title' => 'Inappropriate Desk',
            'file_path' => 'gallery/test.jpg',
            'type' => 'inspiration',
            'visibility' => 'public',
        ]);

        // User reports content
        $reportRes = $this->actingAs($user)->postJson('/api/reports', [
            'reportable_id' => $item->id,
            'reportable_type' => 'gallery_item',
            'reason' => 'Spam content',
        ]);

        $reportRes->assertStatus(201);
        $reportId = $reportRes->json('data.id');

        // Admin views reports
        $listRes = $this->actingAs($admin)->getJson('/api/admin/reports');
        $listRes->assertStatus(200)
            ->assertJsonFragment(['reason' => 'Spam content']);

        // Admin updates report status
        $updateRes = $this->actingAs($admin)->patchJson("/api/admin/reports/{$reportId}", [
            'status' => 'resolved',
            'action_taken' => 'Item reviewed and confirmed valid.',
        ]);

        $updateRes->assertStatus(200);
        $this->assertEquals('resolved', Report::find($reportId)->status);
    }
}
