// src/components/BotonesFilters.jsx (Nuevo nombre de archivo)

import "../styles/BotonesFilters.css";

/**
 * Componente que renderiza los botones de filtro por estado de PQR.
 *
 * @param {object} props
 * @param {string} props.activeStatusFilter El valor del filtro de estado actualmente activo.
 * @param {(status: string) => void} props.onStatusFilterClick Función que se llama cuando se hace clic en un botón de estado.
 */
function BotonesFilters({ activeStatusFilter, onStatusFilterClick }) {
  const statusButtons = [
    { label: "Todos", value: "" },
    { label: "Radicado", value: "Radicado" },
    { label: "Asignado", value: "Asignado" },
    { label: "En Proceso", value: "En Proceso" },
    { label: "Cerrado", value: "Cerrado" },
  ];

  return (
    <div className="status-filter-buttons">
      {statusButtons.map((button) => (
        <button
          key={button.value}
          className={activeStatusFilter === button.value ? "active" : ""}
          onClick={() => onStatusFilterClick(button.value)}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}

export default BotonesFilters; 