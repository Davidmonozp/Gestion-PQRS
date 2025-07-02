<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pqr;
use App\Services\CodigoPqrService;
use App\Services\PqrTiempoService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Mail;

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
                'telefono' => 'nullable|string',
                'sede' => 'required|string',
                'servicio_prestado' => 'required|string',
                'eps' => 'required|string',
                'tipo_solicitud' => 'required|string',
                'descripcion' => 'required|string',
                'archivo' => 'nullable|file|max:5120',
                'registra_otro' => 'required|in:si,no',
            ];

            if ($registra_otro) {
                $rules = array_merge($rules, [
                    'registrador_nombre' => 'required|string|max:100',
                    'registrador_apellido' => 'required|string|max:100',
                    'registrador_documento_tipo' => 'required|string',
                    'registrador_documento_numero' => 'required|string',
                    'registrador_correo' => 'required|email',
                    'registrador_telefono' => 'nullable|string',
                ]);
            }

            $validated = $request->validate($rules);

            // Guardar archivo si se envió
            if ($request->hasFile('archivo')) {
                $path = $request->file('archivo')->store('pqrs_files', 'public');
                $validated['archivo'] = $path;
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
                'tipo_solicitud' => $validated['tipo_solicitud'],
                'descripcion' => $validated['descripcion'],
                'archivo' => $validated['archivo'] ?? null,
                'registra_otro' => $registra_otro,
                'registrador_nombre' => $validated['registrador_nombre'] ?? null,
                'registrador_apellido' => $validated['registrador_apellido'] ?? null,
                'registrador_documento_tipo' => $validated['registrador_documento_tipo'] ?? null,
                'registrador_documento_numero' => $validated['registrador_documento_numero'] ?? null,
                'registrador_correo' => $validated['registrador_correo'] ?? null,
                'registrador_telefono' => $validated['registrador_telefono'] ?? null,
            ]);

            Mail::to($pqr->correo)->send(new \App\Mail\PqrRegistrada($pqr));

            // Agregar URL del archivo para respuesta
            $pqr->archivo_url = $pqr->archivo ? asset('storage/' . $pqr->archivo) : null;

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

            // Si el usuario es un Digitador, filtrar por su documento
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

            // Filtros adicionales (opcional)
            if ($request->filled('id')) {
                $query->where('id', $request->id);
            }

            if ($request->filled('documento_numero')) {
                $query->where('documento_numero', 'like', '%' . $request->documento_numero . '%');
            }

            if ($request->filled('servicio_prestado')) {
                $query->where('servicio_prestado', 'like', '%' . $request->servicio_prestado . '%');
            }

            if ($request->filled('tipo_solicitud')) {
                $query->where('tipo_solicitud', 'like', '%' . $request->tipo_solicitud . '%');
            }

            // Ordenar por fecha más reciente
             $pqrs = $query->orderBy('created_at', 'desc')
                          ->with('asignado:id,name') 
                          ->paginate(10);

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



    public function show($pqr_codigo)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();

            $pqr = Pqr::with(['asignado', 'respuestas'])->where('pqr_codigo', $pqr_codigo)->firstOrFail();

            // Calcular tiempo_respondido usando Carbon (asegúrate de importar Carbon)
            $tiempoRespondido = null;
            if ($pqr->respondido_en) {
                $createdAt = Carbon::parse($pqr->created_at);
                $respondidoEn = Carbon::parse($pqr->respondido_en);

                // Diferencia total en minutos
                $diffInMinutes = $createdAt->diffInMinutes($respondidoEn);

                // Convertir a horas enteras (redondeando hacia abajo)
                $diffInHours = intdiv($diffInMinutes, 60);

                $tiempoRespondido = $diffInHours . ' horas';
            }

            // Adjuntar al objeto pqr (como atributo dinámico)
            $pqr->tiempo_respondido = $tiempoRespondido;

            return response()->json(['pqr' => $pqr->load('respuestas')]);
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
                    'fuente'           => 'nullable|in:Formulario de la web,correo atención al usuario,Correo de Agendamiento NAC,Encuesta de satisfacción IPS,callcenter Presencial',
                    'asignado_a'       => 'nullable|exists:users,id',
                    'prioridad'        => 'required|in:Vital,Priorizado,Simple',
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
                    };

                    // Plazos internos
                    $internoHoras = match ($prioridad) {
                        'Vital'      => 6,
                        'Priorizado' => 24,
                        'Simple'     => 24,
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
}
