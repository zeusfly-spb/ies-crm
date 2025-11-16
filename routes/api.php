<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoodController;
use Illuminate\Support\Facades\Route;

// Публичные маршруты
Route::post('/login', [AuthController::class, 'login']);

// Защищенные маршруты
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/goods', [GoodController::class, 'index']);
});

