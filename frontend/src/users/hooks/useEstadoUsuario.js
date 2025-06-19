// src/hooks/useEstadoUsuario.js
// Asumiendo que tu archivo `api` está en `src/api/api.js`
import { useState } from 'react';
import Swal from 'sweetalert2';
import api from '../../api/api'; 

const useEstadoUsuario = (initialUsers = []) => {
  const [usuarios, setUsuarios] = useState(initialUsers);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState(initialUsers);

  // Función para cargar usuarios, que el componente llamará al inicio
  const cargarUsuarios = async () => {
    try {
      const response = await api.get("/users");
      setUsuarios(response.data);
      setUsuariosFiltrados(response.data);
      return response.data;
    } catch (error) {
    }
  };

  // Función para alternar el estado activo/inactivo de un usuario
  const alternarEstadoUsuario = async (id) => {
    try {
      const userToUpdate = usuarios.find((user) => user.id === id);
      if (!userToUpdate) {
        console.error("Usuario no encontrado");
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'El usuario no fue encontrado.',
          confirmButtonText: 'Ok'
        });
        return;
      }

      const newActivoStatus = !userToUpdate.activo;
      const actionText = newActivoStatus ? 'activar' : 'inactivar';
      const confirmButtonColor = newActivoStatus ? '#28a745' : '#dc3545';

      const result = await Swal.fire({
        title: `¿Estás seguro de ${actionText} a ${userToUpdate.name}?`,
        text: `¡Esta acción cambiará el estado del usuario a ${newActivoStatus ? 'ACTIVO' : 'INACTIVO'}!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: confirmButtonColor,
        cancelButtonColor: '#6c757d',
        confirmButtonText: `Sí, ${actionText}`,
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await api.patch(`users/${id}/toggle-active`, {
          activo: newActivoStatus,
        });

        // Actualiza ambos estados locales del hook
        setUsuarios((prevUsuarios) =>
          prevUsuarios.map((user) =>
            user.id === id ? { ...user, activo: newActivoStatus } : user
          )
        );
        setUsuariosFiltrados((prevUsuarios) =>
          prevUsuarios.map((user) =>
            user.id === id ? { ...user, activo: newActivoStatus } : user
          )
        );

        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: `El usuario ha sido ${newActivoStatus ? 'activado' : 'inactivado'} correctamente.`,
          showConfirmButton: false,
          timer: 1500
        });

      } else {
        Swal.fire({
          icon: 'info',
          title: 'Operación cancelada',
          text: `El estado del usuario no ha cambiado.`,
          showConfirmButton: false,
          timer: 1500
        });
      }

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Hubo un error al cambiar el estado del usuario: ${error.message || 'Error desconocido'}.`,
        confirmButtonText: 'Entendido'
      });
    }
  };

  return {
    usuarios,
    setUsuarios, // Expone setUsuarios para que el componente pueda actualizar la lista completa si es necesario (ej. después de un filtro externo)
    usuariosFiltrados,
    setUsuariosFiltrados, // Expone setUsuariosFiltrados para que el componente pueda aplicar filtros
    alternarEstadoUsuario, // La función principal para activar/inactivar
    cargarUsuarios // La función para la carga inicial de usuarios
  };
};

export default useEstadoUsuario;