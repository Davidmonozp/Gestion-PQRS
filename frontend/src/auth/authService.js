import axios from 'axios';
import Swal from 'sweetalert2';


// const API = "http://127.0.0.1:8000/api/auth/";
// const API = "http://192.168.1.15:8000/api/auth/";
// const API = "https://pqrs.passusips.com/api/auth/";
// const API = "https://test-pqrs.passusips.com/api/auth/";
const API = "https://test-pqrs.passus.cloud/api/auth/";
// const API = "https://pqrs.passus.cloud/api/auth/";



// 🔐 LOGIN
export const login = async (credentials) => {
  try {
    const res = await axios.post(`${API}login`, credentials);

    localStorage.setItem("usuarioId", res.data.user.id);

    // Guardamos el token y el rol principal
    localStorage.setItem('token', res.data.token);

    if (res.data.roles && res.data.roles.length > 0) {
      localStorage.setItem('role', res.data.roles[0]);
    }
    if (res.data.user && res.data.user.sedes) {
      const nombresSedes = res.data.user.sedes.map((s) => s.name);
      localStorage.setItem("sedes", JSON.stringify(nombresSedes));
    }
    if (res.data.user && res.data.user.name) {
      localStorage.setItem('nameUser', res.data.user.name);
    }

    return res.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 403) {
        Swal.fire({
          icon: 'error',
          title: 'Usuario inactivo',
          text: data.message || 'Tu cuenta está inactiva. Contacta al administrador.',
        });
      } else if (status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Credenciales inválidas',
          text: 'Correo o contraseña incorrectos.',
        });
      } else if (status === 422) {
        Swal.fire({
          icon: 'warning',
          title: 'Error de validación',
          text: data.message || 'Revisa los campos e intenta nuevamente.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error del servidor',
          text: 'Ocurrió un error inesperado. Intenta más tarde.',
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor.',
      });
    }
    throw error;
  }
};

// 📝 REGISTER
export const register = async (data) => {
  return axios.post(`${API}register`, data);
};

// 🚪 LOGOUT
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};

// ✅ Getters
export const getToken = () => localStorage.getItem('token');
export const getRole = () => localStorage.getItem('role');
export const getSedes = () => {
  const sedes = localStorage.getItem("sedes");
  return sedes ? JSON.parse(sedes) : [];
};
