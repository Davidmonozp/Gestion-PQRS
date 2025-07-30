import { useNavigate } from "react-router-dom";

function UserFilters({ filters, setFilters, onBuscar }) {
  const navigate = useNavigate();
  const handleClear = () => {
    setFilters({
      documento_numero: "",
      name: "",
      email: "",
      role: "",
    });
  };

  return (
    <>
      <div className="filtros-busqueda-users">
        <input
          type="text"
          className="input-placeholder"
          placeholder="Número de documento"
          value={filters.documento_numero}
          onChange={(e) =>
            setFilters({ ...filters, documento_numero: e.target.value })
          }
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

        {!["Gestor", "Digitador"].includes(localStorage.getItem("role")) && (
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
        )}
      </div>
      <div className="filtros-busqueda-users">
        {/* Contenedor para los botones y el icono */}
        <div className="filtros-acciones">
          <button onClick={onBuscar}>Buscar</button>
          <button onClick={() => navigate("/register-user")}>
            Crear Usuario
          </button>
          <i
            className="fa fa-eraser limpiar-filtros"
            title="Limpiar filtros"
            onClick={handleClear}
          ></i>
        </div>
      </div>
    </>
  );
}

export default UserFilters;
