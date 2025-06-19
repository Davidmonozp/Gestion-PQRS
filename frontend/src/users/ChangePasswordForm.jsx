import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import "./styles/ChangePasswordForm.css";
import Navbar from "../components/Navbar/Navbar";

const ChangePasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      current_password: "",
      new_password: "",
      new_password_confirmation: "", // Nombre común para la confirmación en backends Laravel
    },
    validationSchema: Yup.object({
      current_password: Yup.string().required(
        "La contraseña actual es obligatoria"
      ),
      new_password: Yup.string()
        .min(6, "La nueva contraseña debe tener al menos 6 caracteres")
        .required("La nueva contraseña es obligatoria"),
      new_password_confirmation: Yup.string()
        .required("Confirma la nueva contraseña")
        .oneOf([Yup.ref("new_password")], "Las contraseñas no coinciden"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Asumiendo que tu API tiene un endpoint como '/user/change-password'
        // que verifica la contraseña actual del usuario autenticado.
        const res = await api.post("/user/change-password", {
          current_password: values.current_password,
          new_password: values.new_password, // Tu backend Laravel espera 'password'
          new_password_confirmation: values.new_password_confirmation, // Y 'password_confirmation'
        });

        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: res.data.message || "Contraseña cambiada correctamente",
          timer: 2000,
          showConfirmButton: false,
        });

        formik.resetForm(); // Limpiar el formulario después del éxito

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (error) {
        console.error("Error al cambiar la contraseña:", error);
        let errorMessage =
          "No se pudo cambiar la contraseña. Inténtalo de nuevo.";

        // Manejo de errores específicos del backend
        if (error.response && error.response.data) {
          if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.errors) {
            // Si el backend devuelve errores de validación de Laravel
            const errors = error.response.data.errors;
            if (errors.current_password) {
              errorMessage = errors.current_password[0];
            } else if (errors.password) {
              // Puede ser 'password' o 'new_password'
              errorMessage = errors.password[0];
            } else if (errors.new_password) {
              errorMessage = errors.new_password[0];
            }
          }
        }

        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <>
      <Navbar />
      <div className="header-change-password">
        <div>
          Cambiar <br />
          <span>Contraseña</span>
        </div>
      </div>

      <div className="change-password-container">
        <form onSubmit={formik.handleSubmit}>
          <div className="form-group">
            <label htmlFor="current_password">Contraseña Actual:</label>
            <input
              type="password"
              id="current_password"
              name="current_password"
              value={formik.values.current_password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={loading}
            />
            {formik.touched.current_password &&
              formik.errors.current_password && (
                <div className="text-danger">
                  {formik.errors.current_password}
                </div>
              )}
          </div>

          <div className="form-group">
            <label htmlFor="new_password">Nueva Contraseña:</label>
            <input
              type="password"
              id="new_password"
              name="new_password"
              value={formik.values.new_password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={loading}
            />
            {formik.touched.new_password && formik.errors.new_password && (
              <div className="text-danger">{formik.errors.new_password}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="new_password_confirmation">
              Confirmar Nueva Contraseña:
            </label>
            <input
              type="password"
              id="new_password_confirmation"
              name="new_password_confirmation"
              value={formik.values.new_password_confirmation}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={loading}
            />
            {formik.touched.new_password_confirmation &&
              formik.errors.new_password_confirmation && (
                <div className="text-danger">
                  {formik.errors.new_password_confirmation}
                </div>
              )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Cambiando..." : "Cambiar Contraseña"}
          </button>
        </form>
      </div>
    </>
  );
};

export default ChangePasswordForm;
