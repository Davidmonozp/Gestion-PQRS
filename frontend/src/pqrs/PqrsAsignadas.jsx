import React, { useEffect, useState, useMemo } from "react"; // Importa useMemo
import { getPqrsAsignadas } from "./pqrsService";
import { useNavigate } from "react-router-dom";
import { tienePermiso } from "../utils/permisoHelper"; // Asegúrate de que esto es usado si es necesario
import Navbar from "../components/Navbar/Navbar";
import Swal from "sweetalert2";
import PqrsFilters from "./components/PqrsFilters";

function PqrsAsignadas() {
  const [pqrsBrutas, setPqrsBrutas] = useState([]); // Almacena todas las PQRs sin filtrar
  const [pqrsFiltradas, setPqrsFiltradas] = useState([]); // Almacena las PQRs después de aplicar filtros
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Para indicar si se están cargando los datos
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    pqr_codigo: "",
    documento_numero: "",
    servicio_prestado: [], // Asumo que estos son arrays para múltiples selecciones
    tipo_solicitud: [],
    sede: [],
    eps: [],
    fecha_inicio: "",
    fecha_fin: "",
  });

  // 1. useEffect para cargar todas las PQRs inicialmente
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getPqrsAsignadas(); // Esta función debería traer TODAS las PQRs asignadas
        setPqrsBrutas(data); // Guarda todas las PQRs sin filtrar
        setPqrsFiltradas(data); // Inicialmente, las filtradas son todas
      } catch (err) {
        setError("Error al cargar las PQRs asignadas.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []); // El array de dependencias vacío significa que se ejecuta una vez al montar

  // 2. Función para manejar la aplicación de filtros (ejecutada por el botón "Buscar" de PqrsFilters)
  const handleBuscar = () => {
    // Aquí implementas la lógica de filtrado en el frontend
    let filteredData = [...pqrsBrutas]; // Comienza con todas las PQRs

    // Filtrar por Código PQR
    if (filters.pqr_codigo) {
      filteredData = filteredData.filter((pqr) =>
        String(pqr.pqr_codigo)
          .toLowerCase()
          .includes(filters.pqr_codigo.toLowerCase())
      );
    }

    // Filtrar por Número de Documento
    if (filters.documento_numero) {
      filteredData = filteredData.filter((pqr) =>
        String(pqr.documento_numero)
          .toLowerCase()
          .includes(filters.documento_numero.toLowerCase())
      );
    }

    // Filtrar por Servicio Prestado (si es un array de selecciones)
    if (filters.servicio_prestado && filters.servicio_prestado.length > 0) {
      filteredData = filteredData.filter((pqr) =>
        filters.servicio_prestado.includes(pqr.servicio_prestado)
      );
    }

    // Filtrar por Tipo de Solicitud (si es un array de selecciones)
    if (filters.tipo_solicitud && filters.tipo_solicitud.length > 0) {
      filteredData = filteredData.filter((pqr) =>
        filters.tipo_solicitud.includes(pqr.tipo_solicitud)
      );
    }

    // Filtrar por Sede (si es un array de selecciones)
    if (filters.sede && filters.sede.length > 0) {
      filteredData = filteredData.filter((pqr) =>
        filters.sede.includes(pqr.sede)
      );
    }

    // Filtrar por EPS (si es un array de selecciones)
    if (filters.eps && filters.eps.length > 0) {
      filteredData = filteredData.filter((pqr) =>
        filters.eps.includes(pqr.eps)
      );
    }

    // Ejemplo: Si 'fecha' es una fecha de inicio (mayor o igual)
   if (filters.fecha_inicio || filters.fecha_fin) {
      filteredData = filteredData.filter((pqr) => {
        const pqrDate = new Date(pqr.created_at); // Asume que 'created_at' es tu campo de fecha de la PQR

        let matchesStartDate = true;
        if (filters.fecha_inicio) {
          const startDate = new Date(filters.fecha_inicio + "T00:00:00"); // Añade la hora para asegurar comparación correcta
          matchesStartDate = pqrDate >= startDate;
        }

        let matchesEndDate = true;
        if (filters.fecha_fin) {
          const endDate = new Date(filters.fecha_fin + "T23:59:59"); // Añade la hora para asegurar comparación correcta hasta el final del día
          matchesEndDate = pqrDate <= endDate;
        }

        return matchesStartDate && matchesEndDate;
      });
    }
    setPqrsFiltradas(filteredData); // Actualiza el estado con los resultados filtrados
  };

  return (
    <>
      <Navbar />
       <div className="container-pqrs">
          <div className="header-top">   
          <h2>PQR-S Asignadas a {localStorage.getItem("nameUser")}</h2>
            <PqrsFilters
              filters={filters}
              setFilters={setFilters}
              onBuscar={handleBuscar}
            />
          </div>       
        {error && <p style={{ color: "red" }}>{error}</p>}
        {loading && <p>Cargando PQRs...</p>} {/* Indicador de carga */}
        <div className="table-wrapper">
          <table className="container-table">
            <thead>
              <tr>
                <th>Acciones</th>
                <th>ID</th>
                <th>Nombre</th>
                <th>Tipo Doc.</th>
                <th>Número Doc.</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Sede</th>
                <th>Servicio</th>
                <th>EPS</th>
                <th>Tipo Solicitud</th>
                <th>Archivo</th>
                <th>Estado de la respuesta</th>
                <th>Respuesta enviada a usuario</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {pqrsFiltradas.length === 0 && !loading ? ( // Mostrar mensaje si no hay resultados y no está cargando
                <tr>
                  <td colSpan="16">
                    No hay PQRs asignadas que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                pqrsFiltradas.map(
                  (
                    pqr // Renderiza pqrsFiltradas
                  ) => (
                    <tr key={pqr.id}>
                      <td>
                        <button
                          onClick={() => navigate(`/pqrs/${pqr.pqr_codigo}`)}
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          onClick={() => {
                            if (pqr.estado_respuesta === "En proceso") {
                              Swal.fire({
                                title: "¡Atención!",
                                text: "Ya existe una respuesta preliminar registrada para esta PQR.",
                                icon: "info",
                                confirmButtonText: "Aceptar",
                              }).then(() => {
                                // Podrías navegar al detalle de la PQR en lugar de solo la lista de asignadas
                                // para que el usuario pueda ver la respuesta preliminar.
                                navigate(`/pqrs/${pqr.pqr_codigo}`); // O dejarlo como estaba si es el comportamiento deseado
                              });
                            } else {
                              navigate(`/pqrs/${pqr.pqr_codigo}/respuesta`);
                            }
                          }}
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                      </td>
                      <td>{pqr.pqr_codigo}</td>
                      <td>
                        {pqr.nombre} {pqr.apellido}
                      </td>
                      <td>{pqr.documento_tipo}</td>
                      <td>{pqr.documento_numero}</td>
                      <td>{pqr.correo}</td>
                      <td>{pqr.telefono || "No proporcionado"}</td>
                      <td>{pqr.sede}</td>
                      <td>{pqr.servicio_prestado}</td>
                      <td>{pqr.eps}</td>
                      <td>{pqr.tipo_solicitud}</td>
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
                      <td>{pqr.estado_respuesta}</td>
                      <td>
                        {pqr.respuesta_enviada === 1
                          ? "Enviada ✅"
                          : "No enviada ❌"}
                      </td>
                      <td>{new Date(pqr.created_at).toLocaleString()}</td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default PqrsAsignadas;
