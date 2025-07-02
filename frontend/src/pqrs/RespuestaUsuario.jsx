import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { registrarRespuestaCiudadano } from "./pqrsService";

export default function RespuestaUsuario() {
  const { token } = useParams();
  const [contenido, setContenido] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [archivo, setArchivo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);
    setLoading(true);

    try {
      const res = await registrarRespuestaCiudadano(token, contenido, archivo);
      setMensaje(res.message || "Respuesta enviada correctamente");
      setContenido("");
      setArchivo(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>Enviar respuesta</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <textarea
            rows="6"
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="Escribe tu respuesta aquí..."
            required
            style={{ width: "100%", padding: 10, fontSize: 16 }}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Adjuntar archivo (opcional):</label>
          <input type="file" onChange={(e) => setArchivo(e.target.files[0])} />
        </div>

        <button type="submit" disabled={loading} style={{ marginTop: 10 }}>
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </form>

      {mensaje && <p style={{ color: "green", marginTop: 10 }}>{mensaje}</p>}
      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
    </div>
  );
}
