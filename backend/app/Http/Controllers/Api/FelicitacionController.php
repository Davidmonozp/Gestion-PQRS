<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pqr;
use App\Services\CodigoPqrService;
use Illuminate\Support\Facades\Mail;
use App\Mail\FelicitacionRecibida;
use Carbon\Carbon;

class FelicitacionController extends Controller
{
    public function store(Request $request, CodigoPqrService $codigoService)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'segundo_nombre' => 'nullable|string|max:100',
            'apellido' => 'required|string|max:100',
            'segundo_apellido' => 'nullable|string|max:100',
            'documento_tipo' => 'required|string',
            'documento_numero' => 'required|string',
            'correo' => 'required|email',
            'correo_confirmacion' => 'required|same:correo',
            'descripcion' => 'required|string',
            'sede' => 'required|string|max:100',
        ]);


        // Generar código único
        $codigo = $codigoService->generarCodigoPqr('Felicitacion', $validated['documento_numero']);

        $pqr = Pqr::create([
            'pqr_codigo' => $codigo,
            'nombre' => $validated['nombre'],
            'segundo_nombre' => $validated['segundo_nombre'] ?? null,
            'apellido' => $validated['apellido'],
            'segundo_apellido' => $validated['segundo_apellido'] ?? null,
            'documento_tipo' => $validated['documento_tipo'],
            'documento_numero' => $validated['documento_numero'],
            'correo' => $validated['correo'],
            'telefono' => null,
            'sede' => $validated['sede'],
            'servicio_prestado' => 'No aplica',
            'eps' => 'No aplica',
            'regimen' => 'No aplica',
            'tipo_solicitud' => 'Felicitacion',
            'descripcion' => $validated['descripcion'],
            'archivo' => null,
            'registra_otro' => 0,
            'registrador_nombre' => null,
            'registrador_apellido' => null,
            'registrador_documento_tipo' => null,
            'registrador_documento_numero' => null,
            'registrador_correo' => null,
            'registrador_telefono' => null,
            'respuesta_enviada' => 1,
            'estado_respuesta' => 'cerrado',
            'respondido_en' => Carbon::now(),
        ]);



        // Enviar correo
        Mail::to($pqr->correo)->send(new FelicitacionRecibida($pqr));

        return response()->json([
            'message' => 'Felicitación registrada exitosamente',
            'pqr' => $pqr,
        ], 201);
    }
}
