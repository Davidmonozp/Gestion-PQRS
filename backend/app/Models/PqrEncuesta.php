<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PqrEncuesta extends Model
{
    protected $fillable = [
        'pqr_id',
        'token',
        'respondida',
        'respondida_en'
    ];

    public function pqr()
    {
        return $this->belongsTo(Pqr::class);
    }
}
