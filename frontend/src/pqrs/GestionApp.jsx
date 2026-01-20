import React, { useState } from "react";
import api from "../api/api";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar/Navbar";
import "./styles/GestionApp.css";
import DescargarPqrsExcel from "./components/DescargarPqrsExcel";
import { Version } from "../components/Footer/Version";
import { tienePermiso } from "../utils/permisoHelper";

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

  const sedes = [
    "Bogota-Norte",
    "Bogota-Centro",
    "Bogota-Sur-Occidente-Rehabilitación",
    "Bogota-Sur-Occidente-Hidroterapia",
    "Ibague",
    "Chia",
    "Florencia",
  ];
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

  const [sedeSeleccionada, setSedeSeleccionada] = useState("");

  const handleGuardarSede = async () => {
    if (!sedeSeleccionada) return;
    try {
      const res = await api.post("/crear-clasificacion", { nombre: sedeSeleccionada });
      Swal.fire("Éxito", res.data.message, "success");
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "No se pudo crear la clasificación",
        "error"
      );
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
      <h2 className="titulo-gestion">Gestión de la App</h2>

      <div className="gestion-app">
        <div className="cards-row">
          <div className="card-config">
            <h3>Cambiar sede</h3>
            <p>Cambiar la sede de una PQRS.</p>
            <button
              className="boton-reabrir"
              onClick={async () => {
                const { value: formValues } = await Swal.fire({
                  title: "Cambiar la sede de una PQR",
                  html: `
          <input id="swal-pqr-codigo" class="swal2-input" placeholder="Código de la PQR">
          <select id="swal-pqr-sede" class="swal2-select">
            <option value="">-- Selecciona una sede --</option>
            ${sedes.map(sede => `<option value="${sede}">${sede}</option>`).join('')}
          </select>
        `,
                  focusConfirm: false,
                  showCancelButton: true,
                  preConfirm: () => {
                    const codigo = document.getElementById('swal-pqr-codigo').value.trim();
                    const sede = document.getElementById('swal-pqr-sede').value;
                    if (!codigo || !sede) {
                      Swal.showValidationMessage('Debes ingresar el código y seleccionar una sede');
                      return null;
                    }
                    return { codigo, sede };
                  },
                });

                if (formValues) {
                  try {
                    const res = await api.post(`/pqrs/cambiar-sede/${formValues.codigo}`, {
                      sede: formValues.sede,
                    });
                    Swal.fire("Éxito", res.data.message, "success");
                  } catch (err) {
                    Swal.fire(
                      "Error",
                      err.response?.data?.message || "No se pudo cambiar la sede",
                      "error"
                    );
                  }
                }
              }}
            >
              Cambiar Sede
            </button>
          </div>

          {/* Card Reabrir */}
          {tienePermiso(["Administrador"]) && (
            <>
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
                <p>Agrega nuevas clasificaciones de PQRS.</p>
                <button className="boton-reabrir" onClick={handleNuevaClasificacion}>
                  Agregar Clasificación
                </button>
              </div>
              <div className="card-config">
                <h3>Informe PQRS</h3>
                <p>Descarga de archivo Excel de PQRS</p>
                <DescargarPqrsExcel />
              </div>
            </>
          )}
          {/* Card Cargo */}
          {/* <div className="card-config">
            <h3>Sedes</h3>
            <p>Agregar o modificar sedes</p>
            <button onClick={handleNuevoCargo}>Agregar Cargo</button>
          </div> */}
        </div>
        <Version />
      </div>
    </>
  );
}

export default GestionApp;
