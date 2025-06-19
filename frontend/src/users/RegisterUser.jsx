import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import api from "../api/api";
import Swal from "sweetalert2";
import "./styles/RegisterUser.css";
import Navbar from "../components/Navbar/Navbar";

const RegisterUser = () => {
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const roles = [
    { id: 1, name: "Administrador" },
    { id: 2, name: "Consultor" },
    { id: 3, name: "Supervisor" },
    { id: 4, name: "Gestor" },
    { id: 5, name: "Digitador" },
  ];
  const documentos = [
    { id: 1, nombre: "CC" },
    { id: 2, nombre: "TI" },
  ];

  const registerSchema = Yup.object().shape({
    name: Yup.string().required("El nombre es obligatorio"),
    userName: Yup.string().required("El nombre de usuario es obligatorio"),
    email: Yup.string().email("Correo inválido").required("Requerido"),
    documento_tipo: Yup.string().required(
      "El tipo de documento es obligatorio"
    ),
    documento_numero: Yup.string().required(
      "El número de documento es obligatorio"
    ),
    password: Yup.string().min(5, "Mínimo 5 caracteres").required("Requerido"),
    password_confirmation: Yup.string()
      .oneOf([Yup.ref("password"), null], "Las contraseñas no coinciden")
      .required("Requerido"),
    role: Yup.string().required("Selecciona un rol"),
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      await api.post("/register-user", {
        name: values.name,
        userName: values.userName,
        email: values.email,
        documento_tipo: values.documento_tipo,
        documento_numero: values.documento_numero,
        password: values.password,
        role: values.role,
      });

      Swal.fire({
        icon: "success",
        title: "Usuario registrado",
        text: "El usuario fue creado correctamente",
        confirmButtonColor: "#3085d6",
      }).then(() => {
        navigate("/users");
      });
    } catch (err) {
      console.error(err);
      setServerError("Ocurrió un error al registrar el usuario.");
      setSubmitting(false);
      if (err.response?.data?.message) {
        setErrors({ general: err.response.data.message });
      }
    }
  };

  return (
    <>
    <Navbar/>
      <div className="header-register-user">
        <div>
          Registrar <br />
          <span> Usuario</span>
        </div>
      </div>

      <div className="register-user">
        <img src="/logo-2.png" alt="logo" className="logo-img" />

        <Formik
          initialValues={{
            name: "",
            userName: "",
            email: "",
            documento_tipo: "",
            documento_numero: "",
            password: "",
            password_confirmation: "",
            role: "",
          }}
          validationSchema={registerSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors }) => (
            <Form className="register-user-form">
              <div>
                <Field type="text" name="name" placeholder="Nombre" />
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

              <div>
                <Field as="select" name="role">
                  <option value="">Selecciona un rol</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="role"
                  component="div"
                  className="error-message"
                />
              </div>

              {errors.general && (
                <div className="error-message">{errors.general}</div>
              )}

              {serverError && (
                <div className="error-message">{serverError}</div>
              )}

              <button type="submit" disabled={isSubmitting}>
                Registrar
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
};

export default RegisterUser;
