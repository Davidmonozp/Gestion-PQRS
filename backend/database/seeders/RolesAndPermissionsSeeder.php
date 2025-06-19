<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run()
    {
        // Reset cache de roles y permisos
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Crear permisos
        $permisos = [
            'ver casos',
            'crear casos',
            'editar casos',
            'cerrar casos',
            'asignar casos',
            'responder casos',
            'ver propios casos',
            'ver todos los casos',
        ];

        foreach ($permisos as $permiso) {
            Permission::firstOrCreate(['name' => $permiso]);
        }

        // Crear roles y asignar permisos
        $admin = Role::firstOrCreate(['name' => 'Administrador']);
        $admin->givePermissionTo(Permission::all());

        $consultor = Role::firstOrCreate(['name' => 'Consultor']);
        $consultor->givePermissionTo(['ver todos los casos']);

        $supervisor = Role::firstOrCreate(['name' => 'Supervisor']);
        $supervisor->givePermissionTo(['ver casos', 'editar casos', 'cerrar casos', 'responder casos']);

        $gestor = Role::firstOrCreate(['name' => 'Gestor']);
        $gestor->givePermissionTo(['ver casos', 'editar casos', 'responder casos']);

        $digitador = Role::firstOrCreate(['name' => 'Digitador']);
        $digitador->givePermissionTo(['crear casos', 'ver propios casos']);
    }
}
