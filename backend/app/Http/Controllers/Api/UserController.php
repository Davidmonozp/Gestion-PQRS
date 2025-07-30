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
            $users = User::with(['roles', 'sedes'])->get();
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
            'name' => 'required|string|min:3|max:100',
            'segundo_nombre' => 'nullable|string|max:100',
            'primer_apellido' => 'required|string|max:100',
            'segundo_apellido' => 'nullable|string|max:100',
            'userName' => 'required|string|max:50|unique:users,userName',
            'email' => 'required|email',
            'password' => 'required|string|min:5|confirmed',
            'role' => 'required|exists:roles,name',
            'documento_tipo' => 'required|string|max:5',
            'documento_numero' => 'required|string|max:20|unique:users,documento_numero',
            'sedes' => 'required|array',
            'sedes.*' => 'exists:sedes,id',
            'area' => 'required|string|max:255',
            'cargo' => 'required|string|max:255',
        ]);

        $user = User::create([
            'name' => $request->name,
            'userName' => $request->userName,
            'segundo_nombre' => $request->segundo_nombre,
            'primer_apellido' => $request->primer_apellido,
            'segundo_apellido' => $request->segundo_apellido,
            'email' => $request->email,
            'documento_tipo' => $request->documento_tipo,
            'documento_numero' => $request->documento_numero,
            'password' => Hash::make($request->password),
            'area' => $request->area,
            'cargo' => $request->cargo,
        ]);

        $user->assignRole($request->role);
        $user->sedes()->sync($request->sedes);

        return response()->json([
            'message' => 'Usuario creado correctamente',
            'user' => $user->load('roles', 'sedes'),
        ], 201);
    }

    // Ver un usuario específico
    public function show($id)
    {
        $user = User::with(['roles', 'sedes'])->find($id);
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
            'segundo_nombre' => 'nullable|string|max:100',
            'primer_apellido' => 'sometimes|required|string|max:100',
            'segundo_apellido' => 'nullable|string|max:100',
            'userName' => 'sometimes|required|string|max:50|unique:users,userName,' . $user->id,
            'email' => 'sometimes|required|email',
            'password' => 'nullable|string|min:5|confirmed',
            'role' => 'sometimes|required|exists:roles,name',
            'documento_tipo' => 'sometimes|required|string|max:5',
            'documento_numero' => 'sometimes|required|string|max:20|unique:users,documento_numero,' . $user->id,
            'sedes' => 'nullable|array',
            'sedes.*' => 'exists:sedes,id',
            'area' => 'sometimes|required|string|max:255',
            'cargo' => 'sometimes|required|string|max:255',
        ]);

        // Actualizar campos si vienen en la request, o conservar el valor anterior
        $user->name = $request->name ?? $user->name;
        $user->segundo_nombre = $request->segundo_nombre ?? $user->segundo_nombre;
        $user->primer_apellido = $request->primer_apellido ?? $user->primer_apellido;
        $user->segundo_apellido = $request->segundo_apellido ?? $user->segundo_apellido;
        $user->userName = $request->userName ?? $user->userName;
        $user->email = $request->email ?? $user->email;
        $user->documento_tipo = $request->documento_tipo ?? $user->documento_tipo;
        $user->documento_numero = $request->documento_numero ?? $user->documento_numero;
        $user->area = $request->area ?? $user->area;
        $user->cargo = $request->cargo ?? $user->cargo;

        if ($request->password) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        if ($request->role) {
            $user->syncRoles([$request->role]);
        }

        if ($request->filled('sedes')) {
            $user->sedes()->sync($request->sedes);
        } elseif ($request->has('sedes')) {
            $user->sedes()->sync([]); // Si viene un array vacío, limpia sedes
        }

        return response()->json([
            'message' => 'Usuario actualizado correctamente',
            'user' => $user->load('roles', 'sedes'),
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
