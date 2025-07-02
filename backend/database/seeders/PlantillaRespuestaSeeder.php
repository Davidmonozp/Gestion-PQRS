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
                'nombre' => 'ASIGNACION DE CITAS',
                'contenido' =>

                'Señor(a) [NOMBRE]

                Ciudad: BOGOTÁ

                Cordial saludo,

                Por medio de la presente acusamos recibido de su SOLICITUD presentada el día [PQR_CREADA] donde insta ASIGNACION DE CITAS.

                Atendiendo a su solicitud y siguiendo el conducto regular, se hace envío de ASIGNACION DE CITA [XXXX] de la paciente [PACIENTE] identificada (o) con [TIPO_DOC]. No. [NUMERO_DOC] esta se encuentra adjunta a este correo.

                Passus IPS Taller Psicomotriz SAS, comprometido con la mejora continua en pro de la calidad de la prestación de sus servicios brindada por nuestros profesionales y demás colaboradores. Agradecemos haberse puesto en contacto con nosotros, para expresar sus felicitaciones, inquietudes y sugerencias que nos permiten definir acciones en beneficio de todos nuestros usuarios.

                Cordialmente;',
            ],
            [
                'nombre' => 'CANCELACION DE CITAS',
                'contenido' => '

                Bogotá, [CIUDAD]

                Señor (a) [NOMBRE]

                Ciudad: BOGOTÁ

                Cordial saludo,

                Por medio de la presente acusamos recibido de su SOLICITUD presentada el día [PQR_CREADA] donde insta CANCELACION DE CITAS.

                Atendiendo a su solicitud, adjunto se hace envío del documento soporte de CANCELACION DE CITAS DE [XXXX] de la paciente [NOMBRE] identificada (o) con [TIPO_DOC]. No.[NUMERO_DOC].

                Recordando nuestros canales para asignación de citas y reprogramación en nuestro Callcenter teléfono fijo de contacto (601)3161699

                Horarios de atención: lunes a viernes: 7:30 am a 5:30 pm, Sábados: 8: 00 am a 1:00 pm

                Cancelar tu cita médica cuando no puedas asistir no solo es una muestra de cortesía hacia el personal médico, sino también de consideración hacia otros pacientes que podrían necesitar ese espacio para recibir atención. Al cancelar con anticipación, estás brindando la oportunidad a alguien más de acceder a los servicios médicos necesarios.

                Señor usuario, recuerde que sus datos serán tratados de acuerdo con lo establecido en la Ley estatutaria 1581 de 2012 de Habeas Data. Los tiempos de respuesta están sujetos a lo dispuesto.

                Cordialmente,
                ',
            ],
            [
                'nombre' => 'DIRECCIONAR AL CALLCENTER PARA ASIGNACION DE CITAS',
                'contenido' => '

                Bogotá, [CIUDAD]

                Señor (a) [NOMBRE]

                Ciudad: BOGOTÁ

                Cordial saludo,

                Agradecemos haberse puesto en contacto con nosotros, para expresar sus felicitaciones, inquietudes y sugerencias, teniendo en cuenta que Passus IPS Taller Psicomotriz SAS, está comprometido con la mejora continua para la prestación de sus servicios proporcionada por nuestros profesionales y demás colaboradores.

                Nos permitimos precisar lo siguiente:

                1-Nuestro canal para asignación de citas y reprogramación es el CALLCENTER teléfono fijo de contacto (601)3161699.

                Horarios de atención: lunes a viernes: 7:30 am a 5:30 pm

                                      Sábados: 8: 00 am a 1:00 pm

                2-Para lograr una asignación satisfactoria de la cita, es importante contar con la   autorización e información del paciente al alcance.

                3-Si experimenta algún problema al intentar comunicarse con nuestro call center, no dude en contactarnos por escrito. Estamos aquí para ayudarlo y resolver cualquier inconveniente que pueda surgir.

                Señor usuario, recuerde que sus datos serán tratados de acuerdo con lo establecido en la Ley estatutaria 1581 de 2012 de Habeas Data. Los tiempos de respuesta están sujetos a lo dispuesto.

                Cordialmente,
                ',
            ],
            [
                'nombre' => 'EXONERACION DE MULTAS',
                'contenido' => '

                Bogotá, [CIUDAD]

                Señor (a) [NOMBRE]

                Ciudad: BOGOTÁ

                Cordial saludo,

                Por medio de la presente acusamos recibido de la SOLICITUD presentada el día [PQR_CREADA] donde insta EXONERACION DE MULTA POR INASISTENCIA.

                Atendiendo a su solicitud y siguiendo el conducto regular, verificando el caso de la paciente [NOMBRE] identificado (a) con [TIPO_DOC]. No. [NUMERO_DOC] nos permitimos informar:

                Como institución prestadora de servicios de salud, nos acogemos a la ley 1438 de 2011, la cual establece MULTA POR INASISTENCIAS INJUSTIFICADAS a las sesiones de hidroterapia, esta multa se está aplicando desde el mes de marzo del año 2023.

                Analizando la situación y teniendo en cuenta que fue una situación justificada se EXONERA LA MULTA POR INASTISTENCIA, se registra la información y previa justificación en nuestro sistema de información como control del proceso realizado.

                Es importante recordar que para CANCELAR o REPROGRAMAR sus terapias debe realizarlo con 48 horas de anticipación, las únicas excepciones que aceptamos fuera del plazo establecido son aquellas que cuentan con incapacidad, soportes médicos o casos fortuitos justificados presentados durante la fecha de la cita asignada.

                Passus IPS Taller Psicomotriz SAS, comprometido con la mejora continua en pro de la calidad de la prestación de sus servicios brindada por nuestros profesionales y demás colaboradores. Agradecemos haberse puesto en contacto con nosotros, para expresar sus felicitaciones, inquietudes y sugerencias que nos permiten definir acciones en pro de todos nuestros usuarios.

                Cordialmente,
                ',
            ],
            [
                'nombre' => 'INFORMACION DEL COBRO MULTA',
                'contenido' => '
               
                Bogotá, [CIUDAD]

                Señor (a) [NOMBRE]

                Ciudad: BOGOTÁ

                Cordial saludo,

                Por medio de la presente acusamos recibido de la SOLICITUD presentada el día [PQR_CREADA] donde insta REPROGRAMACIÓN DE TERAPIAS.

                Atendiendo a su solicitud y siguiendo el conducto regular, nos permitimos informar que, como institución prestadora de servicios de salud, nos acogemos a la ley 1438 de 2011, la cual establece MULTA POR INASISTENCIAS INJUSTIFICADAS a las sesiones de hidroterapia esta multa se está aplicando desde el mes de Marzo del 2023.

                Es importante recordar que para CANCELAR o REPROGRAMAR sus terapias debe realizarlo con 48 horas de anticipación, o atreves únicas excepciones que aceptamos fuera del plazo establecido son aquellas que cuentan con incapacidad, soportes médicos o casos fortuitos justificados presentados durante la fecha de la cita asignada, estos deben ser enviados al correo atencionalusuario@passusips.com con datos completos y llamar al callcenter para reprogramar TEL: (601) 3161699.

                Cordialmente,

                ',
            ],
            [
                'nombre' => 'QUEJA O SUGERENCIA',
                'contenido' => 

                'Bogotá, [CIUDAD]

                Señor (a) [NOMBRE]

                Ciudad: BOGOTÁ

                Estimado(a) Sr(a),

                Reciba un cordial saludo de parte de PASSUS IPS TALLER PSICOMOTRIZ S.A.S. Queremos expresarle lo importante que es para nosotros conocer todas sus inquietudes, solicitudes, inconformidades y felicitaciones, ya que nos impulsan a fortalecer nuestros procesos.

                Agradecemos de antemano sus comentarios sobre la situación que ha experimentado, ya que estos son fundamentales para nuestro continuo mejoramiento. Tengan la certeza de que los involucrados recibirán retroalimentación en cuanto al cumplimiento de nuestras políticas, y se realizarán ajustes en los procesos, si es necesario. Nuestra entidad se encuentra en constante búsqueda de la excelencia y está comprometida con altos estándares de calidad.

                En respuesta a las situaciones presentadas, deseamos informarle lo siguiente:

                Passus IPS Taller Psicomotriz SAS, comprometido con la mejora continua en pro de la calidad de la prestación de sus servicios brindada por nuestros profesionales y demás colaboradores.

                Agradecemos haberse puesto en contacto con nosotros.

                Cordialmente;             
                ',
            ],
            [
                'nombre' => 'REITERACION DE MULTAS',
                'contenido' => '
               
                Bogotá, [CIUDAD]

                Señor (a) [NOMBRE]

                Ciudad: BOGOTÁ

                Estimado(a) Sr(a),

                Reciba un cordial saludo de parte de PASSUS IPS TALLER PSICOMOTRIZ S.A.S. Queremos expresarle lo importante que es para nosotros conocer todas sus inquietudes, solicitudes, inconformidades y felicitaciones, ya que nos impulsan a fortalecer nuestros procesos.

                Agradecemos de antemano sus comentarios sobre la situación que ha experimentado, ya que estos son fundamentales para nuestro continuo mejoramiento. Tengan la certeza de que los involucrados recibirán retroalimentación en cuanto al cumplimiento de nuestras políticas, y se realizarán ajustes en los procesos, si es necesario. Nuestra entidad se encuentra en constante búsqueda de la excelencia y está comprometida con altos estándares de calidad.

                En respuesta a las situaciones presentadas, deseamos informarle lo siguiente:

                Passus IPS Taller Psicomotriz SAS, comprometido con la mejora continua en pro de la calidad de la prestación de sus servicios brindada por nuestros profesionales y demás colaboradores.

                Agradecemos haberse puesto en contacto con nosotros.

                Cordialmente;
                ',
            ],
            [
                'nombre' => 'RESPUESTA DE INASISTENCIA',
                'contenido' => '               
                
                Bogotá, [CIUDAD]

                Señor (a) [NOMBRE]

                Ciudad: BOGOTÁ


                Cordial saludo,

                Passus IPS Taller Psicomotriz SAS, comprometido con la mejora continua en pro de la calidad de la prestación de sus servicios brindada por nuestros profesionales y demás colaboradores. Agradecemos haberse puesto en contacto con nosotros, para expresar sus felicitaciones, inquietudes y sugerencias que nos permiten detectar debilidades de manera oportuna para fortalecernos día a día.

                Nos permitimos precisar lo siguiente:

                1. Asignamos cita y la paciente no asistió, adjuntamos soporte de inasistencia.

                2. Al cancelar con anticipación, estás brindando la oportunidad a alguien más de acceder a los servicios médicos necesarios.

                3. Además, cancelar tu cita médica te permite gestionar mejor tu tiempo y agenda. Al hacerlo, podrás reprogramar tu cita en un momento más conveniente y asegurarte de recibir la atención que necesitas sin interrupciones.

                Tenemos diferentes canales de comunicación que la institución tiene habilitado para su practicidad, teléfono fijo de contacto (601) 3161699, correo institucional atencionalusuario@passusips.com, buzón de sugerencia (ubicado en cada una de nuestras sedes).

                Señor usuario, recuerde que sus datos serán tratados de acuerdo con lo establecido en la Ley estatutaria 1581 de 2012 de Habeas Data. Los tiempos de respuesta están sujetos a lo dispuesto.

                Cordialmente,

                ',
            ],
            [
                'nombre' => 'RESPUESTA GENREAL',
                'contenido' => '
               
                Bogotá, [CIUDAD]

                Señor (a) [NOMBRE]

                Ciudad: BOGOTÁ

                Cordial saludo,

                Passus IPS Taller Psicomotriz SAS, comprometido con la mejora continua en pro de la calidad de la prestación de sus servicios brindada por nuestros profesionales y demás colaboradores. Agradecemos haberse puesto en contacto con nosotros, para expresar sus felicitaciones, inquietudes y sugerencias que nos permiten detectar debilidades de manera oportuna para fortalecernos día a día.

                Nos permitimos precisar lo siguiente:

                1.

                2. 

                Tenemos diferentes canales de comunicación que la institución tiene habilitado para su practicidad, teléfono fijo de contacto (601)3161699, correo institucional atencionalusuario@passusips.com, buzón de sugerencia (ubicado en cada una de nuestras sedes).

                Señor usuario, recuerde que sus datos serán tratados de acuerdo con lo establecido en la Ley estatutaria 1581 de 2012 de Habeas Data. Los tiempos de respuesta están sujetos a lo dispuesto.

                Cordialmente,
                ',
            ],
            [
                'nombre' => 'TRASLADO DE SEDE',
                'contenido' => '
               
                
                Bogotá, [CIUDAD]

                Señor (a) [NOMBRE]

                Ciudad: BOGOTÁ

                Cordial saludo,

                Passus IPS Taller Psicomotriz SAS, comprometido con la mejora continua en pro de la calidad de la prestación de sus servicios brindada por nuestros profesionales y demás colaboradores. Agradecemos haberse puesto en contacto con nosotros, para expresar sus felicitaciones, inquietudes y sugerencias que nos permiten detectar debilidades de manera oportuna para fortalecernos día a día.

                Nos permitimos precisar lo siguiente:

                PASSUS IPS, de acuerdo nuestro modelo de atención alineado con su EPS, usted debe continuar las terapias donde fueron asignadas en este caso en [CIUDAD], por motivos de facturación.

                Si su médico tratante le ordena más terapias, si las podemos agendar en la sede que usted guste, pero sobre esta misma autorización ya agendada y asistida no es posible realizar el traslado, agradecemos continuar con sus sesiones en la sede asignada mientras la EPS genera un nueva Autorización.

                Tenemos diferentes canales de comunicación que la institución tiene habilitado para su practicidad, teléfono fijo de contacto (601)3161699, correo institucional atencionalusuario@passusips.com, buzón de sugerencia (ubicado en cada una de nuestras sedes).

                Señor usuario, recuerde que sus datos serán tratados de acuerdo con lo establecido en la Ley estatutaria 1581 de 2012 de Habeas Data. Los tiempos de respuesta están sujetos a lo dispuesto.

                Cordialmente,
                ',
            ],
               [
                'nombre' => 'MODELO PARA REPROGRAMACION DE CITAS',
                'contenido' => '               
                
                Bogotá, [CIUDAD]

                Señor(a) [NOMBRE]

                Ciudad: BOGOTÁ



                Cordial saludo,

                Passus IPS Taller Psicomotriz SAS, comprometido con la mejora continua en pro de la calidad de la prestación de sus servicios brindada por nuestros profesionales y demás colaboradores. Agradecemos haberse puesto en contacto con nosotros, para expresar sus felicitaciones, inquietudes y sugerencias que nos permiten detectar debilidades de manera oportuna para fortalecernos día a día.

                Nos permitimos precisar lo siguiente:

                PASSUS IPS tiene un modelo de reprogramación de citas por incapacidad. Si usted no asistió debe de enviar incapacidad médica que concuerde con los días que falló a su cita ya programada. Recuerde que usted cuenta con un # de sesiones que debe de tomar dentro de la vigencia asignada. Si usted todavía cuenta con vigencia en PASSUS y envía incapacidad dentro del tiempo asignado se le realizará la reprogramación.

                Tenemos diferentes canales de comunicación que la institución tiene habilitado para su practicidad, teléfono fijo de contacto (601) 3161699, correo institucional atencionalusuario@passusips.com, buzón de sugerencia (ubicado en cada una de nuestras sedes).

                Señor usuario, recuerde que sus datos serán tratados de acuerdo con lo establecido en la Ley estatutaria 1581 de 2012 de Habeas Data. Los tiempos de respuesta están sujetos a lo dispuesto.

                Cordialmente,
                ',
            ],
        ];

        foreach ($plantillas as $plantilla) {
            PlantillaRespuesta::create($plantilla);
        }
    }
}
