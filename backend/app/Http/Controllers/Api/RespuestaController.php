<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\RespuestaFinalPQRSMail;
use App\Mail\RespuestaPqrsMail;
use App\Mail\SolicitarRespuestaCiudadanoMail;
use App\Models\Pqr;
use App\Models\Respuesta;
use App\Services\PqrTiempoService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class RespuestaController extends Controller
{
    public function registrarRespuesta(Request $request, $pqr_codigo)
    {
        $request->validate([
            'contenido' => 'required|string',
        ]);

        $pqrs = Pqr::where('pqr_codigo', $pqr_codigo)->firstOrFail();

        if ($pqrs->asignado_a !== Auth::id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $respuestaExistente = Respuesta::where('pqrs_id', $pqrs->id)
            ->where('user_id', Auth::id())
            ->exists();

        if ($respuestaExistente) {
            return response()->json(['error' => 'Ya has registrado una respuesta para esta PQRS'], 400);
        }

        Respuesta::create([
            'pqrs_id' => $pqrs->id,
            'user_id' => Auth::id(),
            'contenido' => $request->contenido,
        ]);

        if ($pqrs->estado_respuesta === 'Asignado') {
            $pqrs->estado_respuesta = 'En proceso';
            $pqrs->save();
        }

        return response()->json(['mensaje' => 'Respuesta preliminar guardada']);
    }



    // public function registrarRespuestaFinal(Request $request, $pqr_codigo)
    // {
    //     $request->validate([
    //         'contenido' => 'required|string',
    //     ]);

    //     $pqrs = Pqr::where('pqr_codigo', $pqr_codigo)->firstOrFail();

    //     $finalYaExiste = Respuesta::where('pqrs_id', $pqrs->id)
    //         ->where('es_final', true)
    //         ->exists();

    //     if ($finalYaExiste) {
    //         return response()->json(['error' => 'Ya existe una respuesta final para esta PQRS'], 400);
    //     }

    //     Respuesta::create([
    //         'pqrs_id' => $pqrs->id,
    //         'user_id' => Auth::id(),
    //         'contenido' => $request->contenido,
    //         'es_final' => true,
    //     ]);

    //     $pqrs->estado_respuesta = 'Cerrado';
    //     $pqrs->save();

    //     return response()->json(['mensaje' => 'Respuesta final registrada correctamente']);
    // }

    public function registrarRespuestaFinal(Request $request, $pqr_codigo)
    {
        $request->validate([
            'contenido' => 'required|string',
        ]);

        $pqrs = Pqr::where('pqr_codigo', $pqr_codigo)->firstOrFail();

        $finalYaExiste = Respuesta::where('pqrs_id', $pqrs->id)
            ->where('es_final', true)
            ->exists();

        if ($finalYaExiste) {
            return response()->json(['error' => 'Ya existe una respuesta final para esta PQRS'], 400);
        }

        // Crear la respuesta final y guardarla en una variable
        $respuestaFinal = Respuesta::create([
            'pqrs_id' => $pqrs->id,
            'user_id' => Auth::id(),
            'contenido' => $request->contenido,
            'es_final' => true,
        ]);

        // Cargar la relación user para devolverla en la respuesta
        $respuestaFinal->load('autor');

        // Actualizar estado del PQR
        $pqrs->estado_respuesta = 'Cerrado';
        $pqrs->save();

        return response()->json([
            'mensaje' => 'Respuesta final registrada correctamente',
            'respuesta' => $respuestaFinal,  // Aquí devuelves la respuesta con el usuario
        ]);
    }




    public function enviarRespuesta($pqr_codigo)
    {
        $pqr = Pqr::where('pqr_codigo', $pqr_codigo)->firstOrFail();

        $respuesta = $pqr->respuestas()->where('es_final', true)->latest()->first();

        if (!$respuesta) {
            return response()->json(['error' => 'No hay respuesta final registrada para esta PQRS.'], 400);
        }

        Mail::to($pqr->correo)->send(new RespuestaFinalPQRSMail($pqr, $respuesta));

        $fechaRespuesta = Carbon::parse($respuesta->created_at, 'America/Bogota');

        $pqr->estado_respuesta = 'Cerrado';
        $pqr->respuesta_enviada = true;
        $pqr->respondido_en = $fechaRespuesta;

        $pqr->deadline_interno = $fechaRespuesta;
        $pqr->deadline_ciudadano = $fechaRespuesta;

        $estadoTiempo = app(PqrTiempoService::class)->calcularEstadoTiempo($pqr);
        $pqr->estado_tiempo = $estadoTiempo['estado'];

        $pqr->save();

        return response()->json(['mensaje' => 'Respuesta final enviada al ciudadano.']);
    }

    public function solicitarRespuestaUsuario($id)
    {
        $pqr = Pqr::findOrFail($id);

        // Solo si está asignada o en proceso, por ejemplo
        if (!in_array($pqr->estado_respuesta, ['Radicado', 'Asignado', 'En proceso', 'Respuesta de usuario registrada'])) {
            return response()->json(['error' => 'Estado inválido para solicitar respuesta.'], 400);
        }

        $pqr->estado_respuesta = 'Requiere respuesta del usuario';
        $pqr->usuario_token = Str::uuid(); // Genera token único
        $pqr->save();

        // Aquí puedes enviar el correo al ciudadano con el link
        $link = url("/respuesta-ciudadano/{$pqr->usuario_token}");
        Mail::to($pqr->correo)->send(new SolicitarRespuestaCiudadanoMail($pqr, $link));

        return response()->json(['message' => 'Se solicitó respuesta al ciudadano.', 'token' => $pqr->usuario_token]);
    }

    public function listarRespuestas($pqr_codigo)
    {
        // Obtener la PQR primero (según tu lógica)
        $pqr = Pqr::where('pqr_codigo', $pqr_codigo)->firstOrFail();

        // Luego obtener las respuestas con la relación 'autor' cargada
        $respuestas = Respuesta::with('autor')->where('pqrs_id', $pqr->id)->get();

        // Devolver como JSON
        return response()->json($respuestas);
    }
}
