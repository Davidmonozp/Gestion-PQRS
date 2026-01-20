<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pqr;
use App\Services\CodigoPqrService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class PqrTutelaController extends Controller
{
    public function store(Request $request, CodigoPqrService $codigoService)
    {
        try {
            $registra_otro = $request->input('registra_otro') === 'si';

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
                            if (!preg_match('/^[A-Za-z0-9]+$/', $value)) {
                                $fail('El número de documento solo puede contener letras y números.');
                            }
                        } else {
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

                'descripcion' => 'required|string',

                'archivos' => 'nullable|array',
                'archivos.*' => 'file|max:15000',

                'archivos_adicionales' => 'nullable|array',
                'archivos_adicionales.*' => 'file|max:15000',

                'registra_otro' => 'required|in:si,no',
                'politica_aceptada' => 'required',
            ];

            // -------------------------
            // 🔹 VALIDACIÓN SOBRE REGISTRA_OTRO (SOLO PARA TUTELA)
            // -------------------------
            if ($registra_otro) {
                $rules = array_merge($rules, [

                    // 👉 ANTES obligatorios siempre — AHORA solo si registra_otro = si
                    'tipo_solicitud' => 'required|string|in:Tutela',
                    'clasificacion_tutela' => 'required|string',
                    'radicado_juzgado' => 'required|string|max:255',
                    'accionado' => 'required|array|min:1',
                    'accionado.*' => 'in:Asegurador,Passus',
                    'parentesco' => 'required|string',

                    // 👉 Ya existían para registra_otro
                    'nombre_juzgado' => 'required|string|max:150',
                    'nombre_juez' => 'required|string|max:150',

                    'registrador_correo'   => 'required|array',
                    'registrador_correo.*' => 'email',
                ]);
            }

            // -------------------------
            // 🔹 VALIDACIÓN SI VIENE DEL BACKEND
            // -------------------------
            if (Auth::check()) {
                $rules['fecha_inicio_real'] = 'required|date_format:Y-m-d H:i';
                $rules['fuente'] = 'required|string|in:Formulario de la web,Correo atención al usuario,Correo de Agendamiento NAC,Encuesta de satisfacción IPS,Callcenter,Presencial';
            }

            $validated = $request->validate($rules);

            // -------------------------
            // 🔹 GUARDAR ARCHIVOS
            // -------------------------
            $uploadedFilesData = [];

            $uploadedFilesData = [];

            $allFiles = [];

            if ($request->hasFile('archivos')) {
                $allFiles = array_merge($allFiles, $request->file('archivos'));
            }

            if ($request->hasFile('archivos_adicionales')) {
                $allFiles = array_merge($allFiles, $request->file('archivos_adicionales'));
            }

            // Eliminar duplicados por nombre
            $allFiles = collect($allFiles)
                ->unique(fn($file) => $file->getClientOriginalName())
                ->values()
                ->all();

            foreach ($allFiles as $file) {
                $path = $file->store('pqrs_files', 'public');
                $uploadedFilesData[] = [
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'url' => asset("storage/$path"),
                ];
            }



            // -------------------------
            // 🔹 GENERAR CÓDIGO PQR
            // -------------------------
            $codigoPqr = $codigoService->generarCodigoPqr('Tutela', $validated['documento_numero']);

            // -------------------------
            // 🔹 CREAR PQR
            // -------------------------
            $pqr = Pqr::create([
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

                'tipo_solicitud' => 'Tutela',
                'descripcion' => $validated['descripcion'],

                // 👉 CORRECCIÓN: guardamos los archivos como JSON
                'archivo' => $uploadedFilesData,

                // Solo si registra_otro = si
                'radicado_juzgado' => $registra_otro ? $validated['radicado_juzgado'] : null,
                'clasificacion_tutela' => $registra_otro ? $validated['clasificacion_tutela'] : null,

                // 👉 CORRECCIÓN: arrays deben guardarse como JSON
                'accionado' => $registra_otro
                    ? implode(',', $validated['accionado'])
                    : null,

                'registra_otro' => $registra_otro,

                'registrador_nombre' => $registra_otro ? ($validated['nombre_juzgado'] ?? null) : null,
                'registrador_apellido' => $registra_otro ? ($validated['nombre_juez'] ?? null) : null,

                // 👉 CORRECCIÓN: array de correos
                'registrador_correo' => $registra_otro
                    ? implode(',', $validated['registrador_correo'])
                    : null,

                'parentesco' => $registra_otro ? $validated['parentesco'] : null,

                'fecha_inicio_real' => $validated['fecha_inicio_real'] ?? null,
                'fuente' => $validated['fuente'] ?? null,
            ]);



            // -------------------------
            // 🔹 ENVIAR CORREOS DESACTIVADO
            // -------------------------


            // Mail::to($pqr->correo)->send(new \App\Mail\PqrRegistrada($pqr));
            // if (!empty($pqr->registrador_correo)) {

            //     $correos = explode(',', $pqr->registrador_correo);

            //     // limpiar correos vacíos o espacios
            //     $correos = array_filter(array_map('trim', $correos));

            //     foreach ($correos as $correo) {
            //         Mail::to($correo)->send(new \App\Mail\PqrRegistrada($pqr));
            //     }
            // }


            return response()->json([
                'message' => 'Tutela registrada con éxito',
                'pqr' => $pqr,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Datos inválidos.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error interno.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
