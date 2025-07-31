<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventLog extends Model
{
    use HasFactory;

    protected $table = 'event_logs'; // Nombre de la tabla

    protected $fillable = [
        'event_type',
        'description',
        'pqr_id',
        'pqr_codigo',
        'estado_anterior',
        'estado_nuevo',
        'fecha_evento',
        'user_id',
    ];

    public $timestamps = false;
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
