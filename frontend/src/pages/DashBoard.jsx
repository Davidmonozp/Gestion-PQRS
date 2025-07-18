import { Link } from "react-router-dom";
import PqrsList from "../pqrs/PqrsList";

export const DashBoard = () => {
  return (
    <div>     
      <div>
        <h1>Dashboard</h1>
        <h1>PQRS</h1>
        <Link to="/logout"><h2>Cerrar sesión</h2></Link>
        <Link to="/users"><h2>Usuarios</h2></Link>
        <Link to="/profile/change-password"><h2>Cambiar contraseña</h2></Link>
        <PqrsList/>
      </div>
    </div>
  );
};
