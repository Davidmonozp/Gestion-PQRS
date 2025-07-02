import React, { useEffect, useState } from "react";
import { getPqrsAsignadas } from "./pqrsService";
import { useNavigate } from "react-router-dom";
import { tienePermiso } from "../utils/permisoHelper";
import "./styles/PqrsList.css";
import Navbar from "../components/Navbar/Navbar";

function PqrsAsignadas() {
  const [pqrs, setPqrs] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getPqrsAsignadas();
        setPqrs(data);
      } catch (err) {
        setError("Error al cargar las PQRs asignadas.");
        console.error(err);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container-pqrs">
        <div className="header-top">
          <h2>Mis PQRs Asignadas</h2>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="table-wrapper">
          <table className="container-table">
            <thead>
              <tr>
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
                <th>Descripción</th>
                <th>Archivo</th>
                <th>Estado de la respuesta</th>
                <th>Respuesta enviada a usuario</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pqrs.length === 0 ? (
                <tr>
                  <td colSpan="16">No hay PQRs asignadas.</td>
                </tr>
              ) : (
                pqrs.map((pqr) => (
                  <tr key={pqr.id}>
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
                    <td>{pqr.descripcion}</td>
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
                    <td>
                      <button onClick={() => navigate(`/pqrs/${pqr.pqr_codigo}`)}>
                        <i className="fa-solid fa-eye"></i>
                      </button>
                      <button
                        onClick={() => navigate(`/pqrs/${pqr.pqr_codigo}/respuesta`)}
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default PqrsAsignadas;
