import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { register } from "./authService";
import { registerSchema } from "./validation"; // Asegúrate que coincida con las reglas del backend
import { useNavigate } from "react-router-dom";
import "../auth/styles/Register.css";
import Swal from "sweetalert2";

export const Register = () => {
  const navigate = useNavigate();

  const documentos = [
    { id: 1, nombre: "CC" },
    { id: 2, nombre: "TI" },
  ];

  const handleSubmit = async (values, actions) => {
    try {
      await register(values);

      Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: "Ya puedes iniciar sesión",
        confirmButtonColor: "#3085d6",
      });

      navigate("/login");
    } catch (error) {
      if (error.response && error.response.data.errors) {
        const apiErrors = error.response.data.errors;

        Object.keys(apiErrors).forEach((key) => {
          actions.setFieldError(key, apiErrors[key][0]);
        });

        Swal.fire({
          icon: "error",
          title: "Error en el registro",
          text: "Revisa los campos ingresados",
          confirmButtonColor: "#d33",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error inesperado",
          text: "No se pudo completar el registro",
          confirmButtonColor: "#d33",
        });
      }

      actions.setSubmitting(false);
    }
  };

  return (
    <>
      <div className="header-register">
        <div>
          Crear <span>Cuenta</span>
        </div>
      </div>
      <br />
      <div className="register">
        <img src="/logo-2.png" alt="" className="logo-img" />
        <Formik
          initialValues={{
            name: "",
            userName: "",
            email: "",
            documento_tipo: "",
            documento_numero: "",
            password: "",
            password_confirmation: "",
          }}
          validationSchema={registerSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors }) => (
            <Form>
              <div>
                <Field type="text" name="name" placeholder="Nombre completo" />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="error-message"
                />
              </div>

              <div>
                <Field type="text" name="userName" placeholder="Usuario" />
                <ErrorMessage
                  name="userName"
                  component="div"
                  className="error-message"
                />
              </div>

              <div>
                <Field
                  type="email"
                  name="email"
                  placeholder="Correo electrónico"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="error-message"
                />
              </div>

              <div>
                <Field as="select" name="documento_tipo">
                  <option value="">Selecciona un tipo de documento</option>
                  {documentos.map((documento) => (
                    <option key={documento.id} value={documento.nombre}>
                      {documento.nombre}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="documento_tipo"
                  component="div"
                  className="error-message"
                />
              </div>

              <div>
                <Field
                  type="text"
                  name="documento_numero"
                  placeholder="Número de documento"
                />
                <ErrorMessage
                  name="documento_numero"
                  component="div"
                  className="error-message"
                />
              </div>

              <div>
                <Field
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="error-message"
                />
              </div>

              <div>
                <Field
                  type="password"
                  name="password_confirmation"
                  placeholder="Confirmar contraseña"
                />
                <ErrorMessage
                  name="password_confirmation"
                  component="div"
                  className="error-message"
                />
              </div>

              {errors.general && (
                <div className="error-message">{errors.general}</div>
              )}

              <button type="submit" disabled={isSubmitting}>
                Registrarse
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
};
