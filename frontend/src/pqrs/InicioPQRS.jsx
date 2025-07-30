import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import "./styles/InicioPQRS.css";
import api from "../api/api";
import Swal from "sweetalert2";

const InicioPQRS = () => {
  // Estado para el input
  const [radicado, setRadicado] = useState("");

  // Función para consultar radicado
const handleConsultar = async () => {
  if (!radicado.trim()) {
    Swal.fire({
      icon: "warning",
      title: "Campo vacío",
      text: "Por favor ingresa el número de radicado.",
    });
    return;
  }

  Swal.fire({
    title: "Consultando...",
    text: "Por favor espera un momento",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await api.post("/pqrs/consultar-radicado", {
      pqr_codigo: radicado.trim(),
    });

    const correoDestino = response.data.correo;

    Swal.fire({
      icon: "success",
      title: "Correo enviado",
      html: `
        <p>El estado de tu PQR fue enviado al correo:</p>
        <strong>${correoDestino}</strong>
      `,
      confirmButtonText: "Entendido",
    });

    setRadicado("");
  } catch (error) {
    if (error.response && error.response.status === 404) {
      Swal.fire({
        icon: "error",
        title: "No encontrado",
        text: "No se encontró ningún radicado con ese número.",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al consultar el radicado. Inténtalo más tarde.",
      });
    }
  }
};

  return (
    <div className="pqrs-container-pqrs">
      <div className="header-pqrs">
        <div>
          Envía tu <span>PQR</span>
        </div>
      </div>
      <h1 className="inicio-title">
        Bienvenido al Sistema de PQR-S de Passus IPS
      </h1>
      <div className="card-container">
        <div className="card-inicio-pqr">
          <i className="fas fa-comment-dots card-icon"></i>
          <h2>PQR</h2>
          <p>Registra una Petición, Queja o Reclamo.</p>
          <NavLink to="/pqrsForm" className="card-button">
            Registrar PQR
          </NavLink>
        </div>

        <div className="card-inicio-pqr">
          <i className="fas fa-file-alt card-icon"></i>
          <h2>Solicitud</h2>
          <p>Registrar una solicitud.</p>
          <NavLink to="/solicitudes" className="card-button">
            Registrar Solicitud
          </NavLink>
        </div>

        <div className="card-inicio-pqr">
          <i className="fas fa-heart card-icon"></i>
          <h2>Felicitación</h2>
          <p>Comparte tu experiencia positiva con nosotros.</p>
          <NavLink to="/felicitacion" className="card-button">
            Registrar Felicitación
          </NavLink>
        </div>
      </div>

      <div className="card-inicio-radicado">
        <i className="fa-solid fa-magnifying-glass card-icon"></i>
        <h2>Consultar Radicado</h2>
        <p>Consulta el estado de tu PQR, solicitud o felicitación.</p>
        <input
          type="text"
          placeholder="Ingresa el número de radicado"
          className="card-input"
          value={radicado}
          onChange={(e) => setRadicado(e.target.value.toUpperCase())}
        />
        <button className="card-button" onClick={handleConsultar}>
          Consultar
        </button>
      </div>
    </div>
  );
};

export default InicioPQRS;
