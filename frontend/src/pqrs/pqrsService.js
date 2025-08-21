import axios from "axios";

// const API_URL = "http://127.0.0.1:8000/api";
const API_URL = "http://192.168.1.15:8000/api";
// const API_URL = "https://pqrs.passusips.com/api";
// const API_URL = "https://test-pqrs.passusips.com/api";
// const API_URL = "https://test-pqrs.passus.cloud/api";
// const API_URL = "https://pqrs.passus.cloud/api";





export async function createPqr(formData) {
  try {
    const res = await axios.post(`${API_URL}/pqrs`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error en la solicitud:", error); // Log general del error

    if (error.response) {
      // El servidor respondió con un estado fuera del rango 2xx
      console.error("Respuesta de error del servidor:", error.response.data);
      console.error("Estado de la respuesta:", error.response.status);
      console.error("Cabeceras de la respuesta:", error.response.headers);

      if (error.response.status === 422) {
        // Errores de validación (Unprocessable Content)
        // El backend suele enviar un objeto 'errors' en el cuerpo
        const backendErrors = error.response.data.errors;
        if (backendErrors) {
          console.error("Errores de validación del backend (422):", backendErrors);
          // Puedes formatear estos errores para mostrarlos al usuario si quieres
          // Por ejemplo, construir un mensaje detallado
          let errorMessage = "Los datos proporcionados no son válidos:\n";
          for (const field in backendErrors) {
            errorMessage += `- ${field}: ${backendErrors[field].join(', ')}\n`;
          }
          throw new Error(errorMessage); // Lanza un error más descriptivo
        }
      }
      // Si hay un mensaje específico del backend, úsalo
      throw new Error(error.response.data.message || `Error del servidor: ${error.response.status}`);
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta (ej. red caída)
      console.error("No se recibió respuesta del servidor:", error.request);
      throw new Error("No se pudo conectar con el servidor. Revisa tu conexión a internet o la URL de la API.");
    } else {
      // Algo sucedió al configurar la solicitud que disparó un error
      console.error("Error al configurar la solicitud:", error.message);
      throw new Error(`Error al enviar la solicitud: ${error.message}`);
    }
  }
}
// export async function createPqr(formData) {
//   try {
//     const res = await axios.post(`${API_URL}/pqrs`, formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });
//     return res.data;
//   } catch (error) {
//     // Extraer mensaje de error para lanzar
//     if (error.response && error.response.data) {
//       throw new Error(error.response.data.message || "Error creando PQR");
//     }
//     throw new Error(error.message);
//   }
// }

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

export async function registrarRespuesta(pqrsId, contenido, adjuntos = []) {
  const token = localStorage.getItem("token");

  // Construir FormData
  const formData = new FormData();
  formData.append("contenido", contenido);

  adjuntos.forEach((file) => {
    formData.append("adjuntos[]", file);
  });

  try {
    const res = await axios.post(
      `${API_URL}/pqrs/codigo/${pqrsId}/respuesta`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
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

  const response = await fetch(
    // `http://127.0.0.1:8000/api/respuesta-usuario/${token}`,
    // `http://192.168.1.15:8000/api/respuesta-usuario/${token}`,    
    // `https://pqrs.passusips.com/api/respuesta-usuario/${token}`,
    `https://test-pqrs.passus.cloud/api/respuesta-usuario/${token}`,
    // `https://pqrs.passus.cloud/api/respuesta-usuario/${token}`,


    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al enviar la respuesta");
  }

  return await response.json();
};
