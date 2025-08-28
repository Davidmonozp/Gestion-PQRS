import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./PqrsSidebar.css";

function PqrsSidebar() {
  const [pqrsPorVencer, setPqrsPorVencer] = useState([]);
  const [pqrsVencidasSinRespuesta, setPqrsVencidasSinRespuesta] = useState([]);

  useEffect(() => {
    // fetch("http://127.0.0.1:8000/api/pqrs/alertas-tiempo")
    // fetch("http://192.168.1.15:8000/api/pqrs/alertas-tiempo")
    // fetch("https://pqrs.passusips.com/api/pqrs/alertas-tiempo")
    // fetch("https://test-pqrs.passusips.com/api/pqrs/alertas-tiempo")
    // fetch("https://test-pqrs.passus.cloud/api/pqrs/alertas-tiempo")
    fetch("https://pqrs.passus.cloud/api/pqrs/alertas-tiempo")


      .then((res) => res.json())
      .then((data) => {
        const porVencerFiltradas = (data.por_vencer || []).filter(
          (pqr) => pqr.tipo_solicitud !== "Felicitacion"
        );
        const vencidasFiltradas = (data.vencidas_sin_respuesta || []).filter(
          (pqr) => pqr.tipo_solicitud !== "Felicitacion"
        );

        setPqrsPorVencer(porVencerFiltradas);
        setPqrsVencidasSinRespuesta(vencidasFiltradas);
      })
      .catch((error) => {
        console.error("Error al cargar PQRS de alerta:", error);
      });
  }, []);

  return (
    <div className="pqrs-sidebar">
      <header>
        <i className="fa-solid fa-triangle-exclamation"></i>
        <span className="header-text">¡Alerta de tiempos!</span>
      </header>
      <nav className="sidebar-nav">
        <ul>
          {pqrsPorVencer.length > 0 && (
            <li>
              <a href="#">
                <i className="fas fa-hourglass-half"></i>
                <span className="tiempo-status-name">Por Vencer:</span>
                <span className="tiempo-status-count">
                  {pqrsPorVencer.length}
                </span>
              </a>
              <ul className="nav-flyout">
                {pqrsPorVencer.map((pqr) => (
                  <li key={pqr.pqr_codigo}>
                    <Link to={`/pqrs/${pqr.pqr_codigo}`}>
                      <i className="ion-ios-arrow-forward"></i>
                      <span>{pqr.pqr_codigo}</span>
                      {pqr.deadline_ciudadano && (
                        <span
                          style={{
                            fontSize: "0.7em",
                            marginLeft: "5px",
                            color: "#ffcc00",
                          }}
                        >
                          (
                          {new Date(
                            pqr.deadline_ciudadano
                          ).toLocaleDateString()}
                          )
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          )}

          {pqrsVencidasSinRespuesta.length > 0 && (
            <li className="tiempo-status-item vencida-sin-respuesta">
              <a href="#">
                <i className="fas fa-times-circle"></i>
                <span className="tiempo-status-name">
                  Vencidas sin respuesta:
                </span>
                <span className="tiempo-status-count">
                  {pqrsVencidasSinRespuesta.length}
                </span>
              </a>
              <ul className="nav-flyout">
                {pqrsVencidasSinRespuesta.map((pqr) => (
                  <li key={pqr.pqr_codigo}>
                    <Link to={`/pqrs/${pqr.pqr_codigo}`}>
                      <i className="ion-ios-arrow-forward"></i>
                      <span>{pqr.pqr_codigo}</span>
                      {pqr.deadline_ciudadano && (
                        <span
                          className="fecha-vencida"
                          style={{
                            fontSize: "0.7em",
                            marginLeft: "5px",
                            color: "#ff5555",
                          }}
                        >
                          (Venció:{" "}
                          {new Date(
                            pqr.deadline_ciudadano
                          ).toLocaleDateString()}
                          )
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}

export default PqrsSidebar;

// // src/components/PqrsSidebar.jsx
// import React from "react";
// import "./styles/PqrsSidebar.css"; // Asegúrate de que este archivo CSS exista
// // Importa Link de react-router-dom si quieres enlaces que no recarguen la página
// import { Link } from "react-router-dom";

// function PqrsSidebar({ pqrsData }) {
//   // Asegúrate de que pqrsData sea la lista completa de PQRS
//   // Calcula los conteos para cada estado de respuesta general
//   const statusCounts = pqrsData.reduce((acc, pqr) => {
//     acc[pqr.estado_respuesta] = (acc[pqr.estado_respuesta] || 0) + 1;
//     return acc;
//   }, {});

//   // Calcula los conteos de estado_tiempo para "A tiempo" y "Vencido" (usado para Cerrado)
//   const cerradoTiempoCounts = pqrsData.reduce((acc, pqr) => {
//     if (pqr.estado_respuesta === "Cerrado" && pqr.estado_tiempo) {
//       acc[pqr.estado_tiempo] = (acc[pqr.estado_tiempo] || 0) + 1;
//     }
//     return acc;
//   }, {});

//   // --- NUEVO: Filtra las PQRS por estado de tiempo para mostrarlas en los submenús ---
//   const pqrsPorVencer = pqrsData.filter(
//     (pqr) => pqr.estado_tiempo === "Por vencer"
//   );
//   const pqrsVencidasSinRespuesta = pqrsData.filter(
//     (pqr) => pqr.estado_tiempo === "Vencida sin respuesta"
//   );

//   return (
//     <div className="pqrs-sidebar">
//       <header>
//         <i className="fa-solid fa-triangle-exclamation"></i>
//         <span className="header-text">¡Alerta de tiempos!</span>
//       </header>
//       <nav className="sidebar-nav">
//         <ul>
//           {pqrsPorVencer.length > 0 && (
//             <li>
//               {/* El elemento principal del menú "Por Vencer" */}
//               <a href="#">
//                 <i className="fas fa-hourglass-half"></i>
//                 <span className="tiempo-status-name">Por Vencer:</span>
//                 <span className="tiempo-status-count">
//                   {pqrsPorVencer.length}
//                 </span>
//               </a>
//               {/* El submenú de "Por Vencer" */}
//               <ul className="nav-flyout">
//                 {pqrsPorVencer.map((pqr) => (
//                   <li key={pqr.pqr_codigo}>
//                     {/* Usar Link para navegar a los detalles de la PQRS */}
//                     <Link to={`/pqrs/${pqr.pqr_codigo}`}>
//                       <i className="ion-ios-arrow-forward"></i>{" "}
//                       {/* Icono para ítems */}
//                       <span>{pqr.pqr_codigo}</span>
//                       {/* Puedes añadir más detalles aquí, como la fecha de vencimiento */}
//                       {pqr.fecha_vencimiento && (
//                         <span
//                           style={{
//                             fontSize: "0.7em",
//                             marginLeft: "5px",
//                             color: "#ffcc00",
//                           }}
//                         >
//                           (
//                           {new Date(pqr.fecha_vencimiento).toLocaleDateString()}
//                           )
//                         </span>
//                       )}
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </li>
//           )}

//           {/* --- NUEVA SECCIÓN: PQRS Vencidas sin respuesta --- */}
//           {pqrsVencidasSinRespuesta.length > 0 && (
//             <li className="tiempo-status-item vencida-sin-respuesta">
//               <a href="#">
//                 <i className="fas fa-times-circle"></i>
//                 <span className="tiempo-status-name">
//                   Vencidas sin respuesta:
//                 </span>
//                 <span className="tiempo-status-count">
//                   {pqrsVencidasSinRespuesta.length}
//                 </span>
//               </a>
//               <ul className="nav-flyout">
//                 {pqrsVencidasSinRespuesta.map((pqr) => (
//                   <li key={pqr.pqr_codigo}>
//                     <Link to={`/pqrs/${pqr.pqr_codigo}`}>
//                       <i className="ion-ios-arrow-forward"></i>
//                       <span>{pqr.pqr_codigo}</span>
//                       {pqr.fecha_vencimiento && (
//                         <span className="fecha-vencida">
//                           (Venció:{" "}
//                           {new Date(pqr.fecha_vencimiento).toLocaleDateString()}
//                           )
//                         </span>
//                       )}
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </li>
//           )}
//         </ul>
//       </nav>
//     </div>
//   );
// }

// export default PqrsSidebar;
