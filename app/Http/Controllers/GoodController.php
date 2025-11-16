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
        
        return response()->json($goods)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
}

