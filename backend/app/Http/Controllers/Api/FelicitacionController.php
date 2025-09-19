<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\FelicitacionGestorNotification;
use Illuminate\Http\Request;
use App\Models\Pqr;
use App\Services\CodigoPqrService;
use Illuminate\Support\Facades\Mail;
use App\Mail\FelicitacionRecibida;
use App\Models\User;
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
            'telefono' => 'required|string',
            'descripcion' => 'required|string',
            'sede' => 'required|string|max:100',
            'servicio_prestado' => 'required|string',
            'eps' => 'required|string',
            'clasificaciones' => 'required|array',
            'clasificaciones.*' => 'exists:clasificaciones,id',
        ]);

        // Generar código único
        $codigo = $codigoService->generarCodigoPqr('Felicitacion', $validated['documento_numero']);

        // Crear la PQR
        $pqr = Pqr::create([
            'pqr_codigo' => $codigo,
            'nombre' => $validated['nombre'],
            'segundo_nombre' => $validated['segundo_nombre'] ?? null,
            'apellido' => $validated['apellido'],
            'segundo_apellido' => $validated['segundo_apellido'] ?? null,
            'documento_tipo' => $validated['documento_tipo'],
            'documento_numero' => $validated['documento_numero'],
            'correo' => $validated['correo'],
            'telefono' => $validated['telefono'],
            'sede' => $validated['sede'],
            'servicio_prestado' => $validated['servicio_prestado'],
            'eps' => $validated['eps'],
            'regimen' => 'No aplica',
            'tipo_solicitud' => 'Felicitacion',
            'descripcion' => $validated['descripcion'],
            'archivo' => null,
            'registra_otro' => 0,
            'respuesta_enviada' => 1,
            'estado_respuesta' => 'Cerrado',
            'respondido_en' => Carbon::now(),
        ]);

        // Guardar clasificaciones
        $pqr->clasificaciones()->sync($validated['clasificaciones']);

        // Enviar correo al usuario que registra
        Mail::to($pqr->correo)->send(new FelicitacionRecibida($pqr));

        // --- Lógica para enviar correo a los gestores de la sede ---

        // Busca gestores por su rol y la sede, asumiendo que el campo 'sede' en tu formulario
        // es el nombre de la sede, no el ID.
        $gestores = User::role('Gestor')
            ->where('activo', 1) // Agrega esta condición para filtrar por usuarios activos
            ->whereHas('sedes', function ($query) use ($pqr) {
                $query->where('name', $pqr->sede);
            })
            ->get();

        // Si se encuentran gestores (activos), se les envía el correo
        if ($gestores->count() > 0) {
            Mail::to($gestores)->send(new FelicitacionGestorNotification($pqr));
        }

        // --- Fin de la lógica adicional ---

        return response()->json([
            'message' => 'Felicitación registrada exitosamente',
            'pqr' => $pqr->load(['clasificaciones', 'respuestas.autor']),
        ], 201);
    }



    // public function store(Request $request, CodigoPqrService $codigoService)
    // {
    //     $validated = $request->validate([
    //         'nombre' => 'required|string|max:100',
    //         'segundo_nombre' => 'nullable|string|max:100',
    //         'apellido' => 'required|string|max:100',
    //         'segundo_apellido' => 'nullable|string|max:100',
    //         'documento_tipo' => 'required|string',
    //         'documento_numero' => 'required|string',
    //         'correo' => 'required|email',
    //         'correo_confirmacion' => 'required|same:correo',
    //         'telefono' => 'required|string',
    //         'descripcion' => 'required|string',
    //         'sede' => 'required|string|max:100',
    //         'servicio_prestado' => 'required|string',
    //         'eps' => 'required|string',
    //         'clasificaciones' => 'required|array',
    //         'clasificaciones.*' => 'exists:clasificaciones,id',
    //     ]);

    //     // Generar código único
    //     $codigo = $codigoService->generarCodigoPqr('Felicitacion', $validated['documento_numero']);

    //     // Crear la PQR
    //     $pqr = Pqr::create([
    //         'pqr_codigo' => $codigo,
    //         'nombre' => $validated['nombre'],
    //         'segundo_nombre' => $validated['segundo_nombre'] ?? null,
    //         'apellido' => $validated['apellido'],
    //         'segundo_apellido' => $validated['segundo_apellido'] ?? null,
    //         'documento_tipo' => $validated['documento_tipo'],
    //         'documento_numero' => $validated['documento_numero'],
    //         'correo' => $validated['correo'],
    //         'telefono' => $validated['telefono'],
    //         'sede' => $validated['sede'],
    //         'servicio_prestado' => $validated['servicio_prestado'],
    //         'eps' => $validated['eps'],
    //         'regimen' => 'No aplica',
    //         'tipo_solicitud' => 'Felicitacion',
    //         'descripcion' => $validated['descripcion'],
    //         'archivo' => null,
    //         'registra_otro' => 0,
    //         'respuesta_enviada' => 1,
    //         'estado_respuesta' => 'Cerrado',
    //         'respondido_en' => Carbon::now(),
    //     ]);

    //     // Guardar clasificaciones
    //     $pqr->clasificaciones()->sync($validated['clasificaciones']);

    //     // Enviar correo
    //     Mail::to($pqr->correo)->send(new FelicitacionRecibida($pqr));

    //     return response()->json([
    //         'message' => 'Felicitación registrada exitosamente',
    //         'pqr' => $pqr->load(['clasificaciones', 'respuestas.autor']),
    //     ], 201);
    // }


}
