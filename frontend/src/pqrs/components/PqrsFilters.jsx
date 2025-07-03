import "../styles/PqrsFilters.css";

function PqrsFilters({ filters, setFilters, onBuscar }) {
  return (
    <div className="filtros-busqueda">
      <input
        type="text"
        className="input-placeholder"
        placeholder="Buscar por ID ó radicado"
        value={filters.pqr_codigo}
        onChange={(e) => setFilters({ ...filters, pqr_codigo: e.target.value })}
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
      <select
        className="input-placeholder"
        value={filters.servicio_prestado}
        onChange={(e) =>
          setFilters({ ...filters, servicio_prestado: e.target.value })
        }
      >
        <option value="">Seleccione el servicio</option>
        <option value="Hidroterapia">Hidroterapia</option>
        <option value="Programa Rehabilitación">Programa Rehabilitación</option>
        <option value="Neuropediatría">Neuropediatría</option>
        <option value="Psiquiatría">Psiquiatría</option>
        <option value="Fisiatría">Fisiatría</option>
        <option value="Acuamotricidad">Acuamotricidad</option>
        <option value="Natación infantil">Natación infantil</option>
        <option value="Natación jovenes-adultos">
          Natación jóvenes-adultos
        </option>
        <option value="Yoga">Yoga</option>
        <option value="Yoga acuático">Yoga acuático</option>
        <option value="Mindfulness">Mindfulness</option>
        <option value="Pilates">Pilates</option>
        <option value="Pilates acuático">Pilates acuático</option>
      </select>

      <select
        className="input-placeholder"
        value={filters.tipo_solicitud}
        onChange={(e) =>
          setFilters({ ...filters, tipo_solicitud: e.target.value })
        }
      >
        <option value="">Seleccione tipo de solicitud</option>
        <option value="Felicitación">Felicitación</option>
        <option value="Petición">Petición</option>
        <option value="Queja">Queja</option>
        <option value="Reclamo">Reclamo</option>
        <option value="Solicitud">Solicitud</option>
      </select>
      <button onClick={onBuscar}>Buscar</button>
    </div>
  );
}

export default PqrsFilters;
