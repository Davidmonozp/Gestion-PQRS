<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function index()
    {
        try {
            $users = User::with('roles')->get();
            return response()->json($users);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener usuarios',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Registrar nuevo usuario y asignar rol
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'userName' => 'required|string|max:50|unique:users,userName',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:5',
            'role' => 'required|exists:roles,name',
            'documento_tipo' => 'required|string|max:5',
            'documento_numero' => 'required|string|max:20|unique:users,documento_numero',
        ]);

        $user = User::create([
            'name' => $request->name,
            'userName' => $request->userName,
            'email' => $request->email,
            'documento_tipo' => $request->documento_tipo,
            'documento_numero' => $request->documento_numero,
            'password' => Hash::make($request->password),
        ]);

        $user->assignRole($request->role);

        return response()->json([
            'message' => 'Usuario creado correctamente',
            'user' => $user->load('roles'),
        ], 201);
    }

    // Ver un usuario específico
    public function show($id)
    {
        $user = User::with('roles')->find($id);
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        return response()->json($user);
    }

    // Actualizar usuario y rol
    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:5',
            'role' => 'sometimes|required|exists:roles,name',
        ]);

        $user->name = $request->name ?? $user->name;
        $user->email = $request->email ?? $user->email;
        if ($request->password) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        if ($request->role) {
            $user->syncRoles([$request->role]);
        }

        return response()->json([
            'message' => 'Usuario actualizado correctamente',
            'user' => $user->load('roles'),
        ]);
    }

    // Eliminar usuario
    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'Usuario eliminado correctamente']);
    }
    public function toggleActive($id)
    {
        $user = User::findOrFail($id);
        $user->activo = !$user->activo; // invierte el estado
        $user->save();

        return response()->json([
            'message' => 'Estado actualizado correctamente',
            'activo' => $user->activo
        ]);
    }
}
