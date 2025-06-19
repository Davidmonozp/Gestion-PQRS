<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pqr;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Mail;

class PqrController extends Controller
{
    // public function store(Request $request)
    // {
    //     try {
    //         $validated = $request->validate([
    //             'nombre' => 'required|string|max:100',
    //             'apellido' => 'required|string|max:100',
    //             'documento_tipo' => 'required|string',
    //             'documento_numero' => 'required|string',
    //             'correo' => 'required|email',
    //             'telefono' => 'nullable|string',
    //             'sede' => 'required|string',
    //             'servicio_prestado' => 'required|string',
    //             'eps' => 'required|string',
    //             'tipo_solicitud' => 'required|string',
    //             'descripcion' => 'required|string',
    //             'archivo' => 'nullable|file|max:5120'
    //         ]);

    //         if ($request->hasFile('archivo')) {
    //             $path = $request->file('archivo')->store('pqrs_files', 'public');
    //             $validated['archivo'] = $path;
    //         }

    //         $pqr = Pqr::create($validated);

    //         return response()->json([
    //             'message' => 'PQR creada con éxito',
    //             'pqr' => $pqr
    //         ], 201);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'error' => $e->getMessage(),
    //         ], 500);
    //     }
    // }

    public function store(Request $request)
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

            // Validación adicional si registra para otro
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

            // Crear la PQR con los datos validados
            $pqr = Pqr::create([
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

    // public function index(Request $request)
    // {
    //     try {
    //         $query = Pqr::query();


    //         if ($request->filled('id')) {
    //             $query->where('id', $request->id);
    //         }

    //         if ($request->filled('documento_numero')) {
    //             $query->where('documento_numero', 'like', '%' . $request->documento_numero . '%');
    //         }

    //         if ($request->filled('servicio_prestado')) {
    //             $query->where('servicio_prestado', 'like', '%' . $request->servicio_prestado . '%');
    //         }
    //         if ($request->filled('tipo_solicitud')) {
    //             $query->where('tipo_solicitud', 'like', '%' . $request->tipo_solicitud . '%');
    //         }

    //         // Puedes añadir más filtros si lo necesitas...

    //         // Ordenar por fecha más reciente
    //         $pqrs = $query->orderBy('created_at', 'desc')->paginate(10);

    //         // return response()->json([
    //         //     'pqrs' => $pqrs->items()
    //         // ]);
    //         return response()->json([
    //             'pqrs' => $pqrs->items(),
    //             'current_page' => $pqrs->currentPage(),
    //             'last_page' => $pqrs->lastPage(),
    //             'total' => $pqrs->total(),
    //             'per_page' => $pqrs->perPage(),
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'error' => 'Error al obtener las PQRS: ' . $e->getMessage()
    //         ], 500);
    //     }
    // }

    public function index(Request $request)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();

            $query = Pqr::query();

            // Si el usuario es un Digitador, filtrar por su documento
            if ($user->hasRole('Digitador')) {
                $query->where(function ($digitadorFilter) use ($user) {
                    $digitadorFilter
                        ->where(function ($matchAsSolicitante) use ($user) {
                            $matchAsSolicitante
                                ->where('documento_tipo', $user->documento_tipo)
                                ->where('documento_numero', $user->documento_numero);
                        })
                        ->orWhere(function ($matchAsRegistrador) use ($user) {
                            $matchAsRegistrador
                                ->where('registrador_documento_tipo', $user->documento_tipo)
                                ->where('registrador_documento_numero', $user->documento_numero);
                        });
                });
            }

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
            $pqrs = $query->orderBy('created_at', 'desc')->paginate(10);

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


public function show($id)
{
    try {
        $user = JWTAuth::parseToken()->authenticate();

        // 👉 AÑADIR 'respuestas' a la carga con relaciones
        $pqr = Pqr::with(['asignado', 'respuestas'])->findOrFail($id);

        if ($user->hasRole('Digitador')) {
            if (
                $pqr->registrador_documento_tipo !== $user->documento_tipo ||
                $pqr->registrador_documento_numero !== $user->documento_numero
            ) {
                return response()->json([
                    'message' => 'No tienes permiso para ver esta PQR.'
                ], 403);
            }
        }

        return response()->json([
            'pqr' => $pqr,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Error al obtener la PQR: ' . $e->getMessage()
        ], 500);
    }
}
    // public function show($id)
    // {
    //     $pqr = Pqr::with('asignado')->findOrFail($id);

    //     return response()->json([
    //         'pqr' => $pqr,
    //     ]);
    // }

    public function update(Request $request, $id)
    {
        try {
            // Buscar la Pqr por id
            $pqr = Pqr::findOrFail($id);

            // Validar los campos básicos
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

            // Si el usuario tiene rol admin o gestor, validar y añadir campos extras
            if ($request->user()->hasRole(['Administrador', 'Gestor'])) {
                $request->validate([
                    'atributo_calidad' => 'nullable|in:Accesibilidad,Continuidad,Oportunidad,Pertinencia,Satisfacción del usuario,Seguridad',
                    'fuente' => 'nullable|in:Formulario de la web,correo atención al usuario,Correo de Agendamiento NAC,Encuesta de satisfacción IPS,callcenter,Presencial',
                    'asignado_a' => 'nullable|exists:users,id',
                ]);

                $data['atributo_calidad'] = $request->atributo_calidad;
                $data['fuente'] = $request->fuente;
                $data['asignado_a'] = $request->asignado_a;
            }

            // Actualizar la Pqr
            $pqr->update($data);

            return response()->json(['message' => 'PQR actualizada correctamente.', 'data' => $pqr]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function asignadas()
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();

            $pqrs = Pqr::where('asignado_a', $user->id)->get();

            return response()->json(['pqrs' => $pqrs]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener la PQR: ' . $e->getMessage()
            ], 500);
        }
    }
}
