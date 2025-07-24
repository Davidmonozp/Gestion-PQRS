// src/components/PqrsStatusFilters.jsx
import React from 'react';

function PqrsStatusFilters({ activeStatusFilter, onStatusFilterClick }) {
  const statusButtons = [
    { label: "Todos", value: "" }, // Para mostrar todos los estados
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

export default PqrsStatusFilters;