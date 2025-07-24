<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Clasificacion extends Model
{
    use HasFactory;

    // ESTA LÍNEA ES FUNDAMENTAL SI TU TABLA SE LLAMA 'clasificacions' (singular con 's')
    protected $table = 'clasificaciones';

    // Asegúrate de que 'nombre' sea fillable
    protected $fillable = [
        'nombre'
    ];
}
