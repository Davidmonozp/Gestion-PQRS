import React, { useEffect, useState } from "react";
import "./styles/EventLog.css";
import api from "../api/api";
import Navbar from "../components/Navbar/Navbar";

function EventLogs({ pqrId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const perPage = 10;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= lastPage) {
      setCurrentPage(page);
    }
  };

  // Llamada al backend
useEffect(() => {
  const fetchLogs = async () => {
    setLoading(true); // <-- Importante al iniciar carga

    try {
      const url = pqrId 
        ? `/event-logs/pqr/${pqrId}?page=${currentPage}&per_page=${perPage}`
        : `/event-logs?page=${currentPage}&per_page=${perPage}`;

      const response = await api.get(url);
      setLogs(response.data.data || []); // Prevención si data viene undefined
      setLastPage(response.data.last_page || 1);
    } catch (error) {
      console.error("Error al cargar logs:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchLogs();
}, [pqrId, currentPage]);


  if (loading) return <p>Cargando logs...</p>;

  return (
    <>
      <Navbar />
      <div className="table-wrapper-logs">
        <table className="container-table-logs">
          <thead>
            <tr>
              <th>ID</th>
              {/* <th>PQR</th> */}
              <th># Radicado</th>
              {/* <th>Evento</th> */}
              <th>Descripción</th>
              <th>Estado Anterior</th>
              <th>Estado Nuevo</th>
              <th>Usuario</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="8">No hay eventos registrados</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  {/* <td>{log.pqr_id}</td> */}
                  <td>{log.pqr_codigo}</td>
                  {/* <td>{log.event_type}</td> */}
                  <td>{log.description}</td>
                  <td>{log.estado_anterior}</td>
                  <td>{log.estado_nuevo}</td>
                  <td>
                    {log.user
                      ? `${log.user.name} ${log.user.primer_apellido || ""} ${
                          log.user?.documento_numero || "N/A"
                        }`
                      : "Desconocido"}
                  </td>
                  <td>{log.fecha_evento}</td>
                </tr>
              ))
            )}
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
                if (currentPage < lastPage) handlePageChange(currentPage + 1);
              }}
              className={currentPage === lastPage ? "disabled" : ""}
              aria-disabled={currentPage === lastPage}
            >
              <i className="fa fa-chevron-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default EventLogs;

// import React, { useEffect, useState } from "react";
// import "./styles/EventLog.css";
// import api from "../api/api";

// function EventLogs({ pqrId }) {
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Llamada al backend
//   useEffect(() => {
//     const fetchLogs = async () => {
//       try {
//         const url = pqrId ? `/event-logs/pqr/${pqrId}` : `/event-logs`;

//         const response = await api.get(url);
//         setLogs(response.data);
//       } catch (error) {
//         console.error("Error al cargar logs:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLogs();
//   }, [pqrId]);

//   if (loading) return <p>Cargando logs...</p>;

//   return (
//     <div className="table-wrapper-users">
//       <table className="container-table-users">
//         <thead>
//           <tr>
//             <th>ID</th>
//             {/* <th>PQR</th> */}
//             <th># Radicado</th>
//             {/* <th>Evento</th> */}
//             <th>Descripción</th>
//             <th>Estado Anterior</th>
//             <th>Estado Nuevo</th>
//             <th>Usuario</th>
//             <th>Fecha</th>
//           </tr>
//         </thead>
//         <tbody>
//           {logs.length === 0 ? (
//             <tr>
//               <td colSpan="8">No hay eventos registrados</td>
//             </tr>
//           ) : (
//             logs.map((log) => (
//               <tr key={log.id}>
//                 <td>{log.id}</td>
//                 {/* <td>{log.pqr_id}</td> */}
//                 <td>{log.pqr_codigo}</td>
//                 {/* <td>{log.event_type}</td> */}
//                 <td>{log.description}</td>
//                 <td>{log.estado_anterior}</td>
//                 <td>{log.estado_nuevo}</td>
//                 <td>
//                   {log.user
//                     ? `${log.user.name} ${log.user.primer_apellido || ""} ${
//                         log.user?.documento_numero || "N/A"
//                       }`
//                     : "Desconocido"}
//                 </td>
//                 <td>{log.fecha_evento}</td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default EventLogs;
