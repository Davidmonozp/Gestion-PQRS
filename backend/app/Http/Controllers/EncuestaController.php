<?php

namespace App\Http\Controllers;

use App\Models\Encuesta;
use Illuminate\Http\Request;

class EncuestaController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'respuesta' => 'required|string'
        ]);

        Encuesta::create([
            'respuesta' => $request->input('respuesta')
        ]);

        return response()->json(['message' => 'Respuesta guardada'], 200);
    }
}
