<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PqrEncuesta;
use Illuminate\Support\Facades\DB;

class EncuestaController extends Controller
{
    public function validarToken($token)
    {
        $encuesta = PqrEncuesta::where('token', $token)->first();

        if (!$encuesta) {
            return response()->json(['error' => 'Token inválido'], 404);
        }

        if ($encuesta->respondida) {
            return response()->json(['error' => 'Encuesta ya respondida'], 410);
        }

        return response()->json([
            'pqr_codigo' => $encuesta->pqr->pqr_codigo,
            'token' => $token
        ]);
    }

    public function guardarRespuesta(Request $request, $token)
    {
        $request->validate([
            'calificacion' => 'required|integer|min:1|max:5',
            'respuesta_satisfaccion_final' => 'required|in:Sí,Parcialmente,No',
            'comentario' => 'nullable|string|max:500',
        ]);

        $encuesta = PqrEncuesta::where('token', $token)->first();

        if (!$encuesta) {
            return response()->json(['error' => 'Token inválido'], 404);
        }

        if ($encuesta->respondida) {
            return response()->json(['error' => 'Encuesta ya respondida'], 410);
        }

        // Guardar respuesta en la MISMA tabla
        $encuesta->calificacion = $request->calificacion;
        $encuesta->comentario = $request->comentario;
        $encuesta->respondida = true;
        $encuesta->respondida_en = now();
        $encuesta->respuesta_satisfaccion_final = $request->respuesta_satisfaccion_final;
        $encuesta->save();

        return response()->json(['mensaje' => 'Encuesta enviada correctamente']);
    }
}
