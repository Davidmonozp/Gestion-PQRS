import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import Swal from "sweetalert2";

const atributos = [
  "Accesibilidad",
  "Continuidad",
  "Oportunidad",
  "Pertinencia",
  "Satisfacción del usuario",
  "Seguridad",
];

const fuentes = [
  "Formulario de la web",
  "Correo atención al usuario",
  "Correo de Agendamiento NAC",
  "Encuesta de satisfacción IPS",
  "Callcenter",
  "Presencial",
];

function PqrsEdit() {
  const { id: pqr_codigo } = useParams();
  const navigate = useNavigate();
  const [pqr, setPqr] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Nuevo estado y referencia para el dropdown de usuarios
  const [showUsuariosDropdown, setShowUsuariosDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pqrRes, usersRes] = await Promise.all([
          api.get(`/pqrs/codigo/${pqr_codigo}`),
          api.get("/users"),
        ]);
        setPqr(pqrRes.data.pqr);
        setUsuarios(usersRes.data);
      } catch (err) {
        Swal.fire("Error", "No se pudo cargar la información", "error");
      }
    };
    fetchData();
  }, [pqr_codigo]);

  // Hook para detectar y manejar el clic fuera del dropdown
  useEffect(() => {
    // Si el dropdown no está visible, no necesitamos un listener
    if (!showUsuariosDropdown) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUsuariosDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Función de limpieza para remover el listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUsuariosDropdown]);

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === "asignado_a") {
      value = value === "" ? null : parseInt(value, 10);
    }
    setPqr({ ...pqr, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/pqrs/codigo/${pqr_codigo}`, {
        atributo_calidad: pqr.atributo_calidad,
        fuente: pqr.fuente,
        asignado_a: pqr.asignado_a,
      });
      Swal.fire(
        "Actualizado",
        "PQRS actualizada correctamente",
        "success"
      ).then(() => {
        navigate(`/pqrs/${pqr_codigo}`);
      });
    } catch (err) {
      console.error(err.response?.data || err);
      Swal.fire("Error", "No se pudo actualizar", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!pqr) return <p>Cargando...</p>;

  return (
    <div className="pqr-card-container">
      <h2>Editar PQRS #{pqr_codigo}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Atributo de Calidad:</label>
          <select
            name="atributo_calidad"
            value={pqr.atributo_calidad || ""}
            onChange={handleChange}
          >
            <option value="">Seleccione</option>
            {atributos.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Fuente:</label>
          <select
            name="fuente"
            value={pqr.fuente || ""}
            onChange={handleChange}
          >
            <option value="">Seleccione</option>
            {fuentes.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </div>

        {/* Aquí está el menú desplegable personalizado para Asignado a */}
        <div ref={dropdownRef} className="dropdown">
          <label>Asignado a:</label>
          <button
            type="button"
            className="dropdown-toggle"
            onClick={() => setShowUsuariosDropdown(!showUsuariosDropdown)}
          >
            {pqr.asignado_a
              ? usuarios.find((u) => u.id === pqr.asignado_a)?.name
              : "Seleccione un usuario"}
          </button>
          
          {showUsuariosDropdown && (
            <ul className="dropdown-menu">
              {usuarios.map((user) => (
                <li
                  key={user.id}
                  onClick={() => {
                    setPqr({ ...pqr, asignado_a: user.id });
                    setShowUsuariosDropdown(false);
                  }}
                >
                  {user.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}

export default PqrsEdit;