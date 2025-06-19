import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import "./styles/PqrsDetail.css";
import { tienePermiso } from "../utils/permisoHelper";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar/Navbar";

function PqrsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pqr, setPqr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [respuestaFinal, setRespuestaFinal] = useState("");
  const [yaTieneFinal, setYaTieneFinal] = useState(false);

  const [formData, setFormData] = useState({
    atributo_calidad: "",
    fuente: "",
    asignado_a: "",
  });

  useEffect(() => {
    if (
      !tienePermiso([
        "Administrador",
        "Consultor",
        "Supervisor",
        "Gestor",
        "Digitador",
      ])
    ) {
      Swal.fire({
        icon: "error",
        title: "Acceso denegado",
        text: "No tienes permiso para ver esta página",
        confirmButtonText: "Aceptar",
      }).then(() => navigate("/dashboard"));
      return;
    }

    const fetchData = async () => {
      try {
        const [pqrRes, usersRes] = await Promise.all([
          api.get(`/pqrs/${id}`),
          api.get("/users"),
        ]);

        const pqrData = pqrRes.data.pqr;
        setPqr(pqrData);
        setUsuarios(usersRes.data);
        setFormData({
          atributo_calidad: pqrData.atributo_calidad || "",
          fuente: pqrData.fuente || "",
          asignado_a: pqrData.asignado ? pqrData.asignado.id : "",
        });

        const finalExistente = pqrData.respuestas?.some(
          (resp) => resp.es_final
        );
        setYaTieneFinal(finalExistente);
      } catch (err) {
        setError("Error al cargar la PQRS");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedData = {};
    for (const key in formData) {
      if (formData[key] !== "") {
        cleanedData[key] = formData[key];
      }
    }

    try {
      await api.put(`/pqrs/${id}`, cleanedData);
      Swal.fire("Actualizado", "PQRS actualizada correctamente", "success");
    } catch (err) {
      Swal.fire("Error", "No se pudo actualizar la PQRS", "error");
    }
  };

  const registrarRespuestaFinal = async () => {
    if (!respuestaFinal.trim()) {
      Swal.fire("Error", "El contenido no puede estar vacío", "warning");
      return;
    }

    try {
      await api.post(`/pqrs/${id}/respuesta-final`, {
        contenido: respuestaFinal,
      });
      Swal.fire(
        "Éxito",
        "Respuesta final registrada correctamente",
        "success"
      ).then(() => window.location.reload());
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.error || "Error al registrar respuesta",
        "error"
      );
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;
  if (!pqr) return <p>No se encontró la PQRS</p>;

  return (
    <>
      <Navbar />
      <div className="pqr-card-container">
        <h2>Detalle y edición de la PQRS #{pqr.id}</h2>
        <div className="pqr-card-columns">
          {/* Columna izquierda */}
          <div className="pqr-card-col">
            <p>
              <strong>Nombre:</strong> {pqr.nombre} {pqr.apellido}
            </p>
            <p>
              <strong>Tipo de Documento:</strong> {pqr.documento_tipo}
            </p>
            <p>
              <strong>Número de Documento:</strong> {pqr.documento_numero}
            </p>
            <p>
              <strong>Correo:</strong> {pqr.correo}
            </p>
            <p>
              <strong>Teléfono:</strong> {pqr.telefono || "No proporcionado"}
            </p>
            <p>
              <strong>Sede:</strong> {pqr.sede}
            </p>
          </div>

          {/* Columna derecha */}
          <div className="pqr-card-col">
            <p>
              <strong>Servicio:</strong> {pqr.servicio_prestado}
            </p>
            <p>
              <strong>EPS:</strong> {pqr.eps}
            </p>
            <p>
              <strong>Tipo de Solicitud:</strong> {pqr.tipo_solicitud}
            </p>
            <p>
              <strong>Fecha:</strong>{" "}
              {new Date(pqr.created_at).toLocaleString()}
            </p>
            {pqr.archivo && (
              <p>
                <strong>Archivo:</strong>{" "}
                <a
                  href={`http://127.0.0.1:8000/storage/${pqr.archivo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver archivo
                </a>
              </p>
            )}

            {!["Consultor", "Digitador"].includes(
              localStorage.getItem("role")
            ) && (
              <form onSubmit={handleSubmit}>
                <label>Atributo de Calidad:</label>
                <select
                  name="atributo_calidad"
                  value={formData.atributo_calidad}
                  onChange={handleChange}
                  className="styled-input"
                >
                  <option value="" disabled>
                    Seleccione una opción
                  </option>
                  <option value="Accesibilidad">Accesibilidad</option>
                  <option value="Continuidad">Continuidad</option>
                  <option value="Oportunidad">Oportunidad</option>
                  <option value="Pertinencia">Pertinencia</option>
                  <option value="Satisfacción del usuario">
                    Satisfacción del usuario
                  </option>
                  <option value="Seguridad">Seguridad</option>
                </select>

                <label>Fuente:</label>
                <select
                  name="fuente"
                  value={formData.fuente}
                  onChange={handleChange}
                  className="styled-input"
                >
                  <option value="" disabled>
                    Seleccione una fuente
                  </option>
                  <option value="Formulario de la web">
                    Formulario de la web
                  </option>
                  <option value="Correo atención al usuario">
                    Correo atención al usuario
                  </option>
                  <option value="Correo de Agendamiento NAC">
                    Correo de Agendamiento NAC
                  </option>
                  <option value="Encuesta de satisfacción IPS">
                    Encuesta de satisfacción IPS
                  </option>
                  <option value="Callcenter">Callcenter</option>
                  <option value="Presencial">Presencial</option>
                </select>

                <label>Asignado a:</label>
                <select
                  name="asignado_a"
                  value={formData.asignado_a}
                  onChange={handleChange}
                  className="styled-input"
                >
                  <option value="" disabled>
                    Seleccione un usuario
                  </option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.name}
                    </option>
                  ))}
                </select>

                <button type="submit">Guardar Cambios</button>
              </form>
            )}
          </div>

          {/* Descripción */}
          <div className="pqr-card-description-full">
            <p>
              <strong>Descripción:</strong>
            </p>
            <div className="pqr-description-text">{pqr.descripcion}</div>
          </div>

          {/* Respuestas */}
          {pqr.respuestas.map((respuesta) => (
            <div key={respuesta.id} className="respuesta-card">
              {respuesta.es_final ? (
                <h4 className="titulo-final">📌 Respuesta Final</h4>
              ) : (
                <h4 className="titulo-preliminar">📝 Respuesta Preliminar</h4>
              )}
              <p>
                <strong>Fecha:</strong>{" "}
                {new Date(respuesta.created_at).toLocaleString()}
              </p>
              <div className="contenido-respuesta">{respuesta.contenido}</div>
            </div>
          ))}

          {/* Formulario respuesta final */}
          {tienePermiso(["Supervisor", "Gestor", "Administrador"]) &&
            !yaTieneFinal && (
              <div className="pqr-card-section pqr-card-col">
                <h3>Registrar Respuesta Final</h3>
                <textarea
                  value={respuestaFinal}
                  onChange={(e) => setRespuestaFinal(e.target.value)}
                  rows="5"
                  placeholder="Escribe la respuesta final..."
                  className="styled-input"
                ></textarea>
                <button onClick={registrarRespuestaFinal}>
                  Enviar Respuesta Final
                </button>
              </div>
            )}

          {/* Registrador info */}
          {pqr.registra_otro === 1 && (
            <div className="pqr-card-section" style={{ marginTop: "1rem" }}>
              <h3>Datos de quien registra la solicitud</h3>
              <p>
                <strong>Nombre:</strong> {pqr.registrador_nombre}{" "}
                {pqr.registrador_apellido}
              </p>
              <p>
                <strong>Tipo de Documento:</strong>{" "}
                {pqr.registrador_documento_tipo}
              </p>
              <p>
                <strong>Número de Documento:</strong>{" "}
                {pqr.registrador_documento_numero}
              </p>
              <p>
                <strong>Correo:</strong> {pqr.registrador_correo}
              </p>
              <p>
                <strong>Teléfono:</strong>{" "}
                {pqr.registrador_telefono || "No proporcionado"}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default PqrsDetail;

