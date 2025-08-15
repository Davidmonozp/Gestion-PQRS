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
    //         'adjuntos' => 'nullable|array',
    //         'adjuntos.*' => 'file|max:8000',
    //     ]);

    //     $pqrs = Pqr::where('pqr_codigo', $pqr_codigo)->firstOrFail();

    //     if (!$pqrs->asignados->contains(Auth::id())) {
    //         return response()->json(['error' => 'No autorizado'], 403);
    //     }


    //     $respuestaExistente = Respuesta::where('pqrs_id', $pqrs->id)
    //         ->where('user_id', Auth::id())
    //         ->exists();

    //     if ($respuestaExistente) {
    //         return response()->json(['error' => 'Ya has registrado una respuesta para esta PQRS'], 400);
    //     }

    //     $adjuntosData = [];
    //     if ($request->hasFile('adjuntos')) {
    //         foreach ($request->file('adjuntos') as $file) {
    //             $path = $file->store('respuestas', 'public');
    //             $adjuntosData[] = [
    //                 'path' => str_replace('public/', '', $path),
    //                 'original_name' => $file->getClientOriginalName(),
    //             ];
    //         }
    //     }

    //     Respuesta::create([
    //         'pqrs_id' => $pqrs->id,
    //         'user_id' => Auth::id(),
    //         'contenido' => $request->contenido,
    //         'adjuntos' => $adjuntosData,
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

    if (!$pqrs->asignados->contains(Auth::id())) {
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
            // Guarda en storage/app/public/respuestas
            $path = $file->store('respuestas', 'public');

            $adjuntosData[] = [
                'path' => $path, // Ej: "respuestas/archivo.pdf"
                'original_name' => $file->getClientOriginalName(),
                'url' => asset("storage/{$path}"), // URL pública directa
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

        $adjuntosData = []; // Array para almacenar los datos de los nuevos archivos adjuntos

        // --- Lógica para manejar archivos adjuntos ---
        Log::info('Checking for attachments in the request for PQR: ' . $pqrs->pqr_codigo);

        if ($request->hasFile('adjuntos')) {
            foreach ($request->file('adjuntos') as $file) {
                // Guarda el archivo en storage/app/public/respuestas
                $path = $file->store('respuestas', 'public');
                
                // *** ESTO ES LO QUE NECESITAS AGREGAR ***
                // Creamos un array con la ruta, nombre original y la URL completa
                $adjuntosData[] = [
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'url' => asset("storage/{$path}"), // Genera la URL pública completa
                ];
            }
        }
        // --- Fin de la lógica de manejo de archivos ---

        // Log the final adjuntosData array that will be saved
        Log::info('Final attachments data to be saved for PQR ' . $pqrs->pqr_codigo . ': ' . json_encode($adjuntosData));

        // 4. Update or Create Final Response
        if ($respuestaFinal) {
            // Si la respuesta existe, actualiza el contenido y el autor
            $respuestaFinal->contenido = $request->contenido;
            $respuestaFinal->user_id = Auth::id();
            
            // Usamos Arr::wrap para asegurarnos de que el valor existente sea siempre un array
            $existingAdjuntos = Arr::wrap($respuestaFinal->adjuntos);
            $respuestaFinal->adjuntos = array_merge($existingAdjuntos, $adjuntosData);
            
            $respuestaFinal->save();
            Log::info('Final response updated for PQR ' . $pqrs->pqr_codigo . '. All attachments: ' . json_encode($respuestaFinal->adjuntos));
        } else {
            // Si la respuesta no existe, crea una nueva respuesta final
            $respuestaFinal = Respuesta::create([
                'pqrs_id' => $pqrs->id,
                'user_id' => Auth::id(),
                'contenido' => $request->contenido,
                'es_final' => true,
                'adjuntos' => $adjuntosData, // Guarda los archivos aquí
            ]);
            Log::info('Final response created for PQR ' . $pqrs->pqr_codigo . '. All attachments: ' . json_encode($respuestaFinal->adjuntos));
        }

        // 5. Load author relationship for response
        $respuestaFinal->load('autor');

        // 6. Return JSON response
        return response()->json([
            'mensaje' => 'Respuesta final registrada correctamente',
            'respuesta' => $respuestaFinal,
        ], 200);
    }


 public function enviarRespuesta($pqr_codigo)
    {
        $pqr = Pqr::where('pqr_codigo', $pqr_codigo)->firstOrFail();

        // 1. Obtener la respuesta final
        $respuesta = $pqr->respuestas()->where('es_final', true)->latest()->first();

        if (!$respuesta) {
            return response()->json(['error' => 'No hay respuesta final registrada para esta PQRS.'], 400);
        }

        // 2. Extraer los adjuntos. Si no existen, se usa un array vacío.
        $adjuntosRespuesta = $respuesta->adjuntos ?? [];

        try {
            $correoCiudadanoValido = !empty($pqr->correo) && filter_var($pqr->correo, FILTER_VALIDATE_EMAIL);
            $correoRegistradorValido = !empty($pqr->registrador_correo) && filter_var($pqr->registrador_correo, FILTER_VALIDATE_EMAIL);

            if (!$correoCiudadanoValido && !$correoRegistradorValido) {
                return response()->json(['error' => 'No se pudo enviar el correo: ambas direcciones son inválidas.'], 400);
            }

            // 3. Crear una única instancia del Mailable con los datos y adjuntos
            $mailable = new RespuestaFinalPQRSMail($pqr, $respuesta, $adjuntosRespuesta);

            if ($correoCiudadanoValido) {
                Mail::to($pqr->correo)->send($mailable);
            }

            if ($correoRegistradorValido) {
                Mail::to($pqr->registrador_correo)->send($mailable);
            }
        } catch (\Exception $e) {
            Log::error("Error al enviar correos para PQRS {$pqr_codigo}: " . $e->getMessage());
            return response()->json(['error' => 'Error al enviar correos.'], 500);
        }

        // 4. Marcar como respondida
        $fechaRespuesta = Carbon::parse($respuesta->created_at, 'America/Bogota');

        $pqr->estado_respuesta = 'Cerrado';
        $pqr->respuesta_enviada = true;
        $pqr->respondido_en = $fechaRespuesta;
        $pqr->deadline_interno = $fechaRespuesta;
        $pqr->deadline_ciudadano = $fechaRespuesta;

        $estadoTiempo = app(PqrTiempoService::class)->calcularEstadoTiempo($pqr);
        $pqr->estado_tiempo = $estadoTiempo['estado'];

        $pqr->save();

        return response()->json(['mensaje' => 'Respuesta final enviada correctamente.']);
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
                // 'adjuntos_existentes.*.url' => 'required|string', // Se asume que el front-end también envía la URL
            ]);

            // Obtiene los adjuntos que ya están en la respuesta
            // Esto es crucial para no sobrescribir los archivos existentes.
            $existingAdjuntos = $respuesta->adjuntos ?? [];

            // Identifica los adjuntos que el front-end quiere mantener
            $keptAdjuntos = $request->input('adjuntos_existentes', []);
            $keptAdjuntoPaths = collect($keptAdjuntos)->pluck('path')->toArray();
            
            // Filtra los adjuntos existentes para quedarte solo con los que el front-end quiere mantener
            $finalAdjuntos = collect($existingAdjuntos)
                ->filter(function ($adjunto) use ($keptAdjuntoPaths) {
                    return in_array($adjunto['path'], $keptAdjuntoPaths);
                })
                ->values()
                ->toArray();

            $newAdjuntosData = [];
            Log::info('Checking for new attachments during update for Respuesta ID: ' . $respuesta->id);

            if ($request->hasFile('adjuntos_nuevos')) {
                Log::info('New attachments found for update. Respuesta ID: ' . $respuesta->id);
                foreach ($request->file('adjuntos_nuevos') as $file) {
                    // Guarda el archivo en storage/app/public/respuestas
                    $path = $file->store('respuestas', 'public');
                    Log::info('New file stored at: ' . $path . ' for Respuesta ID: ' . $respuesta->id);

                    // Añadir la URL completa
                    $newAdjuntosData[] = [
                        'path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'url' => asset("storage/{$path}"), // Genera la URL pública completa
                    ];
                }
            } else {
                Log::info('No new attachments found for update. Respuesta ID: ' . $respuesta->id);
            }

            // Combine existing attachments (those kept by the frontend) with the newly uploaded ones.
            Log::info('Existing attachments to be kept for Respuesta ID ' . $respuesta->id . ': ' . json_encode($finalAdjuntos));
            Log::info('New attachments to be added for Respuesta ID ' . $respuesta->id . ': ' . json_encode($newAdjuntosData));

            $respuesta->contenido = $request->contenido;
            $respuesta->user_id = Auth::id(); // The last editor becomes the author
            $respuesta->adjuntos = array_merge($finalAdjuntos, $newAdjuntosData);
            
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
