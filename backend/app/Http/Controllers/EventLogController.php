<?php

namespace App\Http\Controllers;

use App\Models\EventLog;
use Illuminate\Http\Request;

class EventLogController extends Controller
{
    public function index(Request $request)
    {
        // Incluye la relación con el usuario
        $perPage = $request->get('per_page', 15);
        $logs = EventLog::with('user')
            ->orderBy('fecha_evento', 'desc')
            ->paginate($perPage);

        return response()->json($logs);
    }

    // Listar eventos de una PQR específica
    public function showByPqr(Request $request, $pqrId)
    {
        $perPage = $request->get('per_page', 15);
        $logs = EventLog::with('user')
            ->where('pqr_id', $pqrId)
            ->orderBy('fecha_evento', 'desc')
            ->paginate($perPage);

        return response()->json($logs);
    }
}
