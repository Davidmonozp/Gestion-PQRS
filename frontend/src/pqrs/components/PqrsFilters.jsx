
function PqrsFilters({ filters, setFilters, onBuscar }) {
  return (
    <div className="filtros-busqueda">
      <input
        type="text"
        className="input-placeholder"
        placeholder="Buscar por ID ó radicado"
        value={filters.id}
        onChange={(e) => setFilters({ ...filters, id: e.target.value })}
      />
      <input
        type="text"
        className="input-placeholder"
        placeholder="Número de Documento"
        value={filters.documento_numero}
        onChange={(e) =>
          setFilters({ ...filters, documento_numero: e.target.value })
        }
      />
      <input
        type="text"
        className="input-placeholder"
        placeholder="Servicio"
        value={filters.servicio_prestado}
        onChange={(e) =>
          setFilters({ ...filters, servicio_prestado: e.target.value })
        }
      />
      <input
        type="text"
        className="input-placeholder"
        placeholder="Tipo solicitud"
        value={filters.tipo_solicitud}
        onChange={(e) =>
          setFilters({ ...filters, tipo_solicitud: e.target.value })
        }
      />
      <button onClick={onBuscar}>Buscar</button>
    </div>
  );
}

export default PqrsFilters;