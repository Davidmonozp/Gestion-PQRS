<?php

namespace App\Exports;

use App\Models\Pqr;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class PqrsFullExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
{
    use Exportable;

    public function query()
    {
        return Pqr::query();
    }

    public function map($pqr): array
    {
        return $pqr->toArray();
    }

    public function headings(): array
    {
        return array_keys(Pqr::first()->toArray());
    }
}


// class PqrsFullExport implements FromCollection, WithHeadings
// {
//     public function collection()
//     {
//         // Retorna todos los registros de la tabla Pqrs
//         return Pqr::all();
//     }

//     public function headings(): array
//     {
//         // Devuelve los nombres de las columnas
//         return array_keys(Pqr::first()->toArray());
//     }
// }
