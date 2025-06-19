


export const tienePermiso = (rolesPermitidos) => {
  const rol = localStorage.getItem("role");
  return rolesPermitidos.includes(rol);
};
