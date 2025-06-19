import React, { useEffect, useState } from "react";
import "./styles/UserList.css";
// ¡IMPORTANTE! Importamos 'useNavigate' (el hook) en lugar de 'Navigate' (el componente)
import { Link, useNavigate } from "react-router-dom";
import UserFilters from "./components/UserFilters";
import useEstadoUsuario from "./hooks/useEstadoUsuario";
import Navbar from "../components/Navbar/Navbar";

const UserList = () => {
  // Ahora usas el hook para manejar los estados y la lógica de activación
  const {
    usuarios,
    // setUsuarios, // No se usa directamente aquí, pero está disponible si lo necesitas para otra lógica
    usuariosFiltrados,
    setUsuariosFiltrados,
    alternarEstadoUsuario,
    cargarUsuarios,
  } = useEstadoUsuario([]);

  // ¡CRUCIAL! Inicializa el hook useNavigate dentro del componente
  const navigate = useNavigate();

  const [cargando, setCargando] = useState(true);

  const [filters, setFilters] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    const fetchAndSetUsers = async () => {
      try {
        await cargarUsuarios();
      } catch (error) {
        console.error("Error en el componente al cargar usuarios:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchAndSetUsers();
  }, []);

  // Función para manejar la búsqueda y el filtrado local
  const handleBuscar = () => {
    const filtered = usuarios.filter((user) => {
      const filterId = filters.id.trim();
      const filterName = filters.name.trim().toLowerCase();
      const filterEmail = filters.email.trim().toLowerCase();
      const filterRole = filters.role.trim();

      const matchId = filterId === "" || user.id.toString().includes(filterId);
      const matchName = user.name.toLowerCase().includes(filterName);
      const matchEmail = user.email.toLowerCase().includes(filterEmail);
      const matchRole =
        filterRole === "" || user.roles.some((r) => r.name === filterRole);

      return matchId && matchName && matchEmail && matchRole;
    });

    setUsuariosFiltrados(filtered);
  };

  if (cargando) return <p>Cargando usuarios...</p>;

  // Función para navegar a los detalles/edición del usuario
  const handleVer = (id) => {
    navigate(`/users/${id}`); // <-- ¡Aquí usamos la función 'navigate' obtenida del hook!
  };

  // Función para navegar a la edición del usuario (misma vista por ahora)
  const handleEditar = (id) => {
    navigate(`/users/${id}`); // Asumiendo que rediriges al mismo componente de ver/editar
  };

  // Función para manejar la eliminación de un usuario
  const handleEliminar = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
    }
  };

  return (
    <>
      <Navbar />

      <div className="container-users">
        <div className="header-top-users">
          <UserFilters
            filters={filters}
            setFilters={setFilters}
            onBuscar={handleBuscar}
          />
          <h2>Lista de usuarios</h2>
        </div>

        <div className="table-wrapper-users">
          <table className="container-table-users" border="1" cellPadding="8">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Nombre de usuario</th>
                <th>Correo</th>
                <th>Roles</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.userName}</td>
                  <td>{user.email}</td>
                  <td>{user.roles.map((role) => role.name).join(", ")}</td>
                  <td>{user.activo ? "Activo" : "Inactivo"}</td>
                  <td>
                    <div className="actions">
                      <button onClick={() => handleVer(user.id)} title="Ver">
                        <i className="fa fa-eye"></i>
                      </button>
                      <button
                        onClick={() => handleEditar(user.id)}
                        title="Editar"
                      >
                        <i className="fa fa-edit"></i>
                      </button>
                      {/* Usa la función del hook para el toggle de estado */}
                      <button
                        onClick={() => alternarEstadoUsuario(user.id)}
                        title={
                          user.activo ? "Inactivar usuario" : "Activar usuario"
                        }
                      >
                        {user.activo ? (
                          <i className="fa-solid fa-handshake"></i>
                        ) : (
                          <i className="fa-solid fa-handshake-slash"></i>
                        )}
                      </button>
                      {/* <button
                      onClick={() => handleEliminar(user.id)}
                      title="Eliminar"
                    >
                      <i className="fa fa-trash-alt"></i>
                    </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default UserList;
