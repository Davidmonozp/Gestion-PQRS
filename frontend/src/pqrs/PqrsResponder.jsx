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

  const yaRespondida = pqr?.estado_respuesta === "Preliminar" || pqr?.estado_respuesta === "Cerrado";

  useEffect(() => {
    const fetchPqrs = async () => {
      try {
        if (!pqr_codigo) {
          setError("Código de PQRS no proporcionado en la URL.");
          return;
        }

        const asignadas = await getPqrsAsignadas();
        const encontrada = asignadas.find((item) => item.pqr_codigo === pqr_codigo);

        if (!encontrada) {
          throw new Error("PQRS no encontrada o no asignada a usted.");
        }
        setPqr(encontrada);

        if (encontrada.estado_respuesta === "Preliminar" || encontrada.estado_respuesta === "Cerrado") {
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
      await registrarRespuesta(pqr_codigo, respuesta);
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
  if (!pqr && !error) return <div className="pqrs-res-loading">Cargando PQRS...</div>;

  return (
    <>
      <Navbar />
      <div className="pqrs-res-container">
        <h2 className="pqrs-res-title">Responder PQRS #{pqr.pqr_codigo}</h2>

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
        </div>

        {yaRespondida ? (
          <div className="pqrs-res-message">
            <p>Esta PQRS ya tiene una respuesta registrada o ha sido cerrada.</p>
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

            <button
              type="submit"
              className="pqrs-res-button"
            >
              Enviar Respuesta
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default PqrsResponder;