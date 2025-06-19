import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container">
        <div className="logo">
          <NavLink to="/">Gestión PQRS</NavLink>
        </div>

        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          <i className={menuOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </div>

        <div className={`nav-elements ${menuOpen ? "active" : ""}`}>
          <ul>
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/pqrs/asignadas"
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                Mis PQRS asignadas
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/pqrsForm"
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                Registrar PQR
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/users"
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                Usuarios
              </NavLink>
            </li>
            <li>
              <div
                className="profile-dropdown"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <span className="profile-link">
                  Perfil <i className="fas fa-caret-down"></i>
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
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
