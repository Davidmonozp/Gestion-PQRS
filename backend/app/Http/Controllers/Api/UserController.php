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
            'password' => 'required|string|min:5|confirmed',
            'role' => 'required|exists:roles,name',
            'documento_tipo' => 'required|string|max:5',
            'documento_numero' => 'required|string|max:20|unique:users,documento_numero',
            'sede' => 'required|string|max:255',
            'area' => 'required|string|max:255',
            'cargo' => 'required|string|max:255',
        ]);

        $user = User::create([
            'name' => $request->name,
            'userName' => $request->userName,
            'email' => $request->email,
            'documento_tipo' => $request->documento_tipo,
            'documento_numero' => $request->documento_numero,
            'password' => Hash::make($request->password),
            'sede' => $request->sede,
            'area' => $request->area,
            'cargo' => $request->cargo,
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
            'userName' => 'sometimes|required|string|max:50|unique:users,userName,' . $user->id,
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:5|confirmed',
            'role' => 'sometimes|required|exists:roles,name',
            'documento_tipo' => 'sometimes|required|string|max:5',
            'documento_numero' => 'sometimes|required|string|max:20|unique:users,documento_numero,' . $user->id,
            'sede' => 'sometimes|required|string|max:255',
            'area' => 'sometimes|required|string|max:255',
            'cargo' => 'sometimes|required|string|max:255',
        ]);

        // Actualizar campos si vienen en la request, o conservar el valor anterior
        $user->name = $request->name ?? $user->name;
        $user->userName = $request->userName ?? $user->userName;
        $user->email = $request->email ?? $user->email;
        $user->documento_tipo = $request->documento_tipo ?? $user->documento_tipo;
        $user->documento_numero = $request->documento_numero ?? $user->documento_numero;
        $user->sede = $request->sede ?? $user->sede;
        $user->area = $request->area ?? $user->area;
        $user->cargo = $request->cargo ?? $user->cargo;

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
