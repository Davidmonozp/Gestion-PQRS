import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";
import { tienePermiso } from "../../utils/permisoHelper";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [pqrsDropdownOpen, setPqrsDropdownOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container">
        <div className="logo">
          <NavLink to="/Pqr">
            <img src="/logo-2.png" alt="Logo PQRS" className="logo-navbar" />
          </NavLink>
        </div>

        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          <i className={menuOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </div>

        <div className={`nav-elements ${menuOpen ? "active" : ""}`}>
          <ul>
            <li>
              <NavLink
                to="/Pqr"
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                Tablero General
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/pqrs/asignadas"
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                Mis Casos Asignados
              </NavLink>
            </li>

            {/* Dropdown Registrar PQR-S-F */}
            <li>
              <div
                className="profile-dropdown"
                onClick={() => setPqrsDropdownOpen(!pqrsDropdownOpen)}
              >
                <span className="profile-link">
                  Nuevo Registro <i className="fas fa-caret-down"></i>
                </span>
                {pqrsDropdownOpen && (
                  <ul className="dropdown-menu-pqrs">
                    <li>
                      <NavLink
                        to="/pqrsForm"
                        className={({ isActive }) =>
                          isActive ? "active-link" : ""
                        }
                      >
                        Registrar PQR
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/solicitudes"
                        className={({ isActive }) =>
                          isActive ? "active-link" : ""
                        }
                      >
                        Registrar una solicitud
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/felicitacion"
                        className={({ isActive }) =>
                          isActive ? "active-link" : ""
                        }
                      >
                        Registrar felicitación
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/tutela"
                        className={({ isActive }) =>
                          isActive ? "active-link" : ""
                        }
                      >
                        Registrar tutela
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/derecho-peticion"
                        className={({ isActive }) =>
                          isActive ? "active-link" : ""
                        }
                      >
                        Registrar Der. Petición
                      </NavLink>
                    </li>
                  </ul>
                )}
              </div>
            </li>

            {/* Dropdown Perfil */}
            <li>
              <div
                className="profile-dropdown"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <span className="profile-link">
                  Mi Perfil <i className="fas fa-caret-down"></i>
                </span>
                {profileOpen && (
                  <ul className="dropdown-menu">
                    <li>
                      <NavLink
                        to="/profile/change-password"
                        className={({ isActive }) =>
                          isActive ? "active-link" : ""
                        }
                      >
                        Cambiar contraseña
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/logout"
                        className={({ isActive }) =>
                          isActive ? "active-link" : ""
                        }
                      >
                        Cerrar sesión
                      </NavLink>
                    </li>
                  </ul>
                )}
              </div>
            </li>

            {tienePermiso(["Administrador"]) && (
              <li>
                <NavLink
                  to="/users"
                  className={({ isActive }) => (isActive ? "active-link" : "")}
                >
                  Administración de Usuarios
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
