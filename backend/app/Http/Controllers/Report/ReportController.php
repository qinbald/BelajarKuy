<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Models\GalleryItem;
use App\Models\Report;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'reportable_id' => 'required|integer',
            'reportable_type' => 'required|string|in:gallery_item,App\Models\GalleryItem',
            'reason' => 'required|string|max:500',
        ]);

        // Map short type to full class name if needed
        $type = $request->reportable_type;
        if ($type === 'gallery_item') {
            $type = GalleryItem::class;
        }

        if (!GalleryItem::where('id', $request->reportable_id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Konten yang dilaporkan tidak ditemukan.',
            ], 404);
        }

        $report = Report::create([
            'reporter_id' => $request->user()->id,
            'reportable_type' => $type,
            'reportable_id' => $request->reportable_id,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Laporan Anda telah dikirim dan akan ditinjau oleh Admin.',
            'data' => $report,
        ], 201);
    }
}
