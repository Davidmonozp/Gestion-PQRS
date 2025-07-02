import React, { useEffect, useState } from "react";
import api from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import "./styles/PqrsList.css";
import PqrsFilters from "./components/PqrsFilters";
import { tienePermiso } from "../utils/permisoHelper";
import CountdownTimer from "./components/CountDownTimer";

function PqrsList() {
  const [pqrs, setPqrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [filters, setFilters] = useState({
    id: "",
    documento_numero: "",
    servicio_prestado: "",
    tipo_solicitud: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchPqrs(1); // Carga inicial
  }, []);

  const fetchPqrs = async (page = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (filters.id) queryParams.append("id", filters.id);
      if (filters.documento_numero)
        queryParams.append("documento_numero", filters.documento_numero);
      if (filters.servicio_prestado)
        queryParams.append("servicio_prestado", filters.servicio_prestado);
      if (filters.tipo_solicitud)
        queryParams.append("tipo_solicitud", filters.tipo_solicitud);

      queryParams.append("page", page);

      const res = await api.get(`/pqrs?${queryParams.toString()}`);
      setPqrs(res.data.pqrs);
      setCurrentPage(res.data.current_page);
      setLastPage(res.data.last_page);
    } catch (err) {
      console.error("Error al obtener las PQRS:", err);
      setError("No se pudo cargar la información");
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    fetchPqrs(1); // Siempre buscar desde la primera página
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= lastPage) {
      fetchPqrs(page);
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container-pqrs">
      <div className="header-top">
        <PqrsFilters
          filters={filters}
          setFilters={setFilters}
          onBuscar={handleBuscar}
        />
        <h2>Listado de PQRS</h2>
      </div>

      <div className="table-wrapper">
        <table className="container-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha de solicitud</th>
              <th>Sede</th>
              <th>Tipo Solicitud</th>
              <th>Prioridad</th>
              <th>Estado de la respuesta</th>
              <th>Tipo Doc.</th>
              <th>Número Doc.</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>EPS</th>
              <th>Servicio prestado</th>
              <th>Atributo de calidad</th>
              <th>Asignado a</th>
              <th>Fecha de cierre</th>
              <th>Canal de ingreso</th>
              <th>Tiempo de respuesta PASSUS</th>
              <th>Archivo</th>
              <th>Respuesta enviada a usuario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pqrs.map((pqr) => (
              <tr key={pqr.pqr_codigo}>
                <td>{pqr.pqr_codigo}</td>
                <td>{new Date(pqr.created_at).toLocaleString()}</td>
                <td>{pqr.sede}</td>
                <td>{pqr.tipo_solicitud}</td>
                <td>{pqr.prioridad || "No asignada"}</td>
                <td>{pqr.estado_respuesta}</td>
                <td>{pqr.documento_tipo}</td>
                <td>{pqr.documento_numero}</td>
                <td>{pqr.nombre} </td>
                <td>{pqr.apellido} </td>
                <td>{pqr.eps}</td>
                <td>{pqr.servicio_prestado}</td>
                <td>{pqr.atributo_calidad}</td>
                <td> {pqr.asignado ? pqr.asignado.name : "N/A"}</td>
                <td>{pqr.respondido_en}</td>
                <td>{pqr.fuente}</td>

                <td>
                  {pqr.estado_respuesta === "Cerrado" ? (
                    <span style={{ color: "white", fontStyle: "italic" }}>
                      Finalizado
                    </span>
                  ) : pqr.deadline_interno ? (
                    <CountdownTimer targetDate={pqr.deadline_interno} />
                  ) : (
                    <span style={{ color: "white", fontStyle: "italic" }}>
                      No iniciado
                    </span>
                  )}
                </td>
                <td>
                  {pqr.archivo ? (
                    <a
                      href={`http://127.0.0.1:8000/storage/${pqr.archivo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver archivo
                    </a>
                  ) : (
                    "Sin archivo"
                  )}
                </td>
                <td>
                  {pqr.respuesta_enviada === 1 ? "Enviada ✅" : "No enviada ❌"}
                </td>
                <td>
                  {tienePermiso([
                    "Administrador",
                    "Consultor",
                    "Supervisor",
                    "Gestor",
                    "Digitador",
                  ]) && (
                    <button onClick={() => navigate(`/pqrs/${pqr.pqr_codigo}`)}>
                      <i className="fa fa-eye"></i>
                    </button>
                  )}
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
    </div>
  );
}

export default PqrsList;
