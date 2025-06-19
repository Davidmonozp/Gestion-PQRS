import { useNavigate } from "react-router-dom";

function UserFilters({ filters, setFilters, onBuscar }) {
  const navigate = useNavigate();


  return (
    <div className="filtros-busqueda-users">
      <input
        type="text"
        className="input-placeholder"
        placeholder="Buscar por ID"
        value={filters.id}
        onChange={(e) => setFilters({ ...filters, id: e.target.value })}
      />
      <input
        type="text"
        className="input-placeholder"
        placeholder="Buscar por nombre"
        value={filters.name}
        onChange={(e) => setFilters({ ...filters, name: e.target.value })}
      />
      <input
        type="text"
        className="input-placeholder"
        placeholder="Buscar por correo"
        value={filters.email}
        onChange={(e) => setFilters({ ...filters, email: e.target.value })}
      />
      <select
        className="input-placeholder"
        value={filters.role}
        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
      >
        <option value="">Todos los roles</option>
        <option value="Administrador">Administrador</option>
        <option value="Gestor">Gestor</option>
        <option value="Supervisor">Supervisor</option>
        <option value="Consultor">Consultor</option>
        <option value="Digitador">Digitador</option>
      </select>
      <button onClick={onBuscar}>Buscar</button>
      <button onClick={() => navigate("/register-user")}>Crear Usuario</button>
    </div>
  );
}

export default UserFilters;
