import React, { useState } from "react";
import "../pqrs/styles/Solicitudes.css";
import "animate.css";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

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

  const startCloseAnimation = (callback) => {
    setAnimationClass("animate__zoomOut");
    setTimeout(() => {
      setIsModalOpen(false);
      setAnimationClass("animate__zoomIn");
      if (callback) callback();
    }, 500);
  };

  const modalContent = {
    citas: {
      title: "Agendar citas",
      text: "<strong> Estimado usuario:</strong><br/> Recuerda que puedes agendar tu cita directamente desde nuestra página web en la opción <a href='https://oficinavirtual.passusips.com/login' target='_blank' rel='noopener noreferrer'>Agéndate aqui</a> sin necesidad de registrar una solicitud.",
    },
    valoraciones: {
      title: "Lista de espera",
      text: "Actualmente no hay agenda disponible para esta especialidad. Puedes registrarte en la lista de espera y te contactaremos en cuanto se habiliten cupos.",
    },
    historia: {
      title: "Historia clínica",
      text: `Estimado usuario: <br />
            Los informes se envían automáticamente al correo electrónico   registrado al finalizar la atención. Si no los ha recibido, le recomendamos   revisar su bandeja de entrada, correo no deseado o spam.<br /><br />
            Si no recibiste la información o necesitas la historia clínica completa por favor debes tener en cuenta   los siguientes requisitos según el tipo de solicitante para tramitar la   solicitud de manera correcta. <br /><br />
            Requisitos según el solicitante:<br /><br />

            1. Paciente directamente:<br/>
              • Fotocopia de la cédula de ciudadanía.<br />
              • Diligenciar el siguiente formato: <a href='https://passusips.com/uploads/GPS-FT-10%20Formato%20de%20Solicitud%20de%20Historia%20Clinica%20por%20el%20paciente..pdf' target='_blank' rel='noopener noreferrer'>Formato de Solicitud por paciente</a>.<br /><br />

            2. Tercero autorizado:<br />
              • Fotocopia de la cédula del paciente y del autorizado.<br />
              • Soporte que acredite el parentesco (registro civil, acta de matrimonio).<br />
              • Diligenciar el siguiente formato: <a href='  https://passusips.com/uploads/GPS-FT-15%20Formato%20de%20Solicitud%20de%20Historia%20Clinica%20por%20tercero..pdf
            'target='_blank' rel='noopener noreferrer'>Formato de Solicitud por Tercero</a>.<br /><br />

            3. Paciente menor de edad:<br />
              • Registro civil o tarjeta de identidad (según edad).<br />
              • Registro civil que acredite el parentesco o documento que certifique la representación legal.<br />
              • Cédula de ciudadanía de los padres.<br />
              • Diligenciar el siguiente formato: <a href='https://passusips.com/uploads/GPS-FT-15%20Formato%20de%20Solicitud%20de%20Historia%20Clinica%20por%20tercero..pdf' target='_blank' rel='noopener noreferrer'>LINK</a>.<br /><br />
            <a>Nota</a>: Si el tercero no es familiar, debe presentar una autorización expresa o poder firmado por el paciente, en el que se manifieste la voluntad de otorgar acceso a su historia clínica.<br /><br />

            4. Paciente incapacitado o declarado interdicto:<br />
              • Certificado médico que evidencie el estado de salud del paciente.<br />
              • Documentos que acrediten el parentesco o la representación legal.<br />
              • Cédula del paciente y del familiar o representante.<br />
              • En caso de interdicción, adjuntar la sentencia de interdicción y copia de la cédula del curador.<br />
              • Diligenciar el siguiente formato: <a href='https://passusips.com/uploads/GPS-FT-15%20Formato%20de%20Solicitud%20de%20Historia%20Clinica%20por%20tercero..pdf' target='_blank' rel='noopener noreferrer'>LINK</a>. <br /><br />
            Si desea realizar la <strong>solicitud</strong> por favor Adjuntar los soportes según corresponda. `,
    },
    multa: {
      title: "Exoneración de multa",
      text: `Estimado usuario: <strong>¡Recuerde!</strong> <br /><br />

            Las multas por inasistencia solo podrán ser exoneradas si se presenta una justificación médica válida dentro de las 24 horas siguientes a la cita.<br /><br />

            Adicionalmente, le informamos que PASSUS IPS únicamente realiza reembolsos en los siguientes casos específicos:<br /><br />

            • Cuando, durante la valoración inicial se determina que el paciente no es apto para ingresar al programa de hidroterapia.<br />
            • Cuando, por criterio médico debidamente soportado, se considera que el paciente no debe continuar con terapias en agua, siempre y cuando no haya asistido a más de dos (2) sesiones acuáticas.<br /><br />

            Agradecemos su comprensión y compromiso con el cumplimiento de nuestras políticas.<br /><br />

            Si desea realizar la <strong>solicitud</strong> por favor adjuntar los soportes médicos según corresponda.`,
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

            Si desea registrar una solicitud, por favor adjunte los soportes médicos correspondientes o exponga claramente el motivo en el detalle de la solicitud.`,
    },
    info: {
      title: "Información general",
      text: "Por favor revisa nuestro centro de ayuda o chatbot, donde respondemos preguntas frecuentes.  <a href='/solicitud'>  ¿Deseas continuar con una solicitud personalizada?</a>",
    },
    reembolsos: {
      title: "Reembolsos",
      text: `
            Estimado usuario:<br /><br />
            En PASSUS IPS los reembolsos se realizan únicamente en los siguientes casos:<br /><br />
            1. Cuando, durante la valoración inicial, se determina que el paciente no es apto para ingresar al programa de hidroterapia.<br />
            2. Cuando, por criterio médico debidamente soportado, se considera que el paciente no debe realizar terapias en agua, siempre y cuando no haya asistido a más de dos (2) sesiones acuáticas.<br /><br />

            <strong>Documentos requeridos para la solicitud de reembolso:</strong><br /><br />
            • Certificación bancaria.<br />
            • Carta de autorización de consignación a un tercero (si aplica).<br />
            • Soporte médico.<br />
            • Soporte de pago o transacción. <br /><br />
            Si su situación corresponde a alguno de los casos mencionados, por favor registre su <strong>solicitud</strong>, adjunte los documentos requeridos y describa claramente el motivo en el detalle de la solicitud.
            Agradecemos su atención y comprensión.
          `,
    },
  };

  const enviarEncuesta = async (respuesta) => {
    try {
      await api.post("/encuesta", { respuesta });
    } catch (error) {
      console.error("Error al enviar encuesta:", error);
    }
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
                  if (
                    target.tagName === "A" &&
                    target.getAttribute("href") === "/solicitud"
                  ) {
                    e.preventDefault();
                    navigate("/solicitud");
                  } else if (target.tagName === "A") {
                    window.open(target.href, "_blank", "noopener noreferrer");
                  }
                }}
              ></p>

              {/* Mover decision-options aquí, justo después del <p> */}
              {modalType !== "citas" && modalType !== "valoraciones" && (
                <div className="decision-options">
                  <h2 className="subtitulo">¿Cómo desea proceder?</h2>
                  <br />
                  <ul className="opciones-decision">
                    <li>
                      La información fue clara y cuento con los documentos
                      necesarios para realizar el registro.{" "}
                      <span
                        onClick={() => {
                          enviarEncuesta("diligenciar");
                          handleCloseModal();
                          navigate("/solicitud");
                        }}
                        className="enlace-simulado"
                      >
                        [Haga clic aquí para diligenciar el formulario]
                      </span>
                    </li>
                    <li>
                      La información fue clara, pero no cuento con los soportes
                      requeridos.{" "}
                      <span
                        onClick={() => {
                          enviarEncuesta("cerrar");
                          handleCloseModal();
                        }}
                        className="enlace-simulado"
                      >
                        [Haga clic aquí para cerrar]
                      </span>
                    </li>
                    <li>
                      La información no fue clara y deseo registrar mi solicitud
                      para recibir orientación.{" "}
                      <span
                        onClick={() => {
                          enviarEncuesta("diligenciar-orientacion");
                          handleCloseModal();
                          navigate("/solicitud");
                        }}
                        className="enlace-simulado"
                      >
                        [Haga clic aquí para diligenciar el formulario]
                      </span>
                    </li>
                  </ul>
                </div>
              )}
              {/* El div botones-modal ahora contendrá solo los botones relacionados con "citas" */}
              <div className="botones-modal">
                <div className="botones-modal-inner">
                  {modalType === "citas" && ( // Solo si es "citas"
                    <div className="botones">
                      <a
                        href="https://oficinavirtual.passusips.com/login"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="agendate-link"
                      >
                        <button onClick={(e) => e.stopPropagation()}>
                          Agéndate aquí
                        </button>
                      </a>
                    </div>
                  )}
                </div>
              </div>
              {/* El botón de cerrar se mantiene, se muestra si no es "citas" */}
              {modalType !== "citas" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startCloseAnimation();
                  }}
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* El resto de tu componente (los botones de las tarjetas) permanece igual */}
      <div className="content">
        <div className="pqrs-container">
          <div className="header-pqrs">
            <div>
              <i className="fas fa-file-pen big-icon"></i>
              Registra tus <span>Solicitudes</span>
              <div className="solicitud">
                <p className="parrafo-solicitud">
                  Una solicitud es el interés que tiene un usuario para acceder
                  a un servicio, documento, información o gestión administrativa
                  con la IPS, sin que hayan sido vulnerados sus derechos.
                </p>
              </div>
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
          <div
            className="card"
            onClick={() => handleOpenModal("reprogramacion")}
          >
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
// import "animate.css";
// import { useNavigate } from "react-router-dom";
// import api from "../api/api";

// export const Solicitudes = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalType, setModalType] = useState("");
//   const [animationClass, setAnimationClass] = useState("");
//   const navigate = useNavigate();

//   // const [showDecisionModal, setShowDecisionModal] = useState(false);
//   // const [responseCounts, setResponseCounts] = useState({
//   //   formulario: 0,
//   //   sinSoporte: 0,
//   //   orientacion: 0,
//   // });

//   const handleOpenModal = (type) => {
//     setModalType(type);
//     setAnimationClass("animate__animated animate__zoomIn");
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setModalType("");
//     setAnimationClass("");
//   };

//   const startCloseAnimation = (callback) => {
//     setAnimationClass("animate__zoomOut");
//     setTimeout(() => {
//       setIsModalOpen(false);
//       setAnimationClass("animate__zoomIn");
//       if (callback) callback(); // <- ejecutar algo después del cierre
//     }, 500);
//   };

//   const modalContent = {
//     citas: {
//       title: "Agendar citas",
//       text: "<strong> Estimado usuario:</strong><br/> Recuerda que puedes agendar tu cita directamente desde nuestra página web en la opción <a href='https://oficinavirtual.passusips.com/login' target='_blank' rel='noopener noreferrer'>Agéndate aqui</a> sin necesidad de registrar una solicitud.",
//     },
//     valoraciones: {
//       title: "Lista de espera",
//       text: "Actualmente no hay agenda disponible para esta especialidad. Puedes registrarte en la lista de espera y te contactaremos en cuanto se habiliten cupos.",
//     },
//     historia: {
//       title: "Historia clínica",
//       text: `Estimado usuario: <br />
//            Los informes se envían automáticamente al correo electrónico   registrado al finalizar la atención. Si no los ha recibido, le recomendamos   revisar su bandeja de entrada, correo no deseado o spam.<br /><br />
//             Si no recibiste la información o necesitas la historia clínica completa por favor debes tener en cuenta   los siguientes requisitos según el tipo de solicitante para tramitar la   solicitud de manera correcta. <br /><br />
//             Requisitos según el solicitante:<br /><br />

//             1. Paciente directamente:<br/>
//               • Fotocopia de la cédula de ciudadanía.<br />
//               • Diligenciar el siguiente formato: <a href='https://passusips.com/uploads/GPS-FT-10%20Formato%20de%20Solicitud%20de%20Historia%20Clinica%20por%20el%20paciente..pdf' target='_blank' rel='noopener noreferrer'>Formato de Solicitud por paciente</a>.<br /><br />

//             2. Tercero autorizado:<br />
//               • Fotocopia de la cédula del paciente y del autorizado.<br />
//               • Soporte que acredite el parentesco (registro civil, acta de matrimonio).<br />
//               • Diligenciar el siguiente formato: <a href='  https://passusips.com/uploads/GPS-FT-15%20Formato%20de%20Solicitud%20de%20Historia%20Clinica%20por%20tercero..pdf
//             'target='_blank' rel='noopener noreferrer'>Formato de Solicitud por Tercero</a>.<br /><br />

//             3. Paciente menor de edad:<br />
//               • Registro civil o tarjeta de identidad (según edad).<br />
//               • Registro civil que acredite el parentesco o documento que certifique la representación legal.<br />
//               • Cédula de ciudadanía de los padres.<br />
//               • Diligenciar el siguiente formato: <a href='https://passusips.com/uploads/GPS-FT-15%20Formato%20de%20Solicitud%20de%20Historia%20Clinica%20por%20tercero..pdf' target='_blank' rel='noopener noreferrer'>LINK</a>.<br /><br />
//             <a>Nota</a>: Si el tercero no es familiar, debe presentar una autorización expresa o poder firmado por el paciente, en el que se manifieste la voluntad de otorgar acceso a su historia clínica.<br /><br />

//             4. Paciente incapacitado o declarado interdicto:<br />
//               • Certificado médico que evidencie el estado de salud del paciente.<br />
//               • Documentos que acrediten el parentesco o la representación legal.<br />
//               • Cédula del paciente y del familiar o representante.<br />
//               • En caso de interdicción, adjuntar la sentencia de interdicción y copia de la cédula del curador.<br />
//               • Diligenciar el siguiente formato: <a href='https://passusips.com/uploads/GPS-FT-15%20Formato%20de%20Solicitud%20de%20Historia%20Clinica%20por%20tercero..pdf' target='_blank' rel='noopener noreferrer'>LINK</a>. <br /><br />

//             Si desea realizar la <strong>solicitud</strong> por favor Adjuntar los soportes según corresponda. `,
//     },
//     multa: {
//       title: "Exoneración de multa",
//       text: `Estimado usuario: <strong>¡Recuerde!</strong> <br /><br />

//             Las multas por inasistencia solo podrán ser exoneradas si se presenta una justificación médica válida dentro de las 24 horas siguientes a la cita.<br /><br />

//             Adicionalmente, le informamos que PASSUS IPS únicamente realiza reembolsos en los siguientes casos específicos:<br /><br />

//             • Cuando, durante la valoración inicial se determina que el paciente no es apto para ingresar al programa de hidroterapia.<br />
//             • Cuando, por criterio médico debidamente soportado, se considera que el paciente no debe continuar con terapias en agua, siempre y cuando no haya asistido a más de dos (2) sesiones acuáticas.<br /><br />

//             Agradecemos su comprensión y compromiso con el cumplimiento de nuestras políticas.<br /><br />

//             Si desea realizar la <strong>solicitud</strong> por favor adjuntar los soportes médicos según corresponda.`,
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

//             Si desea registrar una solicitud, por favor adjunte los soportes médicos correspondientes o exponga claramente el motivo en el detalle de la solicitud.`,
//     },
//     info: {
//       title: "Información general",
//       text: "Por favor revisa nuestro centro de ayuda o chatbot, donde respondemos preguntas frecuentes.  <a href='/solicitud'>  ¿Deseas continuar con una solicitud personalizada?</a>",
//     },
//     reembolsos: {
//       title: "Reembolsos",
//       text: `
//           Estimado usuario:<br /><br />
//           En PASSUS IPS los reembolsos se realizan únicamente en los siguientes casos:<br /><br />
//           1. Cuando, durante la valoración inicial, se determina que el paciente no es apto para ingresar al programa de hidroterapia.<br />
//           2. Cuando, por criterio médico debidamente soportado, se considera que el paciente no debe realizar terapias en agua, siempre y cuando no haya asistido a más de dos (2) sesiones acuáticas.<br /><br />

//           <strong>Documentos requeridos para la solicitud de reembolso:</strong><br /><br />
//           • Certificación bancaria.<br />
//           • Carta de autorización de consignación a un tercero (si aplica).<br />
//           • Soporte médico.<br />
//           • Soporte de pago o transacción. <br /><br />
//           Si su situación corresponde a alguno de los casos mencionados, por favor registre su <strong>solicitud</strong>, adjunte los documentos requeridos y describa claramente el motivo en el detalle de la solicitud.
//           Agradecemos su atención y comprensión.
//         `,
//     },
//   };

//   const enviarEncuesta = async (respuesta) => {
//     try {
//       await api.post("/encuesta", { respuesta });
//     } catch (error) {}
//   };

//   return (
//     <>
//       {isModalOpen && (
//         <div id="modal-container">
//           <div className="modal-background" onClick={startCloseAnimation}>
//             <div
//               className={`modal ${animationClass}`}
//               onClick={(e) => e.stopPropagation()}
//             >
//               <h2>{modalContent[modalType]?.title}</h2>
//               <p
//                 dangerouslySetInnerHTML={{
//                   __html: modalContent[modalType]?.text,
//                 }}
//                 onClick={(e) => {
//                   const target = e.target;
//                   if (
//                     target.tagName === "A" &&
//                     target.getAttribute("href") === "/pqrsForm"
//                   ) {
//                     e.preventDefault();
//                     navigate("/pqrsForm");
//                   }
//                 }}
//               ></p>
//               <div className="botones-modal">
//                 <div className="botones-modal-inner">
//                   {modalType === "citas" ? (
//                     <div className="botones">
//                       <a
//                         href="https://oficinavirtual.passusips.com/login"
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="agendate-link"
//                       >
//                         <button onClick={(e) => e.stopPropagation()}>
//                           Agéndate aquí
//                         </button>
//                       </a>

//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           startCloseAnimation();
//                         }}
//                       >
//                         Cerrar
//                       </button>
//                     </div>
//                   ) : (
//                     <div className="decision-options">
//                       {modalType !== "valoraciones" && (
//                         <>
//                           <h2>¿Cómo desea proceder?</h2><br />
//                           <ul className="opciones-decision">
//                             <li>
//                               La información fue clara y cuento con los
//                               documentos necesarios para realizar el registro.{" "}
//                               <span
//                                 onClick={() => {
//                                   enviarEncuesta("diligenciar");
//                                   handleCloseModal();
//                                   navigate("/solicitud");
//                                 }}
//                                 className="enlace-simulado"
//                               >
//                                 [Haga clic aquí para diligenciar el formulario]
//                               </span>
//                             </li>
//                             <li>
//                               La información fue clara, pero no cuento con los
//                               soportes requeridos.{" "}
//                               <span
//                                 onClick={() => {
//                                   enviarEncuesta("cerrar");
//                                   handleCloseModal();
//                                 }}
//                                 className="enlace-simulado"
//                               >
//                                 [Haga clic aquí para cerrar]
//                               </span>
//                             </li>
//                             <li>
//                               La información no fue clara y deseo registrar mi
//                               solicitud para recibir orientación.{" "}
//                               <span
//                                 onClick={() => {
//                                   enviarEncuesta("diligenciar-orientacion");
//                                   handleCloseModal();
//                                   navigate("/solicitud");
//                                 }}
//                                 className="enlace-simulado"
//                               >
//                                 [Haga clic aquí para diligenciar el formulario]
//                               </span>
//                             </li>
//                           </ul>
//                         </>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//               {modalType !== "citas" && (
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     startCloseAnimation();
//                   }}
//                 >
//                   Cerrar
//                 </button>
//               )}
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
//           {/* <div className="card" onClick={() => handleOpenModal("info")}>
//             <i className="fas fa-info-circle icon"></i>
//             <span>Información General</span>
//           </div> */}
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
