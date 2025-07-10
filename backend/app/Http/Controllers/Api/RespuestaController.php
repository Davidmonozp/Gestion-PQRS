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

    // 
    
  public function registrarRespuestaFinal(Request $request)
    {
        // Validación del contenido obligatorio y los archivos (adjuntos)
        $request->validate([
            'contenido' => 'required|string',
            'adjuntos' => 'nullable|array', // Los adjuntos ahora son un array
            'adjuntos.*' => 'file|max:2048|mimes:jpeg,png,jpg,gif,pdf,doc,docx,xls,xlsx', // Cada archivo: max 2MB, tipos permitidos
        ]);

        $pqr_codigo = $request->route('pqr_codigo'); // Obtener pqr_codigo de los parámetros de la ruta

        // Buscar la PQRS correspondiente por su código
        $pqrs = Pqr::where('pqr_codigo', $pqr_codigo)->firstOrFail();

        // Buscar si ya existe una respuesta final
        $respuestaFinal = Respuesta::where('pqrs_id', $pqrs->id)
            ->where('es_final', true)
            ->first();

        $adjuntosData = []; // Array para guardar las rutas y nombres originales

        // ------------------ LÓGICA DE MANEJO DE ARCHIVOS ------------------
        if ($request->hasFile('adjuntos')) {
            foreach ($request->file('adjuntos') as $file) {
                // Genera un nombre único para el archivo y lo guarda en storage/app/public/respuestas_finales
                $path = $file->store('public/respuestas_finales');
                // Almacena la ruta relativa (sin 'public/') y el nombre original
                $adjuntosData[] = [
                    'path' => str_replace('public/', '', $path), // Guardar solo la ruta relativa
                    'original_name' => $file->getClientOriginalName(),
                ];
            }
        }
        // -------------------------------------------------------------------

        if ($respuestaFinal) {
            // Si ya existe, actualizar contenido y autor
            $respuestaFinal->contenido = $request->contenido;
            $respuestaFinal->user_id = Auth::id(); // actualiza el autor si es necesario

            // Si ya tiene adjuntos, los nuevos se añaden a los existentes
            // Si no quieres que se añadan sino que se reemplacen, simplemente asigna $adjuntosData
            $existingAdjuntos = $respuestaFinal->adjuntos ?? [];
            $respuestaFinal->adjuntos = array_merge($existingAdjuntos, $adjuntosData);

            $respuestaFinal->save();
        } else {
            // Si no existe, crear nueva respuesta final
            $respuestaFinal = Respuesta::create([
                'pqrs_id' => $pqrs->id,
                'user_id' => Auth::id(),
                'contenido' => $request->contenido,
                'es_final' => true,
                'adjuntos' => $adjuntosData, // Guardar los adjuntos aquí
            ]);
        }

        // Cargar la relación del autor para devolverla en la respuesta
        $respuestaFinal->load('autor');

        // Opcional: actualizar estado del PQR si necesitas marcarlo como cerrado
        // $pqrs->estado_respuesta = 'Cerrado'; // Esto ya no es necesario aquí si lo gestionas en `update`
        // $pqrs->save(); // No hace falta guardar $pqrs aquí a menos que cambies un campo suyo.

        return response()->json([
            'mensaje' => 'Respuesta final registrada correctamente',
            'respuesta' => $respuestaFinal,
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

    //  public function updateRespuestaFinal(Request $request, Respuesta $respuesta) // Aquí usamos Route Model Binding
    // {
    //     // Valida los datos de la solicitud
    //     $request->validate([
    //         'contenido' => 'required|string',
    //     ]);
     
    //     // Actualiza el contenido de la respuesta
    //     $respuesta->contenido = $request->contenido;

    //     // Si el frontend envía `es_final`, también puedes actualizarlo (con cuidado)
    //     // if ($request->has('es_final')) {
    //     //     $respuesta->es_final = $request->es_final;
    //     // }

    //     $respuesta->save();

    //     // Carga la relación del autor si la necesitas en la respuesta
    //     $respuesta->load('autor');

    //     return response()->json([
    //         'mensaje' => 'Respuesta actualizada correctamente',
    //         'respuesta' => $respuesta,
    //     ]);
    // }

     public function updateRespuestaFinal(Request $request, Respuesta $respuesta) // Inyección de modelo para Respuesta
    {
        // Asegúrate de que la respuesta es final y pertenece a una PQRS
        if (!$respuesta->es_final || !$respuesta->pqrs) {
            return response()->json(['error' => 'La respuesta no es final o no está asociada a una PQRS válida.'], 404);
        }

        $request->validate([
            'contenido' => 'required|string',
            'adjuntos_nuevos' => 'nullable|array', // Nuevos archivos subidos
            'adjuntos_nuevos.*' => 'file|max:2048|mimes:jpeg,png,jpg,gif,pdf,doc,docx,xls,xlsx',
            'adjuntos_existentes' => 'nullable|array', // Rutas de archivos existentes que deben mantenerse
            'adjuntos_existentes.*.path' => 'required|string',
            'adjuntos_existentes.*.original_name' => 'required|string',
        ]);

        $respuesta->contenido = $request->contenido;
        $respuesta->user_id = Auth::id(); // El último que edita es el autor

        $newAdjuntosData = [];
        if ($request->hasFile('adjuntos_nuevos')) {
            foreach ($request->file('adjuntos_nuevos') as $file) {
                $path = $file->store('public/respuestas_finales');
                $newAdjuntosData[] = [
                    'path' => str_replace('public/', '', $path),
                    'original_name' => $file->getClientOriginalName(),
                ];
            }
        }

        // Combinar adjuntos existentes (los que el usuario decidió mantener en el frontend)
        // con los nuevos adjuntos subidos.
        $keptAdjuntos = $request->input('adjuntos_existentes', []);
        $respuesta->adjuntos = array_merge($keptAdjuntos, $newAdjuntosData);

        $respuesta->save();
        $respuesta->load('autor');

        return response()->json([
            'mensaje' => 'Respuesta final actualizada correctamente',
            'respuesta' => $respuesta,
        ]);
    }
}
