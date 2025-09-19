<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Clasificacion;
use Illuminate\Http\Request;
use App\Models\Pqr; // ajusta si tu modelo tiene otro namespace

class GestionAppController extends Controller
{
    /**
     * Reabrir una PQR cerrada.
     */
    public function reabrir(Request $request)
    {
        try {
            $request->validate([
                'pqr_codigo' => 'required|string|exists:pqrs,pqr_codigo',
            ]);

            // Buscar la PQR usando el campo correcto
            $pqr = Pqr::where('pqr_codigo', $request->pqr_codigo)->firstOrFail();

            // Actualizar campos
            $pqr->estado_respuesta = 'En proceso';
            $pqr->respuesta_enviada = 0;
            $pqr->respondido_en = null;
            $pqr->estado_tiempo = null;

            $pqr->save();

            return response()->json([
                'success' => true,
                'message' => "La PQR {$pqr->pqr_codigo} fue reabierta correctamente.",
                'pqr' => $pqr,
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ocurrió un error al intentar reabrir la PQR.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

     public function crearClasificacion(Request $request)
    {
        try {
            // Validamos que el nombre venga y sea único
            $request->validate([
                'nombre' => 'required|string|max:255|unique:clasificaciones,nombre',
            ]);

            // Creamos la clasificación
            $clasificacion = Clasificacion::create([
                'nombre' => $request->nombre,
            ]);

            return response()->json([
                'success' => true,
                'message' => "Clasificación '{$clasificacion->nombre}' creada exitosamente.",
                'clasificacion' => $clasificacion,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ocurrió un error al crear la clasificación.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
