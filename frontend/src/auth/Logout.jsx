import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../auth/authService';

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    logout();          // eliminar token
    navigate('/login'); // redirigir a login
  }, [navigate]);

  return null; // No renderiza nada
}



