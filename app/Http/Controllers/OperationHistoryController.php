<?php

namespace App\Http\Controllers;

use App\Models\OperationHistory;
use Illuminate\Http\JsonResponse;

class OperationHistoryController extends Controller
{
    /**
     * Получить историю операций.
     */
    public function index(): JsonResponse
    {
        $history = OperationHistory::query()
            ->with(['good:id,name', 'user:id,email'])
            ->orderByDesc('created_at')
            ->limit(200)
            ->get();

        return response()->json($history);
    }
}
