<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlantillaRespuesta extends Model
{
    protected $table = 'plantillas_respuesta';

    protected $fillable = ['nombre', 'contenido'];
}
