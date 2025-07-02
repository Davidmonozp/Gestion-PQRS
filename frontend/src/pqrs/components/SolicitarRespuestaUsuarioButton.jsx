import React, { useState } from "react";

import Swal from "sweetalert2";
import api from "../../api/api";

function SolicitarRespuestaUsuarioButton({ pqrId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [token, setToken] = useState(null);

  const solicitarRespuestaUsuario = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/pqrs/${pqrId}/solicitar-respuesta`);
      setMensaje(res.data.message);
      setToken(res.data.token);
      Swal.fire("Éxito", res.data.message, "success");
      if (onSuccess) onSuccess();
    } catch (err) {
      const errMsg = err.response?.data?.error || "Error al solicitar respuesta";
      setError(errMsg);
      Swal.fire("Error", errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "1em" }}>
      <button onClick={solicitarRespuestaUsuario} disabled={loading}>
        {loading ? "Solicitando..." : "Solicitar respuesta al usuario"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}
      {token && (
        <p>
          Token generado: <code>{token}</code>
        </p>
      )}
    </div>
  );
}

export default SolicitarRespuestaUsuarioButton;
