import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import api from "../api/api"; // Asegúrate de que tu instancia de axios esté configurada correctamente para la URL base
import Swal from "sweetalert2";
import "./styles/RegisterUser.css";
import Navbar from "../components/Navbar/Navbar";

const RegisterUser = () => {
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const [showSedesDropdown, setShowSedesDropdown] = useState(false);

  const roles = [
    { id: 1, name: "Administrador" },
    { id: 2, name: "Consultor" },
    { id: 3, name: "Supervisor" },
    { id: 4, name: "Gestor" },
    { id: 5, name: "Digitador" },
  ];
  const sedes = [
    { id: 1, name: "Bogota-Sur-Occidente-Rehabilitación" },
    { id: 2, name: "Bogota-Sur-Occidente-Hidroterapia" },
    { id: 3, name: "Bogota-Norte" },
    { id: 4, name: "Bogota-Centro" },
    { id: 5, name: "Chia" },
    { id: 6, name: "Florencia" },
    { id: 7, name: "Ibague" },
    // { id: 8, name: "Cedritos-Divertido" },
  ];
  const documentos = [
    { id: 1, nombre: "CC" },
    { id: 2, nombre: "TI" },
  ];

  const areas = [
    { id: 1, name: "Bienestar" },
    { id: 2, name: "Administrativa" },
    { id: 3, name: "Financiera" },
    { id: 4, name: "Automatización Y Desarrollo Tecnológico" },
    { id: 5, name: "Calidad Y Mejoramiento Continuo" },
    { id: 7, name: "Prestación De Servicio" },
    { id: 8, name: "Prestación De Servicio - Aseguramiento Misional" },
    { id: 10, name: "Gestión Del Riesgo - Operaciones Misionales" },
    { id: 12, name: "Gestión Del Riesgo - Atención Al Usuario" },
    { id: 13, name: "Gestión Del Riesgo - Agendamiento" },
    { id: 16, name: "Gestión Del Riesgo - Supervisores" },
    { id: 18, name: "Administrativa - Servicios Y Compras" },
    { id: 19, name: "Administrativa - Infraestructura" },
    { id: 20, name: "Administrativa - Oficios Varios" },
    { id: 21, name: "Financiera - Contabilidad" },
    { id: 24, name: "Prestación De Servicio - Analista De Modelo" },
    { id: 25, name: "Prestación De Servicio - Gestores" },
    { id: 26, name: "Prestación De Servicio - Enfermeria" },
    { id: 27, name: "Prestación De Servicio - Terapeutico" },
    { id: 28, name: "Prestación De Servicio - Apoyo Básico" },
    { id: 29, name: "Calidad Y Gestion Documental" },
  ];

  const cargos = [
    { areaId: 1, name: "Anfitrión Salvavidas" },
    { areaId: 1, name: "Profesional En Bienestar" },
    { areaId: 1, name: "Salvavidas" },
    { areaId: 1, name: "Instructor De Natacion" },
    { areaId: 2, name: "Asistente Gestión Talento Humano Y SST" },
    { areaId: 2, name: "Director De Gestión Administrativa Y Contable" },
    { areaId: 2, name: "Profesional En Gestión Del Talento Humano Y SST" },
    { areaId: 2, name: "Profesional Junior En Mercadeo Y Publicidad" },
    { areaId: 3, name: "Analista De Admisiones Y Prefacturación" },
    { areaId: 3, name: "Auxiliar Gestión Facturación Y Cartera" },
    { areaId: 3, name: "Profesional Analista En Facturación Y Cartera" },
    { areaId: 4, name: "Director De Automatización Y Desarrollo Tecnológico" },
    {
      areaId: 4,
      name: "Profesional Especializado En Automatización Y Análisis De Datos",
    },
    {
      areaId: 4,
      name: "Profesional Junior En Automatización Y Desarrollo Tecnológico",
    },
    { areaId: 4, name: "Auxiliar De Automatización Y Desarrollo Tecnologico" },
    {
      areaId: 5,
      name: "Profesional De Aseguramiento De La Calidad En Salud Y PAMEC",
    },
    {
      areaId: 7,
      name: "Subgerente Relacionamiento Y Fidelización Del Paciente",
    },
    { areaId: 7, name: "Aprendiz Sena En Entrenamiento Deportivo" },
    { areaId: 7, name: "Aprendiz Sena En Atencion A La Primera Infancia" },
    {
      areaId: 8,
      name: "Gerente De Prestación De Servicios Y Aseguramiento Misional",
    },
    { areaId: 10, name: "Subgerente Operaciones Misionales" },
    { areaId: 12, name: "Auxiliar De Admisiones Y Caja Nivel 1" },
    { areaId: 12, name: "Auxiliar De Admisiones Y Caja Nivel 2" },
    { areaId: 12, name: "Auxiliar De Admisiones Y Caja Nivel 3" },
    { areaId: 13, name: "Auxiliar Operativo Y Soporte Misional" },
    { areaId: 16, name: "Supervisor Administrativo De Agencia" },
    {
      areaId: 18,
      name: "Profesional En Gestión Logística, Compras E Inventarios",
    },
    { areaId: 19, name: "Auxiliar De Mantenimiento Y Oficios Varios" },
    {
      areaId: 19,
      name: "Profesional De Infraestructura Y Ambiente Físico Junior",
    },
    { areaId: 20, name: "Auxiliar De Apoyo Oficios Varios" },
    { areaId: 21, name: "Auxiliar Gestión Contable" },
    {
      areaId: 24,
      name: "Profesional Analista De Modelo De Atención Y Seguridad Del Paciente",
    },
    { areaId: 25, name: "Gestor Administrativo De Agencia" },
    { areaId: 26, name: "Auxiliar De Enfermería De Agencia Nivel 2" },
    { areaId: 26, name: "Auxiliar De Enfermería De Agencia Nivel 1" },
    { areaId: 27, name: "Educador Especial" },
    { areaId: 27, name: "Fisioterapeuta" },
    { areaId: 27, name: "Fonoaudiologa" },
    { areaId: 27, name: "Terapia Ocupacional" },
    { areaId: 27, name: "Psicologo" },
    { areaId: 27, name: "Especialista En Pediatria" },
    { areaId: 27, name: "Fisiatria" },
    { areaId: 28, name: "Auxiliar De Apoyo Básico" },
    {
      areaId: 29,
      name: "Profesional Junior En Gestión Documental Y Mapa De Procesos",
    },
  ];

  const cargosPorArea = areas.reduce((acc, area) => {
    acc[area.name] = cargos
      .filter((cargo) => cargo.areaId === area.id)
      .map((cargo) => cargo.name);
    return acc;
  }, {});

  const registerSchema = Yup.object().shape({
    name: Yup.string()
      .transform((value) => value.trim())
      .min(3, "El nombre no puede tener menos de 3 caracteres")
      .max(100, "El nombre no puede tener más de 100 caracteres")
      .required("El nombre es obligatorio")
      .test(
        "no-solo-espacios",
        "El nombre no puede contener solo espacios en blanco",
        (value) => value && value.trim().length > 0
      ),
    segundo_nombre: Yup.string()
      .transform((value) => value.trim())
      .min(3, "El nombre no puede tener menos de 3 caracteres")
      .max(100, "El nombre no puede tener más de 100 caracteres"),
    primer_apellido: Yup.string()
      .transform((value) => value.trim())
      .min(3, "El apellido no puede tener menos de 3 caracteres")
      .max(100, "El apellido no puede tener más de 100 caracteres")
      .required("El apellido es obligatorio")
      .test(
        "no-solo-espacios",
        "El apellido no puede contener solo espacios en blanco",
        (value) => value && value.trim().length > 0
      ),
    segundo_apellido: Yup.string()
      .transform((value) => value.trim())
      .min(3, "El apellido no puede tener menos de 3 caracteres")
      .max(100, "El apellido no puede tener más de 100 caracteres"),

    userName: Yup.string()
      .transform((value) => value.trim())
      .min(7, "El nombre no puede tener menos de 7 caracteres")
      .max(50, "El userName no puede tener más de 50 caracteres")
      .required("El nombre de usuario es obligatorio")
      .test(
        "no-solo-espacios",
        "El nombre de usuario no puede contener solo espacios",
        (value) => value && value.trim().length > 0
      ),
    email: Yup.string()
      .transform((value) => value.trim())
      .email("Debes ingresar un correo válido")
      .required("El correo es obligatorio"),
    documento_numero: Yup.string()
      .transform((value) => value.trim())
      .required("El número de documento es obligatorio")
      .min(6, "El número de documento debe tener al menos 6 dígitos")
      .max(30, "El número de documento no puede tener más de 30 dígitos")
      .test(
        "no-solo-espacios",
        "El número de documento no puede contener solo espacios",
        (value) => value && value.trim().length > 0
      ),
    password: Yup.string()
      .transform((value) => value.trim())
      .min(5, "La contraseña debe tener al menos 5 caracteres")
      .max(20, "La contraseña no puede tener más de 20 caracteres")
      .required("La contraseña es obligatoria"),

    password_confirmation: Yup.string()
      .oneOf([Yup.ref("password"), null], "Las contraseñas no coinciden")
      .required("Confirma la contraseña"),
    role: Yup.string().required("Selecciona un rol"),
    // AQUI ES IMPORTANTE: sedes es un array de strings (los IDs)
    sedes: Yup.array()
      .min(1, "Debes seleccionar al menos una sede")
      .required("La sede es obligatoria"), // `required` para arrays asegura que el array no sea `undefined` o `null`. `min(1)` asegura que no esté vacío.
    documento_tipo: Yup.string().required("Selecciona un tipo de documento"), // Agregué validación para documento_tipo
    area: Yup.string().required("El área es obligatoria"),
    cargo: Yup.string().required("El cargo es obligatorio"),
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      await api.post("/register-user", {
        name: values.name,
        segundo_nombre: values.segundo_nombre,
        primer_apellido: values.primer_apellido,
        segundo_apellido: values.segundo_apellido,
        userName: values.userName,
        email: values.email,
        documento_tipo: values.documento_tipo,
        documento_numero: values.documento_numero,
        password: values.password,
        password_confirmation: values.password_confirmation,
        role: values.role,
        sedes: values.sedes, // Esto ya es un array de strings con los IDs, lo cual es correcto
        area: values.area,
        cargo: values.cargo,
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
      setSubmitting(false);

      if (err.response?.status === 422 && err.response?.data?.errors) {
        const apiErrors = err.response.data.errors;
        const formikErrors = {};

        Object.entries(apiErrors).forEach(([field, messages]) => {
          formikErrors[field] = messages.join(", ");
        });

        setErrors(formikErrors);
      } else if (err.response?.data?.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError("Error desconocido, por favor intente nuevamente.");
      }
    }
  };

  return (
    <>
      <Navbar />
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
            segundo_nombre: "",
            primer_apellido: "",
            segundo_apellido: "",
            userName: "",
            email: "",
            documento_tipo: "", // Asegúrate de inicializarlo
            documento_numero: "",
            password: "",
            password_confirmation: "",
            role: "",
            sedes: [], // Importante: inicializar como un array vacío
            area: "",
            cargo: "",
          }}
          validationSchema={registerSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, values, setFieldValue }) => {
            useEffect(() => {
              if (values.area && cargosPorArea[values.area]) {
                setFieldValue("cargo", "");
              } else {
                setFieldValue("cargo", "");
              }
            }, [values.area, setFieldValue]);

            const filteredCargos = values.area
              ? cargosPorArea[values.area] || []
              : [];

            return (
              <Form className="register-user-form form-grid">
                {/* Campos de texto y select normales */}
                <div>
                  <Field type="text" name="name" placeholder="Primer nombre" />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="error-message"
                  />
                </div>
                <div>
                  <Field
                    type="text"
                    name="segundo_nombre"
                    placeholder="Segundo nombre"
                  />
                  <ErrorMessage
                    name="segundo_nombre"
                    component="div"
                    className="error-message"
                  />
                </div>
                <div>
                  <Field
                    type="text"
                    name="primer_apellido"
                    placeholder="Primer apellido"
                  />
                  <ErrorMessage
                    name="primer_apellido"
                    component="div"
                    className="error-message"
                  />
                </div>
                <div>
                  <Field
                    type="text"
                    name="segundo_apellido"
                    placeholder="Segundo apellido"
                  />
                  <ErrorMessage
                    name="segundo_apellido"
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

                {/* Select de tipo de documento */}
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

                {/* Checkboxes para sedes */}
                <div className="sedes-register">
                  {/* <label className="form-label fw-bold">Sedes:</label> */}

                  <div
                    className={`form-control ${
                      values.sedes.length === 0 ? "placeholder-sedes" : ""
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowSedesDropdown((prev) => !prev)}
                  >
                    {values.sedes.length > 0
                      ? sedes
                          .filter((s) => values.sedes.includes(String(s.id)))
                          .map((s) => s.name)
                          .join(", ")
                      : "Seleccione una sede"}
                  </div>

                  {showSedesDropdown && (
                    <div className="checkbox-options-register">
                      {sedes.map((sede) => {
                        const checked = values.sedes.includes(String(sede.id));
                        return (
                          <label
                            key={sede.id}
                            className="checkbox-item-register"
                          >
                            <input
                              className="input-sedes-register"
                              type="checkbox"
                              value={sede.id}
                              checked={checked}
                              onChange={(e) => {
                                const id = String(e.target.value);
                                if (e.target.checked) {
                                  setFieldValue("sedes", [...values.sedes, id]);
                                } else {
                                  setFieldValue(
                                    "sedes",
                                    values.sedes.filter((s) => s !== id)
                                  );
                                }
                              }}
                            />
                            {sede.name}
                          </label>
                        );
                      })}
                    </div>
                  )}

                  <ErrorMessage
                    name="sedes"
                    component="div"
                    className="error-message"
                  />
                </div>

                {/* Select de área */}
                <div>
                  <Field as="select" name="area">
                    <option value="">Selecciona un área</option>
                    {areas
                      .slice()
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((area) => (
                        <option key={area.id} value={area.name}>
                          {area.name}
                        </option>
                      ))}
                  </Field>
                  <ErrorMessage
                    name="area"
                    component="div"
                    className="error-message"
                  />
                </div>

                {/* Select de cargo (depende del área) */}
                <div>
                  <Field
                    as="select"
                    name="cargo"
                    disabled={filteredCargos.length === 0}
                  >
                    <option value="">
                      {filteredCargos.length === 0
                        ? "Selecciona un área primero"
                        : "Selecciona un cargo"}
                    </option>
                    {filteredCargos.map((cargo, index) => (
                      <option key={index} value={cargo}>
                        {cargo}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="cargo"
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
            );
          }}
        </Formik>
      </div>
    </>
  );
};

export default RegisterUser;

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Formik, Form, Field, ErrorMessage } from "formik";
// import * as Yup from "yup";
// import api from "../api/api";
// import Swal from "sweetalert2";
// import "./styles/RegisterUser.css";
// import Navbar from "../components/Navbar/Navbar";

// const RegisterUser = () => {
//   const [serverError, setServerError] = useState("");
//   const navigate = useNavigate();

//   const roles = [
//     { id: 1, name: "Administrador" },
//     { id: 2, name: "Consultor" },
//     { id: 3, name: "Supervisor" },
//     { id: 4, name: "Gestor" },
//     { id: 5, name: "Digitador" },
//   ];
//   const sedes = [
//     { id: 1, name: "Bogota-Sur-Occidente-Rehabilitación" },
//     { id: 2, name: "Bogota-Sur-Occidente-Hidroterapia" },
//     { id: 3, name: "Bogota-Norte-Hidroterapia" },
//     { id: 4, name: "Bogota-Centro-Hidroterapia" },
//     { id: 5, name: "Chia-Rehabilitacion" },
//     { id: 6, name: "Florencia-Hidroterapia-Rehabilitacion" },
//     { id: 7, name: "Ibague-Hidroterapia-Rehabilitacion" },
//   ];
//   const documentos = [
//     { id: 1, nombre: "CC" },
//     { id: 2, nombre: "TI" },
//   ];

//   const areas = [
//     { id: 1, name: "Bienestar" },
//     { id: 2, name: "Administrativa" },
//     { id: 3, name: "Financiera" },
//     { id: 4, name: "Automatización Y Desarrollo Tecnológico" },
//     { id: 5, name: "Calidad Y Mejoramiento Continuo" },
//     // { id: 6, name: "Gestión Del Riesgo" },
//     { id: 7, name: "Prestación De Servicio" },
//     { id: 8, name: "Prestación De Servicio - Aseguramiento Misional" },
//     // { id: 9, name: "Administrativa - Financiera" },
//     { id: 10, name: "Gestión Del Riesgo - Operaciones Misionales" },
//     // { id: 11, name: "Gestión Del Riesgo - Admisiones Y Prefacturación" },
//     { id: 12, name: "Gestión Del Riesgo - Atención Al Usuario" },
//     { id: 13, name: "Gestión Del Riesgo - Agendamiento" },
//     // { id: 14, name: "Gestión Del Riesgo" },
//     // { id: 15, name: "Gestión Del Riesgo - Admisiones Y Caja" },
//     { id: 16, name: "Gestión Del Riesgo - Supervisores" },
//     // { id: 17, name: "Administrativa - Talento Humano Y SST" },
//     { id: 18, name: "Administrativa - Servicios Y Compras" },
//     { id: 19, name: "Administrativa - Infraestructura" },
//     { id: 20, name: "Administrativa - Oficios Varios" },
//     { id: 21, name: "Financiera - Contabilidad" },
//     // { id: 22, name: "Financiera - Facturación Y Cartera" },
//     // { id: 23, name: "Prestación De Servicio" },
//     { id: 24, name: "Prestación De Servicio - Analista De Modelo" },
//     { id: 25, name: "Prestación De Servicio - Gestores" },
//     { id: 26, name: "Prestación De Servicio - Enfermeria" },
//     { id: 27, name: "Prestación De Servicio - Terapeutico" },
//     { id: 28, name: "Prestación De Servicio - Apoyo Básico" },
//     { id: 29, name: "Calidad Y Gestion Documental" },
//   ];

//   const cargos = [
//     { areaId: 1, name: "Anfitrión Salvavidas" },
//     { areaId: 1, name: "Profesional En Bienestar" },
//     { areaId: 1, name: "Salvavidas" },
//     { areaId: 1, name: "Instructor De Natacion" },
//     { areaId: 2, name: "Asistente Gestión Talento Humano Y SST" },
//     { areaId: 2, name: "Director De Gestión Administrativa Y Contable" },
//     { areaId: 2, name: "Profesional En Gestión Del Talento Humano Y SST" },
//     { areaId: 2, name: "Profesional Junior En Mercadeo Y Publicidad" },
//     { areaId: 3, name: "Analista De Admisiones Y Prefacturación" },
//     { areaId: 3, name: "Auxiliar Gestión Facturación Y Cartera" },
//     { areaId: 3, name: "Profesional Analista En Facturación Y Cartera" },
//     { areaId: 4, name: "Director De Automatización Y Desarrollo Tecnológico" },
//     {
//       areaId: 4,
//       name: "Profesional Especializado En Automatización Y Análisis De Datos",
//     },
//     {
//       areaId: 4,
//       name: "Profesional Junior En Automatización Y Desarrollo Tecnológico",
//     },
//     { areaId: 4, name: "Auxiliar De Automatización Y Desarrollo Tecnologico" },
//     {
//       areaId: 5,
//       name: "Profesional De Aseguramiento De La Calidad En Salud Y PAMEC",
//     },
//     {
//       areaId: 7,
//       name: "Subgerente Relacionamiento Y Fidelización Del Paciente",
//     },
//     { areaId: 7, name: "Aprendiz Sena En Entrenamiento Deportivo" },
//     { areaId: 7, name: "Aprendiz Sena En Atencion A La Primera Infancia" },
//     {
//       areaId: 8,
//       name: "Gerente De Prestación De Servicios Y Aseguramiento Misional",
//     },
//     { areaId: 10, name: "Subgerente Operaciones Misionales" },
//     { areaId: 12, name: "Auxiliar De Admisiones Y Caja Nivel 1" },
//     { areaId: 12, name: "Auxiliar De Admisiones Y Caja Nivel 2" },
//     { areaId: 12, name: "Auxiliar De Admisiones Y Caja Nivel 3" },
//     { areaId: 13, name: "Auxiliar Operativo Y Soporte Misional" },
//     { areaId: 16, name: "Supervisor Administrativo De Agencia" },
//     {
//       areaId: 18,
//       name: "Profesional En Gestión Logística, Compras E Inventarios",
//     },
//     { areaId: 19, name: "Auxiliar De Mantenimiento Y Oficios Varios" },
//     {
//       areaId: 19,
//       name: "Profesional De Infraestructura Y Ambiente Físico Junior",
//     },
//     { areaId: 20, name: "Auxiliar De Apoyo Oficios Varios" },
//     { areaId: 21, name: "Auxiliar Gestión Contable" },
//     {
//       areaId: 24,
//       name: "Profesional Analista De Modelo De Atención Y Seguridad Del Paciente",
//     },
//     { areaId: 25, name: "Gestor Administrativo De Agencia" },
//     { areaId: 26, name: "Auxiliar De Enfermería De Agencia Nivel 2" },
//     { areaId: 26, name: "Auxiliar De Enfermería De Agencia Nivel 1" },
//     { areaId: 27, name: "Educador Especial" },
//     { areaId: 27, name: "Fisioterapeuta" },
//     { areaId: 27, name: "Fonoaudiologa" },
//     { areaId: 27, name: "Terapia Ocupacional" },
//     { areaId: 27, name: "Psicologo" },
//     { areaId: 27, name: "Especialista En Pediatria" },
//     { areaId: 27, name: "Fisiatria" },
//     { areaId: 28, name: "Auxiliar De Apoyo Básico" },
//     {
//       areaId: 29,
//       name: "Profesional Junior En Gestión Documental Y Mapa De Procesos",
//     },
//   ];

//   // Crear un objeto para mapear cargos por nombre de área para facilidad de acceso
//   const cargosPorArea = areas.reduce((acc, area) => {
//     acc[area.name] = cargos
//       .filter((cargo) => cargo.areaId === area.id)
//       .map((cargo) => cargo.name);
//     return acc;
//   }, {});

//   const registerSchema = Yup.object().shape({
//     name: Yup.string()
//       .transform((value) => value.trim())
//       .min(7, "El nombre no puede tener menos de 7 caracteres")
//       .max(100, "El nombre no puede tener más de 100 caracteres")
//       .required("El nombre es obligatorio")
//       .test(
//         "no-solo-espacios",
//         "El nombre no puede contener solo espacios en blanco",
//         (value) => value && value.trim().length > 0
//       ),

//     userName: Yup.string()
//       .transform((value) => value.trim())
//       .min(7, "El nombre no puede tener menos de 7 caracteres")
//       .max(50, "El userName no puede tener más de 50 caracteres")
//       .required("El nombre de usuario es obligatorio")
//       .test(
//         "no-solo-espacios",
//         "El nombre de usuario no puede contener solo espacios",
//         (value) => value && value.trim().length > 0
//       ),
//     email: Yup.string()
//       .transform((value) => value.trim())
//       .email("Debes ingresar un correo válido")
//       .required("El correo es obligatorio"),
//     documento_numero: Yup.string()
//       .transform((value) => value.trim())
//       .required("El número de documento es obligatorio")
//       .min(6, "El número de documento debe tener al menos 6 dígitos")
//       .max(30, "El número de documento no puede tener más de 30 dígitos")
//       .test(
//         "no-solo-espacios",
//         "El número de documento no puede contener solo espacios",
//         (value) => value && value.trim().length > 0
//       ),
//     password: Yup.string()
//       .transform((value) => value.trim())
//       .min(5, "La contraseña debe tener al menos 5 caracteres")
//       .max(20, "La contraseña no puede tener más de 20 caracteres")
//       .required("La contraseña es obligatoria"),

//     password_confirmation: Yup.string()
//       .oneOf([Yup.ref("password"), null], "Las contraseñas no coinciden")
//       .required("Confirma la contraseña"),
//     role: Yup.string().required("Selecciona un rol"),
//     sede: Yup.string().required("La sede es obligatoria"),
//     area: Yup.string().required("El área es obligatoria"),
//     cargo: Yup.string().required("El cargo es obligatorio"),
//   });

//   const handleSubmit = async (values, { setSubmitting, setErrors }) => {
//     try {
//       await api.post("/register-user", {
//         name: values.name,
//         userName: values.userName,
//         email: values.email,
//         documento_tipo: values.documento_tipo,
//         documento_numero: values.documento_numero,
//         password: values.password,
//         password_confirmation: values.password_confirmation,
//         role: values.role,
//         sede: values.sede,
//         area: values.area,
//         cargo: values.cargo,
//       });

//       Swal.fire({
//         icon: "success",
//         title: "Usuario registrado",
//         text: "El usuario fue creado correctamente",
//         confirmButtonColor: "#3085d6",
//       }).then(() => {
//         navigate("/users");
//       });
//     } catch (err) {
//       setSubmitting(false);

//       if (err.response?.status === 422 && err.response?.data?.errors) {
//         const apiErrors = err.response.data.errors;
//         const formikErrors = {};

//         Object.entries(apiErrors).forEach(([field, messages]) => {
//           formikErrors[field] = messages.join(", ");
//         });

//         setErrors(formikErrors);
//       } else if (err.response?.data?.message) {
//         setServerError(err.response.data.message);
//       } else {
//         setServerError("Error desconocido, por favor intente nuevamente.");
//       }
//     }
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="header-register-user">
//         <div>
//           Registrar <br />
//           <span> Usuario</span>
//         </div>
//       </div>

//       <div className="register-user">
//         <img src="/logo-2.png" alt="logo" className="logo-img" />

//         <Formik
//           initialValues={{
//             name: "",
//             userName: "",
//             email: "",
//             documento_tipo: "",
//             documento_numero: "",
//             password: "",
//             password_confirmation: "",
//             role: "",
//             sede: "",
//             area: "",
//             cargo: "",
//           }}
//           validationSchema={registerSchema}
//           onSubmit={handleSubmit}
//         >
//           {({ isSubmitting, errors, values, setFieldValue }) => {
//             useEffect(() => {
//               if (values.area && cargosPorArea[values.area]) {
//                 setFieldValue("cargo", "");
//               } else {
//                 setFieldValue("cargo", "");
//               }
//             }, [values.area, setFieldValue]);

//             const filteredCargos = values.area
//               ? cargosPorArea[values.area] || []
//               : [];

//             return (
//               <Form className="register-user-form form-grid">
//                 <div>
//                   <Field type="text" name="name" placeholder="Nombre completo" />
//                   <ErrorMessage
//                     name="name"
//                     component="div"
//                     className="error-message"
//                   />
//                 </div>

//                 <div>
//                   <Field type="text" name="userName" placeholder="Usuario" />
//                   <ErrorMessage
//                     name="userName"
//                     component="div"
//                     className="error-message"
//                   />
//                 </div>

//                 <div>
//                   <Field
//                     type="email"
//                     name="email"
//                     placeholder="Correo electrónico"
//                   />
//                   <ErrorMessage
//                     name="email"
//                     component="div"
//                     className="error-message"
//                   />
//                 </div>

//                 <div>
//                   <Field as="select" name="documento_tipo">
//                     <option value="">Selecciona un tipo de documento</option>
//                     {documentos.map((documento) => (
//                       <option key={documento.id} value={documento.nombre}>
//                         {documento.nombre}
//                       </option>
//                     ))}
//                   </Field>
//                   <ErrorMessage
//                     name="documento_tipo"
//                     component="div"
//                     className="error-message"
//                   />
//                 </div>

//                 <div>
//                   <Field
//                     type="text"
//                     name="documento_numero"
//                     placeholder="Número de documento"
//                   />
//                   <ErrorMessage
//                     name="documento_numero"
//                     component="div"
//                     className="error-message"
//                   />
//                 </div>

//                 <div>
//                   <Field
//                     type="password"
//                     name="password"
//                     placeholder="Contraseña"
//                   />
//                   <ErrorMessage
//                     name="password"
//                     component="div"
//                     className="error-message"
//                   />
//                 </div>

//                 <div>
//                   <Field
//                     type="password"
//                     name="password_confirmation"
//                     placeholder="Confirmar contraseña"
//                   />
//                   <ErrorMessage
//                     name="password_confirmation"
//                     component="div"
//                     className="error-message"
//                   />
//                 </div>

//                 <div>
//                   <Field as="select" name="role">
//                     <option value="">Selecciona un rol</option>
//                     {roles.map((role) => (
//                       <option key={role.id} value={role.name}>
//                         {role.name}
//                       </option>
//                     ))}
//                   </Field>
//                   <ErrorMessage
//                     name="role"
//                     component="div"
//                     className="error-message"
//                   />
//                 </div>

//                 <div>
//                   <Field as="select" name="sede">
//                     <option value="">Selecciona una sede</option>
//                     {sedes.map((sede) => (
//                       <option key={sede.id} value={sede.name}>
//                         {sede.name}
//                       </option>
//                     ))}
//                   </Field>
//                   <ErrorMessage
//                     name="sede"
//                     component="div"
//                     className="error-message"
//                   />
//                 </div>

//                 <div>
//                   <Field as="select" name="area">
//                     <option value="">Selecciona un área</option>
//                     {areas
//                       .slice()
//                       .sort((a, b) => a.name.localeCompare(b.name))
//                       .map((area) => (
//                         <option key={area.id} value={area.name}>
//                           {area.name}
//                         </option>
//                       ))}
//                   </Field>
//                   <ErrorMessage
//                     name="area"
//                     component="div"
//                     className="error-message"
//                   />
//                 </div>

//                 <div>
//                   <Field
//                     as="select"
//                     name="cargo"
//                     disabled={filteredCargos.length === 0}
//                   >
//                     <option value="">
//                       {filteredCargos.length === 0
//                         ? "Selecciona un área primero"
//                         : "Selecciona un cargo"}
//                     </option>
//                     {filteredCargos.map((cargo, index) => (
//                       <option key={index} value={cargo}>
//                         {cargo}
//                       </option>
//                     ))}
//                   </Field>
//                   <ErrorMessage
//                     name="cargo"
//                     component="div"
//                     className="error-message"
//                   />
//                 </div>

//                 {errors.general && (
//                   <div className="error-message">{errors.general}</div>
//                 )}

//                 {serverError && (
//                   <div className="error-message">{serverError}</div>
//                 )}

//                 <button type="submit" disabled={isSubmitting}>
//                   Registrar
//                 </button>
//               </Form>
//             );
//           }}
//         </Formik>
//       </div>
//     </>
//   );
// };

// export default RegisterUser;
