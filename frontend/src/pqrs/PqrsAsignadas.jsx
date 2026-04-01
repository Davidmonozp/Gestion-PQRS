import React, { useEffect, useState } from "react";
import { getPqrsAsignadas } from "./pqrsService";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Swal from "sweetalert2";
import PqrsFilters from "./components/PqrsFilters";
import CountdownTimer from "./components/CountDownTimer";
import { Version } from "../components/Footer/Version";

function PqrsAsignadas() {
  const [pqrsBrutas, setPqrsBrutas] = useState([]);
  const [pqrsFiltradas, setPqrsFiltradas] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const usuarioId = parseInt(localStorage.getItem("usuarioId"), 10);

  const [filters, setFilters] = useState({
    pqr_codigo: "",
    documento_numero: "",
    servicio_prestado: [],
    tipo_solicitud: [],
    sede: [],
    eps: [],
    fecha_inicio: "",
    fecha_fin: "",
    clasificaciones: [],
  });

  // ✅ Traer las PQRs asignadas al cargar el componente
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getPqrsAsignadas();
        setPqrsBrutas(data);
        setPqrsFiltradas(data); // Inicialmente todo
      } catch (err) {
        setError("Error al cargar las PQRs asignadas.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ✅ Filtrar automáticamente cuando cambian los filtros o los datos
  useEffect(() => {
    handleBuscar();
  }, [filters, pqrsBrutas]);

  const handleBuscar = () => {
    let filteredData = [...pqrsBrutas];

    if (filters.pqr_codigo) {
      filteredData = filteredData.filter((pqr) =>
        String(pqr.pqr_codigo)
          .toLowerCase()
          .includes(filters.pqr_codigo.toLowerCase())
      );
    }

    if (filters.documento_numero) {
      filteredData = filteredData.filter((pqr) =>
        String(pqr.documento_numero)
          .toLowerCase()
          .includes(filters.documento_numero.toLowerCase())
      );
    }

    if (filters.servicio_prestado.length > 0) {
      filteredData = filteredData.filter((pqr) =>
        filters.servicio_prestado.includes(pqr.servicio_prestado)
      );
    }

    if (filters.tipo_solicitud.length > 0) {
      filteredData = filteredData.filter((pqr) =>
        filters.tipo_solicitud.includes(pqr.tipo_solicitud)
      );
    }

    if (filters.clasificaciones.length > 0) {
      filteredData = filteredData.filter((pqr) =>
        pqr.clasificaciones?.some((c) => filters.clasificaciones.includes(c.id))
      );
    }

    if (filters.sede.length > 0) {
      filteredData = filteredData.filter((pqr) =>
        filters.sede.includes(pqr.sede)
      );
    }

    if (filters.eps.length > 0) {
      filteredData = filteredData.filter((pqr) =>
        filters.eps.includes(pqr.eps)
      );
    }

    if (filters.fecha_inicio || filters.fecha_fin) {
      filteredData = filteredData.filter((pqr) => {
        const pqrDate = new Date(pqr.created_at);
        let matchesStartDate = true;
        let matchesEndDate = true;

        if (filters.fecha_inicio) {
          matchesStartDate =
            pqrDate >= new Date(filters.fecha_inicio + "T00:00:00");
        }
        if (filters.fecha_fin) {
          matchesEndDate = pqrDate <= new Date(filters.fecha_fin + "T23:59:59");
        }

        return matchesStartDate && matchesEndDate;
      });
    }

    setPqrsFiltradas(filteredData);
  };

  return (
    <>
      <Navbar />
      <div className="container-pqrs">
        <div className="header-top">
          <h2>PQR-S Asignadas a {localStorage.getItem("nameUser")}</h2>
          <PqrsFilters
            filters={filters}
            setFilters={setFilters} // Cada cambio dispara el useEffect
            onBuscar={handleBuscar} // Mantener por compatibilidad, pero ya no es obligatorio
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {loading && <p>Cargando PQRs...</p>}

        <div className="table-wrapper">
          <table className="container-table">
            <thead>
              <tr>
                <th>Acciones</th>
                <th>Índice</th>
                <th>Contestada</th>
                <th># Radicado</th>
                <th>Fecha de solicitud</th>
                <th>Fecha de registro</th>
                <th>Sede</th>
                <th>Tipo Solicitud</th>
                <th>Estado de la PQR</th>
                <th>Tipo Doc.</th>
                <th>Número Doc.</th>
                <th>Nombres y Apellidos</th>
                <th>EPS</th>
                <th>Servicio</th>
                <th>Fecha de cierre</th>
                <th>Tiempo de respuesta PASSUS</th>
                <th>Asignado a</th>
              </tr>
            </thead>
            <tbody>
              {pqrsFiltradas.length === 0 && !loading ? (
                <tr>
                  <td colSpan="17">
                    No hay PQRs asignadas que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                [...pqrsFiltradas]
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // ⬅️ ORDENAR MÁS RECIENTES PRIMERO
                  .map((pqr, index, arrOrdenada) => {
                    const total = arrOrdenada.length;
                    const globalIndex = total - index; // índice descendente

                    const yaRespondio = pqr.respuestas?.some(
                      (r) => r.user_id === usuarioId
                    );

                    return (
                      <tr key={pqr.id}>
                        <td>
                          <button
                            onClick={() => navigate(`/pqrs/${pqr.pqr_codigo}`)}
                          >
                            <i className="fa-solid fa-eye"></i>
                          </button>
                          <button
                            onClick={() => {
                              if (yaRespondio) {
                                Swal.fire({
                                  title: "Respuesta ya registrada",
                                  text: "¿Deseas registrar otra respuesta adicional para esta PQR?",
                                  icon: "warning",
                                  showCancelButton: true,
                                  confirmButtonColor: "#3085d6",
                                  cancelButtonColor: "#d33",
                                  confirmButtonText: "Sí, registrar otra",
                                  cancelButtonText: "Cancelar",
                                  // ✅ Añadimos las animaciones de Animate.css aquí:
                                  showClass: {
                                    popup: 'animate__animated animate__fadeInDown'
                                  },
                                  hideClass: {
                                    popup: 'animate__animated animate__fadeOutUp'
                                  }
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    navigate(`/pqrs/${pqr.pqr_codigo}/respuesta`);
                                  }
                                });
                              } else {
                                // Navegación directa si no ha respondido
                                navigate(`/pqrs/${pqr.pqr_codigo}/respuesta`);
                              }
                            }}
                            title={yaRespondio ? "Ya tiene respuesta" : "Registrar respuesta"}
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                        </td>

                        {/* índice descendente ya corregido */}
                        <td>{globalIndex}</td>

                        <td>{yaRespondio ? "✅ Contestada" : "⏳ Pendiente"}</td>
                        <td>{pqr.pqr_codigo}</td>
                        <td>{pqr.fecha_inicio_real}</td>
                        <td>{new Date(pqr.created_at).toLocaleString()}</td>
                        <td>{pqr.sede}</td>
                        <td>{pqr.tipo_solicitud}</td>
                        <td>{pqr.estado_respuesta}</td>
                        <td>{pqr.documento_tipo}</td>
                        <td>{pqr.documento_numero}</td>
                        <td>
                          {[pqr.nombre, pqr.segundo_nombre, pqr.apellido, pqr.segundo_apellido]
                            .filter(Boolean)
                            .join(" ")}
                        </td>
                        <td>{pqr.eps}</td>
                        <td>{pqr.servicio_prestado}</td>
                        <td>{pqr.respondido_en}</td>
                        <td>
                          {pqr.estado_respuesta === "Cerrado" || pqr.estado_respuesta === "Validacion del juez" ? (
                            <span style={{ color: "#474646", fontStyle: "italic" }}>
                              Finalizado
                            </span>
                          ) : pqr.deadline_interno ? (
                            <CountdownTimer targetDate={pqr.deadline_interno} />
                          ) : (
                            <span style={{ color: "#474646", fontStyle: "italic" }}>
                              No iniciado
                            </span>
                          )}
                        </td>
                        <td className="pqr-status-cell">
                          <ul className="pqr-status-list">
                            {pqr.asignados?.map((usuario) => {
                              const respondio = (pqr.respuestas ?? []).some(
                                (r) => r.user_id === usuario.id
                              );
                              return (
                                <li key={usuario.id} className="pqr-status-item">
                                  <i
                                    className={`fa-solid ${respondio
                                      ? "fa-check pqr-icon success"
                                      : "fa-clock pqr-icon pending"
                                      }`}
                                    title={
                                      respondio
                                        ? "Respuesta enviada"
                                        : "Pendiente de respuesta"
                                    }
                                  ></i>
                                  <span
                                    className="pqr-user-name"
                                    title={usuario.name}
                                  >
                                    {usuario.name}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>

          </table>
        </div>
      </div>
      <Version />
    </>
  );
}

export default PqrsAsignadas;























































// import React, { useEffect, useState } from "react";
// import { getPqrsAsignadas } from "./pqrsService";
// import { useNavigate } from "react-router-dom";
// import Navbar from "../components/Navbar/Navbar";
// import Swal from "sweetalert2";
// import PqrsFilters from "./components/PqrsFilters";
// import CountdownTimer from "./components/CountDownTimer";
// import { Version } from "../components/Footer/Version";

// function PqrsAsignadas() {
//   const [pqrsBrutas, setPqrsBrutas] = useState([]);
//   const [pqrsFiltradas, setPqrsFiltradas] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const usuarioId = parseInt(localStorage.getItem("usuarioId"), 10);

//   const [filters, setFilters] = useState({
//     pqr_codigo: "",
//     documento_numero: "",
//     servicio_prestado: [],
//     tipo_solicitud: [],
//     sede: [],
//     eps: [],
//     fecha_inicio: "",
//     fecha_fin: "",
//     clasificaciones: [],
//   });

//   // ✅ Traer las PQRs asignadas al cargar el componente
//   useEffect(() => {
//     async function fetchData() {
//       setLoading(true);
//       try {
//         const data = await getPqrsAsignadas();
//         setPqrsBrutas(data);
//         setPqrsFiltradas(data); // Inicialmente todo
//       } catch (err) {
//         setError("Error al cargar las PQRs asignadas.");
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchData();
//   }, []);

//   // ✅ Filtrar automáticamente cuando cambian los filtros o los datos
//   useEffect(() => {
//     handleBuscar();
//   }, [filters, pqrsBrutas]);

//   const handleBuscar = () => {
//     let filteredData = [...pqrsBrutas];

//     if (filters.pqr_codigo) {
//       filteredData = filteredData.filter((pqr) =>
//         String(pqr.pqr_codigo)
//           .toLowerCase()
//           .includes(filters.pqr_codigo.toLowerCase())
//       );
//     }

//     if (filters.documento_numero) {
//       filteredData = filteredData.filter((pqr) =>
//         String(pqr.documento_numero)
//           .toLowerCase()
//           .includes(filters.documento_numero.toLowerCase())
//       );
//     }

//     if (filters.servicio_prestado.length > 0) {
//       filteredData = filteredData.filter((pqr) =>
//         filters.servicio_prestado.includes(pqr.servicio_prestado)
//       );
//     }

//     if (filters.tipo_solicitud.length > 0) {
//       filteredData = filteredData.filter((pqr) =>
//         filters.tipo_solicitud.includes(pqr.tipo_solicitud)
//       );
//     }

//     if (filters.clasificaciones.length > 0) {
//       filteredData = filteredData.filter((pqr) =>
//         pqr.clasificaciones?.some((c) => filters.clasificaciones.includes(c.id))
//       );
//     }

//     if (filters.sede.length > 0) {
//       filteredData = filteredData.filter((pqr) =>
//         filters.sede.includes(pqr.sede)
//       );
//     }

//     if (filters.eps.length > 0) {
//       filteredData = filteredData.filter((pqr) =>
//         filters.eps.includes(pqr.eps)
//       );
//     }

//     if (filters.fecha_inicio || filters.fecha_fin) {
//       filteredData = filteredData.filter((pqr) => {
//         const pqrDate = new Date(pqr.created_at);
//         let matchesStartDate = true;
//         let matchesEndDate = true;

//         if (filters.fecha_inicio) {
//           matchesStartDate =
//             pqrDate >= new Date(filters.fecha_inicio + "T00:00:00");
//         }
//         if (filters.fecha_fin) {
//           matchesEndDate = pqrDate <= new Date(filters.fecha_fin + "T23:59:59");
//         }

//         return matchesStartDate && matchesEndDate;
//       });
//     }

//     setPqrsFiltradas(filteredData);
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="container-pqrs">
//         <div className="header-top">
//           <h2>PQR-S Asignadas a {localStorage.getItem("nameUser")}</h2>
//           <PqrsFilters
//             filters={filters}
//             setFilters={setFilters} // Cada cambio dispara el useEffect
//             onBuscar={handleBuscar} // Mantener por compatibilidad, pero ya no es obligatorio
//           />
//         </div>

//         {error && <p style={{ color: "red" }}>{error}</p>}
//         {loading && <p>Cargando PQRs...</p>}

//         <div className="table-wrapper">
//           <table className="container-table">
//             <thead>
//               <tr>
//                 <th>Acciones</th>
//                 <th>Índice</th>
//                 <th>Contestada</th>
//                 <th># Radicado</th>
//                 <th>Fecha de solicitud</th>
//                 <th>Fecha de registro</th>
//                 <th>Sede</th>
//                 <th>Tipo Solicitud</th>
//                 <th>Estado de la PQR</th>
//                 <th>Tipo Doc.</th>
//                 <th>Número Doc.</th>
//                 <th>Nombres y Apellidos</th>
//                 <th>EPS</th>
//                 <th>Servicio</th>
//                 <th>Fecha de cierre</th>
//                 <th>Tiempo de respuesta PASSUS</th>
//                 <th>Asignado a</th>
//               </tr>
//             </thead>
//             <tbody>
//               {pqrsFiltradas.length === 0 && !loading ? (
//                 <tr>
//                   <td colSpan="17">
//                     No hay PQRs asignadas que coincidan con los filtros.
//                   </td>
//                 </tr>
//               ) : (
//                 [...pqrsFiltradas]
//                   .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // ⬅️ ORDENAR MÁS RECIENTES PRIMERO
//                   .map((pqr, index, arrOrdenada) => {
//                     const total = arrOrdenada.length;
//                     const globalIndex = total - index; // índice descendente

//                     const yaRespondio = pqr.respuestas?.some(
//                       (r) => r.user_id === usuarioId
//                     );

//                     return (
//                       <tr key={pqr.id}>
//                         <td>
//                           <button
//                             onClick={() => navigate(`/pqrs/${pqr.pqr_codigo}`)}
//                           >
//                             {yaRespondio && (
//                               <i className="fa-solid fa-eye"></i>
//                             )}
//                           </button>
//                           {!yaRespondio && (
//                             <button
//                               onClick={() =>
//                                 navigate(`/pqrs/${pqr.pqr_codigo}/respuesta`)
//                               }
//                             >
//                               <i className="fa-solid fa-pen-to-square"></i>
//                             </button>
//                           )}
//                           {yaRespondio && (
//                             <button
//                               onClick={() =>
//                                 Swal.fire({
//                                   icon: "info",
//                                   title: "Ya has respondido",
//                                   text: "Ya registraste una respuesta para esta PQR.",
//                                   confirmButtonText: "Aceptar",
//                                 })
//                               }
//                             >
//                               <i
//                                 className="fa-solid fa-ban"
//                                 style={{ color: "gray" }}
//                               ></i>
//                             </button>
//                           )}
//                         </td>

//                         {/* índice descendente ya corregido */}
//                         <td>{globalIndex}</td>

//                         <td>{yaRespondio ? "✅ Contestada" : "⏳ Pendiente"}</td>
//                         <td>{pqr.pqr_codigo}</td>
//                         <td>{pqr.fecha_inicio_real}</td>
//                         <td>{new Date(pqr.created_at).toLocaleString()}</td>
//                         <td>{pqr.sede}</td>
//                         <td>{pqr.tipo_solicitud}</td>
//                         <td>{pqr.estado_respuesta}</td>
//                         <td>{pqr.documento_tipo}</td>
//                         <td>{pqr.documento_numero}</td>
//                         <td>
//                           {[pqr.nombre, pqr.segundo_nombre, pqr.apellido, pqr.segundo_apellido]
//                             .filter(Boolean)
//                             .join(" ")}
//                         </td>
//                         <td>{pqr.eps}</td>
//                         <td>{pqr.servicio_prestado}</td>
//                         <td>{pqr.respondido_en}</td>
//                         <td>
//                           {pqr.estado_respuesta === "Cerrado" || pqr.estado_respuesta === "Validacion del juez" ? (
//                             <span style={{ color: "#474646", fontStyle: "italic" }}>
//                               Finalizado
//                             </span>
//                           ) : pqr.deadline_interno ? (
//                             <CountdownTimer targetDate={pqr.deadline_interno} />
//                           ) : (
//                             <span style={{ color: "#474646", fontStyle: "italic" }}>
//                               No iniciado
//                             </span>
//                           )}
//                         </td>
//                         <td className="pqr-status-cell">
//                           <ul className="pqr-status-list">
//                             {pqr.asignados?.map((usuario) => {
//                               const respondio = (pqr.respuestas ?? []).some(
//                                 (r) => r.user_id === usuario.id
//                               );
//                               return (
//                                 <li key={usuario.id} className="pqr-status-item">
//                                   <i
//                                     className={`fa-solid ${respondio
//                                       ? "fa-check pqr-icon success"
//                                       : "fa-clock pqr-icon pending"
//                                       }`}
//                                     title={
//                                       respondio
//                                         ? "Respuesta enviada"
//                                         : "Pendiente de respuesta"
//                                     }
//                                   ></i>
//                                   <span
//                                     className="pqr-user-name"
//                                     title={usuario.name}
//                                   >
//                                     {usuario.name}
//                                   </span>
//                                 </li>
//                               );
//                             })}
//                           </ul>
//                         </td>
//                       </tr>
//                     );
//                   })
//               )}
//             </tbody>

//           </table>
//         </div>
//       </div>
//       <Version />
//     </>
//   );
// }

// export default PqrsAsignadas;
