import Swal from "sweetalert2";
import api from "../api/api";

const showWarning = (action) => {
  Swal.fire({
    icon: "warning",
    title: "Campos incompletos",
    text: `Por favor, selecciona al menos una PQR y uno o más usuarios para la ${action}.`,
  });
};

const handleMasiveError = (error, action) => {
  console.error(`Error al realizar la ${action} masiva:`, error);

  if (error.response && error.response.status === 422) {
    const validationErrors = error.response.data.errors;
    let errorMessage = "";

    if (validationErrors.hasOwnProperty("pqr_codigos.0")) {
      errorMessage = validationErrors["pqr_codigos.0"][0];
    } else {
      errorMessage = `Hubo un error de validación en la ${action}. Revisa los datos e intenta de nuevo.`;
    }

    Swal.fire({
      icon: "error",
      title: `Error de validación en la ${action}`,
      text: errorMessage,
      confirmButtonText: "OK",
    });
  } else {
    Swal.fire({
      icon: "error",
      title: `Error en el servidor al realizar la ${action}`,
      text: `Hubo un error al realizar la ${action}. Intenta más tarde.`,
      confirmButtonText: "OK",
    });
  }
};

export const handleAsignacionMasiva = async ({
  selectedPqrs,
  usuarioAsignadoMasivo,
  fetchPqrs,
  setSelectedPqrs,
  setUsuarioAsignadoMasivo,
  setShowUserSelect,
}) => {
  if (selectedPqrs.size === 0 || usuarioAsignadoMasivo.length === 0) {
    return showWarning("asignación");
  }

  const result = await Swal.fire({
    title: "¿Confirmas la asignación masiva?",
    text: "Esta acción asignará las PQRS seleccionadas a los usuarios seleccionados.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, asignar",
    cancelButtonText: "Cancelar",
  });

  if (!result.isConfirmed) return;

  try {
    const response = await api.post("/pqrs/asignacion-masiva", {
      pqr_codigos: Array.from(selectedPqrs),
      usuario_ids: usuarioAsignadoMasivo,
    });

    Swal.fire({
      icon: "success",
      title: "¡Asignación exitosa!",
      text: response.data.message,
      confirmButtonText: "OK",
    });

    fetchPqrs();
    setSelectedPqrs(new Set());
    setUsuarioAsignadoMasivo([]);
    setShowUserSelect(false);
  } catch (error) {
    handleMasiveError(error, "asignación");
  }
};

export const handleDesasignacionMasiva = async ({
  selectedPqrs,
  usuarioAsignadoMasivo,
  fetchPqrs,
  setSelectedPqrs,
  setUsuarioAsignadoMasivo,
  setShowUserSelect,
}) => {
  if (selectedPqrs.size === 0 || usuarioAsignadoMasivo.length === 0) {
    return showWarning("desasignación");
  }

  const result = await Swal.fire({
    title: "¿Confirmas la desasignación masiva?",
    text: "Esta acción eliminará la asignación de los usuarios seleccionados de las PQRS seleccionadas.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, desasignar",
    cancelButtonText: "Cancelar",
  });

  if (!result.isConfirmed) return;

  try {
    const response = await api.post("/pqrs/desasignacion-masiva", {
      pqr_codigos: Array.from(selectedPqrs),
      usuario_ids: usuarioAsignadoMasivo,
    });

    Swal.fire({
      icon: "success",
      title: "¡Desasignación exitosa!",
      text: response.data.message,
      confirmButtonText: "OK",
    });

    fetchPqrs();
    setSelectedPqrs(new Set());
    setUsuarioAsignadoMasivo([]);
    setShowUserSelect(false);
  } catch (error) {
    handleMasiveError(error, "desasignación");
  }
};
