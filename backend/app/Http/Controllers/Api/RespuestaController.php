<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\RespuestaFinalPQRSMail;
use App\Mail\RespuestaPqrsMail;
use App\Models\Pqr;
use App\Models\Respuesta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;

class RespuestaController extends Controller
{
    public function registrarRespuesta(Request $request, $id)
    {
        $request->validate([
            'contenido' => 'required|string',
        ]);

        $pqrs = Pqr::findOrFail($id);

        // Verifica que la PQRS esté asignada al usuario actual
        if ($pqrs->asignado_a !== Auth::id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        // Verificar si ya existe una respuesta de este usuario para esta PQRS
        $respuestaExistente = Respuesta::where('pqrs_id', $pqrs->id)
            ->where('user_id', Auth::id(),)
            ->exists();

        if ($respuestaExistente) {
            return response()->json(['error' => 'Ya has registrado una respuesta para esta PQRS'], 400);
        }

        // Si no existe, crear la nueva respuesta
        Respuesta::create([
            'pqrs_id' => $pqrs->id,
            'user_id' => Auth::id(),
            'contenido' => $request->contenido,
        ]);

        // Cambiar estado
        $pqrs->estado_respuesta = 'Preliminar';
        $pqrs->save();

        return response()->json(['mensaje' => 'Respuesta preliminar guardada']);
    }



    public function registrarRespuestaFinal(Request $request, $id)
    {
        $request->validate([
            'contenido' => 'required|string',
        ]);

        $pqrs = Pqr::findOrFail($id);

        // Verificar si ya existe una respuesta final
        $finalYaExiste = Respuesta::where('pqrs_id', $pqrs->id)
            ->where('es_final', true)
            ->exists();

        if ($finalYaExiste) {
            return response()->json(['error' => 'Ya existe una respuesta final para esta PQRS'], 400);
        }

        // Crear respuesta final
        Respuesta::create([
            'pqrs_id' => $pqrs->id,
            'user_id' => Auth::id(),
            'contenido' => $request->contenido,
            'es_final' => true,
        ]);

        $pqrs->estado_respuesta = 'Respondida';
        $pqrs->save();

        return response()->json(['mensaje' => 'Respuesta final registrada correctamente']);
    }


    public function enviarRespuesta($pqrId)
    {
        $pqr = Pqr::findOrFail($pqrId);

        // Buscar SOLO respuesta final
        $respuesta = $pqr->respuestas()->where('es_final', true)->latest()->first();

        if (!$respuesta) {
            return response()->json(['error' => 'No hay respuesta final registrada.'], 400);
        }

        Mail::to($pqr->correo)->send(new RespuestaFinalPQRSMail($pqr, $respuesta));

        $pqr->estado_respuesta = 'Respondida';
        $pqr->respuesta_enviada = true;
        $pqr->save();

        return response()->json(['mensaje' => 'Respuesta final enviada al ciudadano']);
    }
}
