import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import "./styles/PqrsDetail.css";
import { tienePermiso } from "../utils/permisoHelper";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar/Navbar";
import CountdownTimer from "./components/CountDownTimer";
import SolicitarRespuestaUsuarioButton from "./components/SolicitarRespuestaUsuarioButton";

function PqrsDetail() {
  const { pqr_codigo } = useParams();
  const navigate = useNavigate();

  const [pqr, setPqr] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [respuestaFinal, setRespuestaFinal] = useState("");
  const [yaTieneFinal, setYaTieneFinal] = useState(false);
  const [mailEnviado, setMailEnviado] = useState(false);
  const [prioridadBloqueada, setPrioridadBloqueada] = useState(false);
  const estadoStyles = {
    Radicado: "estado-radicado",
    Asignado: "estado-asignado",
    "En proceso": "estado-en-proceso",
    Cerrado: "estado-cerrado",
  };
  const [plantillas, setPlantillas] = useState([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState("");

  const [formData, setFormData] = useState({
    atributo_calidad: "",
    fuente: "",
    asignado_a: "",
    prioridad: "",
  });

  // Función para cargar usuarios y detalle de PQRS
  const fetchPqr = async () => {
    try {
      setLoading(true);

      // Traer usuarios para asignar
      const resUsers = await api.get("/users");
      setUsuarios(resUsers.data);

      // Traer detalle PQR
      const res = await api.get(`/pqrs/codigo/${pqr_codigo}`);
      const p = res.data.pqr;
      setPqr(p);
      setYaTieneFinal(p.respuestas?.some((r) => r.es_final) || false);
      setMailEnviado(p.respuesta_enviada === 1);
      setFormData({
        atributo_calidad: p.atributo_calidad || "",
        fuente: p.fuente || "",
        asignado_a: p?.asignado?.id || "",
        prioridad: p.prioridad || "",
      });
      setPrioridadBloqueada(!!p.prioridad);
    } catch (err) {
      setError("Error cargando la PQRS");
    } finally {
      setLoading(false);
    }
  };

  // Verificación de permisos y carga inicial
  useEffect(() => {
    const cargarPlantillas = async () => {
      try {
        const res = await api.get("/plantillas-respuesta"); // Asegúrate de que esta ruta exista
        setPlantillas(res.data);
      } catch (error) {
        console.error("Error cargando plantillas:", error);
      }
    };

    if (
      !tienePermiso([
        "Administrador",
        "Supervisor",
        "Gestor",
        "Consultor",
        "Digitador",
      ])
    ) {
      Swal.fire({
        icon: "error",
        title: "Acceso denegado",
        text: "No tienes permiso para ver esta página",
      }).then(() => navigate("/dashboard"));
      return;
    }

    // Cargar PQR y plantillas
    fetchPqr();
    cargarPlantillas();
  }, [pqr_codigo, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "asignado_a" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.prioridad) {
      Swal.fire(
        "Debe seleccionar una prioridad",
        "El campo prioridad es obligatorio",
        "warning"
      );
      return;
    }

    const cleanedData = {};
    for (const key in formData) {
      if (formData[key] !== "") cleanedData[key] = formData[key];
    }

    try {
      const response = await api.put(`/pqrs/codigo/${pqr_codigo}`, cleanedData);

      setPqr(response.data.data);
      setPrioridadBloqueada(!!response.data.data.prioridad);

      Swal.fire("Actualizado", "PQRS actualizada correctamente", "success");
    } catch (err) {
      // 1. Registra el error completo en la consola para depuración
      console.error("Error al actualizar PQRS:", err);
      let errorMessage = "No se pudo actualizar"; // Mensaje por defecto

      if (err.response) {
        // 2. Si hay una respuesta del servidor, intenta usar su mensaje
        errorMessage =
          err.response.data?.error ||
          err.response.data?.message ||
          errorMessage;
        // Opcional: registrar más detalles de la respuesta del API en consola
        console.error("Detalles del error de la API:", err.response.data);
        console.error("Código de estado:", err.response.status);
      } else if (err.request) {
        // 3. Si no hay respuesta (ej. problema de red)
        errorMessage =
          "No se recibió respuesta del servidor. Inténtalo de nuevo.";
      } else {
        // 4. Otros errores (ej. error de código local)
        errorMessage = err.message;
      }
      Swal.fire("Error", errorMessage, "error"); // Muestra el mensaje más específico
    }
  };

  // Registrar respuesta final y refrescar datos con fetchPqr
 const registrarRespuestaFinal = async () => {
  if (!respuestaFinal.trim()) {
    return Swal.fire("Error", "El contenido no puede estar vacío", "warning");
  }

  // --- Paso 1: Mostrar el cuadro de diálogo de confirmación ---
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: "Se registrará la respuesta final al ciudadano. ¡Esta acción es irreversible!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, enviar respuesta',
    cancelButtonText: 'Cancelar'
  });

  // --- Paso 2: Verificar si el usuario confirmó ---
  if (result.isConfirmed) {
    try {
      // Como habíamos discutido, si `respuestaFinal` ya es texto plano con \n,
      // no necesitas esta línea. Si tu `textarea` genera <br> por alguna razón,
      // la mantendrías, pero el enfoque ideal es guardar \n.
      const contenidoConHTML = respuestaFinal.replace(/\n/g, "<br>"); // Revisa si esta línea sigue siendo necesaria

      await api.post(`/pqrs/codigo/${pqr_codigo}/respuesta-final`, {
        contenido: contenidoConHTML,
      });

      Swal.fire("¡Registrada!", "La respuesta final ha sido resgistrada con éxito.", "success").then(() => {
        setRespuestaFinal(""); // limpiar texto
        fetchPqr(); // refrescar datos sin recargar página
      });
    } catch (err) {
      console.error("Error al registrar respuesta final:", err);
      Swal.fire(
        "Error",
        err.response?.data?.error || "Error al registrar la respuesta final.",
        "error"
      );
    }
  } else {
    // El usuario canceló la operación
    Swal.fire("Cancelado", "El envío de la respuesta ha sido cancelado.", "info");
  }
};

  // Enviar respuesta final por correo y refrescar estado mailEnviado
 const enviarAlCiudadano = async () => {
  // --- Paso 1: Mostrar el cuadro de diálogo de confirmación ---
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: "Se enviará la respuesta final por correo electrónico al ciudadano. ¡Esta acción es irreversible!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, enviar correo',
    cancelButtonText: 'Cancelar'
  });

  // --- Paso 2: Verificar si el usuario confirmó ---
  if (result.isConfirmed) {
    try {
      await api.post(`/pqrs/codigo/${pqr_codigo}/enviar-respuesta-correo`);
      
      Swal.fire(
        "¡Correo enviado!",
        "La respuesta final fue enviada exitosamente al usuario.",
        "success"
      ).then(() => {
        setMailEnviado(true);
        fetchPqr(); // refrescar datos para reflejar estado actualizado
      });
    } catch (err) {
      console.error("Error al enviar correo al ciudadano:", err); // Mensaje más descriptivo
      Swal.fire(
        "Error",
        err.response?.data?.error || "No se pudo enviar el correo.", // Mensaje más descriptivo
        "error"
      );
    }
  } else {
    // El usuario canceló la operación
    Swal.fire("Cancelado", "El envío del correo ha sido cancelado.", "info");
  }
};

  // Función auxiliar para calcular deadline
  const getUserDeadline = (prioridad, createdAt) => {
    if (!prioridad || !createdAt) return null;

    const createdDate = new Date(createdAt);
    let hours = 0;

    switch (prioridad) {
      case "Vital":
        hours = 24;
        break;
      case "Priorizado":
        hours = 48;
        break;
      case "Simple":
        hours = 72;
        break;
      default:
        hours = 24;
    }

    const deadline = new Date(createdDate.getTime() + hours * 60 * 60 * 1000);
    return deadline;
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;
  if (!pqr) return <p>No se encontró la PQRS</p>;
  function formatoClaseEstado(estado) {
    return estadoStyles[estado] || "";
  }

  return (
    <>
      <Navbar />
      <div className="pqr-card-container">
        <h2>Detalle y edición de la PQRS #{pqr.pqr_codigo}</h2>
        <div className="pqr-card-columns">
          {/* Columna de datos simples */}
          <div className="pqr-card-col">
            <p>
              <strong>Nombre:</strong> {pqr.nombre} {pqr.apellido}
            </p>
            <p>
              <strong>Tipo Doc:</strong> {pqr.documento_tipo}
            </p>
            <p>
              <strong>No. Doc:</strong> {pqr.documento_numero}
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
            <p>
              <strong>Estado de la PQR:</strong>{" "}
              <span
                className={`estado-badge ${formatoClaseEstado(
                  pqr.estado_respuesta
                )}`}
              >
                {pqr.estado_respuesta}
              </span>
            </p>
            <p>
              <strong>Respuesta enviada al usuario:</strong>{" "}
              {pqr.respuesta_enviada === 1 ? "Enviada ✅" : "No enviada ❌"}
            </p>
            <p>
              <strong>Prioridad:</strong> {pqr.prioridad}
            </p>

            <p>
              <strong>⏱ Tiempo de Passus:</strong>{" "}
              {pqr.estado_respuesta === "Cerrado" ? (
                <span style={{ color: "gray", fontStyle: "italic" }}>
                  Finalizado
                </span>
              ) : pqr.deadline_interno ? (
                <CountdownTimer targetDate={pqr.deadline_interno} />
              ) : (
                <span style={{ color: "gray", fontStyle: "italic" }}>
                  No iniciado
                </span>
              )}
            </p>

            <p>
              <strong>⏱ Tiempo de usuario:</strong>{" "}
              {pqr.estado_respuesta === "Cerrado" ? (
                <span style={{ color: "gray", fontStyle: "italic" }}>
                  Finalizado
                </span>
              ) : pqr.deadline_ciudadano ? (
                <CountdownTimer targetDate={pqr.deadline_ciudadano} />
              ) : (
                <span style={{ color: "gray", fontStyle: "italic" }}>
                  No iniciado
                </span>
              )}
            </p>

            <p>
              <strong>La PQR fue respondida en un tiempo de:</strong>{" "}
              {pqr.tiempo_respondido || "No se ha respondido aún"}
            </p>

            {pqr.estado_respuesta === "Cerrado" && (
              <p>
                <strong>Tiempo de respuesta:</strong> {pqr.estado_tiempo}
              </p>
            )}
          </div>

          {/* Columna editable */}
          <div className="pqr-card-col">
            <p>
              <strong>Servicio:</strong> {pqr.servicio_prestado}
            </p>
            <p>
              <strong>EPS:</strong> {pqr.eps}
            </p>
            <p>
              <strong>Tipo Solicitud:</strong> {pqr.tipo_solicitud}
            </p>
            <p>
              <strong>Fecha solicitud:</strong>{" "}
              {new Date(pqr.created_at).toLocaleString()}
            </p>

            {!["Administrador", "Supervisor"].includes(
              localStorage.getItem("role")
            ) && (
              <>
                <p>
                  <strong>Atributo de calidad:</strong> {pqr.atributo_calidad}
                </p>
                <p>
                  <strong>Fuente:</strong> {pqr.fuente}
                </p>
                <p>
                  <strong>Asignado a:</strong>{" "}
                  {pqr.asignado ? pqr.asignado.name : "Sin asignar"}
                </p>
              </>
            )}

            {!["Consultor", "Digitador", "Gestor"].includes(
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
                    Seleccione
                  </option>
                  {[
                    "Accesibilidad",
                    "Continuidad",
                    "Oportunidad",
                    "Pertinencia",
                    "Satisfacción del usuario",
                    "Seguridad",
                  ].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                <label>Fuente:</label>
                <select
                  name="fuente"
                  value={formData.fuente}
                  onChange={handleChange}
                  className="styled-input"
                >
                  <option value="" disabled>
                    Seleccione
                  </option>
                  {[
                    "Formulario de la web",
                    "Correo atención",
                    "Encuesta IPS",
                    "Callcenter",
                    "Presencial",
                  ].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                <label>Asignado a:</label>
                <select
                  name="asignado_a"
                  value={formData.asignado_a}
                  onChange={handleChange}
                  className="styled-input"
                >
                  <option value="" disabled>
                    Seleccione
                  </option>
                  {usuarios.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
                <label>Prioridad:</label>
                <select
                  name="prioridad"
                  value={formData.prioridad}
                  onChange={handleChange}
                  className="styled-input"
                  disabled={prioridadBloqueada} // <- agrega esto
                >
                  <option value="" disabled>
                    Seleccione prioridad
                  </option>
                  {["Vital", "Priorizado", "Simple"].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                <button type="submit">Guardar Cambios</button>
              </form>
            )}
          </div>

          {/* Descripción larga */}
          <div className="pqr-card-description-full">
            <p>
              <strong>Descripción:</strong>
            </p>
            <div className="pqr-description-text">{pqr.descripcion}</div>

            {/* Mostrar archivo adjunto si existe */}
            {pqr.archivo && (
              <div className="archivo-adjunto" style={{ marginTop: "10px" }}>
                <strong>Archivo adjunto:</strong>{" "}
                {pqr.archivo.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                  <div>
                    <img
                      src={`http://localhost:8000/storage/${pqr.archivo}`}
                      alt="Archivo adjunto"
                      style={{ maxWidth: "300px", marginTop: "10px" }}
                    />
                  </div>
                ) : pqr.archivo.match(/\.pdf$/i) ? (
                  <div style={{ marginTop: "10px" }}>
                    <iframe
                      src={`http://localhost:8000/storage/${pqr.archivo}`}
                      title="Archivo PDF"
                      width="100%"
                      height="400px"
                      style={{ border: "1px solid #ccc" }}
                    ></iframe>
                  </div>
                ) : (
                  <a
                    href={`http://localhost:8000/storage/${pqr.archivo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-block", marginTop: "10px" }}
                  >
                    Ver archivo
                  </a>
                )}
              </div>
            )}

            {/* RESPUESTA USUARIO */}
            {/* {[
              "Radicado",
              "Asignado",
              "En proceso",
              "Respuesta del ciudadano registrada",
            ].includes(pqr.estado_respuesta) && (
              <SolicitarRespuestaUsuarioButton
                pqrId={id}
                onSuccess={() => fetchPqr()}
              />
            )} */}
            {/* FIN RESPUESTA USUARIO */}
          </div>

          {/* Sección de respuestas */}
          {pqr?.respuestas?.map((resp) => {
            const esRespuestaUsuario = resp.es_respuesta_usuario;
            const urlArchivo = resp.archivo
              ? `http://localhost:8000/storage/${resp.archivo}`
              : null;

            return (
              <div
                key={resp.id}
                className={`respuesta-card ${
                  esRespuestaUsuario
                    ? "respuesta-usuario"
                    : resp.es_final
                    ? "respuesta-final"
                    : "respuesta-preliminar"
                }`}
              >
                <h4
                  className={
                    esRespuestaUsuario
                      ? "titulo-usuario"
                      : resp.es_final
                      ? "titulo-final"
                      : "titulo-preliminar"
                  }
                >
                  {esRespuestaUsuario
                    ? "👤 Respuesta del Usuario"
                    : resp.es_final
                    ? "📌 Respuesta Final"
                    : "📝 Respuesta Preliminar"}
                </h4>

                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(resp.created_at).toLocaleString()}
                </p>

                <div
                  className="contenido-respuesta"
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{ __html: resp.contenido }}
                />

                {/* Mostrar archivo si existe */}
                {urlArchivo && (
                  <div
                    className="archivo-adjunto"
                    style={{ marginTop: "10px" }}
                  >
                    <strong>Archivo adjunto:</strong>{" "}
                    {urlArchivo.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                      <div>
                        <img
                          src={urlArchivo}
                          alt="Archivo adjunto"
                          style={{ maxWidth: "200px", marginTop: "10px" }}
                        />
                      </div>
                    ) : urlArchivo.match(/\.pdf$/i) ? (
                      <div style={{ marginTop: "10px" }}>
                        <iframe
                          src={urlArchivo}
                          title="Archivo PDF"
                          width="100%"
                          height="400px"
                          style={{ border: "1px solid #ccc" }}
                        ></iframe>
                      </div>
                    ) : (
                      <a
                        href={urlArchivo}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver archivo
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Formulario para crear respuesta final */}
          {tienePermiso(["Supervisor", "Administrador"]) &&
            !yaTieneFinal &&
            pqr && (
              <div className="pqr-card-section pqr-card-col">
                <h3>Registrar Respuesta Final</h3>

                {/* Dropdown de plantillas */}
                <label>Seleccionar plantilla:</label>
                <select
                  className="styled-input"
                  value={plantillaSeleccionada}
                  onChange={(e) => {
                    const idSeleccionado = e.target.value;
                    setPlantillaSeleccionada(idSeleccionado);

                    const plantilla = plantillas.find(
                      (p) => p.id.toString() === idSeleccionado
                    );

                    if (plantilla && pqr) {
                      let contenido = plantilla.contenido;

                      const fechaPqrCreada = new Date(
                        pqr.created_at
                      ).toLocaleDateString("es-CO", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      });

                      // Reemplazo dinámico de placeholders
                      const placeholders = {
                        "[NOMBRE]": `${pqr.nombre || ""} ${
                          pqr.apellido || ""
                        }`.trim(),
                        "[CIUDAD]": pqr.sede || "Ciudad",
                        "[CORREO]": pqr.correo || "",
                        "[TIPO_DOC]": pqr.documento_tipo || "",
                        "[NUMERO_DOC]": pqr.documento_numero || "",
                        "[TELEFONO]": pqr.telefono || "",
                        "[FECHA]": new Date().toLocaleDateString("es-CO"),
                        "[PQR_CREADA]": fechaPqrCreada,
                        "[PACIENTE]": `${pqr.nombre || ""} ${
                          pqr.apellido || ""
                        }`.trim(),
                        "[CC]": pqr.documento_tipo || "",
                      };

                      for (const clave in placeholders) {
                        const valor = placeholders[clave];
                        contenido = contenido.replaceAll(clave, valor);
                      }

                      setRespuestaFinal(contenido);
                    }
                  }}
                >
                  <option value="">-- Selecciona una plantilla --</option>
                  {plantillas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>

                {/* Área de texto editable */}
                <textarea
                  value={respuestaFinal}
                  onChange={(e) => setRespuestaFinal(e.target.value)}
                  rows="10"
                  placeholder="Escribe la respuesta final..."
                  className="styled-input respuesta-final"
                />

                <button onClick={registrarRespuestaFinal}>
                  Registrar Respuesta Final
                </button>
              </div>
            )}

          {yaTieneFinal && !mailEnviado && (
            <div>
              <button
                onClick={enviarAlCiudadano}
                className="boton-enviar-respuesta"
              >
                ✉️ Enviar Respuesta Final al Usuario
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default PqrsDetail;

// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/api";
// import "./styles/PqrsDetail.css";
// import { tienePermiso } from "../utils/permisoHelper";
// import Swal from "sweetalert2";
// import Navbar from "../components/Navbar/Navbar";
// import CountdownTimer from "./components/CountDownTimer";
// import SolicitarRespuestaUsuarioButton from "./components/SolicitarRespuestaUsuarioButton";

// function PqrsDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [pqr, setPqr] = useState(null);
//   const [usuarios, setUsuarios] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [respuestaFinal, setRespuestaFinal] = useState("");
//   const [yaTieneFinal, setYaTieneFinal] = useState(false);
//   const [mailEnviado, setMailEnviado] = useState(false);
//   const [prioridadBloqueada, setPrioridadBloqueada] = useState(false);
//   const estadoStyles = {
//     Radicado: "estado-radicado",
//     Asignado: "estado-asignado",
//     "En proceso": "estado-en-proceso",
//     Cerrado: "estado-cerrado",
//   };
//   const [plantillas, setPlantillas] = useState([]);
//   const [plantillaSeleccionada, setPlantillaSeleccionada] = useState("");

//   const [formData, setFormData] = useState({
//     atributo_calidad: "",
//     fuente: "",
//     asignado_a: "",
//     prioridad: "",
//   });

//   // Función para cargar usuarios y detalle de PQRS
//   const fetchPqr = async () => {
//     try {
//       setLoading(true);

//       // Traer usuarios para asignar
//       const resUsers = await api.get("/users");
//       setUsuarios(resUsers.data);

//       // Traer detalle PQR
//       const res = await api.get(`/pqrs/${id}`);
//       const p = res.data.pqr;
//       setPqr(p);
//       setYaTieneFinal(p.respuestas?.some((r) => r.es_final) || false);
//       setMailEnviado(p.respuesta_enviada === 1);
//       setFormData({
//         atributo_calidad: p.atributo_calidad || "",
//         fuente: p.fuente || "",
//         asignado_a: p?.asignado?.id || "",
//         prioridad: p.prioridad || "",
//       });
//       setPrioridadBloqueada(!!p.prioridad);
//     } catch (err) {
//       setError("Error cargando la PQRS");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Verificación de permisos y carga inicial
//   useEffect(() => {
//     if (
//       !tienePermiso([
//         "Administrador",
//         "Supervisor",
//         "Gestor",
//         "Consultor",
//         "Digitador",
//       ])
//     ) {
//       Swal.fire({
//         icon: "error",
//         title: "Acceso denegado",
//         text: "No tienes permiso para ver esta página",
//       }).then(() => navigate("/dashboard"));
//       return;
//     }

//     fetchPqr();
//   }, [id, navigate]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: name === "asignado_a" ? Number(value) : value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.prioridad) {
//       Swal.fire(
//         "Debe seleccionar una prioridad",
//         "El campo prioridad es obligatorio",
//         "warning"
//       );
//       return;
//     }

//     const cleanedData = {};
//     for (const key in formData) {
//       if (formData[key] !== "") cleanedData[key] = formData[key];
//     }

//     try {
//       const response = await api.put(`/pqrs/${id}`, cleanedData);

//       setPqr(response.data.data);
//       setPrioridadBloqueada(!!response.data.data.prioridad);

//       Swal.fire("Actualizado", "PQRS actualizada correctamente", "success");
//     } catch (err) {
//       Swal.fire("Error", "No se pudo actualizar", "error");
//     }
//   };

//   // Registrar respuesta final y refrescar datos con fetchPqr
//   const registrarRespuestaFinal = async () => {
//     if (!respuestaFinal.trim()) {
//       return Swal.fire("Error", "El contenido no puede estar vacío", "warning");
//     }
//     try {
//       await api.post(`/pqrs/${id}/respuesta-final`, {
//         contenido: respuestaFinal,
//       });
//       Swal.fire("Éxito", "Respuesta final registrada", "success").then(() => {
//         setRespuestaFinal(""); // limpiar texto
//         fetchPqr(); // refrescar datos sin recargar página
//       });
//     } catch (err) {
//       Swal.fire(
//         "Error",
//         err.response?.data?.error || "Error al registrar",
//         "error"
//       );
//     }
//   };

//   // Enviar respuesta final por correo y refrescar estado mailEnviado
//   const enviarAlCiudadano = async () => {
//     try {
//       await api.post(`/pqrs/${id}/enviar-respuesta-correo`);
//       Swal.fire(
//         "Correo enviado",
//         "La respuesta final fue enviada exitosamente al usuario.",
//         "success"
//       ).then(() => {
//         setMailEnviado(true);
//         fetchPqr(); // refrescar datos para reflejar estado actualizado
//       });
//     } catch (err) {
//       Swal.fire(
//         "Error",
//         err.response?.data?.error || "No se pudo enviar",
//         "error"
//       );
//     }
//   };

//   // Función auxiliar para calcular deadline
//   const getUserDeadline = (prioridad, createdAt) => {
//     if (!prioridad || !createdAt) return null;

//     const createdDate = new Date(createdAt);
//     let hours = 0;

//     switch (prioridad) {
//       case "Vital":
//         hours = 24;
//         break;
//       case "Priorizado":
//         hours = 48;
//         break;
//       case "Simple":
//         hours = 72;
//         break;
//       default:
//         hours = 24;
//     }

//     const deadline = new Date(createdDate.getTime() + hours * 60 * 60 * 1000);
//     return deadline;
//   };

//   if (loading) return <p>Cargando...</p>;
//   if (error) return <p>{error}</p>;
//   if (!pqr) return <p>No se encontró la PQRS</p>;
//   function formatoClaseEstado(estado) {
//     return estadoStyles[estado] || "";
//   }

//   return (
//     <>
//       <Navbar />
//       <div className="pqr-card-container">
//         <h2>Detalle y edición de la PQRS #{pqr.id}</h2>
//         <div className="pqr-card-columns">
//           {/* Columna de datos simples */}
//           <div className="pqr-card-col">
//             <p>
//               <strong>Nombre:</strong> {pqr.nombre} {pqr.apellido}
//             </p>
//             <p>
//               <strong>Tipo Doc:</strong> {pqr.documento_tipo}
//             </p>
//             <p>
//               <strong>No. Doc:</strong> {pqr.documento_numero}
//             </p>
//             <p>
//               <strong>Correo:</strong> {pqr.correo}
//             </p>
//             <p>
//               <strong>Teléfono:</strong> {pqr.telefono || "No proporcionado"}
//             </p>
//             <p>
//               <strong>Sede:</strong> {pqr.sede}
//             </p>
//             <p>
//               <strong>Estado de la PQR:</strong>{" "}
//               <span
//                 className={`estado-badge ${formatoClaseEstado(
//                   pqr.estado_respuesta
//                 )}`}
//               >
//                 {pqr.estado_respuesta}
//               </span>
//             </p>
//             <p>
//               <strong>Respuesta enviada al usuario:</strong>{" "}
//               {pqr.respuesta_enviada === 1 ? "Enviada ✅" : "No enviada ❌"}
//             </p>
//             <p>
//               <strong>Prioridad:</strong> {pqr.prioridad}
//             </p>

//             <p>
//               <strong>⏱ Tiempo de Passus:</strong>{" "}
//               {pqr.estado_respuesta === "Cerrado" ? (
//                 <span style={{ color: "gray", fontStyle: "italic" }}>
//                   Finalizado
//                 </span>
//               ) : pqr.deadline_interno ? (
//                 <CountdownTimer targetDate={pqr.deadline_interno} />
//               ) : (
//                 <span style={{ color: "gray", fontStyle: "italic" }}>
//                   No iniciado
//                 </span>
//               )}
//             </p>

//             <p>
//               <strong>⏱ Tiempo de usuario:</strong>{" "}
//               {pqr.estado_respuesta === "Cerrado" ? (
//                 <span style={{ color: "gray", fontStyle: "italic" }}>
//                   Finalizado
//                 </span>
//               ) : pqr.deadline_ciudadano ? (
//                 <CountdownTimer targetDate={pqr.deadline_ciudadano} />
//               ) : (
//                 <span style={{ color: "gray", fontStyle: "italic" }}>
//                   No iniciado
//                 </span>
//               )}
//             </p>

//             <p>
//               <strong>La PQR fue respondida en un tiempo de:</strong>{" "}
//               {pqr.tiempo_respondido || "No se ha respondido aún"}
//             </p>

//             {pqr.estado_respuesta === "Cerrado" && (
//               <p>
//                 <strong>Tiempo de respuesta:</strong> {pqr.estado_tiempo}
//               </p>
//             )}
//           </div>

//           {/* Columna editable */}
//           <div className="pqr-card-col">
//             <p>
//               <strong>Servicio:</strong> {pqr.servicio_prestado}
//             </p>
//             <p>
//               <strong>EPS:</strong> {pqr.eps}
//             </p>
//             <p>
//               <strong>Tipo Solicitud:</strong> {pqr.tipo_solicitud}
//             </p>
//             <p>
//               <strong>Fecha:</strong>{" "}
//               {new Date(pqr.created_at).toLocaleString()}
//             </p>

//             {!["Administrador", "Supervisor"].includes(
//               localStorage.getItem("role")
//             ) && (
//               <>
//                 <p>
//                   <strong>Atributo de calidad:</strong> {pqr.atributo_calidad}
//                 </p>
//                 <p>
//                   <strong>Fuente:</strong> {pqr.fuente}
//                 </p>
//                 <p>
//                   <strong>Asignado a:</strong>{" "}
//                   {pqr.asignado ? pqr.asignado.name : "Sin asignar"}
//                 </p>
//               </>
//             )}

//             {!["Consultor", "Digitador", "Gestor"].includes(
//               localStorage.getItem("role")
//             ) && (
//               <form onSubmit={handleSubmit}>
//                 <label>Atributo de Calidad:</label>
//                 <select
//                   name="atributo_calidad"
//                   value={formData.atributo_calidad}
//                   onChange={handleChange}
//                   className="styled-input"
//                 >
//                   <option value="" disabled>
//                     Seleccione
//                   </option>
//                   {[
//                     "Accesibilidad",
//                     "Continuidad",
//                     "Oportunidad",
//                     "Pertinencia",
//                     "Satisfacción del usuario",
//                     "Seguridad",
//                   ].map((opt) => (
//                     <option key={opt} value={opt}>
//                       {opt}
//                     </option>
//                   ))}
//                 </select>

//                 <label>Fuente:</label>
//                 <select
//                   name="fuente"
//                   value={formData.fuente}
//                   onChange={handleChange}
//                   className="styled-input"
//                 >
//                   <option value="" disabled>
//                     Seleccione
//                   </option>
//                   {[
//                     "Formulario de la web",
//                     "Correo atención",
//                     "Encuesta IPS",
//                     "Callcenter",
//                     "Presencial",
//                   ].map((opt) => (
//                     <option key={opt} value={opt}>
//                       {opt}
//                     </option>
//                   ))}
//                 </select>

//                 <label>Asignado a:</label>
//                 <select
//                   name="asignado_a"
//                   value={formData.asignado_a}
//                   onChange={handleChange}
//                   className="styled-input"
//                 >
//                   <option value="" disabled>
//                     Seleccione
//                   </option>
//                   {usuarios.map((user) => (
//                     <option key={user.id} value={user.id}>
//                       {user.name}
//                     </option>
//                   ))}
//                 </select>
//                 <label>Prioridad:</label>
//                 <select
//                   name="prioridad"
//                   value={formData.prioridad}
//                   onChange={handleChange}
//                   className="styled-input"
//                   disabled={prioridadBloqueada} // <- agrega esto
//                 >
//                   <option value="" disabled>
//                     Seleccione prioridad
//                   </option>
//                   {["Vital", "Priorizado", "Simple"].map((opt) => (
//                     <option key={opt} value={opt}>
//                       {opt}
//                     </option>
//                   ))}
//                 </select>

//                 <button type="submit">Guardar Cambios</button>
//               </form>
//             )}
//           </div>

//           {/* Descripción larga */}
//           <div className="pqr-card-description-full">
//             <p>
//               <strong>Descripción:</strong>
//             </p>
//             <div className="pqr-description-text">{pqr.descripcion}</div>

//             {/* Mostrar archivo adjunto si existe */}
//             {pqr.archivo && (
//               <div className="archivo-adjunto" style={{ marginTop: "10px" }}>
//                 <strong>Archivo adjunto:</strong>{" "}
//                 {pqr.archivo.match(/\.(jpeg|jpg|png|gif)$/i) ? (
//                   <div>
//                     <img
//                       src={`http://localhost:8000/storage/${pqr.archivo}`}
//                       alt="Archivo adjunto"
//                       style={{ maxWidth: "300px", marginTop: "10px" }}
//                     />
//                   </div>
//                 ) : pqr.archivo.match(/\.pdf$/i) ? (
//                   <div style={{ marginTop: "10px" }}>
//                     <iframe
//                       src={`http://localhost:8000/storage/${pqr.archivo}`}
//                       title="Archivo PDF"
//                       width="100%"
//                       height="400px"
//                       style={{ border: "1px solid #ccc" }}
//                     ></iframe>
//                   </div>
//                 ) : (
//                   <a
//                     href={`http://localhost:8000/storage/${pqr.archivo}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     style={{ display: "inline-block", marginTop: "10px" }}
//                   >
//                     Ver archivo
//                   </a>
//                 )}
//               </div>
//             )}

//             {/* RESPUESTA USUARIO */}
//             {/* {[
//               "Radicado",
//               "Asignado",
//               "En proceso",
//               "Respuesta del ciudadano registrada",
//             ].includes(pqr.estado_respuesta) && (
//               <SolicitarRespuestaUsuarioButton
//                 pqrId={id}
//                 onSuccess={() => fetchPqr()}
//               />
//             )} */}
//             {/* FIN RESPUESTA USUARIO */}
//           </div>

//           {/* Sección de respuestas */}
//           {pqr?.respuestas?.map((resp) => {
//             const esRespuestaUsuario = resp.es_respuesta_usuario;
//             const urlArchivo = resp.archivo
//               ? `http://localhost:8000/storage/${resp.archivo}`
//               : null;

//             return (
//               <div
//                 key={resp.id}
//                 className={`respuesta-card ${
//                   esRespuestaUsuario
//                     ? "respuesta-usuario"
//                     : resp.es_final
//                     ? "respuesta-final"
//                     : "respuesta-preliminar"
//                 }`}
//               >
//                 <h4
//                   className={
//                     esRespuestaUsuario
//                       ? "titulo-usuario"
//                       : resp.es_final
//                       ? "titulo-final"
//                       : "titulo-preliminar"
//                   }
//                 >
//                   {esRespuestaUsuario
//                     ? "👤 Respuesta del Usuario"
//                     : resp.es_final
//                     ? "📌 Respuesta Final"
//                     : "📝 Respuesta Preliminar"}
//                 </h4>

//                 <p>
//                   <strong>Fecha:</strong>{" "}
//                   {new Date(resp.created_at).toLocaleString()}
//                 </p>

//                 <div className="contenido-respuesta">{resp.contenido}</div>

//                 {/* Mostrar archivo si existe */}
//                 {urlArchivo && (
//                   <div
//                     className="archivo-adjunto"
//                     style={{ marginTop: "10px" }}
//                   >
//                     <strong>Archivo adjunto:</strong>{" "}
//                     {urlArchivo.match(/\.(jpeg|jpg|png|gif)$/i) ? (
//                       <div>
//                         <img
//                           src={urlArchivo}
//                           alt="Archivo adjunto"
//                           style={{ maxWidth: "200px", marginTop: "10px" }}
//                         />
//                       </div>
//                     ) : urlArchivo.match(/\.pdf$/i) ? (
//                       <div style={{ marginTop: "10px" }}>
//                         <iframe
//                           src={urlArchivo}
//                           title="Archivo PDF"
//                           width="100%"
//                           height="400px"
//                           style={{ border: "1px solid #ccc" }}
//                         ></iframe>
//                       </div>
//                     ) : (
//                       <a
//                         href={urlArchivo}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                       >
//                         Ver archivo
//                       </a>
//                     )}
//                   </div>
//                 )}
//               </div>
//             );
//           })}

//           {/* Formulario para crear respuesta final */}
//           {tienePermiso(["Supervisor", "Administrador"]) && !yaTieneFinal && (
//             <div className="pqr-card-section pqr-card-col">
//               <h3>Registrar Respuesta Final</h3>
//               <textarea
//                 value={respuestaFinal}
//                 onChange={(e) => setRespuestaFinal(e.target.value)}
//                 rows="5"
//                 placeholder="Escribe la respuesta final..."
//                 className="styled-input respuesta-final"
//               />
//               <button onClick={registrarRespuestaFinal}>
//                 Registrar Respuesta Final
//               </button>
//             </div>
//           )}
//           {yaTieneFinal && !mailEnviado && (
//             <div>
//               <button
//                 onClick={enviarAlCiudadano}
//                 className="boton-enviar-respuesta"
//               >
//                 ✉️ Enviar Respuesta Final al Usuario
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

// export default PqrsDetail;
