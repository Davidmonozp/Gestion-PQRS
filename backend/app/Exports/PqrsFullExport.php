<?php

namespace App\Exports;

use App\Models\Pqr;
use App\Models\Pqrs;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class PqrsFullExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        // Retorna todos los registros de la tabla Pqrs
        return Pqr::all();
    }

    public function headings(): array
    {
        // Devuelve los nombres de las columnas
        return array_keys(Pqr::first()->toArray());
    }
}
