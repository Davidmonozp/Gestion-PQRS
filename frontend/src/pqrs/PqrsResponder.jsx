import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPqrsAsignadas, registrarRespuesta } from "./pqrsService";
import "./styles/PqrsResponder.css";
import Navbar from "../components/Navbar/Navbar";
import Swal from "sweetalert2";

const PqrsResponder = () => {
  const { id } = useParams();
  const pqrsId = parseInt(id);
  const navigate = useNavigate();

  const [pqr, setPqr] = useState(null);
  const [respuesta, setRespuesta] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const yaRespondida = pqr?.estado_respuesta === "Preliminar";

  useEffect(() => {
    const fetchPqrs = async () => {
      try {
        const asignadas = await getPqrsAsignadas();
        const encontrada = asignadas.find((item) => item.id === pqrsId);
        if (!encontrada)
          throw new Error("PQRS no encontrada o no asignada a usted.");

        setPqr(encontrada);

        if (
          encontrada.estado_respuesta === "Preliminar" ||
          encontrada.estado_respuesta === "Respondida"
        ) {
          const result = await Swal.fire({
            icon: "info",
            title: "Respuesta ya registrada",
            text: "Esta PQRS ya tiene una respuesta preliminar.",
            confirmButtonText: "Aceptar",
          });
          if (result.isConfirmed) {
            navigate(`/pqrs/${pqrsId}`);
          }
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchPqrs();
  }, [pqrsId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registrarRespuesta(pqrsId, respuesta);
      setMensaje("Respuesta enviada correctamente");
      setRespuesta("");
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) return <div className="pqrs-res-error">{error}</div>;
  if (!pqr) return <div className="pqrs-res-loading">Cargando PQRS...</div>;

  return (
    <>
      <Navbar />
      <div className="pqrs-res-container">
        <h2 className="pqrs-res-title">Responder PQRS #{pqr.id}</h2>

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
        </div>

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
            disabled={yaRespondida}
          />

          <button
            type="submit"
            className="pqrs-res-button"
            disabled={yaRespondida}
          >
            Enviar Respuesta
          </button>
        </form>

        {mensaje && <p className="pqrs-res-success">{mensaje}</p>}
      </div>
    </>
  );
};

export default PqrsResponder;
