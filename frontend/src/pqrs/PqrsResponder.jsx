import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPqrsAsignadas, registrarRespuesta } from "./pqrsService";
import "./styles/PqrsResponder.css";
import Navbar from "../components/Navbar/Navbar";
import Swal from "sweetalert2";
import CountdownTimer from "./components/CountDownTimer";

const PqrsResponder = () => {
  const { pqr_codigo } = useParams();
  const navigate = useNavigate();

  const [pqr, setPqr] = useState(null);
  const [respuesta, setRespuesta] = useState("");
  const [error, setError] = useState("");
  const [adjuntos, setAdjuntos] = useState([]);

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

        if (
          encontrada.estado_respuesta === "Preliminar" ||
          encontrada.estado_respuesta === "Cerrado"
        ) {
          const result = await Swal.fire({
            icon: "info",
            title: "Respuesta ya registrada",
            text: "Esta PQRS ya tiene una respuesta o ha sido finalizada.",
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

  return (
    <>
      <Navbar />
      <div className="pqrs-res-container">
        <h2 className="pqrs-res-title">Respuesta preliminar de la {pqr.pqr_codigo}</h2>

        <div className="pqrs-res-info">
          <p>
            <strong>Nombre:</strong> {pqr.nombre} {pqr.apellido}
          </p>
          <p>
            <strong>Tipo:</strong> {pqr.tipo_solicitud}
          </p>
          <p>
            <strong>Descripción:</strong>
          </p>
          <div className="pqrs-res-descripcion">{pqr.descripcion}</div>

          {pqr.deadline && (
            <div className="pqrs-res-deadline">
              <p>
                <strong>Tiempo de respuesta PASSUS:</strong>{" "}
                {!pqr.respuesta_enviada ? (
                  <CountdownTimer deadline={new Date(pqr.deadline)} />
                ) : (
                  new Date(pqr.deadline).toLocaleString()
                )}
              </p>
            </div>
          )}

          {/* Mostrar archivos adjuntos de la PQRS original si existen */}
          {pqr.archivo && pqr.archivo.length > 0 && (
            <div className="archivos-adjuntos" style={{ marginTop: "10px" }}>
              <strong>Archivos adjuntos de la PQRS:</strong>{" "}
              {pqr.archivo.map((fileItem, index) => {
                // Asume que fileItem es un objeto { path: "...", original_name: "..." }
                // const urlArchivo = `http://localhost:8000/storage/${fileItem.path}`;
                const urlArchivo = ` http://192.168.1.30:8000/storage/${fileItem.path}`;

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

        {yaRespondida ? (
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
        ) : (
          <form onSubmit={handleSubmit} className="pqrs-res-form">
            <p>
              <strong>Respuesta:</strong>
            </p>
            <textarea
              id="respuesta"
              className="pqrs-res-textarea"
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              rows="5"
              required
            />

            <p>
              <strong>Archivos adjuntos (opcional):</strong>
            </p>
            <input
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files);

                // Validar tamaños
                const tooBig = files.find(
                  (file) => file.size > 7 * 1024 * 1024
                );

                if (tooBig) {
                  Swal.fire({
                    icon: "warning",
                    title: "Archivo demasiado grande",
                    text: "Solo se permiten archivos de máximo 7MB.",
                    confirmButtonText: "Aceptar",
                  });
                  return;
                }

                // Si todo bien, agregar
                setAdjuntos((prev) => [...prev, ...files]);
              }}
            />

            {adjuntos.length > 0 && (
              <div style={{ marginTop: "10px" }}>
                <strong className="archivo-seleccionado">Archivos seleccionados:</strong>
                <ul>
                  {adjuntos.map((file, index) => (
                    <li
                      key={index}
                      style={{ display: "flex", alignItems: "center" }}
                    >
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
        )}
      </div>
    </>
  );
};

export default PqrsResponder;
