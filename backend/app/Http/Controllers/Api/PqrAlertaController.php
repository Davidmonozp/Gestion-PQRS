<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pqr;
use App\Services\PqrTiempoService;

class PqrAlertaController extends Controller
{
    protected PqrTiempoService $pqrTiempoService;

    public function __construct(PqrTiempoService $pqrTiempoService)
    {
        $this->pqrTiempoService = $pqrTiempoService;
    }

 public function alertas()
{
    $porVencer = Pqr::where('estado_tiempo', 'Por vencer')->get(['pqr_codigo', 'deadline_ciudadano']);
    $vencidasSinRespuesta = Pqr::where('estado_tiempo', 'Vencida sin respuesta')->get(['pqr_codigo', 'deadline_ciudadano']);

    return response()->json([
        'por_vencer' => $porVencer,
        'vencidas_sin_respuesta' => $vencidasSinRespuesta,
    ]);
}

}
