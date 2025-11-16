<?php

use App\Http\Controllers\GoodController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// API маршруты
Route::prefix('api')->group(function () {
    Route::options('/goods', function () {
        return response('', 200)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    });
    Route::get('/goods', [GoodController::class, 'index']);
});
