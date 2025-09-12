import React, { useState } from "react";
import Swal from "sweetalert2";
import { reclasificarPqr } from "../pqrsService";

const ReclasificarPqr = ({ pqrId, tipoActual, onCambioExitoso }) => {
  const [nuevoTipo, setNuevoTipo] = useState(tipoActual);

  const handleReclasificar = async () => {
    try {
      const response = await reclasificarPqr(pqrId, nuevoTipo);

      Swal.fire({
        icon: "success",
        title: "Reclasificación exitosa",
        text: response.message || "La PQR fue reclasificada correctamente.",
      });

      // 🔹 Avisamos al padre que el tipo cambió
      if (onCambioExitoso) {
        onCambioExitoso(nuevoTipo);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al reclasificar",
        text: error.message || "Error inesperado",
      });
    }
  };

  return (
    <div className="reclasificar-container">
      <select
        className="styled-input"
        id="tipoSolicitud"
        value={nuevoTipo}
        onChange={(e) => setNuevoTipo(e.target.value)}
      >
        <option value="">Selecciona una opción</option>
        <option value="Peticion">Petición</option>
        <option value="Queja">Queja</option>
        <option value="Reclamo">Reclamo</option>
        <option value="Solicitud">Solicitud</option>
        <option value="Felicitacion">Felicitación</option>
        <option value="Tutela">Tutela</option>
        <option value="Derecho de peticion">Derecho de Petición</option>
      </select>

      <button onClick={handleReclasificar} className="btn-reclasificar">
        Guardar cambio
      </button>
    </div>
  );
};

export default ReclasificarPqr;
