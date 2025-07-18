import React, { useState } from "react";
import "../pqrs/styles/Solicitudes.css";
import 'animate.css';
import { useNavigate } from 'react-router-dom';

export const Solicitudes = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [animationClass, setAnimationClass] = useState("");
  const navigate = useNavigate();

  const handleOpenModal = (type) => {
    setModalType(type);
    setAnimationClass("animate__animated animate__zoomIn");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType("");
    setAnimationClass("");
  };

  const startCloseAnimation = () => {
 setAnimationClass("animate__animated animate__zoomOut");
    setTimeout(() => {
      handleCloseModal();
    }, 1000);
  };

  const modalContent = {
    citas: {
      title: "Agendar citas",
      text: "Recuerda que puedes agendar tu cita de Hidroterapia directamente desde nuestra página web en la opción <a href='https://oficinavirtual.passusips.com/login' target='_blank' rel='noopener noreferrer'>Agéndate aqui</a> sin necesidad de registrar una solicitud.",
    },
    valoraciones: {
      title: "Lista de espera",
      text: "Actualmente no hay agenda disponible para esta especialidad. Puedes registrarte en la lista de espera y te contactaremos en cuanto se habiliten cupos.",
    },
    historia: {
      title: "Historia clínica",
      text: `Estimado usuario: <br />
            Los informes se envían automáticamente al correo electrónico registrado al finalizar la atención. Si no los ha recibido, le recomendamos revisar su bandeja de entrada, correo no deseado o spam. <br /><br />
            Si necesitas acceder a la historia clínica completa, tener en cuenta los siguientes requisitos según el tipo de solicitante para tramitar la solicitud de manera correcta:<br /><br />
            Requisitos según el solicitante:<br />

            1. Paciente directamente:
            Fotocopia de la cédula de ciudadanía.
            Diligenciar el siguiente formato: <a href='https://passusips.com/uploads/GPS-FT-10%20Formato%20de%20Solicitud%20de%20Historia%20Clinica%20por%20el%20paciente..pdf' target='_blank' rel='noopener noreferrer'>Formato de Solicitud por paciente</a>.<br /><br />

            2. Tercero autorizado:
            Fotocopia de la cédula del paciente y del autorizado.
            Soporte que acredite el parentesco (registro civil, acta de matrimonio).
            Diligenciar el siguiente formato: <a href='  https://passusips.com/uploads/GPS-FT-15%20Formato%20de%20Solicitud%20de%20Historia%20Clinica%20por%20tercero..pdf
            'target='_blank' rel='noopener noreferrer'>Formato de Solicitud por Tercero</a>.<br /><br />

            3. Paciente menor de edad:
            Registro civil o tarjeta de identidad (según edad).
            Registro civil que acredite el parentesco o documento que certifique la representación legal.
            Cédula de ciudadanía de los padres.
            Diligenciar el siguiente formato: <a href='https://passusips.com/uploads/GPS-FT-15%20Formato%20de%20Solicitud%20de%20Historia%20Clinica%20por%20tercero..pdf' target='_blank' rel='noopener noreferrer'>LINK</a>.<br /><br />
            <a>Nota</a>: Si el tercero no es familiar, debe presentar una autorización expresa o poder firmado por el paciente, en el que se manifieste la voluntad de otorgar acceso a su historia clínica.<br /><br />

            4. Paciente incapacitado o declarado interdicto:
            Certificado médico que evidencie el estado de salud del paciente.
            Documentos que acrediten el parentesco o la representación legal.
            Cédulas del paciente y del familiar o representante.
            En caso de interdicción, adjuntar la sentencia de interdicción y copia de la cédula del curador.
            Diligenciar el siguiente formato: <a href='https://passusips.com/uploads/GPS-FT-15%20Formato%20de%20Solicitud%20de%20Historia%20Clinica%20por%20tercero..pdf' target='_blank' rel='noopener noreferrer'>LINK</a>. <br /><br />

            Si desea realizar la <a href='http://localhost:5173/pqrsForm' target='_blank' rel='noopener noreferrer'>solicitud</a> por favor Adjuntar los soportes según corresponda. `,
    },
    multa: {
      title: "Exoneración de multa",
      text: `Estimado usuario: ¡Recuerde! <br /><br />

            Las multas por inasistencia solo podrán ser exoneradas si se presenta una justificación médica válida dentro de las 24 horas siguientes a la cita.<br /><br />

            Adicionalmente, le informamos que PASSUS IPS únicamente realiza reembolsos en los siguientes casos específicos:<br /><br />

            • Cuando durante la valoración inicial se determina que el paciente no es apto para ingresar al programa de hidroterapia.<br />
            • Cuando, por criterio médico debidamente soportado, se considera que el paciente no debe continuar con terapias en agua, siempre y cuando no haya asistido a más de dos (2) sesiones acuáticas.<br /><br />

            Agradecemos su comprensión y compromiso con el cumplimiento de nuestras políticas.<br /><br />

            Si desea realizar la <a href='http://localhost:5173/pqrsForm' target='_blank' rel='noopener noreferrer'>solicitud</a> por favor adjuntar el soportes médico según corresponda.`,
    },
    reprogramacion: {
      title: "Reprogramación o cancelación",
      text: `Estimado usuario: <br /><br />
            Su mejoría depende directamente de la asistencia, constancia y disciplina durante el tratamiento. Por esta razón, PASSUS IPS no realiza cancelaciones ni reprogramaciones de citas de forma libre, ya que buscamos promover la adherencia al tratamiento ordenado y continuo.<br /><br />
            La cancelación o inasistencia a citas puede afectar negativamente su progreso y reducir la efectividad del proceso de recuperación.<br /><br />

            Solo se permite la reprogramación de citas en caso de incapacidad médica.<br /><br />

            Si usted no asistió o no podrá asistir por motivos médicos, debe enviar la incapacidad al correo electrónico correspondiente.

            Esta debe ser coherente con los días de inasistencia o con las citas ya programadas que no podrá tomar.<br /><br />
            Recuerde que cuenta con un número de sesiones asignadas que deben ser tomadas dentro del periodo de vigencia autorizado por el profesional tratante o la entidad de salud.<br /><br />

            Si aún cuenta con vigencia activa y envía la incapacidad dentro del tiempo establecido, se procederá con la reprogramación de las sesiones pendientes.<br /><br />

            Si desea registrar una solicitud, por favor adjunte los soportes médicos correspondientes o exponga claramente el motivo en el detalle de la solicitud.`
,
    },
    info: {
      title: "Información general",
      text: "Por favor revisa nuestro centro de ayuda o chatbot, donde respondemos preguntas frecuentes.  <a href='/pqrsForm'>  ¿Deseas continuar con una solicitud personalizada?</a>",
    },
    reembolsos: {
      title: "Reembolsos",
      text: `
          Estimado usuario:<br /><br />
          PASSUS IPS realiza reembolsos únicamente en los siguientes casos:<br /><br />
          • Cuando, durante la valoración inicial, se determina que el paciente no es apto para ingresar al programa de hidroterapia.<br />
          • Cuando, por criterio médico debidamente soportado, se considera que el paciente no debe realizar terapias en agua, siempre y cuando no haya asistido a más de dos (2) sesiones acuáticas.<br /><br />
          Si su caso corresponde a alguna de estas situaciones, por favor registre la <a href='/pqrsForm'>solicitud</a> y adjunte los soportes médicos correspondientes o explique claramente el motivo en el detalle de la solicitud.<br /><br />
          Agradecemos su atención y comprensión.
        `,
    },
  };

  return (
    <>
      {isModalOpen && (
        <div id="modal-container">
          <div className="modal-background" onClick={startCloseAnimation}>
            <div
              className={`modal ${animationClass}`}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>{modalContent[modalType]?.title}</h2>
              <p
                dangerouslySetInnerHTML={{
                  __html: modalContent[modalType]?.text,
                }}
                onClick={(e) => {
                  const target = e.target;
                  if (target.tagName === 'A' && target.getAttribute('href') === '/pqrsForm') {
                    e.preventDefault();
                    navigate('/pqrsForm');
                  }
                }}
              ></p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startCloseAnimation();
                }}
                style={{ marginTop: "20px" }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="content">
        <div className="pqrs-container">
          <div className="header-pqrs">
            <div>
              <i className="fas fa-file-pen big-icon"></i>
              Registra tus <span>Solicitudes</span>
              <h6>Tipos de solicitudes</h6>
              <p className="parrafo-solicitudes">
                Por favor lee atentamente las descripciones de los tipos de
                SOLICITUDES y cuéntanos tu experiencia
              </p>
            </div>
          </div>
        </div>

        <div className="buttons">
          <div className="card" onClick={() => handleOpenModal("citas")}>
            <i className="fas fa-calendar-check icon"></i>
            <span>Agendar citas</span>
          </div>
          <div className="card" onClick={() => handleOpenModal("info")}>
            <i className="fas fa-info-circle icon"></i>
            <span>Información General</span>
          </div>
          <div className="card" onClick={() => handleOpenModal("reembolsos")}>
            <i className="fas fa-file-invoice-dollar icon"></i>
            <span>Reembolsos</span>
          </div>
          <div className="card" onClick={() => handleOpenModal("valoraciones")}>
            <i className="fas fa-user-clock icon"></i>
            <span>Valoraciones sin agenda - Lista de espera</span>
          </div>
          <div className="card" onClick={() => handleOpenModal("multa")}>
            <i className="fas fa-ban icon"></i>
            <span>Exoneración de Multa por Inasistencia</span>
          </div>
          <div className="card" onClick={() => handleOpenModal("historia")}>
            <i className="fas fa-file-medical icon"></i>
            <span>Envío de Historia Clínica ó Informes Finales</span>
          </div>
          <div className="card" onClick={() => handleOpenModal("reprogramacion")}>
            <i className="fas fa-calendar-times icon"></i>
            <span>Reprogramación ó Cancelación de Citas</span>
          </div>
        </div>
      </div>
    </>
  );
};



















// import React, { useState } from "react";
// import "../pqrs/styles/Solicitudes.css";
// import { Link } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';

// export const Solicitudes = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalType, setModalType] = useState("");
//   const [modalAnimationType, setModalAnimationType] = useState("one");
//   const navigate = useNavigate();

//   const handleOpenModal = (type) => {
//     setModalType(type);
//     setModalAnimationType("one");
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setModalType("");
//     setModalAnimationType("");
//   };

//   const modalContent = {
//     citas: {
//       title: "Agendar citas",
//       text: "Recuerda que puedes agendar tu cita de Hidroterapia directamente desde nuestra página web en la opción <a href='https://oficinavirtual.passusips.com/login' target='_blank' rel='noopener noreferrer'>Agéndate aqui</a> sin necesidad de registrar una solicitud.",
//     },
//     valoraciones: {
//       title: "Lista de espera",
//       text: "Actualmente no hay agenda disponible para esta especialidad. Puedes registrarte en la lista de espera y te contactaremos en cuanto se habiliten cupos.",
//     },
//     historia: {
//       title: "Historia clínica",
//       text: `Estimado usuario: <br />
//             Los informes se envían automáticamente al correo electrónico registrado al finalizar la atención. Si no los ha recibido, le recomendamos revisar su bandeja de entrada, correo no deseado o spam. <br /><br />
//             Si necesitas acceder a la historia clínica completa, tener en cuenta los siguientes requisitos según el tipo de solicitante para tramitar la solicitud de manera correcta:<br /><br />
//             Requisitos según el solicitante:<br />

//             1. Paciente directamente:
//             Fotocopia de la cédula de ciudadanía.
//             Diligenciar el siguiente formato: <a href='https://passusips.com/uploads/GPS-FT-10%20Formato%20de%20Solicitud%20de%20Historia%20Clinica%20por%20el%20paciente..pdf' target='_blank' rel='noopener noreferrer'>Formato de Solicitud por paciente</a>.<br /><br />

//             2. Tercero autorizado:
//             Fotocopia de la cédula del paciente y del autorizado.
//             Soporte que acredite el parentesco (registro civil, acta de matrimonio).
//             Diligenciar el siguiente formato: <a href='  https://passusips.com/uploads/GPS-FT-15%20Formato%20de%20Solicitud%20de%20Historia%20Clinica%20por%20tercero..pdf
//             'target='_blank' rel='noopener noreferrer'>Formato de Solicitud por Tercero</a>.<br /><br />

//             3. Paciente menor de edad:
//             Registro civil o tarjeta de identidad (según edad).
//             Registro civil que acredite el parentesco o documento que certifique la representación legal.
//             Cédula de ciudadanía de los padres.
//             Diligenciar el siguiente formato: <a href='https://passusips.com/uploads/GPS-FT-15%20Formato%20de%20Solicitud%20de%20Historia%20Clinica%20por%20tercero..pdf' target='_blank' rel='noopener noreferrer'>LINK</a>.<br /><br />
//             <a>Nota</a>: Si el tercero no es familiar, debe presentar una autorización expresa o poder firmado por el paciente, en el que se manifieste la voluntad de otorgar acceso a su historia clínica.<br /><br />

//             4. Paciente incapacitado o declarado interdicto:
//             Certificado médico que evidencie el estado de salud del paciente.
//             Documentos que acrediten el parentesco o la representación legal.
//             Cédulas del paciente y del familiar o representante.
//             En caso de interdicción, adjuntar la sentencia de interdicción y copia de la cédula del curador.
//             Diligenciar el siguiente formato: <a href='https://passusips.com/uploads/GPS-FT-15%20Formato%20de%20Solicitud%20de%20Historia%20Clinica%20por%20tercero..pdf' target='_blank' rel='noopener noreferrer'>LINK</a>. <br /><br />

//             Si desea realizar la <a href='http://localhost:5173/pqrsForm' target='_blank' rel='noopener noreferrer'>solicitud</a> por favor Adjuntar los soportes según corresponda. `,
//     },
//     multa: {
//       title: "Exoneración de multa",
//       text: `Estimado usuario: ¡Recuerde! <br /><br />

//             Las multas por inasistencia solo podrán ser exoneradas si se presenta una justificación médica válida dentro de las 24 horas siguientes a la cita.<br /><br />

//             Adicionalmente, le informamos que PASSUS IPS únicamente realiza reembolsos en los siguientes casos específicos:<br /><br />

//             • Cuando durante la valoración inicial se determina que el paciente no es apto para ingresar al programa de hidroterapia.<br />
//             • Cuando, por criterio médico debidamente soportado, se considera que el paciente no debe continuar con terapias en agua, siempre y cuando no haya asistido a más de dos (2) sesiones acuáticas.<br /><br />

//             Agradecemos su comprensión y compromiso con el cumplimiento de nuestras políticas.<br /><br />

//             Si desea realizar la <a href='http://localhost:5173/pqrsForm' target='_blank' rel='noopener noreferrer'>solicitud</a> por favor adjuntar el soportes médico según corresponda.`,
//     },
//     reprogramacion: {
//       title: "Reprogramación o cancelación",
//       text: `Estimado usuario: <br /><br />
//             Su mejoría depende directamente de la asistencia, constancia y disciplina durante el tratamiento. Por esta razón, PASSUS IPS no realiza cancelaciones ni reprogramaciones de citas de forma libre, ya que buscamos promover la adherencia al tratamiento ordenado y continuo.<br /><br />
//             La cancelación o inasistencia a citas puede afectar negativamente su progreso y reducir la efectividad del proceso de recuperación.<br /><br />

//             Solo se permite la reprogramación de citas en caso de incapacidad médica.<br /><br />

//             Si usted no asistió o no podrá asistir por motivos médicos, debe enviar la incapacidad al correo electrónico correspondiente.

//             Esta debe ser coherente con los días de inasistencia o con las citas ya programadas que no podrá tomar.<br /><br />
//             Recuerde que cuenta con un número de sesiones asignadas que deben ser tomadas dentro del periodo de vigencia autorizado por el profesional tratante o la entidad de salud.<br /><br />

//             Si aún cuenta con vigencia activa y envía la incapacidad dentro del tiempo establecido, se procederá con la reprogramación de las sesiones pendientes.<br /><br />

//             Si desea registrar una solicitud, por favor adjunte los soportes médicos correspondientes o exponga claramente el motivo en el detalle de la solicitud.`
// ,
//     },
//     info: {
//       title: "Información general",
//       text: "Por favor revisa nuestro centro de ayuda o chatbot, donde respondemos preguntas frecuentes.  <a href='/pqrsForm'>  ¿Deseas continuar con una solicitud personalizada?</a>",
//     },
//     reembolsos: {
//       title: "Reembolsos",
//       text: `
//           Estimado usuario:<br /><br />
//           PASSUS IPS realiza reembolsos únicamente en los siguientes casos:<br /><br />
//           • Cuando, durante la valoración inicial, se determina que el paciente no es apto para ingresar al programa de hidroterapia.<br />
//           • Cuando, por criterio médico debidamente soportado, se considera que el paciente no debe realizar terapias en agua, siempre y cuando no haya asistido a más de dos (2) sesiones acuáticas.<br /><br />
//           Si su caso corresponde a alguna de estas situaciones, por favor registre la <a href='/pqrsForm'>solicitud</a> y adjunte los soportes médicos correspondientes o explique claramente el motivo en el detalle de la solicitud.<br /><br />
//           Agradecemos su atención y comprensión.
//         `,
//     },
//   };

//   return (
//     <>
//       {isModalOpen && (
//         <div id="modal-container" className={modalAnimationType}>
//           <div className="modal-background">
//             {/* Evita que los clics dentro del modal no cierren el modal */}
//             <div className="modal" onClick={(e) => e.stopPropagation()}>
//               <h2>{modalContent[modalType]?.title}</h2>
//               <p
//   dangerouslySetInnerHTML={{
//     __html: modalContent[modalType]?.text,
//   }}
//   onClick={(e) => {
//     const target = e.target;
//     if (target.tagName === 'A' && target.getAttribute('href') === '/pqrsForm') {
//       e.preventDefault();
//       navigate('/pqrsForm');
//     }
//   }}
// ></p>

//               <svg
//                 className="modal-svg"
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="100%"
//                 height="100%"
//                 preserveAspectRatio="none"
//               >
//                 <rect
//                   x="0"
//                   y="0"
//                   fill="none"
//                   width="226"
//                   height="162"
//                   rx="3"
//                   ry="3"
//                 ></rect>
//               </svg>
//               <button
//                 onClick={() => {
//                   setModalAnimationType("out"); // Inicia la animación de salida
//                   setTimeout(() => {
//                     handleCloseModal(); // Cierra el modal luego de la animación
//                   }, 1000); // Duración igual a la animación CSS (1s)
//                 }}
//                 style={{ marginTop: "20px" }}
//               >
//                 Cerrar
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="content">
//         <div className="pqrs-container">
//           <div className="header-pqrs">
//             <div>
//               <i className="fas fa-file-pen big-icon"></i>
//               Registra tus <span>Solicitudes</span>
//               <h6>Tipos de solicitudes</h6>
//               <p className="parrafo-solicitudes">
//                 Por favor lee atentamente las descripciones de los tipos de
//                 SOLICITUDES y cuéntanos tu experiencia
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="buttons">
//           <div className="card" onClick={() => handleOpenModal("citas")}>
//             <i className="fas fa-calendar-check icon"></i>
//             <span>Agendar citas</span>
//           </div>
//           <div className="card" onClick={() => handleOpenModal("info")}>
//             <i className="fas fa-info-circle icon"></i>
//             <span>Información General</span>
//           </div>
//           <div className="card" onClick={() => handleOpenModal("reembolsos")}>
//             <i className="fas fa-file-invoice-dollar icon"></i>
//             <span>Reembolsos</span>
//           </div>
//           <div className="card" onClick={() => handleOpenModal("valoraciones")}>
//             <i className="fas fa-user-clock icon"></i>
//             <span>Valoraciones sin agenda - Lista de espera</span>
//           </div>
//           <div className="card" onClick={() => handleOpenModal("multa")}>
//             <i className="fas fa-ban icon"></i>
//             <span>Exoneración de Multa por Inasistencia</span>
//           </div>
//           <div className="card" onClick={() => handleOpenModal("historia")}>
//             <i className="fas fa-file-medical icon"></i>
//             <span>Envío de Historia Clínica ó Informes Finales</span>
//           </div>
//           <div
//             className="card"
//             onClick={() => handleOpenModal("reprogramacion")}
//           >
//             <i className="fas fa-calendar-times icon"></i>
//             <span>Reprogramación ó Cancelación de Citas</span>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };
