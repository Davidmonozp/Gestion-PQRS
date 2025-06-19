// src/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../auth/Login";
import Logout from "../auth/Logout";
import { Register } from "../auth/Register";
import PqrsForm from "../pqrs/PqrsForm";
import { DashBoard } from "../pages/DashBoard";
import PqrsList from "../pqrs/PqrsList";
import PqrsDetail from "../pqrs/PqrsDetail";
import UserList from "../users/UserList";
import RegisterUser from "../users/RegisterUser";
import UserDetailEdit from "../users/UserDeatilEdit";
import ChangePasswordForm from "../users/ChangePasswordForm";
import PqrsEdit from "../pqrs/PqrsEdit";
import PqrsAsignadas from "../pqrs/PqrsAsignadas";
import PqrsResponder from "../pqrs/PqrsResponder";

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

      <Route
        path="/dashboard"
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
            <DashBoard />
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
        path="/pqrs/:id"
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
          <ProtectedRoute allowedRoles={["Administrador", "Supervisor"]}>
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
        path="/pqrs/:id/respuesta"
        element={
          <ProtectedRoute allowedRoles={["Administrador", "Gestor"]}>
            <PqrsResponder />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
