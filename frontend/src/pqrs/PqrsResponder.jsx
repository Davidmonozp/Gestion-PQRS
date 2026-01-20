import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPqrsAsignadas, registrarRespuesta } from "./pqrsService";
import "./styles/PqrsResponder.css";
import Navbar from "../components/Navbar/Navbar";
import Swal from "sweetalert2";
import CountdownTimer from "./components/CountDownTimer";
import { Version } from "../components/Footer/Version";
import SeguimientoPqrs from "./components/SeguimientoPqrs";
import AprobarReembolso from "./components/AprobarReembolso";
import { tienePermiso } from "../utils/permisoHelper";
import api from "../api/api";
import { IndicacionFormato } from "./components/IndicacionFormato";

const PqrsResponder = () => {
  const { pqr_codigo } = useParams();

  const navigate = useNavigate();
  const usuarioId = parseInt(localStorage.getItem("usuarioId"), 10);


  const [pqr, setPqr] = useState(null);
  const [respuesta, setRespuesta] = useState("");
  const [error, setError] = useState("");
  const [adjuntos, setAdjuntos] = useState([]);
  const maxChars = 4000;
  const [formData, setFormData] = useState({
    atributo_calidad: "",
    fuente: "",
    asignados: [],
    prioridad: "",
  });

  const [plantillas, setPlantillas] = useState([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState("");



  const yaRespondida =
    pqr?.estado_respuesta === "Preliminar" ||
    pqr?.estado_respuesta === "Cerrado";

  useEffect(() => {
    const fetchPqrs = async () => {
      try {
        if (!pqr_codigo) {
          setError("Código de PQRS no proporcionado en la URL.");
          return;
        }

        const asignadas = await getPqrsAsignadas();
        const encontrada = asignadas.find(
          (item) => item.pqr_codigo === pqr_codigo
        );

        if (!encontrada) {
          throw new Error("PQRS no encontrada o no asignada a usted.");
        }

        setPqr(encontrada);

        const usuarioId = parseInt(localStorage.getItem("usuarioId"), 10);
        const yaRespondio = encontrada.respuestas?.some(
          (r) => r.user_id === usuarioId
        );

        if (yaRespondio) {
          const result = await Swal.fire({
            icon: "info",
            title: "Ya has respondido",
            text: "Ya registraste una respuesta para esta PQR.",
            confirmButtonText: "Aceptar",
          });
          if (result.isConfirmed) {
            navigate(`/pqrs/${pqr_codigo}`);
          }
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchPqrs();
  }, [pqr_codigo, navigate]);




  useEffect(() => {
    const fetchPlantillas = async () => {
      try {
        const resp = await api.get("/plantillas-respuesta");

        // Laravel devuelve "resp.data"
        setPlantillas(resp.data);
      } catch (error) {
        console.error("Error cargando plantillas:", error);
      }
    };

    fetchPlantillas();
  }, []);

  useEffect(() => {
    const fetchPqr = async () => {
      try {
        const response = await api.get(`/pqrs/codigo/${pqr_codigo}`);
        setPqr(response.data.pqr);
      } catch (error) {
        console.error("Error cargando PQR:", error);
      }
    };

    fetchPqr();
  }, [pqr_codigo]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("contenido", respuesta);

      adjuntos.forEach((file, idx) => {
        formData.append(`adjuntos[]`, file);
      });

      await registrarRespuesta(pqr_codigo, respuesta, adjuntos);
      await Swal.fire({
        icon: "success",
        title: "Respuesta enviada",
        text: "Su respuesta ha sido registrada correctamente.",
        confirmButtonText: "Aceptar",
      });
      navigate("/pqrs/asignadas");
    } catch (err) {
      Swal.fire("Error", err.message || "Ocurrió un error", "error");
    }
  };

  if (error) return <div className="pqrs-res-error">{error}</div>;
  if (!pqr && !error)
    return <div className="pqrs-res-loading">Cargando PQRS...</div>;

  const handleRemoveAttachment = (indexToRemove) => {
    setAdjuntos((prev) => prev.filter((_, index) => index !== indexToRemove));
  };


  const crearMarkupConSaltosDeLinea = (texto) => {
    if (!texto) return { __html: "" };
    // Esta es la conversión crítica: \n a <br />
    const html = texto.replace(/\n/g, '<br />');
    return { __html: html };
  };


  return (
    <>
      <Navbar />

      <div className="pqrs-res-container">
        <h2 className="pqrs-res-title">
          Respuesta preliminar de la {pqr.pqr_codigo}
        </h2>
        <div className="resp-info">
          <div className="pqrs-res-info">
            {/* SI SOLICITANTE EXISTE MOSTRAR SUS DATOS */}
            {pqr.registrador_nombre && (
              <div className="solicitante">
                <p>
                  <strong>
                    {pqr.tipo_solicitud === 'Tutela' ? 'Entidad:' : 'Parentesco:'}
                  </strong>
                  {" "}
                  {pqr.parentesco}
                </p>
                {pqr.nombre_entidad && (
                  <p>
                    <strong>Nombre de la entidad:</strong> {pqr.nombre_entidad}
                  </p>
                )}

                {pqr.tipo_solicitud === 'Tutela' ? (
                  // CASO 1: Si la solicitud es 'Tutela' (Se muestra el Nombre del Juzgado y el apellido en un párrafo aparte)
                  <>
                    <p>
                      <strong>Nombre del Juzgado:</strong> {pqr.registrador_nombre}
                    </p>
                    <p>
                      <strong>Nombre del Juez:</strong> {pqr.registrador_apellido}
                    </p>
                  </>
                ) : (
                  // CASO 2: Si la solicitud NO es 'Tutela' (Se muestra el Nombre completo del Solicitante en un solo párrafo)
                  <p>
                    <strong>Nombre Solicitante:</strong> {pqr.registrador_nombre}{" "}
                    {pqr.registrador_segundo_nombre} {pqr.registrador_apellido}{" "}
                    {pqr.registrador_segundo_apellido}
                  </p>
                )}

                {pqr.registrador_documento_numero && (
                  <p>
                    <strong>Tipo Doc. Solicitante:</strong>{" "}
                    {pqr.registrador_documento_tipo}
                  </p>
                )}

                {pqr.registrador_documento_numero && (
                  <p>
                    <strong>No. Doc. Solicitante:</strong>{" "}
                    {pqr.registrador_documento_numero}
                  </p>
                )}

                <p>
                  <strong>Correo del solicitante:</strong>{" "}
                  {pqr.registrador_correo}
                </p>
                <p>
                  <strong>Teléfono del solicitante:</strong>{" "}
                  {pqr.registrador_telefono || "No proporcionado"}
                </p>

                {pqr.registrador_cargo && (
                  <p>
                    <strong>Cargo:</strong> {pqr.registrador_cargo}
                  </p>
                )}
              </div>
            )}
            {/* FIN DE LOS DATOS DEL SOLICITANTE */}
            <p>
              <strong>Nombre:</strong> {pqr.nombre} {pqr.segundo_nombre}{" "}
              {pqr.apellido} {pqr.segundo_apellido}
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
          </div>

          <div className="pqrs-res-info">
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
            {pqr.clasificacion_tutela && (
              <>
                <p>
                  <strong>Clasificación de la Tutela:</strong>{" "}
                  {pqr.clasificacion_tutela}
                </p>
                <p>
                  <strong>Accionado de la Tutela:</strong> {pqr.accionado}
                </p>
              </>
            )}

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
              <strong>Estado de la respuesta PQR:</strong>{" "}
              {pqr.estado_respuesta}
            </p>
            <p>
              <strong>Atributo de calidad:</strong> {pqr.atributo_calidad}
            </p>
            <p>
              <strong>Fuente:</strong> {pqr.fuente}
            </p>
            <p>
              <strong>Asignado a:</strong>{" "}
              {pqr.asignados && pqr.asignados.length > 0
                ? pqr.asignados.map((u) => u.name).join(", ")
                : "Sin asignar"}
            </p>
            <p>
              <strong>Clasificación: </strong>
              {pqr.clasificaciones && pqr.clasificaciones.length > 0
                ? pqr.clasificaciones.map((c) => c.nombre).join(", ")
                : "Sin clasificar"}
            </p>
            <p>
              <strong>Reembolso:</strong>{" "}
              {pqr.reembolsos && pqr.reembolsos.length > 0 ? (
                <>
                  {pqr.reembolsos[0].estado === "Aprobado"
                    ? "✅ Aprobado"
                    : "❌ Desaprobado"}{" "}
                  {pqr.reembolsos[0].usuario
                    ? `por ${pqr.reembolsos[0].usuario.name} ${pqr.reembolsos[0].usuario.primer_apellido}`
                    : ""}
                </>
              ) : (
                "No tiene reembolso"
              )}
            </p>
          </div>
        </div>
        <p>
          <strong>Descripción:</strong>
        </p>
        <div className="pqr-description-text">{pqr.descripcion}</div>

        {/* Mostrar archivos adjuntos de la PQRS original si existen */}

        {pqr.archivo && pqr.archivo.length > 0 && (
          <div className="archivos-adjuntos" style={{ marginTop: "10px" }}>
            <strong>Archivos adjuntos de la PQRS:</strong>{" "}
            {pqr.archivo.map((fileItem, index) => {
              const urlArchivo = fileItem.url; // ✅ ya viene lista desde Laravel
              const fileName = fileItem.original_name;

              return (
                <div
                  key={`pqr-file-${index}`}
                  style={{ marginBottom: "10px" }}
                >
                  {/* Enlace para descargar o ver */}
                  {urlArchivo && (
                    <a
                      href={urlArchivo}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        marginRight: "10px",
                      }}
                    >
                      {fileName}
                    </a>
                  )}

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
                        height="500px"
                        style={{ border: "1px solid #ccc" }}
                      ></iframe>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
        <SeguimientoPqrs
          pqr_codigo={pqr_codigo}
          formData={formData}
        // estado_respuesta={pqr.estado_respuesta}
        />

        <h2>
          <strong>Reembolso:</strong>{" "}
          {pqr.reembolsos && pqr.reembolsos.length > 0 ? (
            <>
              {pqr.reembolsos[0].estado === "Aprobado"
                ? "✅ Aprobado"
                : "❌ Desaprobado"}{" "}
              {pqr.reembolsos[0].usuario
                ? `por ${pqr.reembolsos[0].usuario.name} ${pqr.reembolsos[0].usuario.primer_apellido}`
                : ""}
            </>
          ) : (
            "No tiene reembolso"
          )}
        </h2>

        {pqr &&
          (tienePermiso(["Administrador"]) || [3, 10].includes(usuarioId)) &&
          pqr.clasificaciones?.some(c => c.nombre === "Solicitudes de tesorería") && (
            <AprobarReembolso pqrId={pqr.id} />
          )}

        {/* {yaRespondida ? (
          <div className="pqrs-res-message">
            <p>
              Esta PQRS ya tiene una respuesta registrada o ha sido cerrada.
            </p>
            <button
              className="pqrs-res-button"
              onClick={() => navigate(`/pqrs/${pqr_codigo}`)}
            >
              Ver detalles de la PQRS
            </button>
          </div>
        ) : ( */}
        <form onSubmit={handleSubmit} className="pqrs-res-form">

          {/* --- Sección para mostrar TODAS las respuestas (Historial) --- */}
          {pqr.respuestas && pqr.respuestas.length > 0 && (
            <div className="preliminary-responses-section">
              <h2>Respuestas Preliminares</h2>
              {pqr.asignados && (
                <div className="pendientes-respuesta mb-2 text-sm text-gray-700">
                  <strong>Pendientes por responder:</strong>{" "}
                  {pqr.asignados
                    .filter(
                      (usuario) =>
                        !pqr.respuestas?.some(
                          (r) =>
                            r.user_id === usuario.id &&
                            !r.es_final && // respuesta preliminar
                            r.es_respuesta_usuario === 0
                        )
                    )
                    .map((u) =>
                      [
                        u.name,
                        u.segundo_nombre,
                        u.primer_apellido,
                        u.segundo_apellido,
                      ]
                        .filter(Boolean) // elimina valores nulos o vacíos
                        .join(" ")
                    )
                    .join(", ") || "Ninguno"}
                </div>
              )}
              <hr />

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
                      {respuesta.autor
                        ? [
                          respuesta.autor.name,
                          respuesta.autor.segundo_nombre,
                          respuesta.autor.primer_apellido,
                          respuesta.autor.segundo_apellido,
                        ]
                          .filter(Boolean) // elimina nulos o vacíos
                          .join(" ")
                        : "Desconocido"}
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
                      <p className="recuadro"
                        dangerouslySetInnerHTML={
                          // 💡 Asegúrate de usar la función de conversión aquí
                          crearMarkupConSaltosDeLinea(respuesta.contenido)
                        }
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
                                // Use the full URL provided by the backend
                                href={adj.url}
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
              {/* <hr className="respuesta-divider" /> */}

            </div>
          )}
          {/* --- FIN Sección para mostrar TODAS las respuestas --- */}


          {/* SELECTOR DE PLANTILLAS */}
          <p>
            <strong>Usar plantilla:</strong>
          </p>
          <select
            className="styled-input-plantilla"
            value={plantillaSeleccionada}
            onChange={(e) => {
              const idSeleccionado = e.target.value;
              setPlantillaSeleccionada(idSeleccionado);

              const plantilla = plantillas.find(
                (p) => p.id.toString() === idSeleccionado
              );

              if (plantilla && pqr) {
                let contenido = plantilla.contenido;

                let fechaOrigen = pqr.fecha_inicio_real
                  ? pqr.fecha_inicio_real
                  : pqr.created_at;

                const fechaPqrCreada = new Date(fechaOrigen).toLocaleDateString(
                  "es-CO",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                );

                const placeholders = {
                  "[NOMBRE]": `${pqr.nombre || ""} ${pqr.segundo_nombre || ""} ${pqr.apellido || ""
                    } ${pqr.segundo_apellido || ""}`.trim(),
                  "[JUEZ]": `${pqr.registrador_apellido || ""}`.trim(),
                  "[RADICADO]": `${pqr.radicado_juzgado || ""}`.trim(),
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
                  "[PACIENTE]": `${pqr.nombre || ""} ${pqr.segundo_nombre || ""} ${pqr.apellido || ""
                    } ${pqr.segundo_apellido || ""}`.trim(),
                  "[CC]": pqr.documento_tipo || "",
                };

                for (const clave in placeholders) {
                  contenido = contenido.replaceAll(clave, placeholders[clave]);
                }

                setRespuesta(contenido);
              }
            }}
          >
            <option value="">-- Selecciona una plantilla --</option>

            {plantillas
              .filter((p) => {
                const esFormato = p.nombre.toLowerCase().includes("formato");
                const esTutela = pqr?.tipo_solicitud === "Tutela";

                if (esTutela) {
                  // Si es tutela → solo plantillas que contienen "formato"
                  return esFormato;
                } else {
                  // Si NO es tutela → NO mostrar plantillas de tutela
                  return !esFormato;
                }
              })
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}

          </select>

          {/* TEXTAREA (no se toca) */}
          <IndicacionFormato></IndicacionFormato>
          <p>
            <strong>Respuesta:</strong>
          </p>
          <textarea
            id="respuesta"
            className="pqrs-res-textarea"
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            rows="5"
            maxLength={maxChars}
            required
          />

          <div className="contador-chars">
            {respuesta.length} / {maxChars} caracteres
          </div>

          {/* ARCHIVOS ADJUNTOS */}
          <p>
            <strong>Archivos adjuntos (opcional):</strong>
          </p>

          <input
            type="file"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files);

              const tooBig = files.find((file) => file.size > 7 * 1024 * 1024);

              if (tooBig) {
                Swal.fire({
                  icon: "warning",
                  title: "Archivo demasiado grande",
                  text: "Solo se permiten archivos de máximo 7MB.",
                  confirmButtonText: "Aceptar",
                });
                return;
              }

              setAdjuntos((prev) => [...prev, ...files]);
            }}
          />

          {adjuntos.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <strong className="archivo-seleccionado">
                Archivos seleccionados:
              </strong>
              <ul>
                {adjuntos.map((file, index) => (
                  <li key={index} style={{ display: "flex", alignItems: "center" }}>
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      style={{
                        marginLeft: "10px",
                        background: "#df3232",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        padding: "2px 6px",
                      }}
                    >
                      X
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button type="submit" className="pqrs-res-button">
            Enviar Respuesta
          </button>
        </form>

        {/* )} */}
      </div>
      <Version />
    </>
  );
};

export default PqrsResponder;




















































// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { getPqrsAsignadas, registrarRespuesta } from "./pqrsService";
// import "./styles/PqrsResponder.css";
// import Navbar from "../components/Navbar/Navbar";
// import Swal from "sweetalert2";
// import CountdownTimer from "./components/CountDownTimer";
// import { Version } from "../components/Footer/Version";
// import SeguimientoPqrs from "./components/SeguimientoPqrs";
// import AprobarReembolso from "./components/AprobarReembolso";
// import { tienePermiso } from "../utils/permisoHelper";
// import api from "../api/api";

// const PqrsResponder = () => {
//   const { pqr_codigo } = useParams();
//   const navigate = useNavigate();
//   const usuarioId = parseInt(localStorage.getItem("usuarioId"), 10);


//   const [pqr, setPqr] = useState(null);
//   const [respuesta, setRespuesta] = useState("");
//   const [error, setError] = useState("");
//   const [adjuntos, setAdjuntos] = useState([]);
//   const maxChars = 4000;
//   const [formData, setFormData] = useState({
//     atributo_calidad: "",
//     fuente: "",
//     asignados: [],
//     prioridad: "",
//   });

//   const [plantillas, setPlantillas] = useState([]);
//   const [plantillaSeleccionada, setPlantillaSeleccionada] = useState("");



//   const yaRespondida =
//     pqr?.estado_respuesta === "Preliminar" ||
//     pqr?.estado_respuesta === "Cerrado";

//   useEffect(() => {
//     const fetchPqrs = async () => {
//       try {
//         if (!pqr_codigo) {
//           setError("Código de PQRS no proporcionado en la URL.");
//           return;
//         }

//         const asignadas = await getPqrsAsignadas();
//         const encontrada = asignadas.find(
//           (item) => item.pqr_codigo === pqr_codigo
//         );

//         if (!encontrada) {
//           throw new Error("PQRS no encontrada o no asignada a usted.");
//         }

//         setPqr(encontrada);

//         const usuarioId = parseInt(localStorage.getItem("usuarioId"), 10);
//         const yaRespondio = encontrada.respuestas?.some(
//           (r) => r.user_id === usuarioId
//         );

//         if (yaRespondio) {
//           const result = await Swal.fire({
//             icon: "info",
//             title: "Ya has respondido",
//             text: "Ya registraste una respuesta para esta PQR.",
//             confirmButtonText: "Aceptar",
//           });
//           if (result.isConfirmed) {
//             navigate(`/pqrs/${pqr_codigo}`);
//           }
//         }
//       } catch (err) {
//         setError(err.message);
//       }
//     };

//     fetchPqrs();
//   }, [pqr_codigo, navigate]);




//   useEffect(() => {
//     const fetchPlantillas = async () => {
//       try {
//         const resp = await api.get("/plantillas-respuesta");

//         // Laravel devuelve "resp.data"
//         setPlantillas(resp.data);
//       } catch (error) {
//         console.error("Error cargando plantillas:", error);
//       }
//     };

//     fetchPlantillas();
//   }, []);


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const formData = new FormData();
//       formData.append("contenido", respuesta);

//       adjuntos.forEach((file, idx) => {
//         formData.append(`adjuntos[]`, file);
//       });

//       await registrarRespuesta(pqr_codigo, respuesta, adjuntos);
//       await Swal.fire({
//         icon: "success",
//         title: "Respuesta enviada",
//         text: "Su respuesta ha sido registrada correctamente.",
//         confirmButtonText: "Aceptar",
//       });
//       navigate("/pqrs/asignadas");
//     } catch (err) {
//       Swal.fire("Error", err.message || "Ocurrió un error", "error");
//     }
//   };

//   if (error) return <div className="pqrs-res-error">{error}</div>;
//   if (!pqr && !error)
//     return <div className="pqrs-res-loading">Cargando PQRS...</div>;

//   const handleRemoveAttachment = (indexToRemove) => {
//     setAdjuntos((prev) => prev.filter((_, index) => index !== indexToRemove));
//   };




//   return (
//     <>
//       <Navbar />

//       <div className="pqrs-res-container">
//         <h2 className="pqrs-res-title">
//           Respuesta preliminar de la {pqr.pqr_codigo}
//         </h2>
//         <div className="resp-info">
//           <div className="pqrs-res-info">
//             {/* SI SOLICITANTE EXISTE MOSTRAR SUS DATOS */}
//             {pqr.registrador_nombre && (
//               <div className="solicitante">
//                 <p>
//                   <strong>
//                     {pqr.tipo_solicitud === 'Tutela' ? 'Entidad:' : 'Parentesco:'}
//                   </strong>
//                   {" "}
//                   {pqr.parentesco}
//                 </p>
//                 {pqr.nombre_entidad && (
//                   <p>
//                     <strong>Nombre de la entidad:</strong> {pqr.nombre_entidad}
//                   </p>
//                 )}

//                 {pqr.tipo_solicitud === 'Tutela' ? (
//                   // CASO 1: Si la solicitud es 'Tutela' (Se muestra el Nombre del Juzgado y el apellido en un párrafo aparte)
//                   <>
//                     <p>
//                       <strong>Nombre del Juzgado:</strong> {pqr.registrador_nombre}
//                     </p>
//                     <p>
//                       <strong>Nombre del Juez:</strong> {pqr.registrador_apellido}
//                     </p>
//                   </>
//                 ) : (
//                   // CASO 2: Si la solicitud NO es 'Tutela' (Se muestra el Nombre completo del Solicitante en un solo párrafo)
//                   <p>
//                     <strong>Nombre Solicitante:</strong> {pqr.registrador_nombre}{" "}
//                     {pqr.registrador_segundo_nombre} {pqr.registrador_apellido}{" "}
//                     {pqr.registrador_segundo_apellido}
//                   </p>
//                 )}

//                 {pqr.registrador_documento_numero && (
//                   <p>
//                     <strong>Tipo Doc. Solicitante:</strong>{" "}
//                     {pqr.registrador_documento_tipo}
//                   </p>
//                 )}

//                 {pqr.registrador_documento_numero && (
//                   <p>
//                     <strong>No. Doc. Solicitante:</strong>{" "}
//                     {pqr.registrador_documento_numero}
//                   </p>
//                 )}

//                 <p>
//                   <strong>Correo del solicitante:</strong>{" "}
//                   {pqr.registrador_correo}
//                 </p>
//                 <p>
//                   <strong>Teléfono del solicitante:</strong>{" "}
//                   {pqr.registrador_telefono || "No proporcionado"}
//                 </p>

//                 {pqr.registrador_cargo && (
//                   <p>
//                     <strong>Cargo:</strong> {pqr.registrador_cargo}
//                   </p>
//                 )}
//               </div>
//             )}
//             {/* FIN DE LOS DATOS DEL SOLICITANTE */}
//             <p>
//               <strong>Nombre:</strong> {pqr.nombre} {pqr.segundo_nombre}{" "}
//               {pqr.apellido} {pqr.segundo_apellido}
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
//           </div>

//           <div className="pqrs-res-info">
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
//             {pqr.clasificacion_tutela && (
//               <>
//                 <p>
//                   <strong>Clasificación de la Tutela:</strong>{" "}
//                   {pqr.clasificacion_tutela}
//                 </p>
//                 <p>
//                   <strong>Accionado de la Tutela:</strong> {pqr.accionado}
//                 </p>
//               </>
//             )}

//             <p>
//               <strong>Fecha solicitud:</strong>{" "}
//               {new Date(pqr.created_at).toLocaleString()}
//             </p>
//             <p>
//               <strong>Fecha solicitud real:</strong>{" "}
//               {pqr.fecha_inicio_real
//                 ? new Date(pqr.fecha_inicio_real).toLocaleString()
//                 : "No registra"}
//             </p>
//             <p>
//               <strong>Estado de la respuesta PQR:</strong>{" "}
//               {pqr.estado_respuesta}
//             </p>
//             <p>
//               <strong>Atributo de calidad:</strong> {pqr.atributo_calidad}
//             </p>
//             <p>
//               <strong>Fuente:</strong> {pqr.fuente}
//             </p>
//             <p>
//               <strong>Asignado a:</strong>{" "}
//               {pqr.asignados && pqr.asignados.length > 0
//                 ? pqr.asignados.map((u) => u.name).join(", ")
//                 : "Sin asignar"}
//             </p>
//             <p>
//               <strong>Clasificación: </strong>
//               {pqr.clasificaciones && pqr.clasificaciones.length > 0
//                 ? pqr.clasificaciones.map((c) => c.nombre).join(", ")
//                 : "Sin clasificar"}
//             </p>
//             <p>
//               <strong>Reembolso:</strong>{" "}
//               {pqr.reembolsos && pqr.reembolsos.length > 0 ? (
//                 <>
//                   {pqr.reembolsos[0].estado === "Aprobado"
//                     ? "✅ Aprobado"
//                     : "❌ Desaprobado"}{" "}
//                   {pqr.reembolsos[0].usuario
//                     ? `por ${pqr.reembolsos[0].usuario.name} ${pqr.reembolsos[0].usuario.primer_apellido}`
//                     : ""}
//                 </>
//               ) : (
//                 "No tiene reembolso"
//               )}
//             </p>
//           </div>
//         </div>
//         <p>
//           <strong>Descripción:</strong>
//         </p>
//         <div className="pqr-description-text">{pqr.descripcion}</div>

//         {/* Mostrar archivos adjuntos de la PQRS original si existen */}

//         {pqr.archivo && pqr.archivo.length > 0 && (
//           <div className="archivos-adjuntos" style={{ marginTop: "10px" }}>
//             <strong>Archivos adjuntos de la PQRS:</strong>{" "}
//             {pqr.archivo.map((fileItem, index) => {
//               const urlArchivo = fileItem.url; // ✅ ya viene lista desde Laravel
//               const fileName = fileItem.original_name;

//               return (
//                 <div
//                   key={`pqr-file-${index}`}
//                   style={{ marginBottom: "10px" }}
//                 >
//                   {/* Enlace para descargar o ver */}
//                   {urlArchivo && (
//                     <a
//                       href={urlArchivo}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       style={{
//                         display: "inline-block",
//                         marginRight: "10px",
//                       }}
//                     >
//                       {fileName}
//                     </a>
//                   )}

//                   {/* Previsualización si es imagen o PDF */}
//                   {fileItem.path.match(/\.(jpeg|jpg|png|gif)$/i) ? (
//                     <div>
//                       <img
//                         src={urlArchivo}
//                         alt={`Adjunto ${index + 1}`}
//                         style={{
//                           maxWidth: "300px",
//                           marginTop: "5px",
//                           display: "block",
//                         }}
//                       />
//                     </div>
//                   ) : fileItem.path.match(/\.pdf$/i) ? (
//                     <div style={{ marginTop: "5px" }}>
//                       <iframe
//                         src={urlArchivo}
//                         title={`PDF Adjunto ${index + 1}`}
//                         width="100%"
//                         height="500px"
//                         style={{ border: "1px solid #ccc" }}
//                       ></iframe>
//                     </div>
//                   ) : null}
//                 </div>
//               );
//             })}
//           </div>
//         )}
//         <SeguimientoPqrs
//           pqr_codigo={pqr_codigo}
//           formData={formData}
//         // estado_respuesta={pqr.estado_respuesta}
//         />

//         <h2>
//           <strong>Reembolso:</strong>{" "}
//           {pqr.reembolsos && pqr.reembolsos.length > 0 ? (
//             <>
//               {pqr.reembolsos[0].estado === "Aprobado"
//                 ? "✅ Aprobado"
//                 : "❌ Desaprobado"}{" "}
//               {pqr.reembolsos[0].usuario
//                 ? `por ${pqr.reembolsos[0].usuario.name} ${pqr.reembolsos[0].usuario.primer_apellido}`
//                 : ""}
//             </>
//           ) : (
//             "No tiene reembolso"
//           )}
//         </h2>

//         {pqr &&
//           (tienePermiso(["Administrador"]) || [3, 10].includes(usuarioId)) &&
//           pqr.clasificaciones?.some(c => c.nombre === "Solicitudes de tesorería") && (
//             <AprobarReembolso pqrId={pqr.id} />
//           )}

//         {/* {yaRespondida ? (
//           <div className="pqrs-res-message">
//             <p>
//               Esta PQRS ya tiene una respuesta registrada o ha sido cerrada.
//             </p>
//             <button
//               className="pqrs-res-button"
//               onClick={() => navigate(`/pqrs/${pqr_codigo}`)}
//             >
//               Ver detalles de la PQRS
//             </button>
//           </div>
//         ) : ( */}
//         <form onSubmit={handleSubmit} className="pqrs-res-form">
//           {/* SELECTOR DE PLANTILLAS */}
//           <p>
//             <strong>Usar plantilla:</strong>
//           </p>

//           <select
//             className="styled-input-plantilla"
//             value={plantillaSeleccionada}
//             onChange={(e) => {
//               const idSeleccionado = e.target.value;
//               setPlantillaSeleccionada(idSeleccionado);

//               const plantilla = plantillas.find(
//                 (p) => p.id.toString() === idSeleccionado
//               );

//               if (plantilla && pqr) {
//                 let contenido = plantilla.contenido;

//                 // Obtener fecha origen
//                 let fechaOrigen = pqr.fecha_inicio_real
//                   ? pqr.fecha_inicio_real
//                   : pqr.created_at;

//                 const fechaPqrCreada = new Date(fechaOrigen).toLocaleDateString(
//                   "es-CO",
//                   {
//                     day: "numeric",
//                     month: "long",
//                     year: "numeric",
//                   }
//                 );

//                 // Placeholders dinámicos
//                 const placeholders = {
//                   "[NOMBRE]": `${pqr.nombre || ""} ${pqr.segundo_nombre || ""} ${pqr.apellido || ""
//                     } ${pqr.segundo_apellido || ""}`.trim(),
//                   "[JUEZ]": `${pqr.registrador_apellido || ""}`.trim(),
//                   "[RADICADO]": `${pqr.radicado_juzgado || ""}`.trim(),
//                   "[CIUDAD]": pqr.sede || "Ciudad",
//                   "[CORREO]": pqr.correo || "",
//                   "[TIPO_DOC]": pqr.documento_tipo || "",
//                   "[NUMERO_DOC]": pqr.documento_numero || "",
//                   "[TELEFONO]": pqr.telefono || "",
//                   "[FECHA]": new Date().toLocaleDateString("es-CO", {
//                     day: "numeric",
//                     month: "long",
//                     year: "numeric",
//                   }),
//                   "[PQR_CREADA]": fechaPqrCreada,
//                   "[PACIENTE]": `${pqr.nombre || ""} ${pqr.segundo_nombre || ""} ${pqr.apellido || ""
//                     } ${pqr.segundo_apellido || ""}`.trim(),
//                   "[CC]": pqr.documento_tipo || "",
//                 };

//                 // Reemplazos
//                 for (const clave in placeholders) {
//                   contenido = contenido.replaceAll(clave, placeholders[clave]);
//                 }

//                 // ⚠️ AQUI LLENAS EL TEXTAREA RESPUESTA
//                 setRespuesta(contenido);
//               }
//             }}
//           >
//             <option value="">-- Selecciona una plantilla --</option>
//             {plantillas.map((p) => (
//               <option key={p.id} value={p.id}>
//                 {p.nombre}
//               </option>
//             ))}
//           </select>

//           {/* TEXTAREA (no se toca) */}
//           <p>
//             <strong>Respuesta:</strong>
//           </p>
//           <textarea
//             id="respuesta"
//             className="pqrs-res-textarea"
//             value={respuesta}
//             onChange={(e) => setRespuesta(e.target.value)}
//             rows="5"
//             maxLength={maxChars}
//             required
//           />

//           <div className="contador-chars">
//             {respuesta.length} / {maxChars} caracteres
//           </div>

//           {/* ARCHIVOS ADJUNTOS */}
//           <p>
//             <strong>Archivos adjuntos (opcional):</strong>
//           </p>

//           <input
//             type="file"
//             multiple
//             onChange={(e) => {
//               const files = Array.from(e.target.files);

//               const tooBig = files.find((file) => file.size > 7 * 1024 * 1024);

//               if (tooBig) {
//                 Swal.fire({
//                   icon: "warning",
//                   title: "Archivo demasiado grande",
//                   text: "Solo se permiten archivos de máximo 7MB.",
//                   confirmButtonText: "Aceptar",
//                 });
//                 return;
//               }

//               setAdjuntos((prev) => [...prev, ...files]);
//             }}
//           />

//           {adjuntos.length > 0 && (
//             <div style={{ marginTop: "10px" }}>
//               <strong className="archivo-seleccionado">
//                 Archivos seleccionados:
//               </strong>
//               <ul>
//                 {adjuntos.map((file, index) => (
//                   <li key={index} style={{ display: "flex", alignItems: "center" }}>
//                     <span>{file.name}</span>
//                     <button
//                       type="button"
//                       onClick={() => handleRemoveAttachment(index)}
//                       style={{
//                         marginLeft: "10px",
//                         background: "#df3232",
//                         color: "white",
//                         border: "none",
//                         borderRadius: "4px",
//                         cursor: "pointer",
//                         padding: "2px 6px",
//                       }}
//                     >
//                       X
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           <button type="submit" className="pqrs-res-button">
//             Enviar Respuesta
//           </button>
//         </form>

//         {/* )} */}
//       </div>
//       <Version />
//     </>
//   );
// };

// export default PqrsResponder;

