// src/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../auth/Login";
import Logout from "../auth/Logout";
import { Register } from "../auth/Register";
import PqrsForm from "../pqrs/PqrsForm";
import { Pqr } from "../pages/Pqr";
import PqrsList from "../pqrs/PqrsList";
import PqrsDetail from "../pqrs/PqrsDetail";
import UserList from "../users/UserList";
import RegisterUser from "../users/RegisterUser";
import UserDetailEdit from "../users/UserDeatilEdit";
import ChangePasswordForm from "../users/ChangePasswordForm";
import PqrsAsignadas from "../pqrs/PqrsAsignadas";
import PqrsResponder from "../pqrs/PqrsResponder";
import RespuestaUsuario from "../pqrs/RespuestaUsuario";
import { Solicitudes } from "../pages/Solicitudes";
import FelicitacionForm from "../pqrs/FelicitacionForm";
import DerechoPeticionForm from "../pqrs/DerechoPeticionForm";
import TutelaForm from "../pqrs/TutelaForm";
import SolicitudForm from "../pqrs/SolicitudForm";
import InicioPQRS from "../pqrs/InicioPQRS";
import EventLogs from "../pqrs/EventLogs";


export function AppRouter() {
  return (
    <Routes>
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pqrsForm" element={<PqrsForm />} />


      {/* <Route path="/pqrsList" element={<PqrsList />} /> */}
      {/* <Route path="/pqrs/:id" element={<PqrsDetail />} /> */}
      {/* <Route path="/pqrs/asignadas" element={<PqrsAsignadas />} /> */}
      {/* <Route path="/pqrs/:id/respuesta" element={<PqrsResponder />} /> */}
       <Route path="/respuesta-usuario/:token" element={<RespuestaUsuario />} />
       <Route path="/solicitudes" element={<Solicitudes />} />
       <Route path="/felicitacion" element={<FelicitacionForm />} />
       <Route path="/tutela" element={<TutelaForm />} />
       <Route path="/derecho-peticion" element={<DerechoPeticionForm />} />
       <Route path="/solicitud" element={<SolicitudForm />} />
       <Route path="/consultar-radicado" element={<InicioPQRS/>} />
       <Route path="/event-logs" element={<EventLogs/>} />
        <Route path="/pqr/:pqr_id/logs" element={<EventLogs />} />

       



      <Route
        path="/Pqr"
        element={
          <ProtectedRoute
            allowedRoles={[
              "Administrador",
              "Consultor",
              "Supervisor",
              "Gestor",
              "Digitador",
            ]}
          >
            <Pqr />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/change-password"
        element={
          <ProtectedRoute
            allowedRoles={[
              "Administrador",
              "Consultor",
              "Supervisor",
              "Gestor",
              "Digitador",
            ]}
          >
            <ChangePasswordForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pqrs/:pqr_codigo"
        element={
          <ProtectedRoute
            allowedRoles={[
              "Administrador",
              "Consultor",
              "Supervisor",
              "Gestor",
              "Digitador",
            ]}
          >
            <PqrsDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={["Administrador", "Supervisor", "Gestor"]}>
            <UserList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/register-user"
        element={
          <ProtectedRoute allowedRoles={["Administrador"]}>
            <RegisterUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id"
        element={
          <ProtectedRoute allowedRoles={["Administrador"]}>
            <UserDetailEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pqrs/asignadas"
        element={
          <ProtectedRoute allowedRoles={["Administrador", "Supervisor", "Gestor"]}>
            <PqrsAsignadas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pqrs/:pqr_codigo/respuesta"
        element={
          <ProtectedRoute allowedRoles={["Administrador", "Gestor"]}>
            <PqrsResponder />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
