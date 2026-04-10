<?php

namespace App\Http\Controllers;

use App\Models\Good;
use App\Models\OperationHistory;
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

        $this->logOperation(
            request: $request,
            goodId: $good->id,
            operationType: 'create',
            amount: null,
            beforeCount: null,
            afterCount: $good->count,
            description: 'Создан товар "' . $good->name . '"'
        );

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
        $beforeCount = $good->count;

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

        $this->logOperation(
            request: $request,
            goodId: $good->id,
            operationType: $request->type,
            amount: (int) $request->amount,
            beforeCount: $beforeCount,
            afterCount: $good->count,
            description: ($request->type === 'income' ? 'Приход' : 'Расход') .
                ' по товару "' . $good->name . '"'
        );

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
        $beforeCount = $good->count;
        $oldName = $good->name;
        
        $good->update([
            'name' => $request->name,
            'comment' => $request->comment ?? '',
            'count' => $request->count,
        ]);

        $this->logOperation(
            request: $request,
            goodId: $good->id,
            operationType: 'update',
            amount: null,
            beforeCount: $beforeCount,
            afterCount: $good->count,
            description: 'Обновлен товар "' . $oldName . '"'
        );

        return response()->json($good);
    }

    /**
     * Удалить товар
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $good = Good::findOrFail($id);
        $goodId = $good->id;
        $goodName = $good->name;
        $beforeCount = $good->count;
        $good->delete();

        $this->logOperation(
            request: $request,
            goodId: $goodId,
            operationType: 'delete',
            amount: null,
            beforeCount: $beforeCount,
            afterCount: null,
            description: 'Удален товар "' . $goodName . '"'
        );

        return response()->json(['message' => 'Товар успешно удален']);
    }

    private function logOperation(
        Request $request,
        ?int $goodId,
        string $operationType,
        ?int $amount,
        ?int $beforeCount,
        ?int $afterCount,
        ?string $description
    ): void {
        OperationHistory::create([
            'good_id' => $goodId,
            'user_id' => $request->user()?->id,
            'operation_type' => $operationType,
            'amount' => $amount,
            'before_count' => $beforeCount,
            'after_count' => $afterCount,
            'description' => $description,
        ]);
    }
}

