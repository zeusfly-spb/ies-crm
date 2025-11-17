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
    Route::post('/goods', [GoodController::class, 'store']);
    Route::put('/goods/{id}/count', [GoodController::class, 'updateCount']);
    Route::put('/goods/{id}', [GoodController::class, 'update']);
    Route::delete('/goods/{id}', [GoodController::class, 'destroy']);
});

