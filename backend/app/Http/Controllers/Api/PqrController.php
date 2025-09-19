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
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\DB;


class PqrController extends Controller
{

    public function store(Request $request, CodigoPqrService $codigoService)
    {
        try {
            $registra_otro = $request->input('registra_otro') === 'si';
            $tipo_solicitud = $request->input('tipo_solicitud');

            // Reglas de validación base
            $rules = [
                'nombre' => 'required|string|max:100',
                'segundo_nombre' => 'nullable|string|max:100',
                'apellido' => 'required|string|max:100',
                'segundo_apellido' => 'nullable|string|max:100',
                'documento_tipo' => 'required|string',
                'documento_numero' => [
                    'required',
                    'string',
                    function ($attribute, $value, $fail) use ($request) {
                        $tipo = strtoupper(trim($request->documento_tipo));

                        if (in_array($tipo, ['PA', 'PT', 'CE'])) {
                            // Solo letras y números
                            if (!preg_match('/^[A-Za-z0-9]+$/', $value)) {
                                $fail('El número de documento solo puede contener letras y números.');
                            }
                        } else {
                            // Solo números
                            if (!preg_match('/^[0-9]+$/', $value)) {
                                $fail('El número de documento solo puede contener solo números.');
                            }
                        }

                        if (strlen($value) < 5 || strlen($value) > 15) {
                            $fail('El número de documento debe tener entre 5 y 15 caracteres.');
                        }
                    }
                ],
                'correo' => 'required|email',
                'correo_confirmacion' => 'required|email|same:correo',
                'telefono' => 'nullable|string',
                'sede' => 'required|string',
                'servicio_prestado' => 'required|string',
                'eps' => 'required|string',
                'regimen' => 'required|string',
                'tipo_solicitud' => 'required|string',
                'radicado_juzgado' => 'required_if:tipo_solicitud,Tutela|string|max:255',
                'descripcion' => 'required|string',
                'archivos' => 'nullable|array',
                'archivos.*' => 'file|max:8000',
                'archivos_adicionales' => 'nullable|array',
                'archivos_adicionales.*' => 'file|max:8000',
                'registra_otro' => 'required|in:si,no',
                'politica_aceptada' => 'required',

                // INICIALIZA estos campos como NULLABLE por defecto
                'fecha_inicio_real' => 'nullable|date_format:Y-m-d H:i',
                'fuente' => 'nullable|string|max:100',

                // ✅ Validación para clasificaciones
                'clasificaciones' => 'nullable|array',
                'clasificaciones.*' => 'exists:clasificaciones,id',
            ];

            // Reglas condicionales para el registrador
            if ($registra_otro) {
                $parentesco = $request->input('parentesco');

                $rules = array_merge($rules, [
                    'registrador_nombre' => 'required|string|max:100',
                    'registrador_segundo_nombre' => 'nullable|string|max:100',
                    'registrador_apellido' => 'required|string|max:100',
                    'registrador_segundo_apellido' => 'nullable|string|max:100',
                    'registrador_correo' => [
                        'required',
                        function ($attribute, $value, $fail) {
                            $correos = array_map('trim', explode(',', $value));
                            foreach ($correos as $correo) {
                                if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
                                    $fail("Uno o más correos en $attribute no son válidos.");
                                }
                            }
                        },
                    ],
                    'registrador_telefono' => 'nullable|string',
                    'parentesco' => 'required|string|max:50',
                ]);

                if ($parentesco === 'Ente de control' || $parentesco === 'Asegurador') {
                    $rules['registrador_cargo'] = 'required|string|max:100';
                    $rules['registrador_documento_tipo'] = 'nullable|string';
                    $rules['registrador_documento_numero'] = 'nullable|string';
                    $rules['nombre_entidad'] = 'required|string|max:100';
                } else {
                    $rules['registrador_documento_tipo'] = 'required|string';
                    $rules['registrador_documento_numero'] = 'required|string';
                    $rules['registrador_cargo'] = 'nullable|string|max:100';
                }
            }

            // Regla condicional para 'clasificacion_tutela'
            if ($tipo_solicitud === 'Tutela') {
                $rules['clasificacion_tutela'] = 'required|string';
            } else {
                $rules['clasificacion_tutela'] = 'nullable';
            }

            if ($tipo_solicitud === 'Tutela') {
                $rules['accionado'] = 'required|array|min:1';
                $rules['accionado.*'] = 'in:Asegurador,Passus';
            } else {
                $rules['accionado'] = 'nullable|array';
                $rules['accionado.*'] = 'in:Asegurador,Passus';
            }

            // Lógica condicional para 'fecha_inicio_real' y 'fuente'
            $isLoggedInBackend = Auth::check();
            if ($isLoggedInBackend) {
                $rules['fecha_inicio_real'] = 'required|date_format:Y-m-d H:i';
                $rules['fuente'] = 'required|string|in:Formulario de la web,Correo atención al usuario,Correo de Agendamiento NAC,Encuesta de satisfacción IPS,Callcenter,Presencial';
            }

            $validated = $request->validate($rules);

            // Guardar archivos
            $uploadedFilesData = [];
            if ($request->hasFile('archivos')) {
                foreach ($request->file('archivos') as $file) {
                    $path = $file->store('pqrs_files', 'public');
                    $uploadedFilesData[] = [
                        'path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'url' => asset("storage/{$path}"),
                    ];
                }
            }

            // ✨ NUEVO: Guardar archivos adicionales
            if ($request->hasFile('archivos_adicionales')) {
                foreach ($request->file('archivos_adicionales') as $file) {
                    $path = $file->store('pqrs_files', 'public');
                    $uploadedFilesData[] = [
                        'path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'url' => asset("storage/{$path}"),
                    ];
                }
            }

            // Generar código PQR
            $codigoPqr = $codigoService->generarCodigoPqr($validated['tipo_solicitud'], $validated['documento_numero']);

            // Datos de creación
            $dataToCreate = [
                'pqr_codigo' => $codigoPqr,
                'nombre' => $validated['nombre'],
                'segundo_nombre' => $validated['segundo_nombre'] ?? null,
                'apellido' => $validated['apellido'],
                'segundo_apellido' => $validated['segundo_apellido'] ?? null,
                'documento_tipo' => $validated['documento_tipo'],
                'documento_numero' => $validated['documento_numero'],
                'correo' => $validated['correo'],
                'telefono' => $validated['telefono'] ?? null,
                'sede' => $validated['sede'],
                'servicio_prestado' => $validated['servicio_prestado'],
                'eps' => $validated['eps'],
                'regimen' => $validated['regimen'],
                'tipo_solicitud' => $validated['tipo_solicitud'],
                'radicado_juzgado' => $validated['radicado_juzgado'] ?? null,
                'clasificacion_tutela' => $validated['clasificacion_tutela'] ?? null,
                'accionado' => $request->input('accionado', []),
                'fuente' => $validated['fuente'] ?? null,
                'descripcion' => $validated['descripcion'],
                'archivo' => $uploadedFilesData,
                'registra_otro' => $validated['registra_otro'] === 'si',
                'registrador_nombre' => $validated['registrador_nombre'] ?? null,
                'registrador_segundo_nombre' => $validated['registrador_segundo_nombre'] ?? null,
                'registrador_apellido' => $validated['registrador_apellido'] ?? null,
                'registrador_segundo_apellido' => $validated['registrador_segundo_apellido'] ?? null,
                'registrador_documento_tipo' =>
                in_array(($validated['parentesco'] ?? null), ['Ente de control', 'Asegurador'])
                    ? null
                    : ($validated['registrador_documento_tipo'] ?? null),
                'registrador_documento_numero' =>
                in_array(($validated['parentesco'] ?? null), ['Ente de control', 'Asegurador'])
                    ? null
                    : ($validated['registrador_documento_numero'] ?? null),
                'registrador_correo' => $validated['registrador_correo'] ?? null,
                'registrador_telefono' => $validated['registrador_telefono'] ?? null,
                'registrador_cargo' => $validated['registrador_cargo'] ?? null,
                'parentesco' => $validated['parentesco'] ?? null,
                'fecha_inicio_real' => $validated['fecha_inicio_real'] ?? null,
                'nombre_entidad' =>
                in_array(($validated['parentesco'] ?? null), ['Ente de control', 'Asegurador'])
                    ? ($validated['nombre_entidad'] ?? null)
                    : null,
            ];

            // Crear la PQR
            $pqr = Pqr::create($dataToCreate);

            // ✅ Guardar clasificaciones en la tabla pivot
            if ($request->has('clasificaciones') && is_array($request->clasificaciones)) {
                $pqr->clasificaciones()->sync($request->clasificaciones);
            }

            // Enviar correos a paciente y registrador
            // Mail::to($pqr->correo)->send(new \App\Mail\PqrRegistrada($pqr));
            // if (!empty($pqr->registrador_correo)) {
            //     Mail::to($pqr->registrador_correo)->send(new \App\Mail\PqrRegistrada($pqr));
            // }



            // if (!empty($pqr->registrador_correo)) {
            //     Mail::to($pqr->registrador_correo)->send(new \App\Mail\PqrRegistrada($pqr));
            // } else {
            //     Mail::to($pqr->correo)->send(new \App\Mail\PqrRegistrada($pqr));
            // }


            // Comprueba si el parentesco de la PQR es "Asegurador" o "Ente de control"
            if ($pqr->tipo_solicitud !== 'Tutela') {
                if ($pqr->parentesco === 'Asegurador' || $pqr->parentesco === 'Ente de control') {
                    // Si la condición es verdadera, solo se envía el correo al registrador (si existe)
                    if (!empty($pqr->registrador_correo)) {
                        Mail::to($pqr->registrador_correo)->send(new \App\Mail\PqrRegistrada($pqr));
                    }
                } else {
                    // Si la condición es falsa, el correo se envía tanto al paciente como al registrador (si existe)
                    Mail::to($pqr->correo)->send(new \App\Mail\PqrRegistrada($pqr));

                    if (!empty($pqr->registrador_correo)) {
                        Mail::to($pqr->registrador_correo)->send(new \App\Mail\PqrRegistrada($pqr));
                    }
                }
            }

            // if ($pqr->parentesco === 'Asegurador' || $pqr->parentesco === 'Ente de control') {
            //     // Si la condición es verdadera, solo se envía el correo al registrador (si existe)
            //     if (!empty($pqr->registrador_correo)) {
            //         Mail::to($pqr->registrador_correo)->send(new \App\Mail\PqrRegistrada($pqr));
            //     }
            // } else {
            //     // Si la condición es falsa, el correo se envía tanto al paciente como al registrador (si existe)
            //     Mail::to($pqr->correo)->send(new \App\Mail\PqrRegistrada($pqr));

            //     if (!empty($pqr->registrador_correo)) {
            //         Mail::to($pqr->registrador_correo)->send(new \App\Mail\PqrRegistrada($pqr));
            //     }
            // }



            // Agregar URLs de archivo
            $pqr->archivo_urls = collect($pqr->archivo)->map(function ($fileItem) {
                $path = is_array($fileItem) ? $fileItem['path'] : $fileItem->path;
                return asset('storage/' . $path);
            })->all();

            return response()->json([
                'message' => 'PQR creada con éxito',
                'pqr' => $pqr,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
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
    //         $tipo_solicitud = $request->input('tipo_solicitud');

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
    //             $parentesco = $request->input('parentesco');

    //             $rules = array_merge($rules, [
    //                 'registrador_nombre' => 'required|string|max:100',
    //                 'registrador_segundo_nombre' => 'nullable|string|max:100',
    //                 'registrador_apellido' => 'required|string|max:100',
    //                 'registrador_segundo_apellido' => 'nullable|string|max:100',
    //                 'registrador_correo' => 'required|email',
    //                 'registrador_telefono' => 'nullable|string',
    //                 'parentesco' => 'required|string|max:50',
    //             ]);

    //             if ($parentesco === 'Ente de control' || $parentesco === 'Entidad') {
    //                 // ✅ Solo pedimos cargo
    //                 $rules['registrador_cargo'] = 'required|string|max:100';
    //                 $rules['registrador_documento_tipo'] = 'nullable|string';
    //                 $rules['registrador_documento_numero'] = 'nullable|string';
    //                 $rules['nombre_entidad'] = 'required|string|max:100';
    //             } else {
    //                 // ✅ Solo pedimos documentos
    //                 $rules['registrador_documento_tipo'] = 'required|string';
    //                 $rules['registrador_documento_numero'] = 'required|string';
    //                 $rules['registrador_cargo'] = 'nullable|string|max:100';
    //             }
    //         }

    //         // Regla condicional para 'clasificacion_tutela'
    //         if ($tipo_solicitud === 'Tutela') {
    //             $rules['clasificacion_tutela'] = 'required|string';
    //         } else {
    //             $rules['clasificacion_tutela'] = 'nullable';
    //         }

    //         if ($tipo_solicitud === 'Tutela') {
    //             $rules['accionado'] = 'required|array|min:1';
    //             $rules['accionado.*'] = 'in:Asegurador,Passus';
    //         } else {
    //             $rules['accionado'] = 'nullable|array';
    //             $rules['accionado.*'] = 'in:Asegurador,Passus';
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
    //             $rules['fuente'] = 'required|string|in:Formulario de la web,Correo atención al usuario,Correo de Agendamiento NAC,Encuesta de satisfacción IPS,Callcenter,Presencial';
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
    //             'telefono' => $validated['telefono'] ?? null,
    //             'sede' => $validated['sede'],
    //             'servicio_prestado' => $validated['servicio_prestado'],
    //             'eps' => $validated['eps'],
    //             'regimen' => $validated['regimen'],
    //             'tipo_solicitud' => $validated['tipo_solicitud'],
    //             'clasificacion_tutela' => $validated['clasificacion_tutela'] ?? null,
    //             'accionado' => $request->input('accionado', []),
    //             'fuente' => $validated['fuente'] ?? null,
    //             'descripcion' => $validated['descripcion'],
    //             'archivo' => $uploadedFilesData,
    //             'registra_otro' => $validated['registra_otro'] === 'si',
    //             'registrador_nombre' => $validated['registrador_nombre'] ?? null,
    //             'registrador_apellido' => $validated['registrador_apellido'] ?? null,
    //             'registrador_documento_tipo' =>
    //             in_array(($validated['parentesco'] ?? null), ['Ente de control', 'Entidad'])
    //                 ? null
    //                 : ($validated['registrador_documento_tipo'] ?? null),

    //             'registrador_documento_numero' =>
    //             in_array(($validated['parentesco'] ?? null), ['Ente de control', 'Entidad'])
    //                 ? null
    //                 : ($validated['registrador_documento_numero'] ?? null),

    //             'registrador_correo' => $validated['registrador_correo'] ?? null,
    //             'registrador_telefono' => $validated['registrador_telefono'] ?? null,
    //             'registrador_cargo' => $validated['registrador_cargo'] ?? null,
    //             'parentesco' => $validated['parentesco'] ?? null,
    //             'fecha_inicio_real' => $validated['fecha_inicio_real'] ?? null,
    //             'nombre_entidad' =>
    //             in_array(($validated['parentesco'] ?? null), ['Ente de control', 'Entidad'])
    //                 ? ($validated['nombre_entidad'] ?? null)
    //                 : null,
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

            // Si el usuario es Digitador, solo puede ver PQRs con tipo_solicitud = 'Solicitud'
            if ($user->hasRole('Digitador')) {
                $query->where('tipo_solicitud', 'Solicitud');
            }
            if ($user->hasRole('Gestor')) {
                // Obtener las sedes asociadas al gestor
                $sedesGestor = $user->sedes->pluck('name')->toArray();

                // Filtrar solo las PQRs cuya sede esté en las del gestor
                $query->whereIn('sede', $sedesGestor);
            }

            if ($user->hasRole('Gestor Administrativo')) {
                $clasificacionesPermitidas = [
                    'Orden y aseo',
                    'Infraestructura',
                    'Solicitudes de Tesoreria'
                ];

                $query->whereHas('clasificaciones', function ($q) use ($clasificacionesPermitidas) {
                    $q->whereIn('nombre', $clasificacionesPermitidas);
                });
            }

            // Filtros con AND (no OR)
            if ($request->filled('pqr_codigo')) {
                $query->where('pqr_codigo', 'like', '%' . $request->pqr_codigo . '%');
            }

            if ($request->filled('documento_numero')) {
                $query->where('documento_numero', 'like', '%' . $request->documento_numero . '%');
            }

            if ($request->has('servicio_prestado')) {
                $servicios = $request->input('servicio_prestado');
                if (is_array($servicios)) {
                    $query->whereIn('servicio_prestado', $servicios);
                } else {
                    $query->where('servicio_prestado', 'like', '%' . $servicios . '%');
                }
            }

            if ($request->has('tipo_solicitud')) {
                $tipos = $request->input('tipo_solicitud');
                if (is_array($tipos)) {
                    $query->whereIn('tipo_solicitud', $tipos);
                } else {
                    $query->where('tipo_solicitud', 'like', '%' . $tipos . '%');
                }
            }

            if ($request->filled('sede')) {
                $query->whereIn('sede', (array) $request->sede);
            }

            if ($request->has('eps')) {
                $epsOptions = $request->input('eps');
                if (is_array($epsOptions)) {
                    $query->whereIn('eps', $epsOptions);
                } else {
                    $query->where('eps', 'like', '%' . $epsOptions . '%');
                }
            }

            if ($request->filled('fecha_inicio') || $request->filled('fecha_fin')) {
                $query->where(function ($qDate) use ($request) {
                    if ($request->filled('fecha_inicio')) {
                        $qDate->whereDate('created_at', '>=', $request->fecha_inicio);
                    }
                    if ($request->filled('fecha_fin')) {
                        $qDate->whereDate('created_at', '<=', $request->fecha_fin);
                    }
                });
            }

            if ($request->has('respuesta_enviada')) {
                $respuestas = $request->input('respuesta_enviada');
                if (is_array($respuestas)) {
                    $query->whereIn('respuesta_enviada', $respuestas);
                } else {
                    $query->where('respuesta_enviada', $respuestas);
                }
            }

            if ($request->has('clasificaciones') && is_array($request->clasificaciones) && count($request->clasificaciones) > 0) {
                $ids = array_map('intval', $request->clasificaciones);
                $query->whereHas('clasificaciones', function ($q) use ($ids) {
                    $q->whereIn('clasificaciones.id', $ids);
                });
            }

            if ($request->has('asignados') && is_array($request->asignados) && count($request->asignados) > 0) {
                $ids = array_map('intval', $request->asignados);

                $query->whereHas('asignados', function ($q) use ($ids) {
                    $q->whereIn('users.id', $ids);
                });
            }


            // 🔹 Antes de paginar, obtenemos todas las PQRs que se van a mostrar y actualizamos estado_tiempo
            $pqrsSinRespuesta = (clone $query)
                ->where('respuesta_enviada', 0)
                ->get();

            $tiempoService = new PqrTiempoService();

            foreach ($pqrsSinRespuesta as $pqr) {
                $nuevoEstado = $tiempoService->calcularEstadoTiempo($pqr)['estado'];
                if ($pqr->estado_tiempo !== $nuevoEstado) {
                    $pqr->estado_tiempo = $nuevoEstado;
                    $pqr->save();
                }
            }

            // Ordenar por fecha más reciente
            $pqrs = $query->orderBy('respuesta_enviada', 'asc')
                ->orderBy('created_at', 'desc')
                ->with([
                    'asignados:id,name,segundo_nombre,primer_apellido,segundo_apellido',
                    'respuestas:id,pqrs_id,user_id,es_respuesta_usuario',
                    'clasificaciones:id,nombre'
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




    // public function index(Request $request)
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
            $pqr = Pqr::where('pqr_codigo', $pqr_codigo)
                ->with([
                    'asignados',
                    'respuestas.autor',
                    'clasificaciones',
                    'eventLogs'
                ])
                ->firstOrFail();

            // 🔹 Calcular y actualizar estado_tiempo
            if ($pqr->respuesta_enviada == 0) {
                $tiempoService = new PqrTiempoService();
                $resultado = $tiempoService->calcularEstadoTiempo($pqr);
                $nuevoEstado = $resultado['estado'];

                if ($pqr->estado_tiempo !== $nuevoEstado) {
                    $pqr->estado_tiempo = $nuevoEstado;
                    $pqr->save();
                }
            }

            // 🔹 Calcular tiempo_respondido
            $tiempoRespondido = null;
            if ($pqr->respondido_en) {
                $createdAt = Carbon::parse($pqr->created_at);
                $respondidoEn = Carbon::parse($pqr->respondido_en);

                $diffInMinutes = $createdAt->diffInMinutes($respondidoEn);
                $diffInHours = intdiv($diffInMinutes, 60);

                $tiempoRespondido = $diffInHours . ' horas';
            }
            $pqr->tiempo_respondido = $tiempoRespondido;

            // 🔹 Agregar URL pública a cada archivo si existe
            if (!empty($pqr->archivo) && is_array($pqr->archivo)) {
                $pqr->archivo = array_map(function ($file) {
                    return [
                        'path' => $file['path'] ?? null,
                        'original_name' => $file['original_name'] ?? null,
                        'url' => !empty($file['path'])
                            ? asset('storage/' . $file['path'])
                            : null
                    ];
                }, $pqr->archivo);
            }

            // 🔹 Renderizar plantilla del correo si es Felicitación
            $contenidoCorreo = null;
            if ($pqr->tipo_solicitud === 'Felicitacion') {
                $contenidoCorreo = View::make('emails.felicitacion', compact('pqr'))->render();
            }
            $pqr->contenido_correo = $contenidoCorreo;

            return response()->json([
                'pqr' => $pqr,
                'contenido_correo' => $contenidoCorreo
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener la PQR: ' . $e->getMessage()
            ], 500);
        }
    }

    // public function show($pqr_codigo)
    // {
    //     try {
    //         $pqr = Pqr::where('pqr_codigo', $pqr_codigo)
    //             ->with([
    //                 'asignados',
    //                 'respuestas.autor',
    //                 'clasificaciones',
    //                 'eventLogs'
    //             ])
    //             ->firstOrFail();

    //         // 🔹 Calcular y actualizar estado_tiempo
    //         if ($pqr->respuesta_enviada == 0) {
    //             $tiempoService = new PqrTiempoService();
    //             $resultado = $tiempoService->calcularEstadoTiempo($pqr);
    //             $nuevoEstado = $resultado['estado'];

    //             if ($pqr->estado_tiempo !== $nuevoEstado) {
    //                 $pqr->estado_tiempo = $nuevoEstado;
    //                 $pqr->save();
    //             }
    //         }

    //         // Calcular tiempo_respondido
    //         $tiempoRespondido = null;
    //         if ($pqr->respondido_en) {
    //             $createdAt = Carbon::parse($pqr->created_at);
    //             $respondidoEn = Carbon::parse($pqr->respondido_en);

    //             $diffInMinutes = $createdAt->diffInMinutes($respondidoEn);
    //             $diffInHours = intdiv($diffInMinutes, 60);

    //             $tiempoRespondido = $diffInHours . ' horas';
    //         }
    //         $pqr->tiempo_respondido = $tiempoRespondido;

    //         // 🔹 Agregar URL pública a cada archivo si existe el campo archivo
    //         if (!empty($pqr->archivo) && is_array($pqr->archivo)) {
    //             $pqr->archivo = array_map(function ($file) {
    //                 return [
    //                     'path' => $file['path'] ?? null,
    //                     'original_name' => $file['original_name'] ?? null,
    //                     'url' => !empty($file['path'])
    //                         ? asset('storage/' . $file['path'])
    //                         : null
    //                 ];
    //             }, $pqr->archivo);
    //         }

    //         return response()->json(['pqr' => $pqr]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'error' => 'Error al obtener la PQR: ' . $e->getMessage()
    //         ], 500);
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

            if ($request->user()->hasRole(['Administrador', 'Supervisor/Atencion al usuario'])) {
                $request->validate([
                    'atributo_calidad' => 'nullable|in:Accesibilidad,Continuidad,Oportunidad,Pertinencia,Seguridad,Efectividad,Integralidad',
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

            // 👉 2️⃣ Guardar cambios en asignados y registrar log si cambian
            $asignadosAntes = $pqr->asignados->pluck('id')->toArray();
            $nuevosAsignados = $request->input('asignados', []);
            $pqr->asignados()->sync($nuevosAsignados);

            // 🔹 Crear log si hubo cambios en los asignados
            if ($asignadosAntes != $nuevosAsignados) {
                $asignadoAnteriorNombres = \App\Models\User::whereIn('id', $asignadosAntes)->pluck('name')->toArray();
                $asignadoNuevoNombres = \App\Models\User::whereIn('id', $nuevosAsignados)->pluck('name')->toArray();

                $asignadoAnteriorStr = $asignadoAnteriorNombres ? implode(', ', $asignadoAnteriorNombres) : 'Sin asignación';
                $asignadoNuevoStr = $asignadoNuevoNombres ? implode(', ', $asignadoNuevoNombres) : 'Sin asignación';

                \App\Models\EventLog::create([
                    'event_type' => 'cambio_asignacion',
                    'description' => "La PQR #{$pqr->pqr_codigo} fue reasignada de [{$asignadoAnteriorStr}] a [{$asignadoNuevoStr}]",
                    'pqr_id' => $pqr->id,
                    'pqr_codigo' => $pqr->pqr_codigo,
                    'estado_anterior' => $asignadoAnteriorStr,
                    'estado_nuevo' => $asignadoNuevoStr,
                    'fecha_evento' => now(),
                    'user_id' => $request->user()->id,
                ]);
            }

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

            // 👉 5️⃣ Asignar la clasificación de las PQRs
            if ($request->has('clasificaciones')) {
                $pqr->clasificaciones()->sync($request->clasificaciones);
            }

            // 👉 6️⃣ Guardar prioridad y calcular deadlines si corresponde
            if ($request->user()->hasRole(['Administrador', 'Supervisor/Atencion al usuario']) && $request->filled('prioridad')) {
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

            // 👉 7️⃣ Calcular y guardar estado de tiempo
            $estadoTiempo = $tiempoService->calcularEstadoTiempo($pqr);
            $pqr->estado_tiempo = $estadoTiempo['estado'];
            $pqr->save();

            return response()->json(['message' => 'PQR actualizada correctamente.', 'data' => $pqr]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al actualizar', 'error' => $e->getMessage()], 500);
        }
    }


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

    //         if ($request->user()->hasRole(['Administrador', 'Supervisor/Atencion al usuario'])) {
    //             $request->validate([
    //                 'atributo_calidad' => 'nullable|in:Accesibilidad,Continuidad,Oportunidad,Pertinencia,Seguridad,Efectividad,Integralidad',
    //                 'clasificaciones' => 'nullable|array',
    //                 'clasificaciones.*' => 'exists:clasificaciones,id',
    //                 'fuente'           => 'nullable|in:Formulario de la web,Correo atención al usuario,Correo de Agendamiento NAC,Encuesta de satisfacción IPS,Callcenter,Presencial',
    //                 'asignados'        => 'nullable|array',
    //                 'asignados.*'      => 'exists:users,id',
    //                 'prioridad'        => 'required|in:Vital,Priorizado,Simple,Solicitud',
    //             ]);

    //             $data['atributo_calidad'] = $request->atributo_calidad;
    //             $data['fuente'] = $request->fuente;
    //         }

    //         // 👉 1️⃣ Guardar cambios generales primero, incluida fecha_inicio_real
    //         $asignadoAntes = $pqr->asignado_a;
    //         $pqr->update($data);

    //         // 👉 2️⃣ Guardar cambios en asignados y registrar log si cambian
    //         $asignadosAntes = $pqr->asignados->pluck('id')->toArray();
    //         $nuevosAsignados = $request->input('asignados', []);
    //         $pqr->asignados()->sync($nuevosAsignados);

    //         // 🔹 Crear log si hubo cambios en los asignados
    //         if ($asignadosAntes != $nuevosAsignados) {
    //             $asignadoAnteriorNombres = \App\Models\User::whereIn('id', $asignadosAntes)->pluck('name')->toArray();
    //             $asignadoNuevoNombres = \App\Models\User::whereIn('id', $nuevosAsignados)->pluck('name')->toArray();

    //             $asignadoAnteriorStr = $asignadoAnteriorNombres ? implode(', ', $asignadoAnteriorNombres) : 'Sin asignación';
    //             $asignadoNuevoStr = $asignadoNuevoNombres ? implode(', ', $asignadoNuevoNombres) : 'Sin asignación';

    //             \App\Models\EventLog::create([
    //                 'event_type' => 'cambio_asignacion',
    //                 'description' => "La PQR #{$pqr->pqr_codigo} fue reasignada de [{$asignadoAnteriorStr}] a [{$asignadoNuevoStr}]",
    //                 'pqr_id' => $pqr->id,
    //                 'pqr_codigo' => $pqr->pqr_codigo,
    //                 'estado_anterior' => $asignadoAnteriorStr,
    //                 'estado_nuevo' => $asignadoNuevoStr,
    //                 'fecha_evento' => now(),
    //                 'user_id' => $request->user()->id,
    //             ]);
    //         }

    //         // 👉 3️⃣ Cambiar estado si se asignó por primera vez
    //         if (empty($asignadosAntes) && !empty($nuevosAsignados)) {
    //             $pqr->estado_respuesta = 'Asignado';
    //             $pqr->save();
    //         }

    //         // 👉 4️⃣ Enviar correos a los nuevos asignados (opcional)
    //         $usuariosAsignados = \App\Models\User::whereIn('id', $nuevosAsignados)->get();
    //         foreach ($usuariosAsignados as $usuario) {
    //             if ($usuario->email) {
    //                 Mail::to($usuario->email)->send(new PqrAsignada($pqr, $usuario));
    //             }
    //         }

    //         // 👉 5️⃣ Asignar la clasificación de las PQRs
    //         if ($request->has('clasificaciones')) {
    //             $pqr->clasificaciones()->sync($request->clasificaciones);
    //         }

    //         // 👉 6️⃣ Guardar prioridad y calcular deadlines si corresponde
    //         if ($request->user()->hasRole(['Administrador', 'Supervisor/Atencion al usuario']) && $request->filled('prioridad')) {
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

    //         // 👉 7️⃣ Calcular y guardar estado de tiempo
    //         $estadoTiempo = $tiempoService->calcularEstadoTiempo($pqr);
    //         $pqr->estado_tiempo = $estadoTiempo['estado'];
    //         $pqr->save();

    //         return response()->json(['message' => 'PQR actualizada correctamente.', 'data' => $pqr]);
    //     } catch (\Exception $e) {
    //         return response()->json(['message' => 'Error al actualizar', 'error' => $e->getMessage()], 500);
    //     }
    // }

    public function reclasificar(Request $request, $id)
    {
        try {
            $request->validate([
                'tipo_solicitud' => 'required|string'
            ]);

            $pqr = Pqr::findOrFail($id);

            $pqr->tipo_solicitud = $request->tipo_solicitud;
            $pqr->save();

            return response()->json([
                'message' => 'PQR reclasificada correctamente',
                'pqr' => $pqr
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al reclasificar PQR',
                'message' => $e->getMessage()
            ], 500);
        }
    }





    public function asignadas()
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();

            $pqrs = $user->pqrsAsignadas()
                ->with([
                    'asignados:id,name',
                    'respuestas:id,pqrs_id,user_id',
                    'clasificaciones:id,nombre'
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


    public function asignacionMasiva(Request $request)
    {
        // 1. Validar los datos de la solicitud
        $request->validate([
            'pqr_codigos' => 'required|array',
            // Asegura que las PQRS existan y tengan un valor en 'atributo_calidad'
            'pqr_codigos.*' => 'string|exists:pqrs,pqr_codigo',

            // Agrega una validación personalizada para verificar el atributo_calidad
            'pqr_codigos.*' => [
                'required',
                'string',
                'exists:pqrs,pqr_codigo',
                function ($attribute, $value, $fail) {
                    // Obtiene la PQR por su código
                    $pqr = Pqr::where('pqr_codigo', $value)->first();
                    // Verifica si el campo 'atributo_calidad' está vacío o nulo
                    if ($pqr && is_null($pqr->atributo_calidad)) {
                        $fail("Las PQRS no se puede asignar porque alguna(s) aún no han sido clasificada(s).");
                    }
                },
            ],
            'usuario_ids' => 'required|array',
            'usuario_ids.*' => 'integer|exists:users,id',
        ]);

        // El resto de la lógica para la asignación masiva...
        $pqrCodigos = $request->input('pqr_codigos');
        $usuarioIds = $request->input('usuario_ids');

        try {
            DB::beginTransaction();

            $pqrs = Pqr::whereIn('pqr_codigo', $pqrCodigos)->get();
            foreach ($pqrs as $pqr) {
                $pqr->asignados()->syncWithoutDetaching($usuarioIds);
            }

            DB::commit();

            return response()->json([
                'message' => 'PQRS asignadas masivamente con éxito.',
                'assigned_count' => count($pqrCodigos),
                'user_count' => count($usuarioIds)
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Error al asignar las PQRS.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
