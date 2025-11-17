<?php

namespace App\Http\Controllers;

use App\Models\Good;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GoodController extends Controller
{
    /**
     * Получить список всех товаров
     */
    public function index(): JsonResponse
    {
        $goods = Good::all();
        
        return response()->json($goods);
    }

    /**
     * Обновить количество товара
     */
    public function update(Request $request, $id): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:income,expense',
            'amount' => 'required|integer|min:1',
        ]);

        $good = Good::findOrFail($id);

        if ($request->type === 'expense' && $request->amount > $good->count) {
            return response()->json([
                'error' => 'Недостаточно товара. Доступно: ' . $good->count
            ], 422);
        }

        if ($request->type === 'income') {
            $good->count += $request->amount;
        } else {
            $good->count -= $request->amount;
        }

        $good->save();

        return response()->json($good);
    }
}

