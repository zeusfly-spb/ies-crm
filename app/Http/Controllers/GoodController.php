<?php

namespace App\Http\Controllers;

use App\Models\Good;
use Illuminate\Http\JsonResponse;

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
}

