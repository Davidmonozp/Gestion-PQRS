<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Clasificacion;
use App\Models\Pqr;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ClasificacionController extends Controller
{
    public function index()
    {
        try {
            $clasificaciones = Clasificacion::all();
            return response()->json($clasificaciones);
        } catch (\Exception $e) {
            Log::error("Error al obtener todas las clasificaciones: " . $e->getMessage());
            return response()->json(['error' => 'Error al cargar las clasificaciones.'], 500);
        }
    }



    public function agregarClasificacion(Request $request, Pqr $pqr)
    {
        // Valida que el request contenga un array 'clasificacion_ids'
        // y que cada ID exista en la tabla 'clasificaciones'.
        $request->validate([
            'clasificacion_ids' => 'nullable|array',
            'clasificacion_ids.*' => 'exists:clasificaciones,id',
        ]);

        try {
            // Obtiene los IDs de clasificación del request, por defecto un array vacío si no se envían
            $clasificacionIds = $request->input('clasificacion_ids', []);

            // Sincroniza las clasificaciones:
            // Esto adjuntará los IDs proporcionados, desadjuntará los que ya no estén
            // y no hará nada con los que ya existan.
            $pqr->clasificaciones()->sync($clasificacionIds); // Aquí $pqr ya es la instancia correcta

            return response()->json(['message' => 'Clasificaciones de PQRS actualizadas correctamente.']);
        } catch (\Exception $e) {
            Log::error("Error al sincronizar clasificaciones para PQR {$pqr->id}: " . $e->getMessage());
            return response()->json(['error' => 'Error al actualizar las clasificaciones: ' . $e->getMessage()], 500);
        }
    }
}
