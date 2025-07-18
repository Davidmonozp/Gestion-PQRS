import React, { useEffect, useState } from "react";
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
        // Si necesitas más campos los agregas aquí
      });
      Swal.fire("Actualizado", "PQRS actualizada correctamente", "success").then(() => {
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

        <div>
          <label>Asignado a:</label>
          <select
            name="asignado_a"
            value={pqr.asignado_a !== null ? pqr.asignado_a : ""}
            onChange={handleChange}
          >
            <option value="">Seleccione un usuario</option>
            {usuarios.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}

export default PqrsEdit;
