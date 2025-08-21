<?php

namespace App\Services;

use App\Models\Pqr;

class CodigoPqrService
{
    public function generarCodigoPqr(string $tipoSolicitud, string $documento): string
    {
        $prefijos = [
            'Peticion' => 'PT',
            'Queja' => 'QJ',
            'Reclamo' => 'RE',
            'Solicitud' => 'SO',
            'Felicitacion' => 'FE',
            'Tutela' => 'TU',
            'Derecho de peticion' => 'DP'
        ];

        $prefijo = $prefijos[$tipoSolicitud] ?? 'OT';

        $conteo = Pqr::where('tipo_solicitud', $tipoSolicitud)->count() + 1;

        $consecutivo = str_pad($conteo, 5, '0', STR_PAD_LEFT);

        return "{$prefijo}{$consecutivo}-{$documento}";
    }
}
