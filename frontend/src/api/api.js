
import axios from "axios";
import Swal from "sweetalert2";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// Interceptor para agregar el token JWT en cada request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar expiración del token u otros errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Mostrar alerta de sesión expirada
      Swal.fire({
        icon: "warning",
        title: "Sesión expirada",
        text: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
        confirmButtonText: "Iniciar sesión",
        allowOutsideClick: false, // evita que lo cierren sin hacer clic
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.clear();
          window.location.href = "/login";
        }
      });
    }

    return Promise.reject(error);
  }
);

export default api;
