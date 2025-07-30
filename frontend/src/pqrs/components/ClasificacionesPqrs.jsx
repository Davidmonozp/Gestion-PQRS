import React, { useState, useEffect, useRef } from "react";
import api from "../../api/api";
import Swal from "sweetalert2";
import "../styles/ClasificacionesPqrs.css";

function ClasificacionesPqrs({
  pqrId,
  pqrCodigo,
  useIdInUrl = true,
  onClasificacionesActualizadas,
  deshabilitado = false,
}) {
  const [availableClasificaciones, setAvailableClasificaciones] = useState([]);
  const [selectedClasificacionIds, setSelectedClasificacionIds] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const ref = useRef();

  useEffect(() => {
    const fetchAvailableClasificaciones = async () => {
      try {
        const response = await api.get("/clasificaciones");
        setAvailableClasificaciones(response.data);
      } catch (err) {
        setError("Error al cargar clasificaciones.");
      }
    };

    const fetchPqrClasificaciones = async () => {
      if (!pqrId) return;
      try {
        const response = await api.get(`/pqrs/${pqrId}/clasificaciones`);
        const selectedIds = response.data.map((c) => c.id); // ✅ Solo las que ya están asociadas
        setSelectedClasificacionIds(selectedIds);
      } catch (err) {
        setError("Error al cargar clasificaciones de la PQR.");
      }
    };

    fetchAvailableClasificaciones();
    fetchPqrClasificaciones();
  }, [pqrId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCheckboxChange = (id) => {
    setSelectedClasificacionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSyncClasificaciones = async () => {
    try {
      const urlSegment = useIdInUrl ? pqrId : pqrCodigo;
      const response = await api.post(
        `/pqrs/${urlSegment}/agregar-clasificacion`,
        {
          clasificacion_ids: selectedClasificacionIds,
        }
      );
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: response.data.message || "Clasificaciones actualizadas.",
        timer: 2000,
        showConfirmButton: false,
      });
      if (onClasificacionesActualizadas) {
        onClasificacionesActualizadas();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "¡Error!",
        text: "No se pudo guardar las clasificaciones.",
        confirmButtonText: "Cerrar",
      });
    }
  };

  return (
    <div className="dropdown-clasificaciones" ref={ref}>
      <label className="dropdown-label">Clasificaciones:</label>
      <div
        className="dropdown-input"
        onClick={() => {
          if (!deshabilitado) setDropdownOpen(!dropdownOpen);
        }}
      >
        {selectedClasificacionIds.length > 0
          ? availableClasificaciones
              .filter((c) => selectedClasificacionIds.includes(c.id))
              .map((c) => c.nombre)
              .join(", ")
          : "Seleccione la clasificación"}
        <span className="dropdown-arrow"></span>
      </div>

      {dropdownOpen && !deshabilitado && (
        <div className="dropdown-list">
          {availableClasificaciones.map((clasificacion) => (
            <div key={clasificacion.id} className="dropdown-item-clasificacion">
              <label className="clasificacion-option">
                <input
                  type="checkbox"
                  checked={selectedClasificacionIds.includes(clasificacion.id)}
                  onChange={() => handleCheckboxChange(clasificacion.id)}
                  disabled={deshabilitado}
                />
                {clasificacion.nombre}
              </label>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleSyncClasificaciones}
        className="sync-button"
        disabled={deshabilitado}
      >
        Actualizar Clasificaciones
      </button>
    </div>
  );
}

export default ClasificacionesPqrs;
