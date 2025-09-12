import React, { useEffect, useState } from "react";
import api from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import "./styles/PqrsList.css";
import PqrsFilters from "./components/PqrsFilters";
import { tienePermiso } from "../utils/permisoHelper";
import CountdownTimer from "./components/CountDownTimer";
import PqrsSidebar from "../components/Sidebar/PqrsSidebar";
import { getRole, getSedes } from "../auth/authService";
import { Version } from "../components/Footer/Version";
// import BotonesFilters from "./components/BotonesFilters";

function PqrsList() {
  const [pqrs, setPqrs] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    current_page: 1,
    per_page: 15,
    last_page: 1,
  });

  const [filters, setFilters] = useState({
    pqr_codigo: "",
    documento_numero: "",
    servicio_prestado: [],
    tipo_solicitud: [],
    sede: [],
    eps: [],
    fecha_inicio: "",
    fecha_fin: "",
    respuesta_enviada: [],
    clasificaciones: [],
  });

  useEffect(() => {
    api
      .get("/pqrs", {
        params: { page: pagination?.current_page || 1, ...filters },
      })
      .then((res) => {
        setPqrs(res.data.pqrs);
        setPagination({
          total: res.data.total,
          current_page: res.data.current_page,
          per_page: res.data.per_page,
          last_page: res.data.last_page,
        });
      });
  }, [pagination?.current_page, filters]);

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

  const navigate = useNavigate();

  // useEffect ahora depende de `filters`, `activeStatusFilter` y `currentPage`
  useEffect(() => {
    fetchPqrs();
  }, [pagination.current_page, filters, activeStatusFilter]);

  const fetchPqrs = async (page = pagination.current_page) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append("page", page);

      if (usuario.role === "Digitador") {
        queryParams.append("per_page", 15);
      }

      let apiUrl = "/pqrs";

      const hasGeneralFilters = Object.keys(filters).some((key) => {
        const value = filters[key];
        if (Array.isArray(value)) return value.length > 0;
        return value !== "";
      });

      if (activeStatusFilter !== "" && !hasGeneralFilters) {
        apiUrl = "/pqrs/estado";
        queryParams.append("estado_respuesta", activeStatusFilter);
      } else {
        if (activeStatusFilter) {
          queryParams.append("estado_respuesta", activeStatusFilter);
        }

        if (filters.pqr_codigo)
          queryParams.append("pqr_codigo", filters.pqr_codigo);
        if (filters.documento_numero)
          queryParams.append("documento_numero", filters.documento_numero);
        if (filters.servicio_prestado?.length) {
          filters.servicio_prestado.forEach((s) =>
            queryParams.append("servicio_prestado[]", s)
          );
        }
        if (filters.tipo_solicitud?.length) {
          filters.tipo_solicitud.forEach((t) =>
            queryParams.append("tipo_solicitud[]", t)
          );
        }
        if (filters.clasificaciones?.length) {
          filters.clasificaciones.forEach((c) =>
            queryParams.append("clasificaciones[]", c)
          );
        }
        if (filters.sede?.length) {
          filters.sede.forEach((s) => queryParams.append("sede[]", s));
        }
        if (filters.eps?.length) {
          filters.eps.forEach((e) => queryParams.append("eps[]", e));
        }
        if (filters.fecha_inicio) {
          queryParams.append("fecha_inicio", filters.fecha_inicio);
        }
        if (filters.fecha_fin) {
          queryParams.append("fecha_fin", filters.fecha_fin);
        }
        if (filters.respuesta_enviada?.length) {
          filters.respuesta_enviada.forEach((estado) =>
            queryParams.append("respuesta_enviada[]", estado)
          );
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
          } catch {
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
      setPagination({
        total: res.data.total,
        current_page: res.data.current_page,
        per_page: res.data.per_page,
        last_page: res.data.last_page, // 👈 aquí está la clave
      });
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
    if (page >= 1 && page <= pagination.last_page) {
      setPagination((prev) => ({ ...prev, current_page: page }));
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <div className="app-layout-container">
        {!tienePermiso(["Digitador", "Gestor", "Gestor Administrativo"]) && (
          <PqrsSidebar pqrsData={pqrs} />
        )}
        <div className="container-pqrs">
          <div className="cabecera">
            <h2>
              <span className="color-verde">TuOpiniónCuenta |</span>Gestión y
              Seguimiento de F-PQRS
            </h2>
          </div>

          {/* <BotonesFilters
            activeStatusFilter={activeStatusFilter}
            onStatusFilterClick={handleStatusFilterClick}
          /> */}

          <div className="header-top">
            <PqrsFilters
              filters={filters}
              setFilters={(newFilters) => {
                setFilters(newFilters);
                setPagination((prev) => ({ ...prev, current_page: 1 })); // reinicia a página 1 al aplicar filtros
              }}
              onBuscar={() =>
                setPagination((prev) => ({ ...prev, current_page: 1 }))
              }
            />
          </div>

          <div className="table-wrapper">
            <table className="container-table">
              <thead>
                <tr>
                  <th>Acciones</th>
                  <th>Índice</th>
                  <th># Radicado</th>
                  <th>Fecha de solicitud</th>
                  {/* <th>Fecha de registro</th> */}
                  <th>Sede</th>
                  <th>Tipo Solicitud</th>
                  <th>Prioridad</th>
                  <th>Estado de la PQR</th>
                  <th>Tipo Doc.</th>
                  <th>Número Doc.</th>
                  <th>Nombres y Apellidos</th>
                  {/* <th>Apellido</th> */}
                  <th>EPS</th>
                  <th>Servicio prestado</th>
                  <th>Descripcion</th>
                  <th>Atributo de calidad</th>
                  <th>Asignado a</th>
                  <th>Fecha de cierre</th>
                  {/* <th>Clasificaciones</th> */}
                  <th>Tiempo de respuesta PASSUS</th>
                  {/* <th>Archivos</th> */}
                  <th>Respuesta enviada a usuario</th>
                </tr>
              </thead>
              <tbody>
                {pqrs
                  // 🔹 Primero filtramos según el rol
                  .filter((pqr) => {
                    const sedesUsuario = usuario.sedes || [];

                    if (
                      usuario.role === "Gestor" ||
                      usuario.role === "Gestor Administrativo"
                    ) {
                      return sedesUsuario.includes(pqr.sede);
                    }

                    if (usuario.role === "Digitador") {
                      return pqr.tipo_solicitud === "Solicitud";
                    }

                    return true; // otros roles ven todas
                  })
                  // 🔹 Luego calculamos el índice global descendente
                  .map((pqr, index) => {
                    const total = pagination?.total || pqrs.length;
                    const currentPage = pagination?.current_page || 1;
                    const perPage = pagination?.per_page || pqrs.length;

                    const globalIndex =
                      total - ((currentPage - 1) * perPage + index);

                    return (
                      <tr key={pqr.pqr_codigo}>
                        <td>
                          {tienePermiso([
                            "Administrador",
                            "Consultor",
                            "Supervisor/Atencion al usuario",
                            "Gestor",
                            "Gestor Administrativo",
                            "Digitador",
                          ]) && (
                            <button
                              onClick={() =>
                                navigate(`/pqrs/${pqr.pqr_codigo}`)
                              }
                            >
                              <i className="fa fa-eye icono-ver"></i>
                            </button>
                          )}
                        </td>
                        <td>{globalIndex}</td>
                        <td>{pqr.pqr_codigo}</td>
                        <td>{pqr.fecha_inicio_real || pqr.created_at}</td>
                        {/* <td>{new Date(pqr.created_at).toLocaleString()}</td> */}
                        <td>{pqr.sede}</td>
                        <td>{pqr.tipo_solicitud}</td>
                        <td>{pqr.prioridad || "No asignada"}</td>
                        <td>{pqr.estado_respuesta}</td>
                        <td>{pqr.documento_tipo}</td>
                        <td>{pqr.documento_numero}</td>
                        <td>
                          {pqr.nombre} {pqr.segundo_nombre} {pqr.apellido}{" "}
                          {pqr.segundo_apellido}
                        </td>
                        <td>{pqr.eps}</td>
                        <td>{pqr.servicio_prestado}</td>
                        <td className="descripcion" title={pqr.descripcion}>
                          {pqr.descripcion}
                        </td>
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
                                <li
                                  key={usuario.id}
                                  className="pqr-status-item"
                                >
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
                                  <span className="pqr-user-name">
                                    {usuario.name} {usuario.primer_apellido}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </td>
                        <td>{pqr.respondido_en}</td>
                        {/* <td>
                          {pqr.clasificaciones &&
                          pqr.clasificaciones.length > 0 ? (
                            pqr.clasificaciones.map((clasificacion) => (
                              <span
                                key={clasificacion.id}
                                className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded mr-1"
                              >
                                {clasificacion.nombre}
                              </span>
                            ))
                          ) : (
                            <em>Sin clasificaciones</em>
                          )}
                        </td> */}
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
                    );
                  })}
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
                    if (pagination.current_page > 1)
                      handlePageChange(pagination.current_page - 1);
                  }}
                  className={pagination.current_page === 1 ? "disabled" : ""}
                  aria-disabled={pagination.current_page === 1}
                >
                  <i className="fa fa-chevron-left"></i>
                </a>
              </li>

              {[...Array(pagination.last_page)].map((_, index) => {
                const page = index + 1;
                return (
                  <li
                    key={page}
                    className={`numero ${
                      page === pagination.current_page ? "active" : ""
                    }`}
                  >
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page !== pagination.current_page)
                          handlePageChange(page);
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
                    if (pagination.current_page < pagination.last_page)
                      handlePageChange(pagination.current_page + 1);
                  }}
                  className={
                    pagination.current_page === pagination.last_page
                      ? "disabled"
                      : ""
                  }
                  aria-disabled={
                    pagination.current_page === pagination.last_page
                  }
                >
                  <i className="fa fa-chevron-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <Version />
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
// import { getRole, getSedes } from "../auth/authService";
// import { Version } from "../components/Footer/Version";
// // import BotonesFilters from "./components/BotonesFilters";

// function PqrsList() {
//   const [pqrs, setPqrs] = useState([]);
//   const [pagination, setPagination] = useState({
//   total: 0,
//   current_page: 1,
//   per_page: 15,
// });
// useEffect(() => {
//   fetch("/api/pqrs", {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem("token")}`,
//     },
//   })
//     .then((res) => res.json())
//     .then((data) => {
//       setPqrs(data.pqrs);
//       setPagination({
//         total: data.total,
//         current_page: data.current_page,
//         per_page: data.per_page,
//       });
//     });
// }, []);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [lastPage, setLastPage] = useState(1);

//   // Estado para el filtro de estado de los botones
//   const [activeStatusFilter, setActiveStatusFilter] = useState(""); // "" significa "Todos"

//   const usuario = {
//     role: getRole(),
//     sedes: getSedes(), // Esto debe devolver un array de nombres
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
//     respuesta_enviada: [],
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

//       if (usuario.role === "Digitador") {
//         queryParams.append("per_page", 15);
//       }

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
//         if (filters.respuesta_enviada && filters.respuesta_enviada.length > 0) {
//           filters.respuesta_enviada.forEach((estado) =>
//             queryParams.append("respuesta_enviada[]", estado)
//           );
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
//         {!tienePermiso(["Digitador", "Gestor"]) && (
//           <PqrsSidebar pqrsData={pqrs} />
//         )}
//         <div className="container-pqrs">
//           <div className="cabecera">
//             <h2>
//               <span className="color-verde">TuOpiniónCuenta |</span>Gestión y
//               Seguimiento de F-PQRS
//             </h2>
//           </div>

//           {/* <BotonesFilters
//             activeStatusFilter={activeStatusFilter}
//             onStatusFilterClick={handleStatusFilterClick}
//           /> */}

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
//                   <th>Índice</th>
//                   <th># Radicado</th>
//                   <th>Fecha de solicitud</th>
//                   <th>Fecha de registro</th>
//                   <th>Sede</th>
//                   <th>Tipo Solicitud</th>
//                   <th>Prioridad</th>
//                   <th>Estado de la PQR</th>
//                   <th>Tipo Doc.</th>
//                   <th>Número Doc.</th>
//                   <th>Nombres y Apellidos</th>
//                   {/* <th>Apellido</th> */}
//                   <th>EPS</th>
//                   <th>Servicio prestado</th>
//                   <th>Descripcion</th>
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
//                     const sedesUsuario = usuario.sedes || [];

//                     if (usuario.role === "Gestor") {
//                       // Gestor: solo ve las PQRs de sus sedes asignadas (por nombre)
//                       return sedesUsuario.includes(pqr.sede);
//                     }

//                     if (usuario.role === "Digitador") {
//                       // Digitador: solo ve PQRs que sean tipo "Solicitud"
//                       return pqr.tipo_solicitud === "Solicitud";
//                     }

//                     return true; // Otros roles ven todas
//                   })
//                   .map((pqr, index) => (
//                     <tr key={pqr.pqr_codigo}>
//                       <td>
//                         {tienePermiso([
//                           "Administrador",
//                           "Consultor",
//                           "Supervisor/Atencion al usuario",
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
//                       <td>{index + 1}</td>
//                       <td>{pqr.pqr_codigo}</td>
//                       <td>
//                         {pqr.fecha_inicio_real
//                           ? pqr.fecha_inicio_real
//                           : pqr.created_at}
//                       </td>
//                       <td>{new Date(pqr.created_at).toLocaleString()}</td>
//                       <td>{pqr.sede}</td>
//                       <td>{pqr.tipo_solicitud}</td>
//                       <td>{pqr.prioridad || "No asignada"}</td>
//                       <td>{pqr.estado_respuesta}</td>
//                       <td>{pqr.documento_tipo}</td>
//                       <td>{pqr.documento_numero}</td>
//                       <td>
//                         {pqr.nombre} {pqr.segundo_nombre} {pqr.apellido} {pqr.segundo_apellido}
//                       </td>
//                       <td>{pqr.eps}</td>
//                       <td>{pqr.servicio_prestado}</td>
//                       <td className="descripcion" title={pqr.descripcion}>
//                         {pqr.descripcion}
//                       </td>
//                       <td>{pqr.atributo_calidad}</td>
//                       <td className="pqr-status-cell">
//                         <ul className="pqr-status-list">
//                           {pqr.asignados?.map((usuario) => {
//                             const respondio = (pqr.respuestas ?? []).some(
//                               (r) =>
//                                 r.user_id === usuario.id &&
//                                 r.es_respuesta_usuario === 0
//                             );

//                             return (
//                               <li key={usuario.id} className="pqr-status-item">
//                                 <i
//                                   className={`fa-solid ${
//                                     respondio
//                                       ? "fa-check pqr-icon success"
//                                       : "fa-clock pqr-icon pending"
//                                   }`}
//                                   title={
//                                     respondio
//                                       ? "Respuesta enviada"
//                                       : "Pendiente de respuesta"
//                                   }
//                                 ></i>
//                                 <span
//                                   className="pqr-user-name"
//                                   title={usuario.name}
//                                 >
//                                   {usuario.name}
//                                 </span>
//                               </li>
//                             );
//                           })}
//                         </ul>
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
//       <Version />
//     </>
//   );
// }

// export default PqrsList;
