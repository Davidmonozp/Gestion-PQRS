<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\Pqr;
use App\Models\Respuesta;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class UsuarioRespuestaController extends Controller
{
    // Mostrar si el token es válido (puede opcionalmente enviar los datos al frontend)
    public function mostrarFormulario($token)
    {
        $pqr = Pqr::where('usuario_token', $token)->first();

        if (!$pqr) {
            return response()->json(['error' => 'Token inválido o expirado.'], 404);
        }

        return response()->json([
            'message' => 'Token válido',
            'pqr_id' => $pqr->id,
            'asunto' => $pqr->asunto ?? null,
        ]);
    }

    // Guardar respuesta enviada desde el frontend
    public function guardarRespuesta(Request $request, $token)
    {
        $request->validate([
            'contenido' => 'required|string|max:5000',
            'archivo' => 'nullable|file|max:10240', // Máximo 10MB
        ]);

        $pqr = Pqr::where('usuario_token', $token)->first();

        if (!$pqr) {
            return response()->json(['error' => 'Token inválido o expirado.'], 404);
        }

        $archivoPath = null;

        DB::transaction(function () use ($pqr, $request, &$archivoPath) {
            if ($request->hasFile('archivo')) {
                $archivoPath = $request->file('archivo')->store('respuestas', 'public');
            }

            Respuesta::create([
                'pqrs_id' => $pqr->id,
                'contenido' => $request->contenido,
                'es_respuesta_usuario' => true,
                'archivo' => $archivoPath,
            ]);

            $pqr->estado_respuesta = 'Respuesta del usuario registrada';
            $pqr->usuario_token = null;
            $pqr->save();
        });

        return response()->json([
            'message' => 'Respuesta registrada exitosamente.',
            'token_recibido' => $token,
            'contenido' => $request->contenido,
            'archivo' => $archivoPath ? 'Archivo guardado en: ' . $archivoPath : 'No se adjuntó archivo'
        ]);
    }
}
