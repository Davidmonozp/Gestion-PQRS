<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $rules = [
            'name' => 'required|string|max:100',
            'userName' => 'required|string|max:50|unique:users,userName',
            'documento_tipo' => 'required|string|max:5',
            'documento_numero' => 'required|string|max:20|unique:users,documento_numero',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:5|max:20|confirmed',
        ];

        $messages = [
            'name.required' => 'El nombre es obligatorio.',
            'userName.required' => 'El nombre de usuario es obligatorio.',
            'userName.unique' => 'Ese nombre de usuario ya está registrado.',
            'email.required' => 'El correo es obligatorio.',
            'email.email' => 'Debes ingresar un correo válido.',
            'email.unique' => 'Ese correo ya está registrado.',
            'documento_tipo.required' => 'El tipo de documento es obligatorio.',
            'documento_numero.required' => 'El número de documento es obligatorio.',
            'documento_numero.unique' => 'Ese número de documento ya está registrado.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 5 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Crear el usuario correctamente
        $user = User::create([
            'name' => $request->name,
            'userName' => $request->userName,
            'email' => $request->email,
            'documento_tipo' => $request->documento_tipo,
            'documento_numero' => $request->documento_numero,
            'password' => Hash::make($request->password),
        ]);

        // Asignar rol por defecto
        $user->assignRole('Consultor');

        // Generar token JWT
        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Registro exitoso',
            'token' => $token,
            'user' => $user,
            'roles' => $user->getRoleNames(),
        ], 201);
    }
    
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'userName' => 'required|string',
            'password' => 'required|string|min:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $credentials = $request->only('userName', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json([
                'message' => 'Credenciales inválidas'
            ], 401);
        }

        $user = JWTAuth::user();

        if (!$user->activo) {
            return response()->json([
                'message' => 'Tu cuenta está inactiva. Contacta al administrador.',
            ], 403);
        }

        return response()->json([
            'message' => 'Inicio de sesión exitoso',
            'token' => $token,
            'user' => $user,
            'roles' => $user->getRoleNames()
        ], 200);
    }
    public function logout(Request $request)
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());

            return response()->json([
                'message' => 'Sesión cerrada correctamente.'
            ], 200);
        } catch (JWTException $e) {
            return response()->json([
                'error' => 'No se pudo cerrar la sesión, intente nuevamente.'
            ], 500);
        }
    }


    public function changePassword(Request $request)
    {
        $user = JWTAuth::parseToken()->authenticate();  // Obtener usuario autenticado via JWT

        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        // Verificar contraseña actual
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'La contraseña actual es incorrecta.'
            ], 422);
        }

        // Actualizar contraseña
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Contraseña cambiada exitosamente.'
        ]);
    }
}
