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
     * Создать новый товар
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'comment' => 'nullable|string',
            'count' => 'required|integer|min:0',
        ]);

        $good = Good::create([
            'name' => $request->name,
            'comment' => $request->comment ?? '',
            'count' => $request->count ?? 0,
        ]);

        return response()->json($good, 201);
    }

    /**
     * Обновить количество товара (приход/расход)
     */
    public function updateCount(Request $request, $id): JsonResponse
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

    /**
     * Обновить данные товара
     */
    public function update(Request $request, $id): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'comment' => 'nullable|string',
            'count' => 'required|integer|min:0',
        ]);

        $good = Good::findOrFail($id);
        
        $good->update([
            'name' => $request->name,
            'comment' => $request->comment ?? '',
            'count' => $request->count,
        ]);

        return response()->json($good);
    }

    /**
     * Удалить товар
     */
    public function destroy($id): JsonResponse
    {
        $good = Good::findOrFail($id);
        $good->delete();

        return response()->json(['message' => 'Товар успешно удален']);
    }
}

