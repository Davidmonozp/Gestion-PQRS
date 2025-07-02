<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlantillaRespuesta;

class PlantillaRespuestaController extends Controller
{
    public function index()
    {
        $plantillas = PlantillaRespuesta::all(['id', 'nombre', 'contenido']);
        return response()->json($plantillas);
    }
}
