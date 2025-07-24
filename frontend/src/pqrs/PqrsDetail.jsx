import React, { useEffect, useState, useRef, useCallback } from "react"; // Añadimos useCallback
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import "./styles/PqrsDetail.css";
import { tienePermiso } from "../utils/permisoHelper";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar/Navbar";
import CountdownTimer from "./components/CountDownTimer";
import SeguimientoPqrs from "./components/SeguimientoPqrs";
import ClasificacionesPqrs from "./components/ClasificacionesPqrs";

function PqrsDetail() {
  const { pqr_codigo } = useParams();
  const navigate = useNavigate();
  const currentUserRole = localStorage.getItem("role");

  const [pqr, setPqr] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [respuestaFinal, setRespuestaFinal] = useState("");
  const [yaTieneFinal, setYaTieneFinal] = useState(false);
  const [existingFinalAnswerId, setExistingFinalAnswerId] = useState(null);
  const [mailEnviado, setMailEnviado] = useState(false);
  const [editandoRespuestaFinal, setEditandoRespuestaFinal] = useState(false);
  const [finalAnswerAuthorName, setFinalAnswerAuthorName] = useState(null);
  const [finalAnswerCreatedAt, setFinalAnswerCreatedAt] = useState(null);

  const [isSavingForm, setIsSavingForm] = useState(false);

  // NUEVOS ESTADOS PARA ADJUNTOS DE RESPUESTA FINAL
  const [adjuntosRespuestaFinal, setAdjuntosRespuestaFinal] = useState([]);
  const [
    adjuntosExistentesRespuestaFinal,
    setAdjuntosExistentesRespuestaFinal,
  ] = useState([]); // Para archivos YA GUARDADOS

  // Referencia para el textarea de la respuesta final
  const respuestaFinalTextareaRef = useRef(null);

  // Estados para controlar la deshabilitación de los campos
  const [prioridadBloqueada, setPrioridadBloqueada] = useState(false);
  const [atributoCalidadBloqueado, setAtributoCalidadBloqueado] =
    useState(false);
  const [fuenteBloqueada, setFuenteBloqueada] = useState(false);
  const [asignadoABloqueado, setAsignadoABloqueado] = useState(false);

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

  // Función para ajustar la altura del textarea
  const adjustTextareaHeight = () => {
    if (respuestaFinalTextareaRef.current) {
      respuestaFinalTextareaRef.current.style.height = "auto"; // Resetear a auto
      respuestaFinalTextareaRef.current.style.height =
        respuestaFinalTextareaRef.current.scrollHeight + "px";
    }
  };

  // Efecto para ajustar la altura cuando cambia el contenido
  useEffect(() => {
    adjustTextareaHeight();
  }, [respuestaFinal, editandoRespuestaFinal, loading]);

  // Función para cargar usuarios y detalle de PQRS (Memoizada con useCallback)
  const fetchPqr = useCallback(async () => {
    try {
      setLoading(true);

      // Traer usuarios para asignar
      const resUsers = await api.get("/users");
      setUsuarios(resUsers.data);

      // Traer detalle PQR
      const res = await api.get(`/pqrs/codigo/${pqr_codigo}`);
      const p = res.data.pqr;

      // Asegurarse de que p.archivo (adjuntos de la PQRS original) sea un array de objetos
      if (
        typeof p.archivo === "string" &&
        p.archivo.startsWith("[") &&
        p.archivo.endsWith("]")
      ) {
        try {
          p.archivo = JSON.parse(p.archivo);
        } catch (parseError) {
          p.archivo = []; // Default to empty array on parse error
        }
      } else if (!Array.isArray(p.archivo)) {
        p.archivo = []; // Ensure it's an array if it's null or a non-JSON string
      }

      setPqr(p);
      setMailEnviado(p.respuesta_enviada === 1);

      // --- Cargar la respuesta final existente en el estado de respuestaFinal ---
      const finalAnswer = p.respuestas?.find((r) => r.es_final);
      if (finalAnswer) {
        setYaTieneFinal(true);
        setRespuestaFinal(finalAnswer.contenido.replace(/<br>/g, "\n"));
        setExistingFinalAnswerId(finalAnswer.id);
        setFinalAnswerAuthorName(finalAnswer.autor?.name || "Desconocido");
        setFinalAnswerCreatedAt(finalAnswer.created_at || null);
        // Cargar adjuntos existentes de la respuesta final
        setAdjuntosExistentesRespuestaFinal(finalAnswer.adjuntos || []); // Asegúrate de que sea un array
      } else {
        setYaTieneFinal(false);
        setRespuestaFinal(""); // Limpiar si no hay respuesta final
        setExistingFinalAnswerId(null);
        setFinalAnswerAuthorName(null);
        setAdjuntosExistentesRespuestaFinal([]); // Limpiar si no hay respuesta final
      }
      setEditandoRespuestaFinal(false); // Al recargar o cargar por primera vez, NO estamos en modo edición.
      setAdjuntosRespuestaFinal([]); // Limpiar archivos nuevos seleccionados al cargar la PQRS

      setFormData({
        atributo_calidad: p.atributo_calidad || "",
        fuente: p.fuente || "",
        asignado_a: p?.asignado?.id || "",
        prioridad: p.prioridad || "",
        tipo_solicitud: p.tipo_solicitud || "",
      });

      // Actualizar el estado de bloqueo basado en si el campo ya tiene un valor
      setPrioridadBloqueada(!!p.prioridad);
      setAtributoCalidadBloqueado(!!p.atributo_calidad);
      setFuenteBloqueada(!!p.fuente);
      setAsignadoABloqueado(!!p.asignado?.id);
    } catch (err) {
      setError("Error cargando la PQRS");
    } finally {
      setLoading(false);
    }
  }, [pqr_codigo]); // Dependencia para useCallback

  // Verificación de permisos y carga inicial
  useEffect(() => {
    const cargarPlantillas = async () => {
      try {
        const res = await api.get("/plantillas-respuesta");
        setPlantillas(res.data);
      } catch (error) {
        console.error("Error al cargar plantillas:", error);
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

    fetchPqr();
    cargarPlantillas();
  }, [pqr_codigo, navigate, fetchPqr]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "asignado_a" ? Number(value) : value,
    }));
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!pqr || !pqr.id) {
        Swal.fire(
          "Advertencia",
          "No hay PQRS cargada o su ID no está disponible para guardar.",
          "warning"
        );
        return;
      }

      setIsSavingForm(true);

      if (!formData.prioridad) {
        Swal.fire(
          "Debe seleccionar una prioridad",
          "El campo prioridad es obligatorio",
          "warning"
        );
        setIsSavingForm(false);
        return;
      }

      if (!formData.asignado_a) {
        Swal.fire(
          "Debe seleccionar a quién se asigna",
          "El campo asignado_a es obligatorio",
          "warning"
        );
        setIsSavingForm(false);
        return;
      }

      if (!formData.fuente) {
        Swal.fire(
          "Debe seleccionar una fuente",
          "El campo fuente es obligatorio",
          "warning"
        );
        setIsSavingForm(false);
        return;
      }

      const tipoSolicitudActual =
        pqr?.tipo_solicitud || formData.tipo_solicitud;
      if (tipoSolicitudActual !== "Solicitud" && !formData.atributo_calidad) {
        Swal.fire(
          "Debe seleccionar un atributo de calidad",
          "El campo atributo_calidad es obligatorio",
          "warning"
        );
        setIsSavingForm(false);
        return;
      }

      const dataToUpdatePqr = { ...formData };

      const cleanedDataPqr = {};
      for (const key in dataToUpdatePqr) {
        if (dataToUpdatePqr[key] !== "") {
          cleanedDataPqr[key] = dataToUpdatePqr[key];
        } else if (key === "asignado_a" && dataToUpdatePqr[key] === "") {
          cleanedDataPqr[key] = null;
        }
      }

      try {
        let successMessage = "PQRS actualizada correctamente";

        const pqrUpdateResponse = await api.put(
          `/pqrs/codigo/${pqr.pqr_codigo}`,
          cleanedDataPqr
        );
        setPqr(pqrUpdateResponse.data.data);
        successMessage += " y ";

        if (err.response) {
          errorMessage =
            err.response.data?.error ||
            err.response.data?.message ||
            errorMessage;
        } else if (err.request) {
          errorMessage =
            "No se recibió respuesta del servidor. Inténtalo de nuevo.";
        } else {
          errorMessage = err.message;
        }
        Swal.fire("Error", errorMessage, "error");
      } finally {
        setIsSavingForm(false);
      }
    },
    [pqr, formData]
  );

  // Función para registrar (POST) o actualizar (PUT) la respuesta final CON ADJUNTOS
  const handleFinalAnswerAction = async () => {
    if (!respuestaFinal.trim()) {
      return Swal.fire("Error", "El contenido no puede estar vacío", "warning");
    }

    // Validación de tamaño de archivo (mantener esta aquí)
    const MAX_FILE_SIZE_MB = 7;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
    for (const file of adjuntosRespuestaFinal) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return Swal.fire(
          "Error de Archivo",
          `El archivo "${file.name}" excede el tamaño máximo permitido de ${MAX_FILE_SIZE_MB}MB.`,
          "error"
        );
      }
    }

    let titleText, confirmText, successMessage, errorMessage, apiCall;

    const formDataToSend = new FormData();
    formDataToSend.append("contenido", respuestaFinal.replace(/\n/g, "<br>"));

    // --- INICIO: Lógica Condicional para el nombre del campo de adjuntos ---
    if (yaTieneFinal && existingFinalAnswerId) {
      // Si ya existe una respuesta final (estamos ACTUALIZANDO)
      // El backend (updateRespuestaFinal) espera 'adjuntos_nuevos[]' para los archivos nuevos
      adjuntosRespuestaFinal.forEach((file) => {
        formDataToSend.append("adjuntos_nuevos[]", file);
      });
      // También envía los adjuntos existentes que el usuario decidió mantener
      adjuntosExistentesRespuestaFinal.forEach((fileItem, index) => {
        formDataToSend.append(
          `adjuntos_existentes[${index}][path]`,
          fileItem.path
        );
        formDataToSend.append(
          `adjuntos_existentes[${index}][original_name]`,
          fileItem.original_name
        );
      });
    } else {
      // Si NO existe una respuesta final (estamos REGISTRANDO una nueva)
      // El backend (registrarRespuestaFinal) espera 'adjuntos[]'
      adjuntosRespuestaFinal.forEach((file) => {
        formDataToSend.append("adjuntos[]", file);
      });
      // En este caso de nueva creación, no hay adjuntos_existentes que gestionar
    } // Configuración para peticiones con archivos (multipart/form-data)
    // --- FIN: Lógica Condicional para el nombre del campo de adjuntos ---

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    if (yaTieneFinal && existingFinalAnswerId) {
      // Ya existe una respuesta final, entonces la editamos (PUT lógico con POST)
      titleText = "¿Estás seguro de actualizar la respuesta final?";
      confirmText = "Sí, actualizar";
      successMessage = "La respuesta final ha sido actualizada con éxito.";
      errorMessage = "Error al actualizar la respuesta final.";
      formDataToSend.append("_method", "PUT"); // Laravel necesita esto para interpretar POST como PUT
      apiCall = api.post(
        `/pqrs/respuestas/${existingFinalAnswerId}`,
        formDataToSend,
        config
      );
    } else {
      // No existe una respuesta final, entonces la registramos (POST directo)
      titleText = "¿Estás seguro de registrar la respuesta final?";
      confirmText = "Sí, registrar";
      successMessage = "La respuesta final ha sido registrada con éxito.";
      errorMessage = "Error al registrar la respuesta final.";
      apiCall = api.post(
        `/pqrs/codigo/${pqr_codigo}/respuesta-final`,
        formDataToSend,
        config
      );
    }

    const result = await Swal.fire({
      title: titleText,
      // text: "¡Esta acción es irreversible una vez confirmada!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: confirmText,
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await apiCall;
        Swal.fire("¡Éxito!", successMessage, "success").then(() => {
          fetchPqr(); // Vuelve a cargar los datos de la PQRS para actualizar la UI
          setAdjuntosRespuestaFinal([]); // Limpia los archivos nuevos seleccionados
        });
      } catch (err) {
        Swal.fire("Error", err.response?.data?.error || errorMessage, "error");
      }
    } else {
      Swal.fire("Cancelado", "La operación ha sido cancelada.", "info");
    }
  };

  // Enviar respuesta final por correo y refrescar estado mailEnviado
  const enviarAlCiudadano = async () => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Se enviará la respuesta por correo electrónico al usuario. ¡Esta acción es irreversible!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, enviar correo",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await api.post(`/pqrs/codigo/${pqr_codigo}/enviar-respuesta-correo`);

        Swal.fire(
          "¡Correo enviado!",
          "La respuesta final fue enviada exitosamente al usuario.",
          "success"
        ).then(() => {
          setPqr((prevPqr) => ({ ...prevPqr, respuesta_enviada: 1 }));
          setMailEnviado(true);
          fetchPqr(); // Y luego re-fetch para una actualización completa y consistente
        });
      } catch (err) {
        Swal.fire(
          "Error",
          err.response?.data?.error || "No se pudo enviar el correo.",
          "error"
        );
      }
    } else {
      Swal.fire("Cancelado", "El envío del correo ha sido cancelado.", "info");
    }
  };

  // Función para manejar la eliminación de un archivo nuevo antes de subirlo
  const handleRemoveNewAttachment = (indexToRemove) => {
    setAdjuntosRespuestaFinal((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  // Función para manejar la eliminación de un archivo existente (solo visualmente, el backend necesita la lógica)
  const handleRemoveExistingAttachment = (indexToRemove) => {
    // Al filtrar, estos archivos no serán enviados de vuelta al backend en adjuntos_existentes
    // lo que efectivamente los "eliminará" de la respuesta al guardar.
    setAdjuntosExistentesRespuestaFinal((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
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
        <h2>Descripción y clasificación de la {pqr.pqr_codigo}</h2>
        <div className="pqr-card-columns">
          {/* Columna de datos simples (izquierda) */}
          <div className="pqr-card-col">
            {/* SI SOLICITANTE EXISTE MOSTRAR SUS DATOS */}
            {pqr.registrador_nombre && (
              <div className="solicitante">
                <p>
                  <strong>Nombre Solicitante:</strong> {pqr.registrador_nombre}{" "}
                  {pqr.registrador_apellido}
                </p>
                <p>
                  <strong>Tipo Doc. Solicitante:</strong>{" "}
                  {pqr.registrador_documento_tipo}
                </p>
                <p>
                  <strong>No. Doc. Solicitante:</strong>{" "}
                  {pqr.registrador_documento_numero}
                </p>
                <p>
                  <strong>Correo del solicitante:</strong>{" "}
                  {pqr.registrador_correo}
                </p>
                <p>
                  <strong>Teléfono del solicitante:</strong>{" "}
                  {pqr.registrador_telefono || "No proporcionado"}
                </p>
              </div>
            )}
            {/* FIN DE LOS DATOS DEL SOLICITANTE */}
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
            <ClasificacionesPqrs
              pqrId={pqr.id}
              useIdInUrl={true} 
            />
          </div>

          {/* Columna editable (centro) */}
          <div className="pqr-card-col">
            <p>
              <strong>Servicio:</strong> {pqr.servicio_prestado}
            </p>
            <p>
              <strong>EPS:</strong> {pqr.eps}
            </p>
            <p>
              <strong>Regimen:</strong> {pqr.regimen}
            </p>
            <p>
              <strong>Tipo Solicitud:</strong> {pqr.tipo_solicitud}
            </p>
            <p>
              <strong>Fecha solicitud:</strong>{" "}
              {new Date(pqr.created_at).toLocaleString()}
            </p>
            <p>
              <strong>Fecha solicitud real:</strong>{" "}
              {pqr.fecha_inicio_real
                ? new Date(pqr.fecha_inicio_real).toLocaleString()
                : "No registra"}
            </p>
            <p>
              <strong>Estado PQR:</strong> {pqr.estado_tiempo}
            </p>

            {/* Campos bloqueados para roles específicos */}
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

            {/* Formulario de edición para roles específicos */}
            {!["Consultor", "Digitador", "Gestor"].includes(
              localStorage.getItem("role")
            ) && (
              <form onSubmit={handleSubmit}>
                {pqr.tipo_solicitud !== "Solicitud" && (
                  <>
                    <label>Atributo de Calidad:</label>
                    <select
                      name="atributo_calidad"
                      value={formData.atributo_calidad}
                      onChange={handleChange}
                      className="styled-input"
                      disabled={
                        (atributoCalidadBloqueado &&
                          currentUserRole !== "Administrador") ||
                        pqr.estado_respuesta === "Cerrado"
                      }
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
                  </>
                )}

                <label>Fuente:</label>
                <select
                  name="fuente"
                  value={formData.fuente}
                  onChange={handleChange}
                  className="styled-input"
                  disabled={
                    (fuenteBloqueada && currentUserRole !== "Administrador") ||
                    pqr.estado_respuesta === "Cerrado"
                  }
                >
                  <option value="" disabled>
                    Seleccione
                  </option>
                  {[
                    "Formulario de la web",
                    "Correo atención al usuario",
                    "Correo de Agendamiento NAC",
                    "Encuesta de satisfacción IPS",
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
                  disabled={
                    (asignadoABloqueado &&
                      currentUserRole !== "Administrador") ||
                    pqr.estado_respuesta === "Cerrado"
                  }
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
                  disabled={
                    prioridadBloqueada || pqr.estado_respuesta === "Cerrado"
                  }
                >
                  <option value="" disabled>
                    Seleccione prioridad
                  </option>
                  {["Vital", "Priorizado", "Simple", "Solicitud"].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                <button type="submit">Guardar Cambios</button>
              </form>
            )}
          </div>

          {/* Descripción larga y adjuntos de la PQRS original (columna derecha) */}
          <div className="pqr-card-description-full">
            <p>
              <strong>Descripción:</strong>
            </p>
            <div className="pqr-description-text">{pqr.descripcion}</div>

            {/* Mostrar archivos adjuntos de la PQRS original si existen */}
            {pqr.archivo && pqr.archivo.length > 0 && (
              <div className="archivos-adjuntos" style={{ marginTop: "10px" }}>
                <strong>Archivos adjuntos de la PQRS:</strong>{" "}
                {pqr.archivo.map((fileItem, index) => {
                  // Asume que fileItem es un objeto { path: "...", original_name: "..." }
                  // const urlArchivo = `http://localhost:8000/storage/${fileItem.path}`;
                  const urlArchivo = `http://192.168.1.30:8000/storage/${fileItem.path}`;

                  const fileName = fileItem.original_name;

                  return (
                    <div
                      key={`pqr-file-${index}`}
                      style={{ marginBottom: "10px" }}
                    >
                      {/* Enlace para descargar o ver */}
                      <a
                        href={urlArchivo}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "inline-block", marginRight: "10px" }}
                      >
                        {fileName}
                      </a>
                      {/* Previsualización si es imagen o PDF */}
                      {fileItem.path.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                        <div>
                          <img
                            src={urlArchivo}
                            alt={`Adjunto ${index + 1}`}
                            style={{
                              maxWidth: "300px",
                              marginTop: "5px",
                              display: "block",
                            }}
                          />
                        </div>
                      ) : fileItem.path.match(/\.pdf$/i) ? (
                        <div style={{ marginTop: "5px" }}>
                          <iframe
                            src={urlArchivo}
                            title={`PDF Adjunto ${index + 1}`}
                            width="100%"
                            height="200px"
                            style={{ border: "1px solid #ccc" }}
                          ></iframe>
                        </div>
                      ) : null}{" "}
                      {/* No hay previsualización para otros tipos */}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Nueva Columna para Historial de Respuestas y Formulario de Respuesta Final */}
          <div className="pqr-card-section pqr-card-col">
            {/* SEGUIMIENTO DE LA PQRS */}
            <section className="seccion-seguimiento">
              <SeguimientoPqrs
                pqr_codigo={pqr_codigo}
                formData={formData}
                estado_respuesta={pqr.estado_respuesta}
              />
            </section>
            {/* FIN DEL SEGUIMIENTO DE LA PQRS */}

            {/* --- Sección para mostrar TODAS las respuestas (Historial) --- */}
            {pqr.respuestas && pqr.respuestas.length > 0 && (
              <div className="preliminary-responses-section">
                <h2>Respuestas Preliminares</h2>
                {/* Filtra las respuestas para incluir solo las que NO son finales */}
                {pqr.respuestas
                  .filter((respuesta) => !respuesta.es_final)
                  .sort(
                    (a, b) => new Date(a.created_at) - new Date(b.created_at)
                  ) // Opcional: ordenar por fecha
                  .map((respuesta) => (
                    <div key={respuesta.id} className="respuesta-item-card">
                      <p>
                        <strong>Autor:</strong>{" "}
                        {respuesta.autor?.name || "Desconocido"}
                      </p>
                      <p>
                        <strong>Fecha:</strong>{" "}
                        {new Date(respuesta.created_at).toLocaleString()}
                      </p>
                      <p>
                        <strong>Tipo:</strong>{" "}
                        <span className="tag-interna">
                          Respuesta Preliminar
                        </span>
                      </p>
                      <div className="respuesta-content-box">
                        <strong>Contenido:</strong>{" "}
                        <p
                          dangerouslySetInnerHTML={{
                            __html: respuesta.contenido,
                          }}
                        />
                      </div>

                      {respuesta.adjuntos && respuesta.adjuntos.length > 0 && (
                        <div className="respuesta-adjuntos-list">
                          <h4>
                            🗂️ Archivos adjuntos de la respuesta preliminar:
                          </h4>
                          <ul>
                            {respuesta.adjuntos.map((adj, idx) => (
                              <li key={idx} className="adjunto-item">
                                <a
                                  // href={`http://127.0.0.1:8000/storage/${adj.path}`}
                                  href={`http://192.168.1.30:8000/storage/${adj.path}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {adj.original_name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <hr className="respuesta-divider" />
                    </div>
                  ))}
                {/* Mensaje si no hay ninguna respuesta preliminar después de filtrar */}
                {pqr.respuestas.filter((r) => !r.es_final).length === 0 && (
                  <p>
                    No hay respuestas preliminares registradas para esta PQR.
                  </p>
                )}
                <hr className="respuesta-divider" />
              </div>
            )}
            {/* --- FIN Sección para mostrar TODAS las respuestas --- */}

            {["Asignado", "En proceso", "Cerrado"].includes(
              pqr?.estado_respuesta
            ) && (
              <div className="respuesta-final">
                <h2>Respuesta Final</h2>

                {yaTieneFinal &&
                finalAnswerAuthorName &&
                finalAnswerCreatedAt ? (
                  <div className="respuesta-item-card">
                    <p>
                      <strong>Autor:</strong> {finalAnswerAuthorName}
                    </p>
                    <p>
                      <strong>Fecha:</strong>{" "}
                      {new Date(finalAnswerCreatedAt).toLocaleString("es-CO", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p>
                      <strong>Tipo:</strong>{" "}
                      <span className="tag-interna">Respuesta Final</span>
                    </p>
                  </div>
                ) : (
                  <h3>Registrar Respuesta Final</h3>
                )}
                {/* Dropdown de plantillas */}
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
                        "[FECHA]": new Date().toLocaleDateString("es-CO", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }),
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
                  disabled={yaTieneFinal && !editandoRespuestaFinal}
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
                  ref={respuestaFinalTextareaRef}
                  value={respuestaFinal}
                  onChange={(e) => setRespuestaFinal(e.target.value)}
                  rows="1"
                  placeholder="Escribe la respuesta final..."
                  className="styled-input respuesta-final"
                  disabled={yaTieneFinal && !editandoRespuestaFinal}
                />
                {/* NUEVO: Sección para adjuntar y mostrar archivos para la RESPUESTA FINAL */}
                {/* Visible solo si tiene permiso y no está cerrada O si está en modo edición */}
                {tienePermiso(["Supervisor", "Administrador"]) &&
                  (!yaTieneFinal || editandoRespuestaFinal) && (
                    <div className="adjuntos-final-respuesta-container">
                      {/* <label htmlFor="adjuntos-final-respuesta">Adjuntar archivos (Respuesta Final):</label> */}
                      <input
                        type="file"
                        id="adjuntos-final-respuesta"
                        multiple
                        onChange={(e) =>
                          setAdjuntosRespuestaFinal(Array.from(e.target.files))
                        }
                        className="styled-input"
                        style={{ marginTop: "10px" }}
                      />
                      <div className="lista-adjuntos-nuevos">
                        {adjuntosRespuestaFinal.length > 0 && (
                          <p>
                            <strong>Archivos nuevos a subir:</strong>
                          </p>
                        )}
                        {adjuntosRespuestaFinal.map((file, index) => (
                          <div
                            key={`new-adj-${index}`}
                            className="adjunto-item"
                          >
                            <span>{file.name}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveNewAttachment(index)}
                              className="remove-adjunto-button"
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                {/* Mostrar adjuntos existentes de la RESPUESTA FINAL (si hay) */}
                {adjuntosExistentesRespuestaFinal.length > 0 && (
                  <div className="adjuntos-final-respuesta-existentes">
                    <h3>🗂️ Archivos adjuntos actuales de la respuesta:</h3>
                    <ul>
                      {adjuntosExistentesRespuestaFinal.map(
                        (fileItem, index) => (
                          <div
                            key={`existing-adj-${index}`}
                            className="adjunto-item"
                          >
                            <a
                              // href={`http://127.0.0.1:8000/storage/${fileItem.path}`}
                              href={`http://192.168.1.30:8000/storage/${fileItem.path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {fileItem.original_name ||
                                `Archivo ${fileIndex + 1}`}
                            </a>
                            {/* Permitir eliminar adjuntos existentes solo en modo edición y con permiso */}
                            {editandoRespuestaFinal &&
                              tienePermiso(["Supervisor", "Administrador"]) && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveExistingAttachment(index)
                                  }
                                  className="remove-adjunto-button"
                                >
                                  X
                                </button>
                              )}
                          </div>
                        )
                      )}
                    </ul>
                  </div>
                )}
                {tienePermiso(["Supervisor", "Administrador"]) && (
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "10px",
                    }}
                  >
                    {!yaTieneFinal && (
                      <button onClick={handleFinalAnswerAction}>
                        Registrar Respuesta Final
                      </button>
                    )}

                    {yaTieneFinal &&
                      !editandoRespuestaFinal &&
                      pqr &&
                      !mailEnviado && (
                        <button onClick={() => setEditandoRespuestaFinal(true)}>
                          Editar Respuesta Final
                        </button>
                      )}

                    {yaTieneFinal && editandoRespuestaFinal && (
                      <>
                        <button onClick={handleFinalAnswerAction}>
                          Guardar Cambios (Respuesta Final)
                        </button>
                        <button
                          className="boton-cancelar-edicion"
                          onClick={() => {
                            setEditandoRespuestaFinal(false);
                            fetchPqr(); // Re-fetch para restablecer los valores originales y los adjuntos
                          }}
                        >
                          Cancelar edición
                        </button>
                      </>
                    )}
                  </div>
                )}
                {/* Botón para enviar al ciudadano, visible solo si ya hay respuesta final y no ha sido enviada */}
                {tienePermiso(["Supervisor", "Administrador"]) &&
                  yaTieneFinal &&
                  !mailEnviado && (
                    <div style={{ marginTop: "20px" }}>
                      <button
                        onClick={enviarAlCiudadano}
                        className="boton-enviar-respuesta"
                      >
                        ✉️ Enviar Respuesta Final al Usuario
                      </button>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default PqrsDetail;

// import React, { useEffect, useState, useRef, useCallback } from "react"; // Añadimos useCallback
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/api";
// import "./styles/PqrsDetail.css";
// import { tienePermiso } from "../utils/permisoHelper";
// import Swal from "sweetalert2";
// import Navbar from "../components/Navbar/Navbar";
// import CountdownTimer from "./components/CountDownTimer";
// import SeguimientoPqrs from "./SeguimientoPqrs";

// function PqrsDetail() {
//   const { pqr_codigo } = useParams();
//   const navigate = useNavigate();
//   const currentUserRole = localStorage.getItem("role");

//   const [pqr, setPqr] = useState(null);
//   const [usuarios, setUsuarios] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [respuestaFinal, setRespuestaFinal] = useState("");
//   const [yaTieneFinal, setYaTieneFinal] = useState(false);
//   const [existingFinalAnswerId, setExistingFinalAnswerId] = useState(null);
//   const [mailEnviado, setMailEnviado] = useState(false);
//   const [editandoRespuestaFinal, setEditandoRespuestaFinal] = useState(false);
//   const [finalAnswerAuthorName, setFinalAnswerAuthorName] = useState(null);

//   // NUEVOS ESTADOS PARA ADJUNTOS DE RESPUESTA FINAL
//   const [adjuntosRespuestaFinal, setAdjuntosRespuestaFinal] = useState([]);
//   const [
//     adjuntosExistentesRespuestaFinal,
//     setAdjuntosExistentesRespuestaFinal,
//   ] = useState([]); // Para archivos YA GUARDADOS

//   // Referencia para el textarea de la respuesta final
//   const respuestaFinalTextareaRef = useRef(null);

//   // Estados para controlar la deshabilitación de los campos
//   const [prioridadBloqueada, setPrioridadBloqueada] = useState(false);
//   const [atributoCalidadBloqueado, setAtributoCalidadBloqueado] =
//     useState(false);
//   const [fuenteBloqueada, setFuenteBloqueada] = useState(false);
//   const [asignadoABloqueado, setAsignadoABloqueado] = useState(false);

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

//   // Función para ajustar la altura del textarea
//   const adjustTextareaHeight = () => {
//     if (respuestaFinalTextareaRef.current) {
//       respuestaFinalTextareaRef.current.style.height = "auto"; // Resetear a auto
//       respuestaFinalTextareaRef.current.style.height =
//         respuestaFinalTextareaRef.current.scrollHeight + "px";
//     }
//   };

//   // Efecto para ajustar la altura cuando cambia el contenido
//   useEffect(() => {
//     adjustTextareaHeight();
//   }, [respuestaFinal, editandoRespuestaFinal, loading]);

//   // Función para cargar usuarios y detalle de PQRS (Memoizada con useCallback)
//   const fetchPqr = useCallback(async () => {
//     try {
//       setLoading(true);

//       // Traer usuarios para asignar
//       const resUsers = await api.get("/users");
//       setUsuarios(resUsers.data);

//       // Traer detalle PQR
//       const res = await api.get(`/pqrs/codigo/${pqr_codigo}`);
//       const p = res.data.pqr;

//       // Asegurarse de que p.archivo (adjuntos de la PQRS original) sea un array de objetos
//       if (
//         typeof p.archivo === "string" &&
//         p.archivo.startsWith("[") &&
//         p.archivo.endsWith("]")
//       ) {
//         try {
//           p.archivo = JSON.parse(p.archivo);
//         } catch (parseError) {
//           p.archivo = []; // Default to empty array on parse error
//         }
//       } else if (!Array.isArray(p.archivo)) {
//         p.archivo = []; // Ensure it's an array if it's null or a non-JSON string
//       }

//       setPqr(p);
//       setMailEnviado(p.respuesta_enviada === 1);

//       // --- Cargar la respuesta final existente en el estado de respuestaFinal ---
//       const finalAnswer = p.respuestas?.find((r) => r.es_final);
//       if (finalAnswer) {
//         setYaTieneFinal(true);
//         setRespuestaFinal(finalAnswer.contenido.replace(/<br>/g, "\n"));
//         setExistingFinalAnswerId(finalAnswer.id);
//         setFinalAnswerAuthorName(finalAnswer.autor?.name || "Desconocido");
//         // Cargar adjuntos existentes de la respuesta final
//         setAdjuntosExistentesRespuestaFinal(finalAnswer.adjuntos || []); // Asegúrate de que sea un array
//       } else {
//         setYaTieneFinal(false);
//         setRespuestaFinal(""); // Limpiar si no hay respuesta final
//         setExistingFinalAnswerId(null);
//         setFinalAnswerAuthorName(null);
//         setAdjuntosExistentesRespuestaFinal([]); // Limpiar si no hay respuesta final
//       }
//       setEditandoRespuestaFinal(false); // Al recargar o cargar por primera vez, NO estamos en modo edición.
//       setAdjuntosRespuestaFinal([]); // Limpiar archivos nuevos seleccionados al cargar la PQRS

//       setFormData({
//         atributo_calidad: p.atributo_calidad || "",
//         fuente: p.fuente || "",
//         asignado_a: p?.asignado?.id || "",
//         prioridad: p.prioridad || "",
//       });

//       // Actualizar el estado de bloqueo basado en si el campo ya tiene un valor
//       setPrioridadBloqueada(!!p.prioridad);
//       setAtributoCalidadBloqueado(!!p.atributo_calidad);
//       setFuenteBloqueada(!!p.fuente);
//       setAsignadoABloqueado(!!p.asignado?.id);
//     } catch (err) {
//       setError("Error cargando la PQRS");
//     } finally {
//       setLoading(false);
//     }
//   }, [pqr_codigo]); // Dependencia para useCallback

//   // Verificación de permisos y carga inicial
//   useEffect(() => {
//     const cargarPlantillas = async () => {
//       try {
//         const res = await api.get("/plantillas-respuesta");
//         setPlantillas(res.data);
//       } catch (error) {
//         console.error("Error al cargar plantillas:", error);
//       }
//     };

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
//     cargarPlantillas();
//   }, [pqr_codigo, navigate, fetchPqr]);

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
//       const response = await api.put(`/pqrs/codigo/${pqr_codigo}`, cleanedData);

//       setPqr(response.data.data);
//       setPrioridadBloqueada(!!response.data.data.prioridad);
//       setAtributoCalidadBloqueado(!!response.data.data.atributo_calidad);
//       setFuenteBloqueada(!!response.data.data.fuente);
//       setAsignadoABloqueado(!!response.data.data.asignado_a);

//       Swal.fire("Actualizado", "PQRS actualizada correctamente", "success");
//     } catch (err) {
//       let errorMessage = "No se pudo actualizar";

//       if (err.response) {
//         errorMessage =
//           err.response.data?.error ||
//           err.response.data?.message ||
//           errorMessage;
//       } else if (err.request) {
//         errorMessage =
//           "No se recibió respuesta del servidor. Inténtalo de nuevo.";
//       } else {
//         errorMessage = err.message;
//       }
//       Swal.fire("Error", errorMessage, "error");
//     }
//   };

//   // Función para registrar (POST) o actualizar (PUT) la respuesta final CON ADJUNTOS
//   const handleFinalAnswerAction = async () => {
//     if (!respuestaFinal.trim()) {
//       return Swal.fire("Error", "El contenido no puede estar vacío", "warning");
//     }

//     // Validación de tamaño de archivo (mantener esta aquí)
//     const MAX_FILE_SIZE_MB = 7;
//     const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
//     for (const file of adjuntosRespuestaFinal) {
//       if (file.size > MAX_FILE_SIZE_BYTES) {
//         return Swal.fire(
//           "Error de Archivo",
//           `El archivo "${file.name}" excede el tamaño máximo permitido de ${MAX_FILE_SIZE_MB}MB.`,
//           "error"
//         );
//       }
//     }

//     let titleText, confirmText, successMessage, errorMessage, apiCall;

//     const formDataToSend = new FormData();
//     formDataToSend.append("contenido", respuestaFinal.replace(/\n/g, "<br>"));

//     // --- INICIO: Lógica Condicional para el nombre del campo de adjuntos ---
//     if (yaTieneFinal && existingFinalAnswerId) {
//       // Si ya existe una respuesta final (estamos ACTUALIZANDO)
//       // El backend (updateRespuestaFinal) espera 'adjuntos_nuevos[]' para los archivos nuevos
//       adjuntosRespuestaFinal.forEach((file) => {
//         formDataToSend.append("adjuntos_nuevos[]", file);
//       });
//       // También envía los adjuntos existentes que el usuario decidió mantener
//       adjuntosExistentesRespuestaFinal.forEach((fileItem, index) => {
//         formDataToSend.append(
//           `adjuntos_existentes[${index}][path]`,
//           fileItem.path
//         );
//         formDataToSend.append(
//           `adjuntos_existentes[${index}][original_name]`,
//           fileItem.original_name
//         );
//       });
//     } else {
//       // Si NO existe una respuesta final (estamos REGISTRANDO una nueva)
//       // El backend (registrarRespuestaFinal) espera 'adjuntos[]'
//       adjuntosRespuestaFinal.forEach((file) => {
//         formDataToSend.append("adjuntos[]", file);
//       });
//       // En este caso de nueva creación, no hay adjuntos_existentes que gestionar
//     } // Configuración para peticiones con archivos (multipart/form-data)
//     // --- FIN: Lógica Condicional para el nombre del campo de adjuntos ---

//     const config = {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     };

//     if (yaTieneFinal && existingFinalAnswerId) {
//       // Ya existe una respuesta final, entonces la editamos (PUT lógico con POST)
//       titleText = "¿Estás seguro de actualizar la respuesta final?";
//       confirmText = "Sí, actualizar";
//       successMessage = "La respuesta final ha sido actualizada con éxito.";
//       errorMessage = "Error al actualizar la respuesta final.";
//       formDataToSend.append("_method", "PUT"); // Laravel necesita esto para interpretar POST como PUT
//       apiCall = api.post(
//         `/pqrs/respuestas/${existingFinalAnswerId}`,
//         formDataToSend,
//         config
//       );
//     } else {
//       // No existe una respuesta final, entonces la registramos (POST directo)
//       titleText = "¿Estás seguro de registrar la respuesta final?";
//       confirmText = "Sí, registrar";
//       successMessage = "La respuesta final ha sido registrada con éxito.";
//       errorMessage = "Error al registrar la respuesta final.";
//       apiCall = api.post(
//         `/pqrs/codigo/${pqr_codigo}/respuesta-final`,
//         formDataToSend,
//         config
//       );
//     }

//     const result = await Swal.fire({
//       title: titleText,
//       // text: "¡Esta acción es irreversible una vez confirmada!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       confirmButtonText: confirmText,
//       cancelButtonText: "Cancelar",
//     });

//     if (result.isConfirmed) {
//       try {
//         await apiCall;
//         Swal.fire("¡Éxito!", successMessage, "success").then(() => {
//           fetchPqr(); // Vuelve a cargar los datos de la PQRS para actualizar la UI
//           setAdjuntosRespuestaFinal([]); // Limpia los archivos nuevos seleccionados
//         });
//       } catch (err) {
//         Swal.fire("Error", err.response?.data?.error || errorMessage, "error");
//       }
//     } else {
//       Swal.fire("Cancelado", "La operación ha sido cancelada.", "info");
//     }
//   };

//   // Enviar respuesta final por correo y refrescar estado mailEnviado
//   const enviarAlCiudadano = async () => {
//     const result = await Swal.fire({
//       title: "¿Estás seguro?",
//       text: "Se enviará la respuesta por correo electrónico al usuario. ¡Esta acción es irreversible!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       confirmButtonText: "Sí, enviar correo",
//       cancelButtonText: "Cancelar",
//     });

//     if (result.isConfirmed) {
//       try {
//         await api.post(`/pqrs/codigo/${pqr_codigo}/enviar-respuesta-correo`);

//         Swal.fire(
//           "¡Correo enviado!",
//           "La respuesta final fue enviada exitosamente al usuario.",
//           "success"
//         ).then(() => {
//           setPqr((prevPqr) => ({ ...prevPqr, respuesta_enviada: 1 }));
//           setMailEnviado(true);
//           fetchPqr(); // Y luego re-fetch para una actualización completa y consistente
//         });
//       } catch (err) {
//         Swal.fire(
//           "Error",
//           err.response?.data?.error || "No se pudo enviar el correo.",
//           "error"
//         );
//       }
//     } else {
//       Swal.fire("Cancelado", "El envío del correo ha sido cancelado.", "info");
//     }
//   };

//   // Función para manejar la eliminación de un archivo nuevo antes de subirlo
//   const handleRemoveNewAttachment = (indexToRemove) => {
//     setAdjuntosRespuestaFinal((prev) =>
//       prev.filter((_, index) => index !== indexToRemove)
//     );
//   };

//   // Función para manejar la eliminación de un archivo existente (solo visualmente, el backend necesita la lógica)
//   const handleRemoveExistingAttachment = (indexToRemove) => {
//     // Al filtrar, estos archivos no serán enviados de vuelta al backend en adjuntos_existentes
//     // lo que efectivamente los "eliminará" de la respuesta al guardar.
//     setAdjuntosExistentesRespuestaFinal((prev) =>
//       prev.filter((_, index) => index !== indexToRemove)
//     );
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
//         <h2>Detalle y edición de la PQRS # {pqr.pqr_codigo}</h2>
//         <div className="pqr-card-columns">
//           {/* Columna de datos simples (izquierda) */}
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

//           {/* Columna editable (centro) */}
//           <div className="pqr-card-col">
//             <p>
//               <strong>Servicio:</strong> {pqr.servicio_prestado}
//             </p>
//             <p>
//               <strong>EPS:</strong> {pqr.eps}
//             </p>
//             <p>
//               <strong>Regimen:</strong> {pqr.regimen}
//             </p>
//             <p>
//               <strong>Tipo Solicitud:</strong> {pqr.tipo_solicitud}
//             </p>
//             <p>
//               <strong>Fecha solicitud:</strong>{" "}
//               {new Date(pqr.created_at).toLocaleString()}
//             </p>
//             <p>
//               <strong>Fecha solicitud real:</strong>{" "}
//               {new Date(pqr.fecha_inicio_real).toLocaleString()}
//             </p>
//             <p>
//               <strong>Estado PQR:</strong> {pqr.estado_tiempo}
//             </p>

//             {/* Campos bloqueados para roles específicos */}
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

//             {/* Formulario de edición para roles específicos */}
//             {!["Consultor", "Digitador", "Gestor"].includes(
//               localStorage.getItem("role")
//             ) && (
//               <form onSubmit={handleSubmit}>
//                 {pqr.tipo_solicitud !== "Solicitud" && (
//                   <>
//                     <label>Atributo de Calidad:</label>
//                     <select
//                       name="atributo_calidad"
//                       value={formData.atributo_calidad}
//                       onChange={handleChange}
//                       className="styled-input"
//                       disabled={
//                         (atributoCalidadBloqueado &&
//                           currentUserRole !== "Administrador") ||
//                         pqr.estado_respuesta === "Cerrado"
//                       }
//                     >
//                       <option value="" disabled>
//                         Seleccione
//                       </option>
//                       {[
//                         "Accesibilidad",
//                         "Continuidad",
//                         "Oportunidad",
//                         "Pertinencia",
//                         "Satisfacción del usuario",
//                         "Seguridad",
//                       ].map((opt) => (
//                         <option key={opt} value={opt}>
//                           {opt}
//                         </option>
//                       ))}
//                     </select>
//                   </>
//                 )}

//                 <label>Fuente:</label>
//                 <select
//                   name="fuente"
//                   value={formData.fuente}
//                   onChange={handleChange}
//                   className="styled-input"
//                   disabled={
//                     (fuenteBloqueada && currentUserRole !== "Administrador") ||
//                     pqr.estado_respuesta === "Cerrado"
//                   }
//                 >
//                   <option value="" disabled>
//                     Seleccione
//                   </option>
//                   {[
//                     "Formulario de la web",
//                     "Correo atención al usuario",
//                     "Correo de Agendamiento NAC",
//                     "Encuesta de satisfacción IPS",
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
//                   disabled={
//                     (asignadoABloqueado &&
//                       currentUserRole !== "Administrador") ||
//                     pqr.estado_respuesta === "Cerrado"
//                   }
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
//                   disabled={
//                     prioridadBloqueada || pqr.estado_respuesta === "Cerrado"
//                   }
//                 >
//                   <option value="" disabled>
//                     Seleccione prioridad
//                   </option>
//                   {["Vital", "Priorizado", "Simple", "Solicitud"].map((opt) => (
//                     <option key={opt} value={opt}>
//                       {opt}
//                     </option>
//                   ))}
//                 </select>

//                 <button type="submit">Guardar Cambios</button>
//               </form>
//             )}
//           </div>

//           {/* Descripción larga y adjuntos de la PQRS original (columna derecha) */}
//           <div className="pqr-card-description-full">
//             <p>
//               <strong>Descripción:</strong>
//             </p>
//             <div className="pqr-description-text">{pqr.descripcion}</div>

//             {/* Mostrar archivos adjuntos de la PQRS original si existen */}
//             {pqr.archivo && pqr.archivo.length > 0 && (
//               <div className="archivos-adjuntos" style={{ marginTop: "10px" }}>
//                 <strong>Archivos adjuntos de la PQRS:</strong>{" "}
//                 {pqr.archivo.map((fileItem, index) => {
//                   // Asume que fileItem es un objeto { path: "...", original_name: "..." }
//                   // const urlArchivo = `http://localhost:8000/storage/${fileItem.path}`;
//                   const urlArchivo = `http://192.168.1.30:8000/storage/${fileItem.path}`;

//                   const fileName = fileItem.original_name;

//                   return (
//                     <div
//                       key={`pqr-file-${index}`}
//                       style={{ marginBottom: "10px" }}
//                     >
//                       {/* Enlace para descargar o ver */}
//                       <a
//                         href={urlArchivo}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         style={{ display: "inline-block", marginRight: "10px" }}
//                       >
//                         {fileName}
//                       </a>
//                       {/* Previsualización si es imagen o PDF */}
//                       {fileItem.path.match(/\.(jpeg|jpg|png|gif)$/i) ? (
//                         <div>
//                           <img
//                             src={urlArchivo}
//                             alt={`Adjunto ${index + 1}`}
//                             style={{
//                               maxWidth: "300px",
//                               marginTop: "5px",
//                               display: "block",
//                             }}
//                           />
//                         </div>
//                       ) : fileItem.path.match(/\.pdf$/i) ? (
//                         <div style={{ marginTop: "5px" }}>
//                           <iframe
//                             src={urlArchivo}
//                             title={`PDF Adjunto ${index + 1}`}
//                             width="100%"
//                             height="200px"
//                             style={{ border: "1px solid #ccc" }}
//                           ></iframe>
//                         </div>
//                       ) : null}{" "}
//                       {/* No hay previsualización para otros tipos */}
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* Nueva Columna para Historial de Respuestas y Formulario de Respuesta Final */}
//           <div className="pqr-card-section pqr-card-col">
//             {/* --- Sección para mostrar TODAS las respuestas (Historial) --- */}
//             {pqr.respuestas && pqr.respuestas.length > 0 && (
//               <div className="preliminary-responses-section">
//                 <h2>Respuestas Preliminares</h2>
//                 {/* Filtra las respuestas para incluir solo las que NO son finales */}
//                 {pqr.respuestas
//                   .filter((respuesta) => !respuesta.es_final)
//                   .sort(
//                     (a, b) => new Date(a.created_at) - new Date(b.created_at)
//                   ) // Opcional: ordenar por fecha
//                   .map((respuesta) => (
//                     <div key={respuesta.id} className="respuesta-item-card">
//                       <p>
//                         <strong>Autor:</strong>{" "}
//                         {respuesta.autor?.name || "Desconocido"}
//                       </p>
//                       <p>
//                         <strong>Fecha:</strong>{" "}
//                         {new Date(respuesta.created_at).toLocaleString()}
//                       </p>
//                       <p>
//                         <strong>Tipo:</strong>{" "}
//                         <span className="tag-interna">
//                           Respuesta Preliminar
//                         </span>
//                       </p>
//                       <div className="respuesta-content-box">
//                         <strong>Contenido:</strong>{" "}
//                         <p
//                           dangerouslySetInnerHTML={{
//                             __html: respuesta.contenido,
//                           }}
//                         />
//                       </div>

//                       {respuesta.adjuntos && respuesta.adjuntos.length > 0 && (
//                         <div className="respuesta-adjuntos-list">
//                           <h4>
//                             🗂️ Archivos adjuntos de la respuesta preliminar:
//                           </h4>
//                           <ul>
//                             {respuesta.adjuntos.map((adj, idx) => (
//                               <li key={idx} className="adjunto-item">
//                                 <a
//                                   // href={`http://127.0.0.1:8000/storage/${adj.path}`}
//                                   href={`http://192.168.1.30:8000/storage/${adj.path}`}
//                                   target="_blank"
//                                   rel="noopener noreferrer"
//                                 >
//                                   {adj.original_name}
//                                 </a>
//                               </li>
//                             ))}
//                           </ul>
//                         </div>
//                       )}
//                       <hr className="respuesta-divider" />
//                     </div>
//                   ))}
//                 {/* Mensaje si no hay ninguna respuesta preliminar después de filtrar */}
//                 {pqr.respuestas.filter((r) => !r.es_final).length === 0 && (
//                   <p>
//                     No hay respuestas preliminares registradas para esta PQR.
//                   </p>
//                 )}
//                 <hr className="respuesta-divider" />
//               </div>
//             )}
//             {/* --- FIN Sección para mostrar TODAS las respuestas --- */}

//             {/* SEGUIMIENTO DE LA PQRS */}
//             <section className="seccion-seguimiento">
//               <SeguimientoPqrs pqr_codigo={pqr_codigo} />
//             </section>
//             {/* FIN DEL SEGUIMIENTO DE LA PQRS */}

//             {/* JSX existente para el formulario de Respuesta Final */}
//             <h3>
//               {yaTieneFinal && finalAnswerAuthorName
//                 ? `📝 Respuesta Final registrada por ${finalAnswerAuthorName}`
//                 : "Registrar Respuesta Final"}
//             </h3>
//             {/* Dropdown de plantillas */}
//             <select
//               className="styled-input"
//               value={plantillaSeleccionada}
//               onChange={(e) => {
//                 const idSeleccionado = e.target.value;
//                 setPlantillaSeleccionada(idSeleccionado);

//                 const plantilla = plantillas.find(
//                   (p) => p.id.toString() === idSeleccionado
//                 );

//                 if (plantilla && pqr) {
//                   let contenido = plantilla.contenido;

//                   const fechaPqrCreada = new Date(
//                     pqr.created_at
//                   ).toLocaleDateString("es-CO", {
//                     day: "numeric",
//                     month: "long",
//                     year: "numeric",
//                   });

//                   // Reemplazo dinámico de placeholders
//                   const placeholders = {
//                     "[NOMBRE]": `${pqr.nombre || ""} ${
//                       pqr.apellido || ""
//                     }`.trim(),
//                     "[CIUDAD]": pqr.sede || "Ciudad",
//                     "[CORREO]": pqr.correo || "",
//                     "[TIPO_DOC]": pqr.documento_tipo || "",
//                     "[NUMERO_DOC]": pqr.documento_numero || "",
//                     "[TELEFONO]": pqr.telefono || "",
//                     "[FECHA]": new Date().toLocaleDateString("es-CO", {
//                       day: "numeric",
//                       month: "long",
//                       year: "numeric",
//                     }),
//                     "[PQR_CREADA]": fechaPqrCreada,
//                     "[PACIENTE]": `${pqr.nombre || ""} ${
//                       pqr.apellido || ""
//                     }`.trim(),
//                     "[CC]": pqr.documento_tipo || "",
//                   };

//                   for (const clave in placeholders) {
//                     const valor = placeholders[clave];
//                     contenido = contenido.replaceAll(clave, valor);
//                   }

//                   setRespuestaFinal(contenido);
//                 }
//               }}
//               disabled={yaTieneFinal && !editandoRespuestaFinal}
//             >
//               <option value="">-- Selecciona una plantilla --</option>
//               {plantillas.map((p) => (
//                 <option key={p.id} value={p.id}>
//                   {p.nombre}
//                 </option>
//               ))}
//             </select>
//             {/* Área de texto editable */}
//             <textarea
//               ref={respuestaFinalTextareaRef}
//               value={respuestaFinal}
//               onChange={(e) => setRespuestaFinal(e.target.value)}
//               rows="1"
//               placeholder="Escribe la respuesta final..."
//               className="styled-input respuesta-final"
//               style={{ overflow: "hidden", resize: "none" }}
//               disabled={yaTieneFinal && !editandoRespuestaFinal}
//             />
//             {/* NUEVO: Sección para adjuntar y mostrar archivos para la RESPUESTA FINAL */}
//             {/* Visible solo si tiene permiso y no está cerrada O si está en modo edición */}
//             {tienePermiso(["Supervisor", "Administrador"]) &&
//               (!yaTieneFinal || editandoRespuestaFinal) && (
//                 <div className="adjuntos-final-respuesta-container">
//                   {/* <label htmlFor="adjuntos-final-respuesta">Adjuntar archivos (Respuesta Final):</label> */}
//                   <input
//                     type="file"
//                     id="adjuntos-final-respuesta"
//                     multiple
//                     onChange={(e) =>
//                       setAdjuntosRespuestaFinal(Array.from(e.target.files))
//                     }
//                     className="styled-input"
//                     style={{ marginTop: "10px" }}
//                   />
//                   <div className="lista-adjuntos-nuevos">
//                     {adjuntosRespuestaFinal.length > 0 && (
//                       <p>
//                         <strong>Archivos nuevos a subir:</strong>
//                       </p>
//                     )}
//                     {adjuntosRespuestaFinal.map((file, index) => (
//                       <div key={`new-adj-${index}`} className="adjunto-item">
//                         <span>{file.name}</span>
//                         <button
//                           type="button"
//                           onClick={() => handleRemoveNewAttachment(index)}
//                           className="remove-adjunto-button"
//                         >
//                           X
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             {/* Mostrar adjuntos existentes de la RESPUESTA FINAL (si hay) */}
//             {adjuntosExistentesRespuestaFinal.length > 0 && (
//               <div className="adjuntos-final-respuesta-existentes">
//                 <h3>🗂️ Archivos adjuntos actuales de la respuesta:</h3>
//                 <ul>
//                   {adjuntosExistentesRespuestaFinal.map((fileItem, index) => (
//                     <div key={`existing-adj-${index}`} className="adjunto-item">
//                       <a
//                         // href={`http://127.0.0.1:8000/storage/${fileItem.path}`}
//                         href={`http://192.168.1.30:8000/storage/${fileItem.path}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                       >
//                         {fileItem.original_name || `Archivo ${fileIndex + 1}`}
//                       </a>
//                       {/* Permitir eliminar adjuntos existentes solo en modo edición y con permiso */}
//                       {editandoRespuestaFinal &&
//                         tienePermiso(["Supervisor", "Administrador"]) && (
//                           <button
//                             type="button"
//                             onClick={() =>
//                               handleRemoveExistingAttachment(index)
//                             }
//                             className="remove-adjunto-button"
//                           >
//                             X
//                           </button>
//                         )}
//                     </div>
//                   ))}
//                 </ul>
//               </div>
//             )}
//             {tienePermiso(["Supervisor", "Administrador"]) && (
//               <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
//                 {!yaTieneFinal && (
//                   <button onClick={handleFinalAnswerAction}>
//                     Registrar Respuesta Final
//                   </button>
//                 )}

//                 {yaTieneFinal &&
//                   !editandoRespuestaFinal &&
//                   pqr &&
//                   !mailEnviado && (
//                     <button onClick={() => setEditandoRespuestaFinal(true)}>
//                       Editar Respuesta Final
//                     </button>
//                   )}

//                 {yaTieneFinal && editandoRespuestaFinal && (
//                   <>
//                     <button onClick={handleFinalAnswerAction}>
//                       Guardar Cambios (Respuesta Final)
//                     </button>
//                     <button
//                       className="boton-cancelar-edicion"
//                       onClick={() => {
//                         setEditandoRespuestaFinal(false);
//                         fetchPqr(); // Re-fetch para restablecer los valores originales y los adjuntos
//                       }}
//                     >
//                       Cancelar edición
//                     </button>
//                   </>
//                 )}
//               </div>
//             )}
//             {/* Botón para enviar al ciudadano, visible solo si ya hay respuesta final y no ha sido enviada */}
//             {tienePermiso(["Supervisor", "Administrador"]) &&
//               yaTieneFinal &&
//               !mailEnviado && (
//                 <div style={{ marginTop: "20px" }}>
//                   <button
//                     onClick={enviarAlCiudadano}
//                     className="boton-enviar-respuesta"
//                   >
//                     ✉️ Enviar Respuesta Final al Usuario
//                   </button>
//                 </div>
//               )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default PqrsDetail;
