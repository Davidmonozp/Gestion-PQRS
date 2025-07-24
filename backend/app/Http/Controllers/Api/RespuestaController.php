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
use Illuminate\Support\Facades\Log;


class RespuestaController extends Controller
{

    // public function registrarRespuesta(Request $request, $pqr_codigo)
    // {
    //     $request->validate([
    //         'contenido' => 'required|string',
    //     ]);

    //     $pqrs = Pqr::where('pqr_codigo', $pqr_codigo)->firstOrFail();

    //     if ($pqrs->asignado_a !== Auth::id()) {
    //         return response()->json(['error' => 'No autorizado'], 403);
    //     }

    //     $respuestaExistente = Respuesta::where('pqrs_id', $pqrs->id)
    //         ->where('user_id', Auth::id())
    //         ->exists();

    //     if ($respuestaExistente) {
    //         return response()->json(['error' => 'Ya has registrado una respuesta para esta PQRS'], 400);
    //     }

    //     Respuesta::create([
    //         'pqrs_id' => $pqrs->id,
    //         'user_id' => Auth::id(),
    //         'contenido' => $request->contenido,
    //     ]);

    //     if ($pqrs->estado_respuesta === 'Asignado') {
    //         $pqrs->estado_respuesta = 'En proceso';
    //         $pqrs->save();
    //     }

    //     return response()->json(['mensaje' => 'Respuesta preliminar guardada']);
    // }
    public function registrarRespuesta(Request $request, $pqr_codigo)
    {
        $request->validate([
            'contenido' => 'required|string',
            'adjuntos' => 'nullable|array',
            'adjuntos.*' => 'file|max:8000',
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

        $adjuntosData = [];
        if ($request->hasFile('adjuntos')) {
            foreach ($request->file('adjuntos') as $file) {
                $path = $file->store('respuestas', 'public'); 
                $adjuntosData[] = [
                    'path' => str_replace('public/', '', $path),
                    'original_name' => $file->getClientOriginalName(),
                ];
            }
        }

        Respuesta::create([
            'pqrs_id' => $pqrs->id,
            'user_id' => Auth::id(),
            'contenido' => $request->contenido,
            'adjuntos' => $adjuntosData,
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
        // 1. Validation
        $request->validate([
            'contenido' => 'required|string',
            'adjuntos' => 'nullable|array',
            'adjuntos.*' => 'file|max:8000',
        ]);

        $pqr_codigo = $request->route('pqr_codigo');
        $pqrs = Pqr::where('pqr_codigo', $pqr_codigo)->firstOrFail();

        // 2. Update PQRS status if applicable
        if ($pqrs->estado_respuesta === 'Asignado') {
            $pqrs->estado_respuesta = 'En proceso';
            $pqrs->save();
        }

        // 3. Check for existing final response
        $respuestaFinal = Respuesta::where('pqrs_id', $pqrs->id)
            ->where('es_final', true)
            ->first();

        $adjuntosData = []; // Array to store paths and original names

        // --- File Handling Logic ---
        Log::info('Checking for attachments in the request for PQR: ' . $pqrs->pqr_codigo);

        if ($request->hasFile('adjuntos')) {
            foreach ($request->file('adjuntos') as $file) {
                // *** CAMBIO AQUÍ: Usar 'respuestas' como carpeta y 'public' como disco explícito ***
                $path = $file->store('respuestas', 'public'); // Guarda el archivo en storage/app/public/respuestas
                // $path ahora será 'respuestas/nombre_unico.png' directamente, relativo al disco 'public'

                // Ya no necesitas str_replace si el path ya viene sin 'public/'
                // Sin embargo, mantenerlo es inofensivo si quieres ser redundante o si el comportamiento de store() cambia
                $adjuntosData[] = [
                    'path' => $path, // El path ya está correcto aquí
                    'original_name' => $file->getClientOriginalName(),
                ];
            }
        }
        // --- End of File Handling Logic ---

        // Log the final adjuntosData array that will be saved
        Log::info('Final attachments data to be saved for PQR ' . $pqrs->pqr_codigo . ': ' . json_encode($adjuntosData));


        // 4. Update or Create Final Response
        if ($respuestaFinal) {
            // If response exists, update content and author
            $respuestaFinal->contenido = $request->contenido;
            $respuestaFinal->user_id = Auth::id();

            // Append new attachments to existing ones
            $existingAdjuntos = $respuestaFinal->adjuntos ?? []; // Ensure it's an array
            $respuestaFinal->adjuntos = array_merge($existingAdjuntos, $adjuntosData);

            $respuestaFinal->save();
            Log::info('Final response updated for PQR ' . $pqrs->pqr_codigo . '. All attachments: ' . json_encode($respuestaFinal->adjuntos));
        } else {
            // If response doesn't exist, create a new final response
            $respuestaFinal = Respuesta::create([
                'pqrs_id' => $pqrs->id,
                'user_id' => Auth::id(),
                'contenido' => $request->contenido,
                'es_final' => true,
                'adjuntos' => $adjuntosData, // Save the attachments here
            ]);
            Log::info('Final response created for PQR ' . $pqrs->pqr_codigo . '. All attachments: ' . json_encode($respuestaFinal->adjuntos));
        }

        // 5. Load author relationship for response
        $respuestaFinal->load('autor');

        // 6. Return JSON response
        return response()->json([
            'mensaje' => 'Respuesta final registrada correctamente',
            'respuesta' => $respuestaFinal,
        ], 200); // Changed to 200 as it's often an update/register
    }






    public function enviarRespuesta($pqr_codigo)
    {
        $pqr = Pqr::where('pqr_codigo', $pqr_codigo)->firstOrFail();

        // Busca la respuesta final más reciente
        $respuesta = $pqr->respuestas()->where('es_final', true)->latest()->first();

        if (!$respuesta) {
            return response()->json(['error' => 'No hay respuesta final registrada para esta PQRS.'], 400);
        }

        // Obtén los adjuntos de la respuesta final
        // Asegúrate de que $respuesta->adjuntos devuelva una colección o array de objetos/rutas de archivo
        $adjuntosRespuesta = $respuesta->adjuntos; // Asumiendo que 'adjuntos' es una relación o un campo serializado

        // Pasa los adjuntos al Mailable
        Mail::to($pqr->correo)->send(new RespuestaFinalPQRSMail($pqr, $respuesta, $adjuntosRespuesta));
        Mail::to($pqr->registrador_correo)->send(new RespuestaFinalPQRSMail($pqr, $respuesta, $adjuntosRespuesta));


        $fechaRespuesta = Carbon::parse($respuesta->created_at, 'America/Bogota');

        $pqr->estado_respuesta = 'Cerrado'; // Considera si quieres que esto sea 'Cerrado' o 'Respondido'
        $pqr->respuesta_enviada = true;
        $pqr->respondido_en = $fechaRespuesta;

        // Estas fechas de deadline quizás deban actualizarse solo si la PQR se cierra
        $pqr->deadline_interno = $fechaRespuesta;
        $pqr->deadline_ciudadano = $fechaRespuesta;

        $estadoTiempo = app(PqrTiempoService::class)->calcularEstadoTiempo($pqr);
        $pqr->estado_tiempo = $estadoTiempo['estado'];

        $pqr->save();

        return response()->json(['mensaje' => 'Respuesta final enviada al ciudadano.']);
    }


    // public function enviarRespuesta($pqr_codigo)
    // {
    //     $pqr = Pqr::where('pqr_codigo', $pqr_codigo)->firstOrFail();

    //     $respuesta = $pqr->respuestas()->where('es_final', true)->latest()->first();

    //     if (!$respuesta) {
    //         return response()->json(['error' => 'No hay respuesta final registrada para esta PQRS.'], 400);
    //     }

    //     Mail::to($pqr->correo)->send(new RespuestaFinalPQRSMail($pqr, $respuesta));

    //     $fechaRespuesta = Carbon::parse($respuesta->created_at, 'America/Bogota');

    //     $pqr->estado_respuesta = 'Cerrado';
    //     $pqr->respuesta_enviada = true;
    //     $pqr->respondido_en = $fechaRespuesta;

    //     $pqr->deadline_interno = $fechaRespuesta;
    //     $pqr->deadline_ciudadano = $fechaRespuesta;

    //     $estadoTiempo = app(PqrTiempoService::class)->calcularEstadoTiempo($pqr);
    //     $pqr->estado_tiempo = $estadoTiempo['estado'];

    //     $pqr->save();

    //     return response()->json(['mensaje' => 'Respuesta final enviada al ciudadano.']);
    // }

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



    public function updateRespuestaFinal(Request $request, Respuesta $respuesta)
    {
        try {
            // Check if it's a final response and associated with a PQR
            // Assuming the relationship from Respuesta to Pqr is named 'pqr'
            if (!$respuesta->es_final || !$respuesta->pqr) {
                Log::warning('Intento de actualizar una respuesta no final o sin PQRS asociada. Respuesta ID: ' . $respuesta->id);
                return response()->json(['error' => 'La respuesta no es final o no está asociada a una PQRS válida.'], 404);
            }

            // Validation rules
            $request->validate([
                'contenido' => 'required|string',
                'adjuntos_nuevos' => 'nullable|array', // New files being uploaded
                'adjuntos_nuevos.*' => 'file|max:8000',
                'adjuntos_existentes' => 'nullable|array', // Paths of existing files that should be kept
                'adjuntos_existentes.*.path' => 'required|string',
                'adjuntos_existentes.*.original_name' => 'required|string',
            ]);

            $respuesta->contenido = $request->contenido;
            $respuesta->user_id = Auth::id(); // The last editor becomes the author

            $newAdjuntosData = [];
            Log::info('Checking for new attachments during update for Respuesta ID: ' . $respuesta->id);

            if ($request->hasFile('adjuntos_nuevos')) {
                Log::info('New attachments found for update. Respuesta ID: ' . $respuesta->id);
                foreach ($request->file('adjuntos_nuevos') as $file) {
                    // *** CRITICAL CHANGE: Use 'respuestas' folder and 'public' disk explicitly ***
                    // This stores the file in storage/app/public/respuestas/unique_name.ext
                    $path = $file->store('respuestas', 'public');
                    Log::info('New file stored at: ' . $path . ' for Respuesta ID: ' . $respuesta->id);

                    // The $path returned from store() when using a disk is already relative to the disk's root (e.g., 'respuestas/unique_name.png')
                    // So, str_replace('public/', '', $path) is no longer needed here.
                    $newAdjuntosData[] = [
                        'path' => $path, // Path is already correct: 'respuestas/unique_name.png'
                        'original_name' => $file->getClientOriginalName(),
                    ];
                }
            } else {
                Log::info('No new attachments found for update. Respuesta ID: ' . $respuesta->id);
            }

            // Combine existing attachments (those kept by the frontend) with the newly uploaded ones.
            // The frontend should send back the 'path' and 'original_name' of existing files it wants to keep.
            $keptAdjuntos = $request->input('adjuntos_existentes', []);
            Log::info('Existing attachments to be kept for Respuesta ID ' . $respuesta->id . ': ' . json_encode($keptAdjuntos));

            $respuesta->adjuntos = array_merge($keptAdjuntos, $newAdjuntosData);
            Log::info('Final attachments array after merge for Respuesta ID ' . $respuesta->id . ': ' . json_encode($respuesta->adjuntos));

            $respuesta->save();
            $respuesta->load('autor'); // Load the author relationship for the response

            return response()->json([
                'mensaje' => 'Respuesta final actualizada correctamente',
                'respuesta' => $respuesta,
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error in updateRespuestaFinal: ' . $e->getMessage(), ['errors' => $e->errors()]);
            return response()->json([
                'error' => 'Error de validación',
                'messages' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('General exception in updateRespuestaFinal: ' . $e->getMessage() . ' on line ' . $e->getLine() . ' in file ' . $e->getFile());
            return response()->json([
                'error' => 'Error al actualizar la respuesta final: ' . $e->getMessage(),
            ], 500);
        }
    }
    // public function updateRespuestaFinal(Request $request, Respuesta $respuesta)
    // {

    //     if (!$respuesta->es_final || !$respuesta->pqr) { // ¡CAMBIAR $respuesta->pqrs a $respuesta->pqr!
    //         // El Log::warning que te sugerí antes (con pqr) te daría más detalles si esta condición falla.
    //         return response()->json(['error' => 'La respuesta no es final o no está asociada a una PQRS válida.'], 404);
    //     }

    //     $request->validate([
    //         'contenido' => 'required|string',
    //         'adjuntos_nuevos' => 'nullable|array', // Nuevos archivos subidos
    //         'adjuntos_nuevos.*' => 'file|max:8000',
    //         'adjuntos_existentes' => 'nullable|array', // Rutas de archivos existentes que deben mantenerse
    //         'adjuntos_existentes.*.path' => 'required|string',
    //         'adjuntos_existentes.*.original_name' => 'required|string',
    //     ]);

    //     $respuesta->contenido = $request->contenido;
    //     $respuesta->user_id = Auth::id(); // El último que edita es el autor

    //     $newAdjuntosData = [];
    //     if ($request->hasFile('adjuntos_nuevos')) {
    //         foreach ($request->file('adjuntos_nuevos') as $file) {
    //             $path = $file->store('public/respuestas_finales');
    //             $newAdjuntosData[] = [
    //                 'path' => str_replace('public/', '', $path),
    //                 'original_name' => $file->getClientOriginalName(),
    //             ];
    //         }
    //     }

    //     // Combinar adjuntos existentes (los que el usuario decidió mantener en el frontend)
    //     // con los nuevos adjuntos subidos.
    //     $keptAdjuntos = $request->input('adjuntos_existentes', []);
    //     $respuesta->adjuntos = array_merge($keptAdjuntos, $newAdjuntosData);

    //     $respuesta->save();
    //     $respuesta->load('autor');

    //     return response()->json([
    //         'mensaje' => 'Respuesta final actualizada correctamente',
    //         'respuesta' => $respuesta,
    //     ]);
    // }
}
