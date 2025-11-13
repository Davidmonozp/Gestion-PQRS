<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function resumenGlobal()
    {
        return response()->json([
            'total'      => DB::table('pqrs')->count(),
            'pendientes' => DB::table('pqrs')->where('respuesta_enviada', 0)->count(),
            'resueltas'  => DB::table('pqrs')->where('respuesta_enviada', 1)->count(),
        ]);
    }
    public function resumenFiltrado(Request $request)
    {
        $query = DB::table('pqrs')
            ->leftJoin('clasificacion_pqr', 'clasificacion_pqr.pqr_id', '=', 'pqrs.id')
            ->leftJoin('clasificaciones', 'clasificaciones.id', '=', 'clasificacion_pqr.clasificacion_id')
            ->select('pqrs.*');

        if ($request->filled('sede')) {
            $query->whereIn('pqrs.sede', (array) $request->sede);
        }

        if ($request->filled('mes')) {
            $query->whereIn(DB::raw('MONTH(pqrs.created_at)'), (array) $request->mes);
        }

        if ($request->filled('dia')) {
            $query->whereDay('pqrs.created_at', $request->dia);
        }

        if ($request->filled('atributo_calidad')) {
            $query->whereIn('pqrs.atributo_calidad', (array) $request->atributo_calidad);
        }

        if ($request->filled('anio')) {
            $query->whereIn(DB::raw('YEAR(pqrs.created_at)'), (array) $request->anio);
        }

        if ($request->filled('eps')) {
            $query->whereIn('pqrs.eps', (array) $request->eps);
        }

        if ($request->filled('tipo_solicitud')) {
            $query->whereIn('pqrs.tipo_solicitud', (array) $request->tipo_solicitud);
        }

        if ($request->filled('servicio_prestado')) {
            $query->whereIn('pqrs.servicio_prestado', (array) $request->servicio_prestado);
        }

        // ...
        // Filtro de clasificación
        if ($request->filled('clasificacion_id')) {
            $query->whereIn('clasificaciones.id', (array) $request->clasificacion_id);
        } elseif ($request->filled('clasificacion')) {
            $query->whereIn('clasificaciones.nombre', (array) $request->clasificacion);
        }

        $base = clone $query;

        $total = $base->distinct('pqrs.id')->count('pqrs.id');
        $pendientes = (clone $base)->where('pqrs.respuesta_enviada', 0)->distinct('pqrs.id')->count('pqrs.id');
        $resueltas = (clone $base)->where('pqrs.respuesta_enviada', 1)->distinct('pqrs.id')->count('pqrs.id');

        return response()->json([
            'total'      => $total,
            'pendientes' => $pendientes,
            'resueltas'  => $resueltas,
        ]);
    }



    public function porMes(Request $request)
    {
        $anio = $request->input('anio', date('Y'));
        $mes = $request->input('mes'); // opcional
        $dia = $request->input('dia'); // opcional
        $sede = $request->input('sede'); // opcional
        $atributo = $request->input('atributo_calidad');
        $estadoTiempo = $request->input('estado_tiempo');
        $tipoSolicitud = $request->input('tipo_solicitud');
        $servicioPrestado = $request->input('servicio_prestado');
        $eps = $request->input('eps');
        $clasificacion_id = $request->input('clasificacion_id');
        $clasificacion = $request->input('clasificacion');

        $query = DB::table('pqrs')
            ->leftJoin('clasificacion_pqr', 'clasificacion_pqr.pqr_id', '=', 'pqrs.id')
            ->leftJoin('clasificaciones', 'clasificaciones.id', '=', 'clasificacion_pqr.clasificacion_id')
            ->select(DB::raw('MONTH(pqrs.created_at) as mes'), DB::raw('COUNT(DISTINCT pqrs.id) as cantidad'))
            ->whereYear('pqrs.created_at', $anio);

        if ($mes) {
            if (is_array($mes)) {
                $query->whereIn(DB::raw('MONTH(pqrs.created_at)'), $mes);
            } else {
                $query->whereMonth('pqrs.created_at', $mes);
            }
        }
        
        if ($dia) $query->whereDay('created_at', $dia);
        if ($sede) {
            if (is_array($sede)) {
                $query->whereIn('sede', $sede);
            } else {
                $query->where('sede', $sede);
            }
        }

        if ($atributo) {
            if (is_array($atributo)) {
                $query->whereIn('atributo_calidad', $atributo);
            } else {
                $query->where('atributo_calidad', $atributo);
            }
        }
        if ($estadoTiempo) $query->where('estado_tiempo', $estadoTiempo);

        if ($request->filled('eps')) {
            $eps = $request->eps;
            if (is_array($eps)) {
                $query->whereIn('eps', $eps);
            } else {
                $query->where('eps', $eps);
            }
        }

        if ($tipoSolicitud) {
            if (is_array($tipoSolicitud)) {
                $query->whereIn('tipo_solicitud', $tipoSolicitud);
            } else {
                $query->where('tipo_solicitud', $tipoSolicitud);
            }
        }

        if ($servicioPrestado) {
            if (is_array($servicioPrestado)) {
                $query->whereIn('servicio_prestado', $servicioPrestado);
            } else {
                $query->where('servicio_prestado', $servicioPrestado);
            }
        }

        if ($clasificacion_id) {
            $query->whereIn('clasificaciones.id', (array) $clasificacion_id);
        } elseif ($clasificacion) {
            $query->whereIn('clasificaciones.nombre', (array) $clasificacion);
        }


        $results = $query->groupBy('mes')->orderBy('mes')->get();

        // Crear arreglo de 12 meses con cantidad 0 por defecto
        $meses = collect(range(1, 12))->map(function ($m) use ($results) {
            $match = $results->firstWhere('mes', $m);
            return [
                'mes' => $m,
                'cantidad' => $match ? $match->cantidad : 0,
            ];
        });

        return $meses;
    }



    public function porTipo(Request $request)
    {
        $anio = $request->input('anio', date('Y'));
        $mes = $request->input('mes');
        $dia = $request->input('dia');
        $sede = $request->input('sede');
        $atributo = $request->input('atributo_calidad');
        $estadoTiempo = $request->input('estado_tiempo');
        $tipoSolicitud = $request->input('tipo_solicitud');
        $servicioPrestado = $request->input('servicio_prestado');
        $eps = $request->input('eps');
        $clasificacion_id = $request->input('clasificacion_id');
        $clasificacion = $request->input('clasificacion');

        // ✅ JOIN para incluir clasificaciones
        $query = DB::table('pqrs')
            ->leftJoin('clasificacion_pqr', 'clasificacion_pqr.pqr_id', '=', 'pqrs.id')
            ->leftJoin('clasificaciones', 'clasificaciones.id', '=', 'clasificacion_pqr.clasificacion_id')
            ->select('pqrs.tipo_solicitud', DB::raw('COUNT(DISTINCT pqrs.id) as cantidad'))
            ->whereYear('pqrs.created_at', $anio);

        if ($mes) {
            if (is_array($mes)) {
                $query->whereIn(DB::raw('MONTH(pqrs.created_at)'), $mes);
            } else {
                $query->whereMonth('pqrs.created_at', $mes);
            }
        }

        if ($dia) $query->whereDay('pqrs.created_at', $dia);

        if ($sede) {
            $query->whereIn('pqrs.sede', (array) $sede);
        }

        if ($atributo) {
            $query->whereIn('pqrs.atributo_calidad', (array) $atributo);
        }

        if ($estadoTiempo) {
            $query->where('pqrs.estado_tiempo', $estadoTiempo);
        }

        if ($eps) {
            $query->whereIn('pqrs.eps', (array) $eps);
        }

        if ($tipoSolicitud) {
            $query->whereIn('pqrs.tipo_solicitud', (array) $tipoSolicitud);
        }

        if ($servicioPrestado) {
            $query->whereIn('pqrs.servicio_prestado', (array) $servicioPrestado);
        }

        // ✅ Filtro por clasificación (id o nombre)
        if ($clasificacion_id) {
            $query->whereIn('clasificaciones.id', (array) $clasificacion_id);
        } elseif ($clasificacion) {
            $query->whereIn('clasificaciones.nombre', (array) $clasificacion);
        }

        $resultados = $query->groupBy('pqrs.tipo_solicitud')->get();

        // Obtener todas las categorías que existen en BD
        $categorias = DB::table('pqrs')
            ->distinct()
            ->pluck('tipo_solicitud');

        // Construir arreglo final con ceros donde no hay registros
        $tipos = collect($categorias)->map(function ($cat) use ($resultados) {
            $match = $resultados->firstWhere('tipo_solicitud', $cat);
            return [
                'tipo_solicitud' => $cat,
                'cantidad' => $match ? $match->cantidad : 0,
            ];
        });

        return $tipos;
    }



    public function porEps(Request $request)
    {
        $anio = $request->input('anio', date('Y'));
        $mes = $request->input('mes');
        $dia = $request->input('dia');
        $sede = $request->input('sede');
        $atributo = $request->input('atributo_calidad');
        $estadoTiempo = $request->input('estado_tiempo');
        $tipoSolicitud = $request->input('tipo_solicitud');
        $servicioPrestado = $request->input('servicio_prestado');
        $eps = $request->input('eps');
        $clasificacion_id = $request->input('clasificacion_id');
        $clasificacion = $request->input('clasificacion');

        $query = DB::table('pqrs')
            ->leftJoin('clasificacion_pqr', 'clasificacion_pqr.pqr_id', '=', 'pqrs.id')
            ->leftJoin('clasificaciones', 'clasificaciones.id', '=', 'clasificacion_pqr.clasificacion_id')
            ->select('eps', DB::raw('COUNT(DISTINCT pqrs.id) as cantidad'))
            ->whereYear('pqrs.created_at', $anio);

        if ($mes) {
            if (is_array($mes)) {
                $query->whereIn(DB::raw('MONTH(pqrs.created_at)'), $mes);
            } else {
                $query->whereMonth('pqrs.created_at', $mes);
            }
        }

        if (!empty($dia)) $query->whereDay('created_at', $dia);
        if (!empty($sede)) $query->whereIn('sede', (array) $sede);
        if (!empty($atributo)) $query->whereIn('atributo_calidad', (array) $atributo);
        if (!empty($estadoTiempo)) $query->where('estado_tiempo', $estadoTiempo);
        if (!empty($tipoSolicitud)) $query->whereIn('tipo_solicitud', (array) $tipoSolicitud);
        if (!empty($servicioPrestado)) $query->whereIn('servicio_prestado', (array) $servicioPrestado);
        if (!empty($eps)) $query->whereIn('eps', (array) $eps);

        if (!empty($clasificacion_id)) {
            $query->whereIn('clasificaciones.id', $clasificacion_id);
        } elseif (!empty($clasificacion)) {
            $query->whereIn('clasificaciones.nombre', $clasificacion);
        }

        return $query->groupBy('eps')->get();
    }



    public function porAnio()
    {
        return DB::table('pqrs')
            ->select(DB::raw('YEAR(created_at) as anio, COUNT(*) as cantidad'))
            ->groupBy('anio')
            ->orderBy('anio')
            ->get();
    }

    public function porAtributoCalidad(Request $request)
    {
        $anio = $request->input('anio', date('Y'));
        $mes = $request->input('mes');
        $dia = $request->input('dia');
        $sede = $request->input('sede');
        $atributo = $request->input('atributo_calidad');
        $estadoTiempo = $request->input('estado_tiempo');
        $tipoSolicitud = $request->input('tipo_solicitud');
        $eps = $request->input('eps');
        $servicioPrestado = $request->input('servicio_prestado');
        $clasificacion_id = $request->input('clasificacion_id');
        $clasificacion = $request->input('clasificacion');

        $query = DB::table('pqrs')
            ->leftJoin('clasificacion_pqr', 'clasificacion_pqr.pqr_id', '=', 'pqrs.id')
            ->leftJoin('clasificaciones', 'clasificaciones.id', '=', 'clasificacion_pqr.clasificacion_id')
            ->select(
                DB::raw("COALESCE(atributo_calidad, 'No definido') as atributo_calidad"),
                DB::raw('COUNT(DISTINCT pqrs.id) as cantidad')
            )
            ->whereYear('pqrs.created_at', $anio);

        if ($mes) {
            if (is_array($mes)) {
                $query->whereIn(DB::raw('MONTH(pqrs.created_at)'), $mes);
            } else {
                $query->whereMonth('pqrs.created_at', $mes);
            }
        }

        if (!empty($dia)) $query->whereDay('created_at', $dia);
        if (!empty($sede)) $query->whereIn('sede', (array) $sede);
        if (!empty($atributo)) $query->whereIn('atributo_calidad', (array) $atributo);
        if (!empty($estadoTiempo)) $query->where('estado_tiempo', $estadoTiempo);
        if (!empty($eps)) $query->whereIn('eps', (array) $eps);
        if (!empty($tipoSolicitud)) $query->whereIn('tipo_solicitud', (array) $tipoSolicitud);
        if (!empty($servicioPrestado)) $query->whereIn('servicio_prestado', (array) $servicioPrestado);

        if (!empty($clasificacion_id)) {
            $query->whereIn('clasificaciones.id', (array) $clasificacion_id);
        } elseif (!empty($clasificacion)) {
            $query->whereIn('clasificaciones.nombre', (array) $clasificacion);
        }

        return $query->groupBy('atributo_calidad')->get();
    }


    public function clasificacionPorTipoSolicitud(Request $request)
    {
        // 📅 Filtros principales
        $anio = $request->input('anio', date('Y'));
        $mes = $request->input('mes');
        $dia = $request->input('dia');
        $sede = $request->input('sede');
        $atributo = $request->input('atributo_calidad');
        $estadoTiempo = $request->input('estado_tiempo');
        $tipoSolicitud = $request->input('tipo_solicitud');
        $eps = $request->input('eps');
        $servicioPrestado = $request->input('servicio_prestado');
        $clasificacion = $request->input('clasificacion');

        // 📊 Consulta base
        $query = DB::table('clasificacion_pqr as cp')
            ->join('pqrs as p', 'p.id', '=', 'cp.pqr_id')
            ->join('clasificaciones as c', 'c.id', '=', 'cp.clasificacion_id')
            ->select(
                'c.nombre as clasificacion',
                'p.tipo_solicitud',
                DB::raw('COUNT(DISTINCT p.id) as total')
            )
            ->whereYear('p.created_at', $anio);

        // 📆 Filtro por mes
        if ($mes) {
            if (is_array($mes)) $query->whereIn(DB::raw('MONTH(p.created_at)'), $mes);
            else $query->whereMonth('p.created_at', $mes);
        }

        // 📅 Filtro por día
        if ($dia) $query->whereDay('p.created_at', $dia);

        // 🏢 Filtro por sede
        if ($sede) $query->whereIn('p.sede', (array) $sede);

        // 🌟 Filtro por atributo de calidad
        if ($atributo) $query->whereIn('p.atributo_calidad', (array) $atributo);

        // ⏱️ Filtro por estado de tiempo
        if ($estadoTiempo) $query->whereIn('p.estado_tiempo', (array) $estadoTiempo);

        // 🏥 Filtro por EPS
        if ($eps) $query->whereIn('p.eps', (array) $eps);

        // 📝 Filtro por tipo de solicitud
        if ($tipoSolicitud) $query->whereIn('p.tipo_solicitud', (array) $tipoSolicitud);

        // 💬 Filtro por servicio prestado
        if ($servicioPrestado) $query->whereIn('p.servicio_prestado', (array) $servicioPrestado);

        // 🔹 Filtro por nombre de clasificación
        if ($clasificacion) $query->whereIn('c.nombre', (array) $clasificacion);

        // 📈 Agrupación base
        $rawData = $query
            ->groupBy('c.nombre', 'p.tipo_solicitud')
            ->orderBy('c.nombre')
            ->get();

        // 🔄 Transformar los datos para Recharts
        $agrupado = [];
        foreach ($rawData as $item) {
            $nombreClasificacion = $item->clasificacion;
            $tipo = $item->tipo_solicitud;
            $total = $item->total;

            if (!isset($agrupado[$nombreClasificacion])) {
                $agrupado[$nombreClasificacion] = ['clasificacion' => $nombreClasificacion];
            }

            $agrupado[$nombreClasificacion][$tipo] = $total;
        }

        // 📊 Convertir a arreglo plano (listo para la gráfica)
        $data = array_values($agrupado);

        return response()->json($data);
    }


  
    // public function promedioTiempoRespuesta()
    // {
    //     $promedio = DB::table('pqrs')
    //         ->whereNotNull('respondido_en')
    //         ->select(DB::raw("AVG(TIMESTAMPDIFF(SECOND, created_at, respondido_en)) as promedio_segundos"))
    //         ->value('promedio_segundos');

    //     // Convertir segundos a horas y minutos
    //     $horas = floor($promedio / 3600);
    //     $minutos = floor(($promedio % 3600) / 60);

    //     return response()->json([
    //         'promedio_horas_decimal' => round($promedio / 3600, 2), // en horas con decimales
    //         'formato' => "{$horas} horas {$minutos} minutos"       // en formato legible
    //     ]);
    // }

    public function promedioTiempoRespuesta(Request $request)
    {
        // 📅 Obtener todos los filtros del request
        $anio = $request->input('anio', date('Y'));
        $mes = $request->input('mes');
        $dia = $request->input('dia');
        $sede = $request->input('sede');
        $atributo = $request->input('atributo_calidad');
        $estadoTiempo = $request->input('estado_tiempo');
        $tipoSolicitud = $request->input('tipo_solicitud');
        $eps = $request->input('eps');
        $servicioPrestado = $request->input('servicio_prestado');
        $clasificacion = $request->input('clasificacion');

        // 📊 Consulta base
        $query = DB::table('pqrs as p')
            ->whereNotNull('p.respondido_en')
            ->whereYear('p.created_at', $anio)
            ->select(DB::raw("AVG(TIMESTAMPDIFF(SECOND, p.created_at, p.respondido_en)) as promedio_segundos"));

        // Si se usa el filtro 'clasificacion', necesitamos un JOIN
        if ($clasificacion) {
            $query->join('clasificacion_pqr as cp', 'p.id', '=', 'cp.pqr_id')
                ->join('clasificaciones as c', 'c.id', '=', 'cp.clasificacion_id')
                ->whereIn('c.nombre', (array) $clasificacion);
        }

        // 📆 Filtro por mes
        if ($mes) {
            if (is_array($mes)) $query->whereIn(DB::raw('MONTH(p.created_at)'), $mes);
            else $query->whereMonth('p.created_at', $mes);
        }

        // 📅 Filtro por día
        if ($dia) $query->whereDay('p.created_at', $dia);

        // 🏢 Filtro por sede
        if ($sede) $query->whereIn('p.sede', (array) $sede);

        // 🌟 Filtro por atributo de calidad
        if ($atributo) $query->whereIn('p.atributo_calidad', (array) $atributo);

        // ⏱️ Filtro por estado de tiempo
        if ($estadoTiempo) $query->whereIn('p.estado_tiempo', (array) $estadoTiempo);

        // 🏥 Filtro por EPS
        if ($eps) $query->whereIn('p.eps', (array) $eps);

        // 📝 Filtro por tipo de solicitud
        if ($tipoSolicitud) $query->whereIn('p.tipo_solicitud', (array) $tipoSolicitud);

        // 💬 Filtro por servicio prestado
        if ($servicioPrestado) $query->whereIn('p.servicio_prestado', (array) $servicioPrestado);
        
        // Ejecutar la consulta para obtener el promedio en segundos
        $promedio = $query->value('promedio_segundos');

        // Si no hay resultados, retornar 0
        if (is_null($promedio)) {
            return response()->json([
                'promedio_horas_decimal' => 0,
                'formato' => "0 horas 0 minutos"
            ]);
        }

        // Convertir segundos a horas y minutos para el formato legible
        $horas = floor($promedio / 3600);
        $minutos = floor(($promedio % 3600) / 60);

        return response()->json([
            'promedio_horas_decimal' => round($promedio / 3600, 2), // en horas con decimales
            'formato' => "{$horas} horas {$minutos} minutos"      // en formato legible
        ]);
    }



    public function porEstadoRespuesta(Request $request)
    {
        $anio = $request->input('anio', date('Y'));
        $mes = $request->input('mes');
        $dia = $request->input('dia');
        $sede = $request->input('sede');
        $atributo = $request->input('atributo_calidad');
        $estadoTiempo = $request->input('estado_tiempo');
        $tipoSolicitud = $request->input('tipo_solicitud');
        $eps = $request->input('eps');
        $servicioPrestado = $request->input('servicio_prestado');
        $clasificacion_id = $request->input('clasificacion_id');
        $clasificacion = $request->input('clasificacion');

        $query = DB::table('pqrs')
            ->leftJoin('clasificacion_pqr', 'clasificacion_pqr.pqr_id', '=', 'pqrs.id')
            ->leftJoin('clasificaciones', 'clasificaciones.id', '=', 'clasificacion_pqr.clasificacion_id')
            ->select(DB::raw("COALESCE(estado_tiempo, 'No se ha clasificado') as estado_tiempo"), DB::raw('COUNT(DISTINCT pqrs.id) as cantidad'))
            ->whereYear('pqrs.created_at', $anio);

        if ($mes) {
            if (is_array($mes)) {
                // Asegúrate de usar el prefijo en la función RAW si es necesario, 
                // aunque el alias de columna es más común. Usaremos el alias aquí:
                $query->whereIn(DB::raw('MONTH(pqrs.created_at)'), $mes);
            } else {
                $query->whereMonth('pqrs.created_at', $mes);
            }
        }
        if ($dia) $query->whereDay('created_at', $dia);

        if ($sede) {
            if (is_array($sede)) {
                $query->whereIn('sede', $sede);
            } else {
                $query->where('sede', $sede);
            }
        }

        if ($atributo) {
            if (is_array($atributo)) {
                $query->whereIn('atributo_calidad', $atributo);
            } else {
                $query->where('atributo_calidad', $atributo);
            }
        }

        if ($estadoTiempo) $query->where('estado_tiempo', $estadoTiempo);

        if ($request->filled('eps')) {
            $eps = $request->eps;
            if (is_array($eps)) {
                $query->whereIn('eps', $eps);
            } else {
                $query->where('eps', $eps);
            }
        }
        if ($eps) {
            if (is_array($eps)) {
                $query->whereIn('eps', $eps);
            } else {
                $query->where('eps', $eps);
            }
        }

        if ($tipoSolicitud) {
            if (is_array($tipoSolicitud)) {
                $query->whereIn('tipo_solicitud', $tipoSolicitud);
            } else {
                $query->where('tipo_solicitud', $tipoSolicitud);
            }
        }
        if ($servicioPrestado) {
            if (is_array($servicioPrestado)) {
                $query->whereIn('servicio_prestado', $servicioPrestado);
            } else {
                $query->where('servicio_prestado', $servicioPrestado);
            }
        }
        if ($clasificacion_id) {
            $query->whereIn('clasificaciones.id', (array) $clasificacion_id);
        } elseif ($clasificacion) {
            $query->whereIn('clasificaciones.nombre', (array) $clasificacion);
        }

        $resultados = $query->groupBy('estado_tiempo')->get();

        // 🔹 Usa el mismo string que en COALESCE
        $estados = [
            "Vencida sin respuesta",
            "Cumplida a tiempo",
            "Cumplida fuera del tiempo",
            "En tiempo",
            "Por vencer",
            "No se ha clasificado"
        ];

        $total = $resultados->sum('cantidad');

        return collect($estados)->map(function ($estado) use ($resultados, $total) {
            $match = $resultados->firstWhere('estado_tiempo', $estado);
            $cantidad = $match ? $match->cantidad : 0;

            return [
                'estado_tiempo' => $estado,
                'cantidad' => $cantidad,
                'porcentaje' => $total > 0 ? round(($cantidad / $total) * 100, 2) : 0
            ];
        });
    }


    public function porServicioPrestado(Request $request)
    {
        $anio = $request->input('anio', date('Y'));
        $mes = $request->input('mes');
        $dia = $request->input('dia');
        $sede = $request->input('sede');
        $atributo = $request->input('atributo_calidad');
        $estadoTiempo = $request->input('estado_tiempo');
        $tipoSolicitud = $request->input('tipo_solicitud');
        $eps = $request->input('eps');
        $servicioPrestado = $request->input('servicio_prestado');
        $clasificacion_id = $request->input('clasificacion_id');
        $clasificacion = $request->input('clasificacion');

        $query = DB::table('pqrs')
            ->leftJoin('clasificacion_pqr', 'clasificacion_pqr.pqr_id', '=', 'pqrs.id')
            ->leftJoin('clasificaciones', 'clasificaciones.id', '=', 'clasificacion_pqr.clasificacion_id')
            ->whereYear('pqrs.created_at', $anio);

        // Filtros
        if (!empty($mes)) {
            if (is_array($mes)) $query->whereIn(DB::raw('MONTH(pqrs.created_at)'), $mes);
            else $query->whereMonth('pqrs.created_at', $mes);
        }
        if (!empty($dia)) $query->whereDay('pqrs.created_at', $dia);
        if (!empty($sede)) $query->whereIn('sede', (array) $sede);
        if (!empty($atributo)) $query->whereIn('atributo_calidad', (array) $atributo);
        if (!empty($estadoTiempo)) $query->whereIn('estado_tiempo', (array) $estadoTiempo);
        if (!empty($eps)) $query->whereIn('eps', (array) $eps);
        if (!empty($tipoSolicitud)) $query->whereIn('tipo_solicitud', (array) $tipoSolicitud);
        if (!empty($servicioPrestado)) $query->whereIn('servicio_prestado', (array) $servicioPrestado);

        // 🔹 Filtrar por clasificación correctamente
        if (!empty($clasificacion_id)) {
            $query->whereIn('clasificacion_pqr.clasificacion_id', (array) $clasificacion_id);
        } elseif (!empty($clasificacion)) {
            $query->whereIn('clasificaciones.nombre', (array) $clasificacion);
        }

        // Total de PQRs filtradas (DISTINCT pqrs.id)
        $total = (clone $query)->distinct('pqrs.id')->count('pqrs.id');

        // Conteo por servicio_prestado
        $resultados = $query
            ->select(DB::raw("COALESCE(servicio_prestado, 'No definido') as servicio_prestado"), DB::raw('COUNT(DISTINCT pqrs.id) as cantidad'))
            ->groupBy('servicio_prestado')
            ->get();

        // Agregar porcentaje
        $resultados = $resultados->map(function ($item) use ($total) {
            $item->porcentaje = $total > 0 ? round(($item->cantidad / $total) * 100, 2) : 0;
            return $item;
        });

        return response()->json([
            'total' => $total,
            'data'  => $resultados,
        ]);
    }


    public function porSedeTipoSolicitud(Request $request)
    {
        $anio = $request->input('anio', date('Y'));
        $mes = $request->input('mes');
        $dia = $request->input('dia');
        $sede = $request->input('sede');
        $eps = $request->input('eps');
        $atributo = $request->input('atributo_calidad');
        $estadoTiempo = $request->input('estado_tiempo');
        $tipoSolicitud = $request->input('tipo_solicitud');
        $servicioPrestado = $request->input('servicio_prestado');
        $clasificacion_id = $request->input('clasificacion_id');
        $clasificacion = $request->input('clasificacion');

        $query = DB::table('pqrs')
            ->leftJoin('clasificacion_pqr', 'clasificacion_pqr.pqr_id', '=', 'pqrs.id')
            ->leftJoin('clasificaciones', 'clasificaciones.id', '=', 'clasificacion_pqr.clasificacion_id')
            ->whereYear('pqrs.created_at', $anio);

        // 🔹 Mes
        if (!empty($mes)) {
            if (is_array($mes)) $query->whereIn(DB::raw('MONTH(pqrs.created_at)'), $mes);
            else $query->whereMonth('pqrs.created_at', $mes);
        }

        // 🔹 Día
        if (!empty($dia)) $query->whereDay('pqrs.created_at', $dia);

        // 🔹 Sede
        if (!empty($sede)) $query->whereIn('sede', (array) $sede);

        // 🔹 EPS
        if (!empty($eps)) $query->whereIn('eps', (array) $eps);

        // 🔹 Atributo de calidad
        if (!empty($atributo)) $query->whereIn('atributo_calidad', (array) $atributo);

        // 🔹 Estado de tiempo
        if (!empty($estadoTiempo)) $query->whereIn('estado_tiempo', (array) $estadoTiempo);

        // 🔹 Tipo de solicitud
        if (!empty($tipoSolicitud)) $query->whereIn('tipo_solicitud', (array) $tipoSolicitud);

        // 🔹 Servicio prestado
        if (!empty($servicioPrestado)) $query->whereIn('servicio_prestado', (array) $servicioPrestado);

        // 🔹 Clasificación
        if (!empty($clasificacion_id)) {
            $query->whereIn('clasificacion_pqr.clasificacion_id', (array) $clasificacion_id);
        } elseif (!empty($clasificacion)) {
            $query->whereIn('clasificaciones.nombre', (array) $clasificacion);
        }

        // 🔹 Conteo de PQRs por sede y tipo de solicitud
        $resultados = $query
            ->select('sede', 'tipo_solicitud', DB::raw('COUNT(DISTINCT pqrs.id) as cantidad'))
            ->groupBy('sede', 'tipo_solicitud')
            ->get();

        // 🔹 Reorganizar para Recharts
        $agrupado = [];
        foreach ($resultados as $row) {
            if (!isset($agrupado[$row->sede])) {
                $agrupado[$row->sede] = [
                    'sede' => $row->sede,
                    'Queja' => 0,
                    'Reclamo' => 0,
                    'Petición' => 0,
                    'Felicitacion' => 0,
                    'Solicitud' => 0,
                    'Tutela' => 0,
                    'Derecho de petición' => 0,
                ];
            }
            $agrupado[$row->sede][$row->tipo_solicitud] = $row->cantidad;
        }

        return array_values($agrupado);
    }


    public function usuariosConVariasPqrs(Request $request)
    {
        // Paso 1: Agrupar por usuario + tipo de solicitud
        $subQuery = DB::table('pqrs')
            ->select(
                'documento_numero',
                'nombre',
                'apellido',
                'tipo_solicitud',
                DB::raw('COUNT(*) as cantidad')
            )
            ->groupBy('documento_numero', 'nombre', 'apellido', 'tipo_solicitud');

        // Paso 2: Agrupar solo por usuario
        $usuarios = DB::table(DB::raw("({$subQuery->toSql()}) as sub"))
            ->mergeBindings($subQuery) // importante para que funcione con bindings
            ->select(
                'documento_numero',
                'nombre',
                'apellido',
                DB::raw('SUM(cantidad) as total'),
                DB::raw('JSON_ARRAYAGG(JSON_OBJECT("tipo_solicitud", tipo_solicitud, "cantidad", cantidad)) as tipos')
            )
            ->groupBy('documento_numero', 'nombre', 'apellido')
            ->havingRaw('SUM(cantidad) >= 3') 
            ->get();

        // Decodificar JSON de MySQL para que llegue como array en la API
        $usuarios = $usuarios->map(function ($u) {
            return [
                'documento_numero' => $u->documento_numero,
                'nombre'           => $u->nombre,
                'apellido'         => $u->apellido,
                'total'            => $u->total,
                'tipos'            => json_decode($u->tipos, true),
            ];
        });

        return response()->json($usuarios);
    }

    public function tiempoPorArea()
    {
        try {
            $tiempos = DB::table('pqrs_user')
                ->join('users', 'pqrs_user.user_id', '=', 'users.id')
                ->join('pqrs', 'pqrs_user.pqr_id', '=', 'pqrs.id')
                ->whereNotNull('pqrs.respondido_en') // excluir null
                ->whereNotNull('users.area')
                ->where('pqrs.tipo_solicitud', '<>', 'Felicitacion') // excluir felicitaciones
                ->select(
                    'users.area as area',
                    DB::raw('ROUND(AVG(TIMESTAMPDIFF(MINUTE, pqrs.created_at, pqrs.respondido_en))/60,2) as promedio_horas'),
                    DB::raw('ROUND(MAX(TIMESTAMPDIFF(MINUTE, pqrs.created_at, pqrs.respondido_en))/60,2) as max_horas'),
                    DB::raw('ROUND(MIN(TIMESTAMPDIFF(MINUTE, pqrs.created_at, pqrs.respondido_en))/60,2) as min_horas')
                )
                ->groupBy('users.area')
                ->orderByDesc('promedio_horas')
                ->get();

            // Calcular porcentaje relativo al total
            $totalPromedio = $tiempos->sum('promedio_horas');

            $resultado = $tiempos->map(function ($item) use ($totalPromedio) {
                $item->porcentaje = $totalPromedio > 0
                    ? round(($item->promedio_horas / $totalPromedio) * 100, 2)
                    : 0;
                return $item;
            });

            return response()->json($resultado);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error interno',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
