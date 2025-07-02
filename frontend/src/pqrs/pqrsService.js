import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export async function createPqr(formData) {
  try {
    const res = await axios.post(`${API_URL}/pqrs`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    // Extraer mensaje de error para lanzar
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Error creando PQR");
    }
    throw new Error(error.message);
  }
}

export async function getPqrsAsignadas() {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/pqrs-asignadas`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data.pqrs;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(
        error.response.data.error || "Error obteniendo las PQR asignadas"
      );
    }
    throw new Error(error.message);
  }
}


export async function registrarRespuesta(pqrsId, contenido) {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.post(
      `${API_URL}/pqrs/codigo/${pqrsId}/respuesta`,
      { contenido },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(
        error.response.data.error || "Error al registrar la respuesta"
      );
    }
    throw new Error(error.message);
  }
}


export const registrarRespuestaCiudadano = async (
  token,
  contenido,
  archivo
) => {
  const formData = new FormData();
  formData.append("contenido", contenido);
  if (archivo) {
    formData.append("archivo", archivo);
  }

  const response = await fetch(`http://127.0.0.1:8000/api/respuesta-usuario/${token}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al enviar la respuesta");
  }

  return await response.json();
};
