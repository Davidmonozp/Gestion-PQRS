<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ConsultaRadicadoInfo;
use App\Mail\PqrAsignada;
use App\Models\Pqr;
use App\Services\CodigoPqrService;
use App\Services\PqrTiempoService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class PqrController extends Controller
{


    public function store(Request $request, CodigoPqrService $codigoService)
    {
        try {
            $registra_otro = $request->input('registra_otro') === 'si';

            // Reglas de validación
            $rules = [
                'nombre' => 'required|string|max:100',
                'apellido' => 'required|string|max:100',
                'documento_tipo' => 'required|string',
                'documento_numero' => 'required|string',
                'correo' => 'required|email',
                'correo_confirmacion' => 'required|email|same:correo',
                'telefono' => 'nullable|string',
                'sede' => 'required|string',
                'servicio_prestado' => 'required|string',
                'eps' => 'required|string',
                'regimen' => 'required|string',
                'tipo_solicitud' => 'required|string',
                'fuente' => 'nullable|string|max:100',
                'descripcion' => 'required|string',
                'archivos' => 'nullable|array',
                'archivos.*' => 'file|max:8000',
                'registra_otro' => 'required|in:si,no',
                'politica_aceptada' => 'accepted'
            ];

            if ($registra_otro) {
                $rules = array_merge($rules, [
                    'registrador_nombre' => 'required|string|max:100',
                    'registrador_apellido' => 'required|string|max:100',
                    'registrador_documento_tipo' => 'required|string',
                    'registrador_documento_numero' => 'required|string',
                    'registrador_correo' => 'required|email',
                    'registrador_telefono' => 'nullable|string',
                    'parentesco' => 'required|string|max:50',
                ]);
            }

            $validated = $request->validate($rules);

            $uploadedFilesData = [];
            // Guardar archivo si se envió
            $uploadedFilesData = []; // Array para almacenar objetos {path, original_name}
            if ($request->hasFile('archivos')) {
                foreach ($request->file('archivos') as $file) {
                    $path = $file->store('pqrs_files', 'public'); // Guarda el archivo
                    $originalName = $file->getClientOriginalName(); // Obtiene el nombre original del archivo

                    $uploadedFilesData[] = [
                        'path' => $path,
                        'original_name' => $originalName,
                    ];
                }
            }

            // Generar el código único de la PQR
            $codigoPqr = $codigoService->generarCodigoPqr($validated['tipo_solicitud'], $validated['documento_numero']);

            // Crear la PQR
            $pqr = Pqr::create([
                'pqr_codigo' => $codigoPqr,
                'nombre' => $validated['nombre'],
                'apellido' => $validated['apellido'],
                'documento_tipo' => $validated['documento_tipo'],
                'documento_numero' => $validated['documento_numero'],
                'correo' => $validated['correo'],
                'telefono' => $validated['telefono'],
                'sede' => $validated['sede'],
                'servicio_prestado' => $validated['servicio_prestado'],
                'eps' => $validated['eps'],
                'regimen' => $validated['regimen'],
                'tipo_solicitud' => $validated['tipo_solicitud'],
                'fuente' => $validated['fuente'] ?? null,
                'descripcion' => $validated['descripcion'],
                'archivo' => $uploadedFilesData,
                'registra_otro' => $registra_otro,
                'registrador_nombre' => $validated['registrador_nombre'] ?? null,
                'registrador_apellido' => $validated['registrador_apellido'] ?? null,
                'registrador_documento_tipo' => $validated['registrador_documento_tipo'] ?? null,
                'registrador_documento_numero' => $validated['registrador_documento_numero'] ?? null,
                'registrador_correo' => $validated['registrador_correo'] ?? null,
                'registrador_telefono' => $validated['registrador_telefono'] ?? null,
                'parentesco' => $validated['parentesco'] ?? null,
            ]);

            Mail::to($pqr->correo)->send(new \App\Mail\PqrRegistrada($pqr));

            // Agregar URL del archivo para respuesta
            $pqr->archivo_urls = collect($pqr->archivo)->map(function ($fileItem) {
                // Asegúrate de que $fileItem sea un objeto o array asociativo
                $path = is_array($fileItem) ? $fileItem['path'] : $fileItem->path;
                return asset('storage/' . $path);
            })->all();

            return response()->json([
                'message' => 'PQR creada con éxito',
                'pqr' => $pqr,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }






    public function index(Request $request)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();

            $query = Pqr::query();

            // Si quieres aplicar el filtro por usuario Digitador, descomenta y ajusta
            // if ($user->hasRole('Digitador')) {
            //     $query->where(function ($digitadorFilter) use ($user) {
            //         $digitadorFilter
            //             ->where(function ($matchAsSolicitante) use ($user) {
            //                 $matchAsSolicitante
            //                     ->where('documento_tipo', $user->documento_tipo)
            //                     ->where('documento_numero', $user->documento_numero);
            //             })
            //             ->orWhere(function ($matchAsRegistrador) use ($user) {
            //                 $matchAsRegistrador
            //                     ->where('registrador_documento_tipo', $user->documento_tipo)
            //                     ->where('registrador_documento_numero', $user->documento_numero);
            //             });
            //     });
            // }

            // Filtros con OR
            if (
                $request->filled('pqr_codigo') ||
                $request->filled('documento_numero') ||
                $request->filled('servicio_prestado') ||
                $request->filled('tipo_solicitud')
            ) {
                $query->where(function ($q) use ($request) {
                    if ($request->filled('pqr_codigo')) {
                        $q->orWhere('pqr_codigo', 'like', '%' . $request->pqr_codigo . '%');
                    }
                    if ($request->filled('documento_numero')) {
                        $q->orWhere('documento_numero', 'like', '%' . $request->documento_numero . '%');
                    }
                    if ($request->filled('servicio_prestado')) {
                        $q->orWhere('servicio_prestado', 'like', '%' . $request->servicio_prestado . '%');
                    }
                    if ($request->filled('tipo_solicitud')) {
                        $q->orWhere('tipo_solicitud', 'like', '%' . $request->tipo_solicitud . '%');
                    }
                });
            }

            // Ordenar por fecha más reciente
            $pqrs = $query->orderBy('created_at', 'desc')
                ->with('asignado:id,name')
                ->paginate(15);

            return response()->json([
                'pqrs' => $pqrs->items(),
                'current_page' => $pqrs->currentPage(),
                'last_page' => $pqrs->lastPage(),
                'total' => $pqrs->total(),
                'per_page' => $pqrs->perPage(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener las PQRS: ' . $e->getMessage()
            ], 500);
        }
    }



    // public function show($pqr_codigo)
    // {
    //     try {
    //         $user = JWTAuth::parseToken()->authenticate();

    //         $pqr = Pqr::with(['asignado', 'respuestas'])->where('pqr_codigo', $pqr_codigo)->firstOrFail();

    //         // Calcular tiempo_respondido usando Carbon (asegúrate de importar Carbon)
    //         $tiempoRespondido = null;
    //         if ($pqr->respondido_en) {
    //             $createdAt = Carbon::parse($pqr->created_at);
    //             $respondidoEn = Carbon::parse($pqr->respondido_en);

    //             // Diferencia total en minutos
    //             $diffInMinutes = $createdAt->diffInMinutes($respondidoEn);

    //             // Convertir a horas enteras (redondeando hacia abajo)
    //             $diffInHours = intdiv($diffInMinutes, 60);

    //             $tiempoRespondido = $diffInHours . ' horas';
    //         }

    //         // Adjuntar al objeto pqr (como atributo dinámico)
    //         $pqr->tiempo_respondido = $tiempoRespondido;

    //         return response()->json(['pqr' => $pqr->load('respuestas')]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'error' => 'Error al obtener la PQR: ' . $e->getMessage()
    //         ], 500);
    //     }
    // }

    public function show($pqr_codigo)
    {
        try {
            // No es estrictamente necesario autenticar al usuario aquí si solo vas a mostrar la PQR,
            // pero si tu lógica de negocio lo requiere, déjalo.
            // $user = JWTAuth::parseToken()->authenticate();

            $pqr = Pqr::where('pqr_codigo', $pqr_codigo)
                ->with([
                    'asignado',          // Carga el usuario asignado a la PQR
                    'respuestas.autor'   // ¡Esto es lo crucial! Carga las respuestas Y el autor de cada respuesta
                ])
                ->firstOrFail();

            // Calcular tiempo_respondido usando Carbon
            $tiempoRespondido = null;
            if ($pqr->respondido_en) {
                $createdAt = Carbon::parse($pqr->created_at);
                $respondidoEn = Carbon::parse($pqr->respondido_en);

                $diffInMinutes = $createdAt->diffInMinutes($respondidoEn);
                $diffInHours = intdiv($diffInMinutes, 60);

                $tiempoRespondido = $diffInHours . ' horas';
            }

            // Adjuntar al objeto pqr (como atributo dinámico)
            $pqr->tiempo_respondido = $tiempoRespondido;

            // Retorna la PQR ya con todas las relaciones cargadas
            return response()->json(['pqr' => $pqr]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener la PQR: ' . $e->getMessage()
            ], 500);
        }
    }


    public function update(Request $request, $pqr_codigo, PqrTiempoService $tiempoService)
    {
        try {
            $pqr = Pqr::where('pqr_codigo', $pqr_codigo)->firstOrFail();

            $data = $request->only([
                'nombre',
                'apellido',
                'documento_tipo',
                'documento_numero',
                'correo',
                'telefono',
                'sede',
                'servicio_prestado',
                'eps',
                'tipo_solicitud',
                'descripcion',
                'archivo',
            ]);

            if ($request->user()->hasRole(['Administrador', 'Supervisor'])) {
                $request->validate([
                    'atributo_calidad' => 'nullable|in:Accesibilidad,Continuidad,Oportunidad,Pertinencia,Satisfacción del usuario,Seguridad',
                    'fuente'           => 'nullable|in:Formulario de la web,Correo atención al usuario,Correo de Agendamiento NAC,Encuesta de satisfacción IPS,Callcenter,Presencial',
                    'asignado_a'       => 'nullable|exists:users,id',
                    'prioridad'        => 'required|in:Vital,Priorizado,Simple,Solicitud',
                ]);

                $data['atributo_calidad'] = $request->atributo_calidad;
                $data['fuente'] = $request->fuente;
                $data['asignado_a'] = $request->asignado_a;

                // Cambiar estado si se asigna por primera vez
                if (!$pqr->asignado_a && $request->filled('asignado_a')) {
                    $data['estado_respuesta'] = 'Asignado';
                }

                // Asignar deadlines solo si aún no existen
                if ($request->filled('prioridad') && !$pqr->deadline_ciudadano && !$pqr->deadline_interno) {
                    $prioridad = $request->prioridad;

                    // Plazos para el ciudadano
                    $ciudadanoHoras = match ($prioridad) {
                        'Vital'      => 24,
                        'Priorizado' => 48,
                        'Simple'     => 72,
                        'Solicitud'  => 48,
                    };

                    // Plazos internos
                    $internoHoras = match ($prioridad) {
                        'Vital'      => 6,
                        'Priorizado' => 24,
                        'Simple'     => 24,
                        'Solicitud'  => 24,
                    };


                    $data['prioridad'] = $prioridad;
                    $fechaCreacion = Carbon::parse($pqr->created_at);

                    $data['deadline_ciudadano'] = $fechaCreacion->copy()->addHours($ciudadanoHoras);
                    $data['deadline_interno'] = $fechaCreacion->copy()->addHours($internoHoras);
                }
            }

            // Actualiza y recalcula estado de tiempo
            $pqr->update($data);
            $estadoTiempo = $tiempoService->calcularEstadoTiempo($pqr);
            $pqr->estado_tiempo = $estadoTiempo['estado'];
            $pqr->save();

            // Enviar correo al asignado si hay uno nuevo
            if ($request->filled('asignado_a')) {
                $asignado = \App\Models\User::find($request->asignado_a);
                if ($asignado && $asignado->email) {
                    Mail::to($asignado->email)->send(new PqrAsignada($pqr));
                }
            }

            return response()->json(['message' => 'PQR actualizada correctamente.', 'data' => $pqr]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al actualizar', 'error' => $e->getMessage()], 500);
        }
    }


    public function asignadas()
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();

            $pqrs = Pqr::where('asignado_a', $user->id)
                ->with('asignado:id,name')
                ->get();

            return response()->json(['pqrs' => $pqrs]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener la PQR: ' . $e->getMessage()
            ], 500);
        }
    }


    public function consultarRadicado(Request $request)
    {
        $codigo = $request->input('pqr_codigo');
        Log::info('Código recibido en API:', ['codigo' => $codigo]);

        $pqr = Pqr::with('estados')->where('pqr_codigo', $codigo)->first();

        if (!$pqr) {
            Log::warning('PQR no encontrada:', ['codigo' => $codigo]);
            return response()->json(['error' => 'PQR no encontrada'], 404);
        }

        try {
            Mail::to($pqr->correo)->send(new ConsultaRadicadoInfo($pqr));
            return response()->json([
                'message' => 'Correo enviado con la información del radicado',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error al enviar correo:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Error al enviar el correo: ' . $e->getMessage()], 500);
        }
    }

    public function registrarSeguimiento(Request $request, $pqr_codigo)
    {
        $request->validate([
            'descripcion' => 'required|string|max:1000',
        ]);

        $pqr = Pqr::where('pqr_codigo', $pqr_codigo)->firstOrFail();

        $seguimiento = $pqr->seguimientos()->create([
            'user_id'     => $request->user()->id,
            'descripcion' => $request->descripcion,
        ]);

        return response()->json([
            'message' => 'Seguimiento registrado',
            'data'    => $seguimiento
        ]);
    }


    public function obtenerSeguimientos($pqr_codigo)
    {
        $pqr = Pqr::where('pqr_codigo', $pqr_codigo)
            ->with(['seguimientos.user:id,name'])
            ->firstOrFail();

        return response()->json([
            'pqr_codigo'  => $pqr->pqr_codigo,
            'seguimientos' => $pqr->seguimientos
        ]);
    }
}
