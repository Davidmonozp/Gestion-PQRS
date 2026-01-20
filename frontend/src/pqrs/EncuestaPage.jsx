import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import "./styles/EncuestaPage.css";


function EncuestaPage() {
    const { token } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [pqrCodigo, setPqrCodigo] = useState("");
    const [calificacion, setCalificacion] = useState("");
    const [respuesta_satisfaccion_final, setRespuesta_satisfaccion_final] = useState("");
    const [comentario, setComentario] = useState("");
    const [enviada, setEnviada] = useState(false);

    useEffect(() => {
        api.get(`/encuesta/${token}`)
            .then(res => {
                setPqrCodigo(res.data.pqr_codigo);
                setLoading(false);
            })
            .catch(err => {
                setError(err.response?.data?.error || "Error al cargar encuesta");
                setLoading(false);
            });
    }, [token]);

    const enviar = () => {
        api.post(`/encuesta/${token}`, {
            calificacion,
            respuesta_satisfaccion_final,
            comentario
        })
            .then(() => setEnviada(true))
            .catch(err =>
                setError(err.response?.data?.error || "Error al enviar encuesta")
            );
    };

    if (loading) return <p>Cargando...</p>;
    if (error === "Encuesta ya respondida") {
        return (
            <div className="thank-you-container">
                <div className="thank-you-card">
                    <img src="/logo-2.png" alt="Passus" />
                    <h2>Esta encuesta ya fue respondida.</h2>
                    <p className="parrafo-encuesta-respondida">¡Gracias por tu participación!</p>
                </div>
            </div>
        );
    }
    if (enviada) return (
        <div className="thank-you-container">
            <div className="thank-you-card">
                <img src="/logo-2.png" alt="Passus" />
                <h2>¡Gracias! Tu respuesta ha sido registrada.</h2>
            </div>
        </div>
    );

    return (
        <div className="encuesta-container">
            <img src="/logo-2.png" alt="Passus" />
            <h2>Encuesta de satisfacción</h2>
            <p><strong>PQRS:</strong> {pqrCodigo}</p>

            <label>¿Cómo calificaría su experiencia general con la gestión de su PQR?:</label>
            <select className="custom-select" value={calificacion} onChange={e => setCalificacion(e.target.value)}>
                <option value="">Seleccione…</option>
                <option value="5">Excelente</option>
                <option value="4">Bueno</option>
                <option value="3">Regular</option>
                <option value="2">Malo</option>
                <option value="1">Muy malo</option>
            </select>

            <label>¿Considera que su PQR fue resuelta satisfactoriamente con la respuesta final que recibió?:</label>
            <select className="custom-select" value={respuesta_satisfaccion_final} onChange={e => setRespuesta_satisfaccion_final(e.target.value)}>
                <option value="">Seleccione…</option>
                <option value="Si">Sí fue resuelta</option>
                <option value="Parcialmente">Fue parcialmente resuelta</option>
                <option value="No">No fue resuelta</option>
            </select>

            <label>Comentario (opcional):</label>
            <textarea
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                maxLength={200}
            >
            </textarea>
            <p className="caracteres">{comentario.length}/200</p>
            <button onClick={enviar}>Enviar</button>
        </div>
    );
}

export default EncuestaPage;
