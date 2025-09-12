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
        String(pqr.pqr_codigo).toLowerCase().includes(filters.pqr_codigo.toLowerCase())
      );
    }

    if (filters.documento_numero) {
      filteredData = filteredData.filter((pqr) =>
        String(pqr.documento_numero).toLowerCase().includes(filters.documento_numero.toLowerCase())
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
          matchesStartDate = pqrDate >= new Date(filters.fecha_inicio + "T00:00:00");
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
    pqrsFiltradas.map((pqr, index) => {
      const total = pqrsFiltradas.length; // total de PQRs filtradas
      const globalIndex = total - index;   // índice descendente

      const yaRespondio = pqr.respuestas?.some(
        (r) => r.user_id === usuarioId
      );

      return (
        <tr key={pqr.id}>
          <td>
            <button onClick={() => navigate(`/pqrs/${pqr.pqr_codigo}`)}>
              <i className="fa-solid fa-eye"></i>
            </button>
            {!yaRespondio && (
              <button onClick={() => navigate(`/pqrs/${pqr.pqr_codigo}/respuesta`)}>
                <i className="fa-solid fa-pen-to-square"></i>
              </button>
            )}
            {yaRespondio && (
              <button onClick={() =>
                Swal.fire({
                  icon: "info",
                  title: "Ya has respondido",
                  text: "Ya registraste una respuesta para esta PQR.",
                  confirmButtonText: "Aceptar",
                })
              }>
                <i className="fa-solid fa-ban" style={{ color: "gray" }}></i>
              </button>
            )}
          </td>

          {/* ✅ Aquí está el índice descendente */}
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
          <td>{`${pqr.nombre} ${pqr.segundo_nombre} ${pqr.apellido} ${pqr.segundo_apellido}`}</td>
          <td>{pqr.eps}</td>
          <td>{pqr.servicio_prestado}</td>
          <td>{pqr.respondido_en}</td>
          <td>
            {pqr.estado_respuesta === "Cerrado" ? (
              <span style={{ color: "#474646", fontStyle: "italic" }}>Finalizado</span>
            ) : pqr.deadline_interno ? (
              <CountdownTimer targetDate={pqr.deadline_interno} />
            ) : (
              <span style={{ color: "#474646", fontStyle: "italic" }}>No iniciado</span>
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
                      className={`fa-solid ${respondio ? "fa-check pqr-icon success" : "fa-clock pqr-icon pending"}`}
                      title={respondio ? "Respuesta enviada" : "Pendiente de respuesta"}
                    ></i>
                    <span className="pqr-user-name" title={usuario.name}>{usuario.name}</span>
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


// import React, { useEffect, useState, useMemo } from "react"; // Importa useMemo
// import { getPqrsAsignadas } from "./pqrsService";
// import { useNavigate } from "react-router-dom";
// import { tienePermiso } from "../utils/permisoHelper"; // Asegúrate de que esto es usado si es necesario
// import Navbar from "../components/Navbar/Navbar";
// import Swal from "sweetalert2";
// import PqrsFilters from "./components/PqrsFilters";

// function PqrsAsignadas() {
//   const [pqrsBrutas, setPqrsBrutas] = useState([]); // Almacena todas las PQRs sin filtrar
//   const [pqrsFiltradas, setPqrsFiltradas] = useState([]); // Almacena las PQRs después de aplicar filtros
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false); // Para indicar si se están cargando los datos
//   const navigate = useNavigate();

//   const [filters, setFilters] = useState({
//     pqr_codigo: "",
//     documento_numero: "",
//     servicio_prestado: [], // Asumo que estos son arrays para múltiples selecciones
//     tipo_solicitud: [],
//     sede: [],
//     eps: [],
//     fecha_inicio: "",
//     fecha_fin: "",
//   });

//   // 1. useEffect para cargar todas las PQRs inicialmente
//   useEffect(() => {
//     async function fetchData() {
//       setLoading(true);
//       try {
//         const data = await getPqrsAsignadas(); // Esta función debería traer TODAS las PQRs asignadas
//         setPqrsBrutas(data); // Guarda todas las PQRs sin filtrar
//         setPqrsFiltradas(data); // Inicialmente, las filtradas son todas
//       } catch (err) {
//         setError("Error al cargar las PQRs asignadas.");
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchData();
//   }, []); // El array de dependencias vacío significa que se ejecuta una vez al montar

//   // 2. Función para manejar la aplicación de filtros (ejecutada por el botón "Buscar" de PqrsFilters)
//   const handleBuscar = () => {
//     // Aquí implementas la lógica de filtrado en el frontend
//     let filteredData = [...pqrsBrutas]; // Comienza con todas las PQRs

//     // Filtrar por Código PQR
//     if (filters.pqr_codigo) {
//       filteredData = filteredData.filter((pqr) =>
//         String(pqr.pqr_codigo)
//           .toLowerCase()
//           .includes(filters.pqr_codigo.toLowerCase())
//       );
//     }

//     // Filtrar por Número de Documento
//     if (filters.documento_numero) {
//       filteredData = filteredData.filter((pqr) =>
//         String(pqr.documento_numero)
//           .toLowerCase()
//           .includes(filters.documento_numero.toLowerCase())
//       );
//     }

//     // Filtrar por Servicio Prestado (si es un array de selecciones)
//     if (filters.servicio_prestado && filters.servicio_prestado.length > 0) {
//       filteredData = filteredData.filter((pqr) =>
//         filters.servicio_prestado.includes(pqr.servicio_prestado)
//       );
//     }

//     // Filtrar por Tipo de Solicitud (si es un array de selecciones)
//     if (filters.tipo_solicitud && filters.tipo_solicitud.length > 0) {
//       filteredData = filteredData.filter((pqr) =>
//         filters.tipo_solicitud.includes(pqr.tipo_solicitud)
//       );
//     }

//     // Filtrar por Sede (si es un array de selecciones)
//     if (filters.sede && filters.sede.length > 0) {
//       filteredData = filteredData.filter((pqr) =>
//         filters.sede.includes(pqr.sede)
//       );
//     }

//     // Filtrar por EPS (si es un array de selecciones)
//     if (filters.eps && filters.eps.length > 0) {
//       filteredData = filteredData.filter((pqr) =>
//         filters.eps.includes(pqr.eps)
//       );
//     }

//     // Ejemplo: Si 'fecha' es una fecha de inicio (mayor o igual)
//     if (filters.fecha_inicio || filters.fecha_fin) {
//       filteredData = filteredData.filter((pqr) => {
//         const pqrDate = new Date(pqr.created_at); // Asume que 'created_at' es tu campo de fecha de la PQR

//         let matchesStartDate = true;
//         if (filters.fecha_inicio) {
//           const startDate = new Date(filters.fecha_inicio + "T00:00:00"); // Añade la hora para asegurar comparación correcta
//           matchesStartDate = pqrDate >= startDate;
//         }

//         let matchesEndDate = true;
//         if (filters.fecha_fin) {
//           const endDate = new Date(filters.fecha_fin + "T23:59:59"); // Añade la hora para asegurar comparación correcta hasta el final del día
//           matchesEndDate = pqrDate <= endDate;
//         }

//         return matchesStartDate && matchesEndDate;
//       });
//     }
//     setPqrsFiltradas(filteredData); // Actualiza el estado con los resultados filtrados
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="container-pqrs">
//         <div className="header-top">
//           <h2>PQR-S Asignadas a {localStorage.getItem("nameUser")}</h2>
//           <PqrsFilters
//             filters={filters}
//             setFilters={setFilters}
//             onBuscar={handleBuscar}
//           />
//         </div>
//         {error && <p style={{ color: "red" }}>{error}</p>}
//         {loading && <p>Cargando PQRs...</p>} {/* Indicador de carga */}
//         <div className="table-wrapper">
//           <table className="container-table">
//             <thead>
//               <tr>
//                 <th>Acciones</th>
//                 <th>ID</th>
//                 <th>Nombre</th>
//                 <th>Tipo Doc.</th>
//                 <th>Número Doc.</th>
//                 <th>Correo</th>
//                 <th>Teléfono</th>
//                 <th>Sede</th>
//                 <th>Servicio</th>
//                 <th>EPS</th>
//                 <th>Tipo Solicitud</th>
//                 <th>Archivo</th>
//                 <th>Estado de la respuesta</th>
//                 <th>Respuesta enviada a usuario</th>
//                 <th>Fecha</th>
//               </tr>
//             </thead>
//             <tbody>
//               {pqrsFiltradas.length === 0 && !loading ? ( // Mostrar mensaje si no hay resultados y no está cargando
//                 <tr>
//                   <td colSpan="16">
//                     No hay PQRs asignadas que coincidan con los filtros.
//                   </td>
//                 </tr>
//               ) : (
//                 pqrsFiltradas.map(
//                   (
//                     pqr // Renderiza pqrsFiltradas
//                   ) => (
//                     <tr key={pqr.id}>
//                       <td>
//                         <button
//                           onClick={() => navigate(`/pqrs/${pqr.pqr_codigo}`)}
//                         >
//                           <i className="fa-solid fa-eye"></i>
//                         </button>
//                         {pqr.has_respondido ? (
//                           <button
//                             onClick={() => {
//                               Swal.fire({
//                                 title: "¡Atención!",
//                                 text: "Ya has registrado una respuesta preliminar para esta PQR.",
//                                 icon: "info",
//                                 confirmButtonText: "Aceptar",
//                               }).then(() => {
//                                 navigate(`/pqrs/${pqr.pqr_codigo}`);
//                               });
//                             }}
//                           >
//                             <i className="fa-solid fa-eye"></i>
//                           </button>
//                         ) : (
//                           <button
//                             onClick={() =>
//                               navigate(`/pqrs/${pqr.pqr_codigo}/respuesta`)
//                             }
//                           >
//                             <i className="fa-solid fa-pen-to-square"></i>
//                           </button>
//                         )}
//                       </td>
//                       <td>{pqr.pqr_codigo}</td>
//                       <td>
//                         {pqr.nombre} {pqr.apellido}
//                       </td>
//                       <td>{pqr.documento_tipo}</td>
//                       <td>{pqr.documento_numero}</td>
//                       <td>{pqr.correo}</td>
//                       <td>{pqr.telefono || "No proporcionado"}</td>
//                       <td>{pqr.sede}</td>
//                       <td>{pqr.servicio_prestado}</td>
//                       <td>{pqr.eps}</td>
//                       <td>{pqr.tipo_solicitud}</td>
//                       <td>
//                         {pqr.archivo ? (
//                           <a
//                             href={`http://127.0.0.1:8000/storage/${pqr.archivo}`}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                           >
//                             Ver archivo
//                           </a>
//                         ) : (
//                           "Sin archivo"
//                         )}
//                       </td>
//                       <td>{pqr.estado_respuesta}</td>
//                       <td>
//                         {pqr.respuesta_enviada === 1
//                           ? "Enviada ✅"
//                           : "No enviada ❌"}
//                       </td>
//                       <td>{new Date(pqr.created_at).toLocaleString()}</td>
//                     </tr>
//                   )
//                 )
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </>
//   );
// }

// export default PqrsAsignadas;
