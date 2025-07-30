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
use Illuminate\Support\Facades\Auth;

class PqrController extends Controller
{

    public function store(Request $request, CodigoPqrService $codigoService)
    {
        try {
            $registra_otro = $request->input('registra_otro') === 'si';

            // Reglas de validación base
            $rules = [
                'nombre' => 'required|string|max:100',
                'segundo_nombre' => 'nullable|string|max:100',
                'apellido' => 'required|string|max:100',
                'segundo_apellido' => 'nullable|string|max:100',
                'documento_tipo' => 'required|string',
                'documento_numero' => 'required|string',
                'correo' => 'required|email',
                'correo_confirmacion' => 'required|email|same:correo',
                'telefono' => 'nullable|string', // Considera validar formato con regex si es numérico
                'sede' => 'required|string',
                'servicio_prestado' => 'required|string',
                'eps' => 'required|string',
                'regimen' => 'required|string',
                'tipo_solicitud' => 'required|string',
                'descripcion' => 'required|string',
                'archivos' => 'nullable|array', // 'archivos' es el nombre del array de files
                'archivos.*' => 'file|max:8000', // Cada archivo dentro del array
                'registra_otro' => 'required|in:si,no',
                'politica_aceptada' => 'required',

                // INICIALIZA estos campos como NULLABLE por defecto
                'fecha_inicio_real' => 'nullable|date_format:Y-m-d H:i',
                'fuente' => 'nullable|string|max:100', // La regla 'in' se añade condicionalmente
            ];

            // Reglas condicionales para el registrador
            if ($registra_otro) {
                $parentesco = $request->input('parentesco');

                $rules = array_merge($rules, [
                    'registrador_nombre' => 'required|string|max:100',
                    'registrador_segundo_nombre' => 'nullable|string|max:100',
                    'registrador_apellido' => 'required|string|max:100',
                    'registrador_segundo_apellido' => 'nullable|string|max:100',
                    'registrador_correo' => 'required|email',
                    'registrador_telefono' => 'nullable|string',
                    'parentesco' => 'required|string|max:50',
                ]);

                if ($parentesco === 'Ente de control') {
                    // ✅ Solo pedimos cargo
                    $rules['registrador_cargo'] = 'required|string|max:100';
                    $rules['registrador_documento_tipo'] = 'nullable|string';
                    $rules['registrador_documento_numero'] = 'nullable|string';
                    $rules['nombre_entidad'] = 'required|string|max:100';
                } else {
                    // ✅ Solo pedimos documentos
                    $rules['registrador_documento_tipo'] = 'required|string';
                    $rules['registrador_documento_numero'] = 'required|string';
                    $rules['registrador_cargo'] = 'nullable|string|max:100';
                }
            }


            // Lógica condicional para 'fecha_inicio_real' y 'fuente'
            // Esto asume que tienes alguna forma de saber si el usuario está "logeado" en el backend.
            // Si tu API usa autenticación de Laravel (ej. Sanctum, Passport), Auth::check() funcionará.
            // Si no, necesitarías otra forma de determinar si el usuario es un "admin" o "logeado".
            $isLoggedInBackend = Auth::check(); // Verifica si hay un usuario autenticado

            Log::info('Backend Auth Check:', ['isLoggedIn' => $isLoggedInBackend]);

            if ($isLoggedInBackend) {
                // Si el usuario está logeado, estas reglas se vuelven 'required'
                $rules['fecha_inicio_real'] = 'required|date_format:Y-m-d H:i';
                $rules['fuente'] = 'required|string|in:Formulario de la web,Correo atención al usuario,Correo de Agendamiento NAC,Encuesta de satisfacción IPS,Callcenter,Presencial';
            }

            Log::info('Valor de politica_aceptada recibido antes de validación:', ['politica_aceptada_raw' => $request->input('politica_aceptada')]);
            Log::info('Todos los datos del request antes de validación:', $request->all());

            // Validar la solicitud
            $validated = $request->validate($rules);
            Log::info('Datos validados:', $validated); // Verifica lo que Laravel realmente valida y devuelve

            $uploadedFilesData = [];
            // Guardar archivos si se enviaron (solo si el Content-Type es multipart/form-data)
            if ($request->hasFile('archivos')) {
                foreach ($request->file('archivos') as $file) {
                    $path = $file->store('pqrs_files', 'public');
                    $originalName = $file->getClientOriginalName();

                    $uploadedFilesData[] = [
                        'path' => $path,
                        'original_name' => $originalName,
                    ];
                }
            }

            // Generar el código único de la PQR
            $codigoPqr = $codigoService->generarCodigoPqr($validated['tipo_solicitud'], $validated['documento_numero']);

            // Preparar los datos para la creación de la PQR
            $dataToCreate = [
                'pqr_codigo' => $codigoPqr,
                'nombre' => $validated['nombre'],
                'apellido' => $validated['apellido'],
                'documento_tipo' => $validated['documento_tipo'],
                'documento_numero' => $validated['documento_numero'],
                'correo' => $validated['correo'],
                'telefono' => $validated['telefono'] ?? null,
                'sede' => $validated['sede'],
                'servicio_prestado' => $validated['servicio_prestado'],
                'eps' => $validated['eps'],
                'regimen' => $validated['regimen'],
                'tipo_solicitud' => $validated['tipo_solicitud'],
                'fuente' => $validated['fuente'] ?? null,
                'descripcion' => $validated['descripcion'],
                'archivo' => $uploadedFilesData,
                'registra_otro' => $validated['registra_otro'] === 'si',
                'registrador_nombre' => $validated['registrador_nombre'] ?? null,
                'registrador_apellido' => $validated['registrador_apellido'] ?? null,
                'registrador_documento_tipo' => ($validated['parentesco'] ?? null) === 'Ente de control'
                    ? null
                    : ($validated['registrador_documento_tipo'] ?? null),
                'registrador_documento_numero' => ($validated['parentesco'] ?? null) === 'Ente de control'
                    ? null
                    : ($validated['registrador_documento_numero'] ?? null),
                'registrador_correo' => $validated['registrador_correo'] ?? null,
                'registrador_telefono' => $validated['registrador_telefono'] ?? null,
                'registrador_cargo' => $validated['registrador_cargo'] ?? null,
                'parentesco' => $validated['parentesco'] ?? null,
                'fecha_inicio_real' => $validated['fecha_inicio_real'] ?? null,
                'nombre_entidad' => ($validated['parentesco'] ?? null) === 'Ente de control'
                    ? ($validated['nombre_entidad'] ?? null)
                    : null,

            ];


            // Crear la PQR
            $pqr = Pqr::create($dataToCreate);

            // Enviar correo al paciente
            Mail::to($pqr->correo)->send(new \App\Mail\PqrRegistrada($pqr));

            // Enviar al registrador SOLO si existe correo
            if (!empty($pqr->registrador_correo)) {
                Mail::to($pqr->registrador_correo)->send(new \App\Mail\PqrRegistrada($pqr));
            }


            // Agregar URL del archivo para respuesta (si es necesario en la respuesta JSON)
            $pqr->archivo_urls = collect($pqr->archivo)->map(function ($fileItem) {
                // Asegúrate de que $fileItem sea un objeto o array asociativo
                $path = is_array($fileItem) ? $fileItem['path'] : $fileItem->path;
                return asset('storage/' . $path);
            })->all();

            return response()->json([
                'message' => 'PQR creada con éxito',
                'pqr' => $pqr,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Error de validación de PQR:', $e->errors());
            return response()->json([
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error al crear PQR:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'message' => 'Error interno del servidor al crear la PQR.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    // public function store(Request $request, CodigoPqrService $codigoService)
    // {
    //     try {
    //         $registra_otro = $request->input('registra_otro') === 'si';

    //         // Reglas de validación base
    //         $rules = [
    //             'nombre' => 'required|string|max:100',
    //             'segundo_nombre' => 'nullable|string|max:100',
    //             'apellido' => 'required|string|max:100',
    //             'segundo_apellido' => 'nullable|string|max:100',
    //             'documento_tipo' => 'required|string',
    //             'documento_numero' => 'required|string',
    //             'correo' => 'required|email',
    //             'correo_confirmacion' => 'required|email|same:correo',
    //             'telefono' => 'nullable|string', // Considera validar formato con regex si es numérico
    //             'sede' => 'required|string',
    //             'servicio_prestado' => 'required|string',
    //             'eps' => 'required|string',
    //             'regimen' => 'required|string',
    //             'tipo_solicitud' => 'required|string',
    //             'descripcion' => 'required|string',
    //             'archivos' => 'nullable|array', // 'archivos' es el nombre del array de files
    //             'archivos.*' => 'file|max:8000', // Cada archivo dentro del array
    //             'registra_otro' => 'required|in:si,no',
    //             'politica_aceptada' => 'required',

    //             // INICIALIZA estos campos como NULLABLE por defecto
    //             'fecha_inicio_real' => 'nullable|date_format:Y-m-d H:i',
    //             'fuente' => 'nullable|string|max:100', // La regla 'in' se añade condicionalmente
    //         ];

    //         // Reglas condicionales para el registrador
    //         if ($registra_otro) {
    //             $rules = array_merge($rules, [
    //                 'registrador_nombre' => 'required|string|max:100',
    //                 'registrador_segundo_nombre' => 'nullable|string|max:100',
    //                 'registrador_apellido' => 'required|string|max:100',
    //                 'registrador_segundo_apellido' => 'nullable|string|max:100',
    //                 'registrador_documento_tipo' => 'required|string',
    //                 'registrador_documento_numero' => 'required|string',
    //                 'registrador_correo' => 'required|email',
    //                 'registrador_telefono' => 'nullable|string',
    //                 'parentesco' => 'required|string|max:50',
    //             ]);
    //         }

    //         // Lógica condicional para 'fecha_inicio_real' y 'fuente'
    //         // Esto asume que tienes alguna forma de saber si el usuario está "logeado" en el backend.
    //         // Si tu API usa autenticación de Laravel (ej. Sanctum, Passport), Auth::check() funcionará.
    //         // Si no, necesitarías otra forma de determinar si el usuario es un "admin" o "logeado".
    //         $isLoggedInBackend = Auth::check(); // Verifica si hay un usuario autenticado

    //         Log::info('Backend Auth Check:', ['isLoggedIn' => $isLoggedInBackend]);

    //         if ($isLoggedInBackend) {
    //             // Si el usuario está logeado, estas reglas se vuelven 'required'
    //             $rules['fecha_inicio_real'] = 'required|date_format:Y-m-d H:i';
    //             $rules['fuente'] = 'required|string|in:"Formulario de la web","Correo atención al usuario","Correo de Agendamiento NAC","Encuesta de satisfacción IPS","Callcenter","Presencial"';
    //         }

    //         Log::info('Valor de politica_aceptada recibido antes de validación:', ['politica_aceptada_raw' => $request->input('politica_aceptada')]);
    //         Log::info('Todos los datos del request antes de validación:', $request->all());

    //         // Validar la solicitud
    //         $validated = $request->validate($rules);
    //         Log::info('Datos validados:', $validated); // Verifica lo que Laravel realmente valida y devuelve

    //         $uploadedFilesData = [];
    //         // Guardar archivos si se enviaron (solo si el Content-Type es multipart/form-data)
    //         if ($request->hasFile('archivos')) {
    //             foreach ($request->file('archivos') as $file) {
    //                 $path = $file->store('pqrs_files', 'public');
    //                 $originalName = $file->getClientOriginalName();

    //                 $uploadedFilesData[] = [
    //                     'path' => $path,
    //                     'original_name' => $originalName,
    //                 ];
    //             }
    //         }

    //         // Generar el código único de la PQR
    //         $codigoPqr = $codigoService->generarCodigoPqr($validated['tipo_solicitud'], $validated['documento_numero']);

    //         // Preparar los datos para la creación de la PQR
    //         $dataToCreate = [
    //             'pqr_codigo' => $codigoPqr,
    //             'nombre' => $validated['nombre'],
    //             'apellido' => $validated['apellido'],
    //             'documento_tipo' => $validated['documento_tipo'],
    //             'documento_numero' => $validated['documento_numero'],
    //             'correo' => $validated['correo'],
    //             'telefono' => $validated['telefono'] ?? null, // Usa null si es nullable y no se envió
    //             'sede' => $validated['sede'],
    //             'servicio_prestado' => $validated['servicio_prestado'],
    //             'eps' => $validated['eps'],
    //             'regimen' => $validated['regimen'],
    //             'tipo_solicitud' => $validated['tipo_solicitud'],
    //             'fuente' => $validated['fuente'] ?? null, // Si 'fuente' es nullable y no se envió, será null
    //             'descripcion' => $validated['descripcion'],
    //             'archivo' => $uploadedFilesData, // Esto asume que 'archivo' en DB es JSON o TEXT para guardar el array
    //             'registra_otro' => $validated['registra_otro'] === 'si', // Guarda como boolean si la columna es boolean
    //             'registrador_nombre' => $validated['registrador_nombre'] ?? null,
    //             'registrador_apellido' => $validated['registrador_apellido'] ?? null,
    //             'registrador_documento_tipo' => $validated['registrador_documento_tipo'] ?? null,
    //             'registrador_documento_numero' => $validated['registrador_documento_numero'] ?? null,
    //             'registrador_correo' => $validated['registrador_correo'] ?? null,
    //             'registrador_telefono' => $validated['registrador_telefono'] ?? null,
    //             'parentesco' => $validated['parentesco'] ?? null,
    //             'fecha_inicio_real' => $validated['fecha_inicio_real'] ?? null,
    //         ];

    //         // Crear la PQR
    //         $pqr = Pqr::create($dataToCreate);

    //         // Enviar correo al paciente
    //         Mail::to($pqr->correo)->send(new \App\Mail\PqrRegistrada($pqr));

    //         // Enviar al registrador SOLO si existe correo
    //         if (!empty($pqr->registrador_correo)) {
    //             Mail::to($pqr->registrador_correo)->send(new \App\Mail\PqrRegistrada($pqr));
    //         }


    //         // Agregar URL del archivo para respuesta (si es necesario en la respuesta JSON)
    //         $pqr->archivo_urls = collect($pqr->archivo)->map(function ($fileItem) {
    //             // Asegúrate de que $fileItem sea un objeto o array asociativo
    //             $path = is_array($fileItem) ? $fileItem['path'] : $fileItem->path;
    //             return asset('storage/' . $path);
    //         })->all();

    //         return response()->json([
    //             'message' => 'PQR creada con éxito',
    //             'pqr' => $pqr,
    //         ], 201);
    //     } catch (\Illuminate\Validation\ValidationException $e) {
    //         Log::error('Error de validación de PQR:', $e->errors());
    //         return response()->json([
    //             'message' => 'Los datos proporcionados no son válidos.',
    //             'errors' => $e->errors()
    //         ], 422);
    //     } catch (\Exception $e) {
    //         Log::error('Error al crear PQR:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
    //         return response()->json([
    //             'message' => 'Error interno del servidor al crear la PQR.',
    //             'error' => $e->getMessage(),
    //         ], 500);
    //     }
    // }






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
                $request->filled('tipo_solicitud') ||
                $request->filled('sede') ||
                $request->filled('eps') ||
                $request->filled('fecha_inicio') ||
                $request->filled('fecha_fin')
            ) {
                $query->where(function ($q) use ($request) {
                    if ($request->filled('pqr_codigo')) {
                        $q->orWhere('pqr_codigo', 'like', '%' . $request->pqr_codigo . '%');
                    }

                    if ($request->filled('documento_numero')) {
                        $q->orWhere('documento_numero', 'like', '%' . $request->documento_numero . '%');
                    }

                    if ($request->has('servicio_prestado')) {
                        $servicios = $request->input('servicio_prestado');
                        if (is_array($servicios)) {
                            $q->orWhereIn('servicio_prestado', $servicios);
                        } else {
                            $q->orWhere('servicio_prestado', 'like', '%' . $servicios . '%');
                        }
                    }

                    if ($request->has('tipo_solicitud')) {
                        $tipos = $request->input('tipo_solicitud');
                        if (is_array($tipos)) {
                            $q->orWhereIn('tipo_solicitud', $tipos);
                        } else {
                            $q->orWhere('tipo_solicitud', 'like', '%' . $tipos . '%');
                        }
                    }

                    if ($request->filled('sede')) {
                        $q->orWhereIn('sede', (array) $request->sede);
                    }

                    if ($request->has('eps')) {
                        $epsOptions = $request->input('eps');
                        if (is_array($epsOptions)) {
                            $q->orWhereIn('eps', $epsOptions);
                        } else {
                            $q->orWhere('eps', 'like', '%' . $epsOptions . '%');
                        }
                    }

                    if ($request->filled('fecha_inicio') || $request->filled('fecha_fin')) {
                        $q->orWhere(function ($qDate) use ($request) {
                            if ($request->filled('fecha_inicio')) {
                                $qDate->whereDate('created_at', '>=', $request->fecha_inicio);
                            }
                            if ($request->filled('fecha_fin')) {
                                $qDate->whereDate('created_at', '<=', $request->fecha_fin);
                            }
                        });
                    }
                });
            }

            // Ordenar por fecha más reciente
            $pqrs = $query->orderBy('created_at', 'desc')
                ->with([
                    'asignados:id,name',
                    'respuestas:id,pqrs_id,user_id,es_respuesta_usuario' // carga sólo los campos necesarios
                ])
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

    //  public function index(Request $request)
    // {
    //     try {
    //         $user = JWTAuth::parseToken()->authenticate();

    //         $query = Pqr::query();

    //         // Si quieres aplicar el filtro por usuario Digitador, descomenta y ajusta
    //         // if ($user->hasRole('Digitador')) {
    //         //     $query->where(function ($digitadorFilter) use ($user) {
    //         //         $digitadorFilter
    //         //             ->where(function ($matchAsSolicitante) use ($user) {
    //         //                 $matchAsSolicitante
    //         //                     ->where('documento_tipo', $user->documento_tipo)
    //         //                     ->where('documento_numero', $user->documento_numero);
    //         //             })
    //         //             ->orWhere(function ($matchAsRegistrador) use ($user) {
    //         //                 $matchAsRegistrador
    //         //                     ->where('registrador_documento_tipo', $user->documento_tipo)
    //         //                     ->where('registrador_documento_numero', $user->documento_numero);
    //         //             });
    //         //     });
    //         // }

    //         // Filtros con OR
    //         if (
    //             $request->filled('pqr_codigo') ||
    //             $request->filled('documento_numero') ||
    //             $request->filled('servicio_prestado') ||
    //             $request->filled('tipo_solicitud') ||
    //             $request->filled('sede') ||
    //             $request->filled('eps') ||
    //             $request->filled('fecha_inicio') ||
    //             $request->filled('fecha_fin')
    //         ) {
    //             $query->where(function ($q) use ($request) {
    //                 if ($request->filled('pqr_codigo')) {
    //                     $q->orWhere('pqr_codigo', 'like', '%' . $request->pqr_codigo . '%');
    //                 }

    //                 if ($request->filled('documento_numero')) {
    //                     $q->orWhere('documento_numero', 'like', '%' . $request->documento_numero . '%');
    //                 }

    //                 if ($request->has('servicio_prestado')) {
    //                     $servicios = $request->input('servicio_prestado');
    //                     if (is_array($servicios)) {
    //                         $q->orWhereIn('servicio_prestado', $servicios);
    //                     } else {
    //                         $q->orWhere('servicio_prestado', 'like', '%' . $servicios . '%');
    //                     }
    //                 }

    //                 if ($request->has('tipo_solicitud')) {
    //                     $tipos = $request->input('tipo_solicitud');
    //                     if (is_array($tipos)) {
    //                         $q->orWhereIn('tipo_solicitud', $tipos);
    //                     } else {
    //                         $q->orWhere('tipo_solicitud', 'like', '%' . $tipos . '%');
    //                     }
    //                 }

    //                 if ($request->filled('sede')) {
    //                     $q->orWhereIn('sede', (array) $request->sede);
    //                 }

    //                 if ($request->has('eps')) {
    //                     $epsOptions = $request->input('eps');
    //                     if (is_array($epsOptions)) {
    //                         $q->orWhereIn('eps', $epsOptions);
    //                     } else {
    //                         $q->orWhere('eps', 'like', '%' . $epsOptions . '%');
    //                     }
    //                 }

    //                 if ($request->filled('fecha_inicio') || $request->filled('fecha_fin')) {
    //                     $q->orWhere(function ($qDate) use ($request) {
    //                         if ($request->filled('fecha_inicio')) {
    //                             $qDate->whereDate('created_at', '>=', $request->fecha_inicio);
    //                         }
    //                         if ($request->filled('fecha_fin')) {
    //                             $qDate->whereDate('created_at', '<=', $request->fecha_fin);
    //                         }
    //                     });
    //                 }
    //             });
    //         }

    //         // Ordenar por fecha más reciente
    //         $pqrs = $query->orderBy('created_at', 'desc')
    //             ->with([
    //                 'asignados:id,name',
    //                 'respuestas:id,pqrs_id,user_id,es_respuesta_usuario' // carga sólo los campos necesarios
    //             ])
    //             ->paginate(15);


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

    public function show($pqr_codigo)
    {
        try {
            // No es estrictamente necesario autenticar al usuario aquí si solo vas a mostrar la PQR,
            // pero si tu lógica de negocio lo requiere, déjalo.
            // $user = JWTAuth::parseToken()->authenticate();

            $pqr = Pqr::where('pqr_codigo', $pqr_codigo)
                ->with([
                    'asignados',
                    'respuestas.autor',
                    'clasificaciones'
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

    // public function show($pqr_codigo)
    // {
    //     try {
    //         // No es estrictamente necesario autenticar al usuario aquí si solo vas a mostrar la PQR,
    //         // pero si tu lógica de negocio lo requiere, déjalo.
    //         // $user = JWTAuth::parseToken()->authenticate();

    //         $pqr = Pqr::where('pqr_codigo', $pqr_codigo)
    //             ->with([
    //                 'asignado',
    //                 'respuestas.autor',
    //                 'clasificaciones'
    //             ])
    //             ->firstOrFail();

    //         // Calcular tiempo_respondido usando Carbon
    //         $tiempoRespondido = null;
    //         if ($pqr->respondido_en) {
    //             $createdAt = Carbon::parse($pqr->created_at);
    //             $respondidoEn = Carbon::parse($pqr->respondido_en);

    //             $diffInMinutes = $createdAt->diffInMinutes($respondidoEn);
    //             $diffInHours = intdiv($diffInMinutes, 60);

    //             $tiempoRespondido = $diffInHours . ' horas';
    //         }

    //         // Adjuntar al objeto pqr (como atributo dinámico)
    //         $pqr->tiempo_respondido = $tiempoRespondido;

    //         // Retorna la PQR ya con todas las relaciones cargadas
    //         return response()->json(['pqr' => $pqr]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'error' => 'Error al obtener la PQR: ' . $e->getMessage()
    //         ], 500);
    //     }
    // }


    // public function update(Request $request, $pqr_codigo, PqrTiempoService $tiempoService)
    // {
    //     try {
    //         $pqr = Pqr::where('pqr_codigo', $pqr_codigo)->firstOrFail();

    //         // Primero tomamos todos los campos comunes, incluida fecha_inicio_real
    //         $data = $request->only([
    //             'nombre',
    //             'apellido',
    //             'documento_tipo',
    //             'documento_numero',
    //             'correo',
    //             'telefono',
    //             'sede',
    //             'servicio_prestado',
    //             'eps',
    //             'tipo_solicitud',
    //             'descripcion',
    //             'archivo',
    //             'fecha_inicio_real',
    //         ]);

    //         if ($request->user()->hasRole(['Administrador', 'Supervisor'])) {
    //             $request->validate([
    //                 'atributo_calidad' => 'nullable|in:Accesibilidad,Continuidad,Oportunidad,Pertinencia,Satisfacción del usuario,Seguridad',
    //                 'clasificaciones' => 'nullable|array',
    //                 'clasificaciones.*' => 'exists:clasificacions,id',
    //                 'fuente'           => 'nullable|in:Formulario de la web,Correo atención al usuario,Correo de Agendamiento NAC,Encuesta de satisfacción IPS,Callcenter,Presencial',
    //                 'asignado_a'       => 'nullable|exists:users,id',
    //                 'prioridad'        => 'required|in:Vital,Priorizado,Simple,Solicitud',
    //             ]);

    //             $data['atributo_calidad'] = $request->atributo_calidad;
    //             $data['fuente'] = $request->fuente;
    //             $data['asignado_a'] = $request->asignado_a;
    //         }
    //         // 👉 1️⃣ Guardar cambios generales primero, incluida fecha_inicio_real
    //         $asignadoAntes = $pqr->asignado_a;
    //         $pqr->update($data);

    //         // 👉 2️⃣ Refrescar el modelo para asegurar datos actualizados
    //         $pqr->refresh();

    //         // 👉 Cambiar estado_respuesta si se asignó por primera vez
    //         if (!$asignadoAntes && $pqr->asignado_a) {
    //             $pqr->estado_respuesta = 'Asignado';
    //             $pqr->save();
    //         }
    //         // ASIGNAR LA CLASIFICACION DE LAS PQRS
    //         if ($request->has('clasificaciones')) {
    //             $pqr->clasificaciones()->sync($request->clasificaciones);
    //         }


    //         if ($request->user()->hasRole(['Administrador', 'Supervisor']) && $request->filled('prioridad')) {
    //             $prioridad = $request->prioridad;

    //             $ciudadanoHoras = match ($prioridad) {
    //                 'Vital'      => 24,
    //                 'Priorizado' => 48,
    //                 'Simple'     => 72,
    //                 'Solicitud'  => 48,
    //             };

    //             $internoHoras = match ($prioridad) {
    //                 'Vital'      => 6,
    //                 default      => 24,
    //             };

    //             $pqr->prioridad = $prioridad;

    //             // 👉 3️⃣ Definir fecha base para deadlines (ahora sí con fecha_inicio_real actualizada)
    //             $fechaBase = $pqr->fecha_inicio_real
    //                 ? Carbon::parse($pqr->fecha_inicio_real)
    //                 : Carbon::parse($pqr->created_at);

    //             // 👉 4️⃣ Calcular deadlines
    //             $pqr->deadline_ciudadano = $fechaBase->copy()->addHours($ciudadanoHoras);
    //             $pqr->deadline_interno = $fechaBase->copy()->addHours($internoHoras);

    //             $pqr->save();
    //         }

    //         // 👉 5️⃣ Calcular y guardar estado de tiempo
    //         $estadoTiempo = $tiempoService->calcularEstadoTiempo($pqr);
    //         $pqr->estado_tiempo = $estadoTiempo['estado'];
    //         $pqr->save();

    //         // 👉 6️⃣ Enviar correo al asignado si hay uno nuevo
    //         if ($request->filled('asignado_a')) {
    //             $asignado = \App\Models\User::find($request->asignado_a);
    //             if ($asignado && $asignado->email) {
    //                 Mail::to($asignado->email)->send(new PqrAsignada($pqr));
    //             }
    //         }

    //         return response()->json(['message' => 'PQR actualizada correctamente.', 'data' => $pqr]);
    //     } catch (\Exception $e) {
    //         return response()->json(['message' => 'Error al actualizar', 'error' => $e->getMessage()], 500);
    //     }
    // }

    public function update(Request $request, $pqr_codigo, PqrTiempoService $tiempoService)
    {
        try {
            $pqr = Pqr::where('pqr_codigo', $pqr_codigo)->firstOrFail();

            // Primero tomamos todos los campos comunes, incluida fecha_inicio_real
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
                'fecha_inicio_real',
            ]);

            if ($request->user()->hasRole(['Administrador', 'Supervisor'])) {
                $request->validate([
                    'atributo_calidad' => 'nullable|in:Accesibilidad,Continuidad,Oportunidad,Pertinencia,Satisfacción del usuario,Seguridad',
                    'clasificaciones' => 'nullable|array',
                    'clasificaciones.*' => 'exists:clasificaciones,id',
                    'fuente'           => 'nullable|in:Formulario de la web,Correo atención al usuario,Correo de Agendamiento NAC,Encuesta de satisfacción IPS,Callcenter,Presencial',
                    'asignados'        => 'nullable|array',
                    'asignados.*'      => 'exists:users,id',
                    'prioridad'        => 'required|in:Vital,Priorizado,Simple,Solicitud',
                ]);

                $data['atributo_calidad'] = $request->atributo_calidad;
                $data['fuente'] = $request->fuente;
            }
            // 👉 1️⃣ Guardar cambios generales primero, incluida fecha_inicio_real
            $asignadoAntes = $pqr->asignado_a;
            $pqr->update($data);

            $asignadosAntes = $pqr->asignados->pluck('id')->toArray();
            $nuevosAsignados = $request->input('asignados', []);
            $pqr->asignados()->sync($nuevosAsignados);

            // 👉 3️⃣ Cambiar estado si se asignó por primera vez
            if (empty($asignadosAntes) && !empty($nuevosAsignados)) {
                $pqr->estado_respuesta = 'Asignado';
                $pqr->save();
            }

            // 👉 4️⃣ Enviar correos a los nuevos asignados (opcional)
            $usuariosAsignados = \App\Models\User::whereIn('id', $nuevosAsignados)->get();
            foreach ($usuariosAsignados as $usuario) {
                if ($usuario->email) {
                    Mail::to($usuario->email)->send(new PqrAsignada($pqr, $usuario));
                }
            }
            // ASIGNAR LA CLASIFICACION DE LAS PQRS
            if ($request->has('clasificaciones')) {
                $pqr->clasificaciones()->sync($request->clasificaciones);
            }


            if ($request->user()->hasRole(['Administrador', 'Supervisor']) && $request->filled('prioridad')) {
                $prioridad = $request->prioridad;

                $ciudadanoHoras = match ($prioridad) {
                    'Vital'      => 24,
                    'Priorizado' => 48,
                    'Simple'     => 72,
                    'Solicitud'  => 48,
                };

                $internoHoras = match ($prioridad) {
                    'Vital'      => 6,
                    default      => 24,
                };

                $pqr->prioridad = $prioridad;

                // 👉 3️⃣ Definir fecha base para deadlines (ahora sí con fecha_inicio_real actualizada)
                $fechaBase = $pqr->fecha_inicio_real
                    ? Carbon::parse($pqr->fecha_inicio_real)
                    : Carbon::parse($pqr->created_at);

                // 👉 4️⃣ Calcular deadlines
                $pqr->deadline_ciudadano = $fechaBase->copy()->addHours($ciudadanoHoras);
                $pqr->deadline_interno = $fechaBase->copy()->addHours($internoHoras);

                $pqr->save();
            }

            // 👉 5️⃣ Calcular y guardar estado de tiempo
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

            $pqrs = $user->pqrsAsignadas()
                ->with([
                    'asignados:id,name',
                    'respuestas:id,pqrs_id,user_id'
                ])
                ->get();

            return response()->json(['pqrs' => $pqrs]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener la PQR: ' . $e->getMessage()
            ], 500);
        }
    }


    // public function asignadas()
    // {
    //     try {
    //         $user = JWTAuth::parseToken()->authenticate();

    //         $pqrs = $user->pqrsAsignadas()->with('asignados:id,name')->get();

    //         return response()->json(['pqrs' => $pqrs]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'error' => 'Error al obtener la PQR: ' . $e->getMessage()
    //         ], 500);
    //     }
    // }




    public function consultarRadicado(Request $request)
    {
        $request->validate([
            'pqr_codigo' => 'required|string'
        ]);

        $codigo = trim($request->input('pqr_codigo'));
        Log::info('Código recibido en API:', ['codigo' => $codigo]);

        $pqr = Pqr::where('pqr_codigo', $codigo)->first();


        if (!$pqr) {
            Log::warning('PQR no encontrada:', ['codigo' => $codigo]);
            return response()->json(['error' => 'PQR no encontrada'], 404);
        }

        try {
            Mail::to($pqr->correo)->send(new ConsultaRadicadoInfo($pqr));
            return response()->json([
                'message' => 'Correo enviado con la información del radicado',
                'correo' => $pqr->correo
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error al enviar correo:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Error al enviar el correo: ' . $e->getMessage()], 500);
        }
    }

    public function registrarSeguimiento(Request $request, $pqr_codigo)
    {
        $request->validate([
            'descripcion' => 'required|string|max:2000',
            'tipo_seguimiento' => 'required|string|max:255', // Nuevo campo
        ]);

        $pqr = Pqr::where('pqr_codigo', $pqr_codigo)->firstOrFail();

        $seguimiento = $pqr->seguimientos()->create([
            'user_id'          => $request->user()->id,
            'descripcion'      => $request->descripcion,
            'tipo_seguimiento' => $request->tipo_seguimiento,
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

    public function filtros_estado_respuesta(Request $request)
    {
        try {
            // dd($request->all()); // Para depuración

            $user = JWTAuth::parseToken()->authenticate();

            $query = Pqr::query();


            if ($request->filled('estado_respuesta')) {
                $query->where('estado_respuesta', $request->estado_respuesta);
            }


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
                'error' => 'Error al obtener las PQRS por estado: ' . $e->getMessage()
            ], 500);
        }
    }
}
