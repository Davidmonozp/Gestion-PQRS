<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Crear usuarios con distintos roles
        $usuarios = [
            [
                'name' => 'Admin',
                'userName' => 'admin123',
                'email' => 'admin@example.com',
                'password' => Hash::make('password'),
                'role' => 'Administrador',
                'documento_tipo' => 'CC',
                'documento_numero' => '1000000001',
            ],
            [
                'name' => 'Consultor',
                'userName' => 'consultor123',
                'email' => 'consultor@example.com',
                'password' => Hash::make('password'),
                'role' => 'Consultor',
                'documento_tipo' => 'CC',
                'documento_numero' => '1000000002',
            ],
            [
                'name' => 'Supervisor',
                'userName' => 'supervisor123',
                'email' => 'supervisor@example.com',
                'password' => Hash::make('password'),
                'role' => 'Supervisor',
                'documento_tipo' => 'TI',
                'documento_numero' => '1000000003',
            ],
            [
                'name' => 'Gestor',
                'userName' => 'gestor123',
                'email' => 'gestor@example.com',
                'password' => Hash::make('password'),
                'role' => 'Gestor',
                'documento_tipo' => 'CC',
                'documento_numero' => '1000000004',
            ],
            [
                'name' => 'Digitador',
                'userName' => 'digitador123',
                'email' => 'digitador@example.com',
                'password' => Hash::make('password'),
                'role' => 'Digitador',
                'documento_tipo' => 'CC',
                'documento_numero' => '1000000005',
            ],
        ];

        foreach ($usuarios as $usuario) {
            $user = User::firstOrCreate(
                ['email' => $usuario['email']],
                [
                    'name' => $usuario['name'],
                    'userName' => $usuario['userName'],
                    'password' => $usuario['password'],
                    'documento_tipo' => $usuario['documento_tipo'],
                    'documento_numero' => $usuario['documento_numero'],
                ]
            );

            $user->assignRole($usuario['role']);
        }
    }
}
