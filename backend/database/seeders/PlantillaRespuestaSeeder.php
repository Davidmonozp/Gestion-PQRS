<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PlantillaRespuesta;

class PlantillaRespuestaSeeder extends Seeder
{
    public function run()
    {
        $plantillas = [
            [
                'nombre' => 'ASIGNACION DE CITA POR ENVIO PUNTUAL DE EPS-JUZGADO',
                'contenido' => '
Bogotá, [FECHA]

Señor(a) [NOMBRE]

Ciudad: BOGOTÁ

Reciba un cordial saludo de PASSUS IPS Taller Psicomotriz S.A.S.,

En atención a su solicitud recibida el día [PQR_CREADA], mediante la cual solicita la asignación de citas, le informamos que se ha programado la cita [XXXX] para el(la) señor(a) [PACIENTE] identificada(o) con [TIPO_DOC]. No. [NUMERO_DOC]. La respectiva confirmación fue enviada a su correo electrónico.

De igual forma, le invitamos cordialmente a ingresar a nuestra página web, en la opción “Agéndate aquí”, o directamente a través del siguiente enlace: <a href="https://oficinavirtual.passusips.com/login">Passus IPS | Oficina Virtual</a>. Esta herramienta, disponible las 24 horas del día, le permitirá programar sus citas de Hidroterapia y consultas especializadas de manera ágil, segura y oportuna, desde cualquier lugar.

En PASSUS trabajamos con un firme compromiso hacia la mejora continua y la calidad en la prestación de los servicios de salud y bienestar. Agradecemos su confianza y el haberse puesto en contacto con nosotros, pues sus solicitudes, comentarios y sugerencias son fundamentales para seguir fortaleciendo nuestro servicio en beneficio de todos los usuarios.

Cordialmente,

Área de Experiencia al Usuario
PASSUS IPS Taller Psicomotriz S.A.S.
',
            ],
            [
                'nombre' => 'NOVEDADES CON AGENDAMIENTO WEB',
                'contenido' => '
Bogotá, [FECHA]

Señor(a) [NOMBRE]

Ciudad: BOGOTÁ

Reciba un cordial saludo de PASSUS IPS Taller Psicomotriz S.A.S.,

En atención a su solicitud recibida, en la cual nos informa que no fue posible realizar el proceso de agendamiento a través de nuestra Oficina Virtual-<a href="https://oficinavirtual.passusips.com/login">Agendamiento Web.</a> Ofrecemos disculpas por los inconvenientes presentados.

Le informamos que la novedad presentada se debió a un tema técnico puntual, el cual ya fue solucionado en nuestra plataforma. Le invitamos cordialmente a ingresar nuevamente y realizar su agendamiento desde nuestra página web en la opción <a href="https://oficinavirtual.passusips.com/login">Agéndate a qui/a> o directamente a través del siguiente link: <a href="https://oficinavirtual.passusips.com/login">Passus IPS | Oficina Virtual</a> para completar el proceso de manera ágil, seleccionando las fechas que mejor se ajusten a su disponibilidad.


En PASSUS trabajamos con un firme compromiso hacia la mejora continua y la calidad en la prestación de los servicios de salud y bienestar. Agradecemos su confianza y el haberse puesto en contacto con nosotros, pues sus solicitudes, comentarios y sugerencias son fundamentales para seguir fortaleciendo nuestro servicio en beneficio de todos los usuarios.

Cordialmente,

Área de Experiencia al Usuario
PASSUS IPS Taller Psicomotriz S.A.S.
',
            ],
            [
                'nombre' => 'POLITICA DE MULTAS CUANDO NO ADJUNTA LOS SOPORTES
',
                'contenido' => '
Bogotá, [FECHA]

Señor(a) [NOMBRE]

Ciudad: BOGOTÁ

Reciba un cordial saludo de PASSUS IPS Taller Psicomotriz S.A.S.,

En atención a su solicitud relacionada con la, exoneración de multa por inasistencia, nos permitimos informarle que estas exoneraciones únicamente aplican en los siguientes casos:

    1. Justificación médica válida, presentada dentro de las 24 horas siguientes a la cita.
    
    2. Situaciones de fuerza mayor, como calamidad familiar por fallecimiento, siempre que estén debidamente soportadas y presentadas en la misma fecha de la cita asignada.
   
En caso de que la multa aplique, el pago deberá realizarse en efectivo y en su totalidad en cualquiera de nuestras sedes PASSUS.

En PASSUS IPS valoramos profundamente la importancia de su tratamiento y la continuidad de su proceso terapéutico. Queremos resaltar que estas políticas no tienen carácter sancionatorio, sino que buscan:

        1. Fomentar la adherencia a las sesiones.
    
        2. Garantizar la oportunidad en la atención.

        3. Contribuir al logro de los mejores resultados para su bienestar integral.

Como institución prestadora de servicios de salud, nos acogemos a lo establecido en la Ley 1438 de 2011.

Para dar trámite a su solicitud, le invitamos a adjuntar los soportes correspondientes a través del siguiente enlace, diligenciando el formulario: <a href="https://fpqrs.passus.cloud/solicitud">[LINK]</a>.

En PASSUS trabajamos con un firme compromiso hacia la mejora continua y la calidad en la prestación de los servicios de salud y bienestar. Agradecemos su confianza y el haberse puesto en contacto con nosotros, pues sus solicitudes, comentarios y sugerencias son fundamentales para seguir fortaleciendo nuestro servicio en beneficio de todos los usuarios.    

Cordialmente,

Área de Experiencia al Usuario
PASSUS IPS Taller Psicomotriz S.A.S.
',
            ],
                  [
                'nombre' => 'RESPUESTA DE EXONERACIÓN JUSTIFICADA.',
                'contenido' => '
Bogotá, [FECHA]

Señor(a) [NOMBRE]

Ciudad: BOGOTÁ

Reciba un cordial saludo de PASSUS IPS Taller Psicomotriz S.A.S.,

En atención a su solicitud relacionada con la exoneración de multa por inasistencia, le confirmamos que, tras la revisión de los soportes aportados y considerando que se trata de una situación debidamente justificada, se exonera la multa por inasistencia. Esta novedad ha sido registrada en nuestro sistema de información, garantizando el control y la trazabilidad del proceso.

Deseamos recordarle que la cancelación o reprogramación de terapias debe gestionarse con al menos 48 horas de anticipación. Las únicas excepciones a este plazo corresponden a situaciones con incapacidad, soportes médicos válidos o casos fortuitos debidamente justificados y presentados durante la fecha de la cita asignada.

En PASSUS trabajamos con un firme compromiso hacia la mejora continua y la calidad en la prestación de los servicios de salud y bienestar. Agradecemos su confianza y el haberse puesto en contacto con nosotros, pues sus solicitudes, comentarios y sugerencias son fundamentales para seguir fortaleciendo nuestro servicio en beneficio de todos los usuarios.

Cordialmente,

Área de Experiencia al Usuario
PASSUS IPS Taller Psicomotriz S.A.S.
',
            ],
                   [
                'nombre' => 'PROFORMA DE RESPUESTA A QUEJA / SUGERENCIA',
                'contenido' => '
Bogotá, [FECHA]

Señor(a) [NOMBRE]

Ciudad: BOGOTÁ

Reciba un cordial saludo de PASSUS IPS Taller Psicomotriz S.A.S.,

Queremos expresarle lo valioso que es para nosotros conocer sus inquietudes, sugerencias o inconformidades, pues constituyen una oportunidad para fortalecer nuestros procesos y garantizar un mejor servicio.

En respuesta a la situación presentada, deseamos informarle lo siguiente:

        1. Aquí se incluye la explicación o respuesta concreta frente a la queja o sugerencia.

En PASSUS trabajamos con un firme compromiso hacia la mejora continua y la calidad en la prestación de los servicios de salud y bienestar. Agradecemos su confianza y el haberse puesto en contacto con nosotros, pues sus solicitudes, comentarios y sugerencias son fundamentales para seguir fortaleciendo nuestro servicio en beneficio de todos los usuarios.

Cordialmente,

Área de Experiencia al Usuario
PASSUS IPS Taller Psicomotriz S.A.S.
',
            ],
                          [
                'nombre' => ' RESPUESTA TRASLADO DE SEDE',
                'contenido' => '
Bogotá, [FECHA]

Señor(a) [NOMBRE]

Ciudad: BOGOTÁ

Reciba un cordial saludo de PASSUS IPS Taller Psicomotriz S.A.S.,

En atención a su solicitud relacionada con el traslado de sede, y de acuerdo con nuestro modelo de atención y alienado con el de su asegurador, le informamos que debe continuar sus terapias en la sede previamente asignada, debido a motivos administrativos.

En caso de que su médico tratante le ordene nuevas terapias, estas sí podrán agendarse en la sede de su preferencia. Sin embargo, respecto a la autorización actualmente vigente y en curso, no es posible realizar traslado. Por lo anterior, agradecemos continuar con sus sesiones en la sede asignada hasta que la asegurador le emita una nueva autorización.

En PASSUS trabajamos con un firme compromiso hacia la mejora continua y la calidad en la prestación de los servicios de salud y bienestar. Agradecemos su confianza y el haberse puesto en contacto con nosotros, pues sus solicitudes, comentarios y sugerencias son fundamentales para seguir fortaleciendo nuestro servicio en beneficio de todos los usuarios.

Cordialmente,

Área de Experiencia al Usuario
PASSUS IPS Taller Psicomotriz S.A.S.
',
            ],
                         [
                'nombre' => 'REPROGRAMACIÓN O CANCELACIÓN CUANDO NO ADJUNTA LOS SOPORTES',
                'contenido' => '
Bogotá, [FECHA]

Señor(a) [NOMBRE]

Ciudad: BOGOTÁ

Reciba un cordial saludo de PASSUS IPS Taller Psicomotriz S.A.S.,

En PASSUS IPS estamos convencidos de que la recuperación depende de la asistencia, la constancia y la disciplina en el tratamiento. Por esta razón, no es posible realizar cancelaciones ni reprogramaciones de manera libre, ya que nuestro propósito es garantizar la adherencia al tratamiento de forma ordenada y continua.

La reprogramación de citas únicamente procede en los siguientes casos:

        1. Incapacidad médica debidamente soportada y coherente con las fechas de inasistencia o con las citas programadas.

Tenga en cuenta:

        1. Las sesiones asignadas deben cumplirse dentro del periodo de vigencia autorizado por su entidad de salud o por el profesional tratante.

        2. Si cuenta con vigencia activa y presenta el soporte dentro del tiempo establecido, se reprogramarán las sesiones pendientes.

Para registrar su solicitud:

 Adjunte los soportes correspondientes diligenciando el formulario en el siguiente enlace: <a href="https://fpqrs.passus.cloud/solicitud">[LINK]</a>.


En PASSUS trabajamos con un firme compromiso hacia la mejora continua y la calidad en la prestación de los servicios de salud y bienestar. Agradecemos su confianza y el haberse puesto en contacto con nosotros, pues sus solicitudes, comentarios y sugerencias son fundamentales para seguir fortaleciendo nuestro servicio en beneficio de todos los usuarios.

Cordialmente,

Área de Experiencia al Usuario
PASSUS IPS Taller Psicomotriz S.A.S.
',
            ],
                            [
                'nombre' => 'REPROGRAMACION O CANCELACIÓN JUSTIFICADA. ',
                'contenido' => '
Bogotá, [FECHA]

Señor(a) [NOMBRE]

Ciudad: BOGOTÁ

Reciba un cordial saludo de PASSUS IPS Taller Psicomotriz S.A.S.,

En atención a su solicitud de reprogramación, y tras la verificación de los documentos aportados, le confirmamos que estos cumplen con los requisitos establecidos (vigencia activa y soporte de incapacidad coherente con las fechas correspondientes).

Por lo anterior, se han cancelado las citas, las cuales pueden ser reprogramadas dentro del periodo autorizado (30 días) . Para mayor facilidad, usted puede proceder a reprogramar sus citas desde nuestra página web, en la opción “Agéndate aquí”, o directamente a través del siguiente link: <a href="https://oficinavirtual.passusips.com/login">Passus IPS | Oficina Virtual</a>.  Esta herramienta, disponible las 24 horas del día, le permitirá programar sus citas de Hidroterapia y consultas especializadas de manera ágil, segura y oportuna, desde cualquier lugar.  

En PASSUS trabajamos con un firme compromiso hacia la mejora continua y la calidad en la prestación de los servicios de salud y bienestar. Agradecemos su confianza y el haberse puesto en contacto con nosotros, pues sus solicitudes, comentarios y sugerencias son fundamentales para seguir fortaleciendo nuestro servicio en beneficio de todos los usuarios.

Cordialmente,

Área de Experiencia al Usuario
PASSUS IPS Taller Psicomotriz S.A.S.
',
            ],   
                            [
                'nombre' => 'RESPUESTA DE ENVIO DE INFORME FINAL ',
                'contenido' => '
Bogotá, [FECHA]

Señor(a) [NOMBRE]

Ciudad: BOGOTÁ

Reciba un cordial saludo de PASSUS IPS Taller Psicomotriz S.A.S.,

En atención a su solicitud de envío de informe final, y una vez verificados los documentos, me permito informarle que dicho informe ha sido remitido de forma automática al correo electrónico registrado en nuestro sistema. En caso de no haberlo recibido, le sugerimos revisar las carpetas de correo no deseado o spam.

En PASSUS trabajamos con un firme compromiso hacia la mejora continua y la calidad en la prestación de los servicios de salud y bienestar. Agradecemos su confianza y el haberse puesto en contacto con nosotros. Sus solicitudes, comentarios y sugerencias son fundamentales para seguir fortaleciendo nuestro servicio en beneficio de todos los usuarios. 


Cordialmente,

Área de Experiencia al Usuario
PASSUS IPS Taller Psicomotriz S.A.S.
',
            ],         
        ];

        foreach ($plantillas as $plantilla) {
            PlantillaRespuesta::create($plantilla);
        }
    }
}
