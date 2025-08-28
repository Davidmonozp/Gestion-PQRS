// src/components/autoLogout/AutoLogout.js
import { useIdleTimer } from 'react-idle-timer';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../auth/authService';

const AutoLogout = () => {
  const navigate = useNavigate();

  const handleOnIdle = () => {
    logout();             // 🔒 Limpia sesión
    navigate('/login');   // 🚪 Redirige
  };

  useIdleTimer({
    timeout: 20 * 60 * 1000, 
    onIdle: handleOnIdle,
    debounce: 500,
  });

  return null;
};

export default AutoLogout;
