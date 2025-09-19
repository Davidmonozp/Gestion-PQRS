import React, { useState } from "react";
import api from "../api/api";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar/Navbar";
import "./styles/GestionApp.css";

function GestionApp() {
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);

  // 👉 Función para reabrir PQR
const handleReabrir = async () => {
  if (!codigo.trim()) {
    Swal.fire("Error", "Debes ingresar el código de la PQR", "error");
    return;
  }

  // Confirmación antes de reabrir
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: "¿Deseas reabrir esta PQR?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, reabrir",
    cancelButtonText: "Cancelar",
  });

  if (!result.isConfirmed) {
    return; // el usuario canceló
  }

  setLoading(true);
  try {
    const response = await api.post("/pqrs/reabrir", { pqr_codigo: codigo });

    Swal.fire("Éxito", response.data.message, "success");
    setCodigo(""); // limpiar input
  } catch (error) {
    console.error(error);
    Swal.fire(
      "Error",
      error.response?.data?.message || "No se pudo reabrir la PQR",
      "error"
    );
  } finally {
    setLoading(false);
  }
};


  // 👉 Función para agregar clasificación
  const handleNuevaClasificacion = async () => {
    const { value: nombre } = await Swal.fire({
      title: "Nueva Clasificación",
      input: "text",
      inputLabel: "Nombre de la clasificación",
      inputPlaceholder: "Ej: Desarrollo",
      showCancelButton: true,
      confirmButtonText: "Guardar",
    });

    if (nombre) {
      try {
        const res = await api.post("/crear-clasificacion", { nombre });
        Swal.fire("Éxito", res.data.message, "success");
      } catch (err) {
        Swal.fire(
          "Error",
          err.response?.data?.message || "No se pudo crear la clasificación",
          "error"
        );
      }
    }
  };

  // 👉 Función para agregar cargo
  const handleNuevoCargo = async () => {
    const { value: nombre } = await Swal.fire({
      title: "Nuevo Cargo",
      input: "text",
      inputLabel: "Nombre del cargo",
      inputPlaceholder: "Ej: Coordinador",
      showCancelButton: true,
      confirmButtonText: "Guardar",
    });

    if (nombre) {
      try {
        const res = await api.post("/cargos", { nombre });
        Swal.fire("Éxito", res.data.message, "success");
      } catch (err) {
        Swal.fire(
          "Error",
          err.response?.data?.message || "No se pudo crear el cargo",
          "error"
        );
      }
    }
  };

  return (
    <>
      <Navbar />
      <h2>Gestión de la App</h2>

      <div className="gestion-app">
        <div className="cards-row">
          {/* Card Reabrir */}
          <div className="card-config">
            <h3>Reabrir una PQR</h3>
            <div className="form-group">
              <label className="label-config" htmlFor="codigo">
                Código de la PQR:
              </label>
              <input
                className="input-config"
                type="text"
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ej: PT00017-1105695518"
              />
            </div>
            <button className="boton-reabrir" onClick={handleReabrir} disabled={loading}>
              {loading ? "Reabriendo..." : "Reabrir PQR"}
            </button>
          </div>

          {/* Card Clasificación */}
          <div className="card-config">
            <h3>Clasificaciones</h3>
            <p>Agrega nuevas clasificaciones de PQRs.</p>
            <button className="boton-reabrir" onClick={handleNuevaClasificacion}>
              Agregar Clasificación
            </button>
          </div>

          {/* Card Cargo */}
          {/* <div className="card-config">
            <h3>Sedes</h3>
            <p>Agregar o modificar sedes</p>
            <button onClick={handleNuevoCargo}>Agregar Cargo</button>
          </div> */}
        </div>
      </div>
    </>
  );
}

export default GestionApp;
