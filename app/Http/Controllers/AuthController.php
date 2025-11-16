<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Авторизация пользователя
     */
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'Неверные учетные данные.',
                    'errors' => [
                        'email' => ['Неверные учетные данные.']
                    ]
                ], 422);
            }

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка сервера: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получить текущего пользователя
     */
    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Выход пользователя
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Успешный выход']);
    }
}

