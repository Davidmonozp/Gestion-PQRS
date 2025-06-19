
// import { Navigate } from 'react-router-dom';
// import { getToken, getRole } from '../auth/authService';

// export default function ProtectedRoute({ children, allowedRoles = [] }) {
//   const token = getToken();
//   const role = getRole();

//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
//     return <h2>No tienes permisos para acceder a esta vista.</h2>;
//   }

//   return children;
// }

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getToken, getRole } from '../auth/authService';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const [authorized, setAuthorized] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const token = getToken();
  const role = getRole();

  useEffect(() => {
    const allowed = allowedRoles.map(r => r.toLowerCase().trim());
    const current = role?.toLowerCase().trim();

    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: 'Sesión no iniciada',
        text: 'Debes iniciar sesión para acceder a esta vista.',
        confirmButtonText: 'Volver',
      }).then(() => {
        navigate(-1); // 🔙 vuelve a la ruta anterior
      });
      return;
    }

    if (allowedRoles.length > 0 && !allowed.includes(current)) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'No tienes permisos para acceder a esta vista.',
        confirmButtonText: 'Volver',
      }).then(() => {
        navigate(-1); 
      });
      setAuthorized(false);
    } else {
      setAuthorized(true);
    }
  }, [token, role, allowedRoles, navigate]);

  if (authorized === null) return null; 
  if (!authorized) return null;

  return children;
}
