import React, { useEffect, useState } from "react";
import api from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import "./styles/PqrsList.css";
import PqrsFilters from "./components/PqrsFilters";
import { tienePermiso } from "../utils/permisoHelper";
import CountdownTimer from "./components/CountDownTimer";
import PqrsSidebar from "../components/Sidebar/PqrsSidebar";
import { getRole, getSedes } from "../auth/authService";
// import BotonesFilters from "./components/BotonesFilters";

function PqrsList() {
  const [pqrs, setPqrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);


  // Estado para el filtro de estado de los botones
  const [activeStatusFilter, setActiveStatusFilter] = useState(""); // "" significa "Todos"

  const usuario = {
    role: getRole(),
    sedes: getSedes(), // Esto debe devolver un array de nombres
  };

  const [filters, setFilters] = useState({
    pqr_codigo: "",
    documento_numero: "",
    servicio_prestado: [],
    tipo_solicitud: [],
    sede: [],
    eps: [],
    fecha_inicio: "",
    fecha_fin: "",
  });

  const navigate = useNavigate();

  // useEffect ahora depende de `filters`, `activeStatusFilter` y `currentPage`
  useEffect(() => {
    fetchPqrs(currentPage);
  }, [filters, activeStatusFilter, currentPage]);

  const fetchPqrs = async (page = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append("page", page);

       if (usuario.role === "Digitador") {
      queryParams.append("per_page", 15);
    }

      let apiUrl = "/pqrs"; // Endpoint por defecto (tu método index)

      // **Lógica para decidir qué endpoint de API llamar**
      // Primero, detectamos si hay algún filtro general activo (aparte del de estado)
      const hasGeneralFilters = Object.keys(filters).some((key) => {
        const value = filters[key];
        if (Array.isArray(value)) return value.length > 0;
        return value !== "";
      });

      // Si SOLO hay un filtro de estado y NO hay otros filtros generales
      if (activeStatusFilter !== "" && !hasGeneralFilters) {
        apiUrl = "/pqrs/estado"; // Usar el endpoint específico de estado
        queryParams.append("estado_respuesta", activeStatusFilter);
      } else {
        // Si hay otros filtros generales O si el filtro de estado es "Todos" (vacío)
        // Usar el endpoint general (index) y enviar todos los filtros, incluyendo el de estado si está activo
        if (activeStatusFilter) {
          queryParams.append("estado_respuesta", activeStatusFilter); // Enviar también el filtro de estado a `index`
        }

        // Añadir los filtros de búsqueda general
        if (filters.pqr_codigo)
          queryParams.append("pqr_codigo", filters.pqr_codigo);
        if (filters.documento_numero)
          queryParams.append("documento_numero", filters.documento_numero);
        if (filters.servicio_prestado && filters.servicio_prestado.length > 0) {
          filters.servicio_prestado.forEach((servicio) =>
            queryParams.append("servicio_prestado[]", servicio)
          );
        }
        if (filters.tipo_solicitud && filters.tipo_solicitud.length > 0) {
          filters.tipo_solicitud.forEach((tipo) =>
            queryParams.append("tipo_solicitud[]", tipo)
          );
        }
        if (filters.sede && filters.sede.length > 0) {
          filters.sede.forEach((sede) => queryParams.append("sede[]", sede));
        }
        if (filters.eps && filters.eps.length > 0) {
          filters.eps.forEach((eps) => queryParams.append("eps[]", eps));
        }
        if (filters.fecha_inicio) {
          queryParams.append("fecha_inicio", filters.fecha_inicio);
        }
        if (filters.fecha_fin) {
          queryParams.append("fecha_fin", filters.fecha_fin);
        }
      }

      const res = await api.get(`${apiUrl}?${queryParams.toString()}`);

      const processedPqrs = res.data.pqrs.map((pqr) => {
        let processedArchivo = [];
        if (typeof pqr.archivo === "string") {
          try {
            const parsed = JSON.parse(pqr.archivo);
            if (Array.isArray(parsed)) {
              processedArchivo = parsed.filter(
                (item) =>
                  typeof item === "object" && item !== null && "path" in item
              );
            } else if (
              parsed &&
              typeof parsed === "object" &&
              "path" in parsed
            ) {
              processedArchivo = [parsed];
            } else {
              processedArchivo = [
                {
                  path: pqr.archivo,
                  original_name: pqr.archivo.split("/").pop(),
                },
              ];
            }
          } catch (parseError) {
            console.warn(
              "Error parsing pqr.archivo as JSON, treating as direct path or empty:",
              pqr.archivo,
              parseError
            );
            processedArchivo = [
              {
                path: pqr.archivo,
                original_name: pqr.archivo.split("/").pop(),
              },
            ];
          }
        } else if (Array.isArray(pqr.archivo)) {
          processedArchivo = pqr.archivo.filter(
            (item) =>
              typeof item === "object" && item !== null && "path" in item
          );
        } else if (
          pqr.archivo &&
          typeof pqr.archivo === "object" &&
          "path" in pqr.archivo
        ) {
          processedArchivo = [pqr.archivo];
        }

        return { ...pqr, archivo: processedArchivo };
      });

      setPqrs(processedPqrs);
      setCurrentPage(res.data.current_page);
      setLastPage(res.data.last_page);

 
    } catch (err) {
      console.error("Error al obtener las PQRS:", err);
      setError("No se pudo cargar la información");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterClick = (status) => {
    setActiveStatusFilter(status); // Actualiza el estado del filtro de estado
    setCurrentPage(1); // Siempre vuelve a la primera página con el nuevo filtro aplicado
  };

  const handleBuscar = () => {
    setCurrentPage(1); // Al hacer click en buscar, siempre vuelve a la primera página
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= lastPage) {
      setCurrentPage(page);
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <div className="app-layout-container">
        {!tienePermiso(["Digitador", "Gestor"]) && (
          <PqrsSidebar pqrsData={pqrs} />
        )}
        <div className="container-pqrs">
          <div className="cabecera">
            <h2>TABLERO DE CONTROL Y GESTIÓN DE F-PQRS</h2>
          </div>

          {/* <BotonesFilters
            activeStatusFilter={activeStatusFilter}
            onStatusFilterClick={handleStatusFilterClick}
          /> */}

          <div className="header-top">
            <PqrsFilters
              filters={filters}
              setFilters={setFilters}
              onBuscar={handleBuscar}
            />
          </div>

          <div className="table-wrapper">
            <table className="container-table">
              <thead>
                <tr>
                  <th>Acciones</th>
                  <th># Radicado</th>
                  <th>Fecha de solicitud</th>
                  <th>Fecha de registro</th>
                  <th>Sede</th>
                  <th>Tipo Solicitud</th>
                  <th>Prioridad</th>
                  <th>Estado de la PQR</th>
                  <th>Tipo Doc.</th>
                  <th>Número Doc.</th>
                  <th>Nombre</th>
                  {/* <th>Apellido</th> */}
                  <th>EPS</th>
                  <th>Servicio prestado</th>
                  <th>Atributo de calidad</th>
                  <th>Asignado a</th>
                  <th>Fecha de cierre</th>
                  <th>Canal de ingreso</th>
                  <th>Tiempo de respuesta PASSUS</th>
                  {/* <th>Archivos</th> */}
                  <th>Respuesta enviada a usuario</th>
                </tr>
              </thead>
              <tbody>
                {pqrs
                  .filter((pqr) => {
                    const sedesUsuario = usuario.sedes || [];

                    if (usuario.role === "Gestor") {
                      // Gestor: solo ve las PQRs de sus sedes asignadas (por nombre)
                      return sedesUsuario.includes(pqr.sede);
                    }

                    if (usuario.role === "Digitador") {
                      // Digitador: solo ve PQRs que sean tipo "Solicitud"
                      return pqr.tipo_solicitud === "Solicitud";
                    }

                    return true; // Otros roles ven todas
                  })
                  .map((pqr) => (
                    <tr key={pqr.pqr_codigo}>
                      <td>
                        {tienePermiso([
                          "Administrador",
                          "Consultor",
                          "Supervisor",
                          "Gestor",
                          "Digitador",
                        ]) && (
                          <button
                            onClick={() => navigate(`/pqrs/${pqr.pqr_codigo}`)}
                          >
                            <i className="fa fa-eye icono-ver"></i>
                          </button>
                        )}
                      </td>
                      <td>{pqr.pqr_codigo}</td>
                      <td>{new Date(pqr.created_at).toLocaleString()}</td>
                      <td>{pqr.fecha_inicio_real}</td>
                      <td>{pqr.sede}</td>
                      <td>{pqr.tipo_solicitud}</td>
                      <td>{pqr.prioridad || "No asignada"}</td>
                      <td>{pqr.estado_respuesta}</td>
                      <td>{pqr.documento_tipo}</td>
                      <td>{pqr.documento_numero}</td>
                      <td>
                        {pqr.nombre} {pqr.apellido} {pqr.segundo_apellido}
                      </td>
                      <td>{pqr.eps}</td>
                      <td>{pqr.servicio_prestado}</td>
                      <td>{pqr.atributo_calidad}</td>
                      <td className="pqr-status-cell">
                        <ul className="pqr-status-list">
                          {pqr.asignados?.map((usuario) => {
                            const respondio = (pqr.respuestas ?? []).some(
                              (r) =>
                                r.user_id === usuario.id &&
                                r.es_respuesta_usuario === 0
                            );

                            return (
                              <li key={usuario.id} className="pqr-status-item">
                                <i
                                  className={`fa-solid ${
                                    respondio
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
                      <td>{pqr.respondido_en}</td>
                      <td>{pqr.fuente}</td>
                      <td>
                        {pqr.estado_respuesta === "Cerrado" ? (
                          <span
                            style={{ color: "#474646", fontStyle: "italic" }}
                          >
                            Finalizado
                          </span>
                        ) : pqr.deadline_interno ? (
                          <CountdownTimer targetDate={pqr.deadline_interno} />
                        ) : (
                          <span
                            style={{ color: "#474646", fontStyle: "italic" }}
                          >
                            No iniciado
                          </span>
                        )}
                      </td>
                      <td>
                        {pqr.respuesta_enviada === 1
                          ? "Enviada ✅"
                          : "No enviada ❌"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <nav className="paginacion">
            <ul className="elementosPaginacion">
              <li className="numero">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "disabled" : ""}
                  aria-disabled={currentPage === 1}
                >
                  <i className="fa fa-chevron-left"></i>
                </a>
              </li>

              {[...Array(lastPage)].map((_, index) => {
                const page = index + 1;
                return (
                  <li
                    key={page}
                    className={`numero ${page === currentPage ? "active" : ""}`}
                  >
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page !== currentPage) handlePageChange(page);
                      }}
                    >
                      {page}
                    </a>
                  </li>
                );
              })}

              <li className="numero">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < lastPage)
                      handlePageChange(currentPage + 1);
                  }}
                  className={currentPage === lastPage ? "disabled" : ""}
                  aria-disabled={currentPage === lastPage}
                >
                  <i className="fa fa-chevron-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}

export default PqrsList;

// import React, { useEffect, useState } from "react";
// import api from "../api/api";
// import { Link, useNavigate } from "react-router-dom";
// import "./styles/PqrsList.css";
// import PqrsFilters from "./components/PqrsFilters";
// import { tienePermiso } from "../utils/permisoHelper";
// import CountdownTimer from "./components/CountDownTimer";
// import PqrsSidebar from "../components/Sidebar/PqrsSidebar";
// import { getRole, getSede } from "../auth/authService";
// import BotonesFilters from "./components/BotonesFilters";

// function PqrsList() {
//   const [pqrs, setPqrs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [lastPage, setLastPage] = useState(1);

//   // Estado para el filtro de estado de los botones
//   const [activeStatusFilter, setActiveStatusFilter] = useState(""); // "" significa "Todos"

//   const usuario = {
//     role: getRole(),
//     sede: getSede(),
//   };

//   const [filters, setFilters] = useState({
//     pqr_codigo: "",
//     documento_numero: "",
//     servicio_prestado: [],
//     tipo_solicitud: [],
//     sede: [],
//     eps: [],
//     fecha_inicio: "",
//     fecha_fin: "",
//   });

//   const navigate = useNavigate();

//   // useEffect ahora depende de `filters`, `activeStatusFilter` y `currentPage`
//   useEffect(() => {
//     fetchPqrs(currentPage);
//   }, [filters, activeStatusFilter, currentPage]);

//   const fetchPqrs = async (page = 1) => {
//     try {
//       setLoading(true);
//       const queryParams = new URLSearchParams();
//       queryParams.append("page", page);

//       let apiUrl = "/pqrs"; // Endpoint por defecto (tu método index)

//       // **Lógica para decidir qué endpoint de API llamar**
//       // Primero, detectamos si hay algún filtro general activo (aparte del de estado)
//       const hasGeneralFilters = Object.keys(filters).some((key) => {
//         const value = filters[key];
//         if (Array.isArray(value)) return value.length > 0;
//         return value !== "";
//       });

//       // Si SOLO hay un filtro de estado y NO hay otros filtros generales
//       if (activeStatusFilter !== "" && !hasGeneralFilters) {
//         apiUrl = "/pqrs/estado"; // Usar el endpoint específico de estado
//         queryParams.append("estado_respuesta", activeStatusFilter);
//       } else {
//         // Si hay otros filtros generales O si el filtro de estado es "Todos" (vacío)
//         // Usar el endpoint general (index) y enviar todos los filtros, incluyendo el de estado si está activo
//         if (activeStatusFilter) {
//           queryParams.append("estado_respuesta", activeStatusFilter); // Enviar también el filtro de estado a `index`
//         }

//         // Añadir los filtros de búsqueda general
//         if (filters.pqr_codigo)
//           queryParams.append("pqr_codigo", filters.pqr_codigo);
//         if (filters.documento_numero)
//           queryParams.append("documento_numero", filters.documento_numero);
//         if (filters.servicio_prestado && filters.servicio_prestado.length > 0) {
//           filters.servicio_prestado.forEach((servicio) =>
//             queryParams.append("servicio_prestado[]", servicio)
//           );
//         }
//         if (filters.tipo_solicitud && filters.tipo_solicitud.length > 0) {
//           filters.tipo_solicitud.forEach((tipo) =>
//             queryParams.append("tipo_solicitud[]", tipo)
//           );
//         }
//         if (filters.sede && filters.sede.length > 0) {
//           filters.sede.forEach((sede) => queryParams.append("sede[]", sede));
//         }
//         if (filters.eps && filters.eps.length > 0) {
//           filters.eps.forEach((eps) => queryParams.append("eps[]", eps));
//         }
//         if (filters.fecha_inicio) {
//           queryParams.append("fecha_inicio", filters.fecha_inicio);
//         }
//         if (filters.fecha_fin) {
//           queryParams.append("fecha_fin", filters.fecha_fin);
//         }
//       }

//       const res = await api.get(`${apiUrl}?${queryParams.toString()}`);

//       const processedPqrs = res.data.pqrs.map((pqr) => {
//         let processedArchivo = [];
//         if (typeof pqr.archivo === "string") {
//           try {
//             const parsed = JSON.parse(pqr.archivo);
//             if (Array.isArray(parsed)) {
//               processedArchivo = parsed.filter(
//                 (item) =>
//                   typeof item === "object" && item !== null && "path" in item
//               );
//             } else if (
//               parsed &&
//               typeof parsed === "object" &&
//               "path" in parsed
//             ) {
//               processedArchivo = [parsed];
//             } else {
//               processedArchivo = [
//                 {
//                   path: pqr.archivo,
//                   original_name: pqr.archivo.split("/").pop(),
//                 },
//               ];
//             }
//           } catch (parseError) {
//             console.warn(
//               "Error parsing pqr.archivo as JSON, treating as direct path or empty:",
//               pqr.archivo,
//               parseError
//             );
//             processedArchivo = [
//               {
//                 path: pqr.archivo,
//                 original_name: pqr.archivo.split("/").pop(),
//               },
//             ];
//           }
//         } else if (Array.isArray(pqr.archivo)) {
//           processedArchivo = pqr.archivo.filter(
//             (item) =>
//               typeof item === "object" && item !== null && "path" in item
//           );
//         } else if (
//           pqr.archivo &&
//           typeof pqr.archivo === "object" &&
//           "path" in pqr.archivo
//         ) {
//           processedArchivo = [pqr.archivo];
//         }

//         return { ...pqr, archivo: processedArchivo };
//       });

//       setPqrs(processedPqrs);
//       setCurrentPage(res.data.current_page);
//       setLastPage(res.data.last_page);
//     } catch (err) {
//       console.error("Error al obtener las PQRS:", err);
//       setError("No se pudo cargar la información");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStatusFilterClick = (status) => {
//     setActiveStatusFilter(status); // Actualiza el estado del filtro de estado
//     setCurrentPage(1); // Siempre vuelve a la primera página con el nuevo filtro aplicado
//   };

//   const handleBuscar = () => {
//     setCurrentPage(1); // Al hacer click en buscar, siempre vuelve a la primera página
//   };

//   const handlePageChange = (page) => {
//     if (page >= 1 && page <= lastPage) {
//       setCurrentPage(page);
//     }
//   };

//   if (loading) return <p>Cargando...</p>;
//   if (error) return <p>{error}</p>;

//   return (
//     <>
//       <div className="app-layout-container">
//         <PqrsSidebar pqrsData={pqrs} />
//         <div className="container-pqrs">
//           <div className="cabecera">
//             <h2>Listado de PQRS</h2>
//           </div>

//           <BotonesFilters
//             activeStatusFilter={activeStatusFilter}
//             onStatusFilterClick={handleStatusFilterClick}
//           />

//           <div className="header-top">
//             <PqrsFilters
//               filters={filters}
//               setFilters={setFilters}
//               onBuscar={handleBuscar}
//             />
//           </div>

//           <div className="table-wrapper">
//             <table className="container-table">
//               <thead>
//                 <tr>
//                   <th>Acciones</th>
//                   <th>Respuesta preliminar</th>
//                   <th># Radicado</th>
//                   <th>Fecha de solicitud</th>
//                   <th>Sede</th>
//                   <th>Tipo Solicitud</th>
//                   <th>Prioridad</th>
//                   <th>Estado de la PQR</th>
//                   <th>Tipo Doc.</th>
//                   <th>Número Doc.</th>
//                   <th>Nombre</th>
//                   <th>Apellido</th>
//                   <th>EPS</th>
//                   <th>Servicio prestado</th>
//                   <th>Atributo de calidad</th>
//                   <th>Asignado a</th>
//                   <th>Fecha de cierre</th>
//                   <th>Canal de ingreso</th>
//                   <th>Tiempo de respuesta PASSUS</th>
//                   {/* <th>Archivos</th> */}
//                   <th>Respuesta enviada a usuario</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {pqrs
//                   .filter((pqr) => {
//                     // Este filtro de frontend por rol/sede solo es necesario si el backend no lo aplica
//                     // Si el backend ya filtra por Digitador/Gestor/Sede, esta parte puede ser redundante o eliminada
//                     // para confiar solo en el filtro del backend.
//                     if (usuario.role === "Gestor") {
//                       return pqr.sede === usuario.sede;
//                     }
//                     return true;
//                   })
//                   .map((pqr) => (
//                     <tr key={pqr.pqr_codigo}>
//                       <td>
//                         {tienePermiso([
//                           "Administrador",
//                           "Consultor",
//                           "Supervisor",
//                           "Gestor",
//                           "Digitador",
//                         ]) && (
//                           <button
//                             onClick={() => navigate(`/pqrs/${pqr.pqr_codigo}`)}
//                           >
//                             <i className="fa fa-eye icono-ver"></i>
//                           </button>
//                         )}
//                       </td>
//                       <td className="pqr-status-cell">
//                         {" "}
//                         {/* Mantén la clase pqr-status-cell para el centrado y tamaño */}
//                         {pqr.estado_respuesta === "En proceso" ? (
//                           <i
//                             className="fa-solid fa-check pqr-status-icon process-icon"
//                             title="PQR en proceso"
//                           ></i>
//                         ) : pqr.estado_respuesta === "Cerrado" ? (
//                           <i
//                             className="fa-solid fa-slash pqr-status-icon closed-icon"
//                             title="PQR cerrada"
//                           ></i>
//                         ) : (
//                           // Si no es "En proceso" ni "Cerrado"
//                           <i
//                             className="fa-solid fa-square-xmark pqr-status-icon not-process-icon"
//                             title="PQR sin respuesta preliminar"
//                           ></i>
//                         )}
//                       </td>
//                       <td>{pqr.pqr_codigo}</td>
//                       <td>{new Date(pqr.created_at).toLocaleString()}</td>
//                       <td>{pqr.sede}</td>
//                       <td>{pqr.tipo_solicitud}</td>
//                       <td>{pqr.prioridad || "No asignada"}</td>
//                       <td>{pqr.estado_respuesta}</td>
//                       <td>{pqr.documento_tipo}</td>
//                       <td>{pqr.documento_numero}</td>
//                       <td>{pqr.nombre}</td>
//                       <td>{pqr.apellido}</td>
//                       <td>{pqr.eps}</td>
//                       <td>{pqr.servicio_prestado}</td>
//                       <td>{pqr.atributo_calidad}</td>
//                       <td>
//                         {Array.isArray(pqr.asignados) &&
//                         pqr.asignados.length > 0 ? (
//                           <ul style={{ paddingLeft: "1rem", margin: 0 }}>
//                             {pqr.asignados.map((usuario) => (
//                               <li key={usuario.id}>{usuario.name}</li>
//                             ))}
//                           </ul>
//                         ) : (
//                           "Sin asignar"
//                         )}
//                       </td>

//                       <td>{pqr.respondido_en}</td>
//                       <td>{pqr.fuente}</td>
//                       <td>
//                         {pqr.estado_respuesta === "Cerrado" ? (
//                           <span
//                             style={{ color: "#474646", fontStyle: "italic" }}
//                           >
//                             Finalizado
//                           </span>
//                         ) : pqr.deadline_interno ? (
//                           <CountdownTimer targetDate={pqr.deadline_interno} />
//                         ) : (
//                           <span
//                             style={{ color: "#474646", fontStyle: "italic" }}
//                           >
//                             No iniciado
//                           </span>
//                         )}
//                       </td>
//                       {/* <td>
//                         {pqr.archivo && pqr.archivo.length > 0
//                           ? pqr.archivo.map((fileItem, fileIndex) => (
//                               <div
//                                 key={fileIndex}
//                                 style={{ marginBottom: "5px" }}
//                               >
//                                 <a
//                                   href={`http://127.0.0.1:8000/storage/${fileItem.path}`}
//                                   target="_blank"
//                                   rel="noopener noreferrer"
//                                 >
//                                   {fileItem.original_name ||
//                                     `Archivo ${fileIndex + 1}`}
//                                 </a>
//                               </div>
//                             ))
//                           : "Sin archivos"}
//                       </td> */}
//                       <td>
//                         {pqr.respuesta_enviada === 1
//                           ? "Enviada ✅"
//                           : "No enviada ❌"}
//                       </td>
//                     </tr>
//                   ))}
//               </tbody>
//             </table>
//           </div>

//           <nav className="paginacion">
//             <ul className="elementosPaginacion">
//               <li className="numero">
//                 <a
//                   href="#"
//                   onClick={(e) => {
//                     e.preventDefault();
//                     if (currentPage > 1) handlePageChange(currentPage - 1);
//                   }}
//                   className={currentPage === 1 ? "disabled" : ""}
//                   aria-disabled={currentPage === 1}
//                 >
//                   <i className="fa fa-chevron-left"></i>
//                 </a>
//               </li>

//               {[...Array(lastPage)].map((_, index) => {
//                 const page = index + 1;
//                 return (
//                   <li
//                     key={page}
//                     className={`numero ${page === currentPage ? "active" : ""}`}
//                   >
//                     <a
//                       href="#"
//                       onClick={(e) => {
//                         e.preventDefault();
//                         if (page !== currentPage) handlePageChange(page);
//                       }}
//                     >
//                       {page}
//                     </a>
//                   </li>
//                 );
//               })}

//               <li className="numero">
//                 <a
//                   href="#"
//                   onClick={(e) => {
//                     e.preventDefault();
//                     if (currentPage < lastPage)
//                       handlePageChange(currentPage + 1);
//                   }}
//                   className={currentPage === lastPage ? "disabled" : ""}
//                   aria-disabled={currentPage === lastPage}
//                 >
//                   <i className="fa fa-chevron-right"></i>
//                 </a>
//               </li>
//             </ul>
//           </nav>
//         </div>
//       </div>
//     </>
//   );
// }

// export default PqrsList;
