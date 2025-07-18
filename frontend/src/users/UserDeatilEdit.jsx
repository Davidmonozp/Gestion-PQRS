import React, { useEffect, useState, useMemo } from "react"; // Ensure useMemo is imported
import { useParams, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import api from "../api/api";
import "./styles/UserDetailEdit.css";
import Navbar from "../components/Navbar/Navbar";

const UserDetailEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // --- Constants for roles, areas, cargos, sedes ---
  // These can be defined at the top of the component as they don't depend on formik.
  const availableRoles = [
    { id: 1, name: "Administrador" },
    { id: 2, name: "Consultor" },
    { id: 3, name: "Supervisor" },
    { id: 4, name: "Gestor" },
    { id: 5, name: "Digitador" },
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
    { id: 26, name: "Auxiliar De Enfermería De Agencia Nivel 2" },
    { id: 26, name: "Auxiliar De Enfermería De Agencia Nivel 1" },
    { id: 27, name: "Educador Especial" },
    { id: 27, name: "Fisioterapeuta" },
    { id: 27, name: "Fonoaudiologa" },
    { id: 27, name: "Terapia Ocupacional" },
    { id: 27, name: "Psicologo" },
    { id: 27, name: "Especialista En Pediatria" },
    { id: 27, name: "Fisiatria" },
    { id: 28, name: "Auxiliar De Apoyo Básico" },
    {
      id: 29,
      name: "Profesional Junior En Gestión Documental Y Mapa De Procesos",
    },
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
  const sedes = [
    { id: 1, name: "Bogota-Sur-Occidente-Rehabilitación" },
    { id: 2, name: "Bogota-Sur-Occidente-Hidroterapia" },
    { id: 3, name: "Bogota-Norte-Hidroterapia" },
    { id: 4, name: "Bogota-Centro-Hidroterapia" },
    { id: 5, name: "Chia-Rehabilitacion" },
    { id: 6, name: "Florencia-Hidroterapia-Rehabilitacion" },
    { id: 7, name: "Ibague-Hidroterapia-Rehabilitacion" },
  ];

  // --- Formik Definition (MUST come before useMemo hooks that depend on it) ---
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      role: "",
      password: "",
      confirmPassword: "",
      cargo: "",
      area: "",
      sede: "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required("El nombre es obligatorio"),
      email: Yup.string()
        .email("Correo inválido")
        .required("El correo es obligatorio"),
      role: Yup.string().required("El rol es obligatorio"),
      password: Yup.string()
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .nullable(),
      confirmPassword: Yup.string().when("password", {
        is: (val) => !!val,
        then: (schema) =>
          schema
            .required("Confirma la contraseña")
            .oneOf([Yup.ref("password")], "Las contraseñas no coinciden"),
      }),
      cargo: Yup.string().required("El cargo es obligatorio"),
      area: Yup.string().required("El área es obligatoria"),
      sede: Yup.string().required("La sede es obligatoria"),
    }),
    onSubmit: async (values) => {
      try {
        const payload = {
          name: values.name,
          email: values.email,
          role: values.role,
          cargo: values.cargo,
          area: values.area,
          sede: values.sede,
        };

        if (showPasswordFields && values.password) {
          payload.password = values.password;
        }

        const res = await api.put(`/users/${id}`, payload);
        const updatedUserFromServer = res.data.user;

        setUser(updatedUserFromServer);
        setEditMode(false);
        setShowPasswordFields(false);

        formik.resetForm({
          values: {
            name: updatedUserFromServer.name,
            email: updatedUserFromServer.email,
            role: updatedUserFromServer.roles[0]?.name || "",
            password: "",
            confirmPassword: "",
            cargo: updatedUserFromServer.cargo || "",
            area: updatedUserFromServer.area || "",
            sede: updatedUserFromServer.sede || "",
          },
        });

        Swal.fire({
          icon: "success",
          title: "¡Guardado!",
          text: "El usuario se actualizó correctamente",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error(
          "Error al actualizar:",
          error.response?.data || error.message
        );
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `No se pudo actualizar el usuario: ${
            error.response?.data?.message || error.message
          }`,
        });
      }
    },
  });

  // --- useMemo Hooks (MUST come AFTER formik definition) ---
  const selectedAreaObject = useMemo(() => {
    // This now safely accesses formik.values.area because formik is defined.
    return areas.find((area) => area.name === formik.values.area);
  }, [formik.values.area, areas]); // Dependencies are correct

  const filteredCargos = useMemo(() => {
    if (selectedAreaObject) {
      return cargos.filter((cargo) => cargo.areaId === selectedAreaObject.id);
    }
    return [];
  }, [selectedAreaObject, cargos]); // Dependencies are correct
  // --- End of useMemo hooks ---

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/users/${id}`);
        const data = res.data;
        setUser(data);
        formik.setValues({
          name: data.name,
          email: data.email,
          role: data.roles[0]?.name || "",
          password: "",
          confirmPassword: "",
          cargo: data.cargo || "",
          area: data.area || "",
          sede: data.sede || "",
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cargar el usuario",
        });
        navigate("/users");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate, formik.setValues]); // formik.setValues is a stable function provided by Formik, so it's safe here.

  if (loading) return <p>Cargando...</p>;
  if (!user) return <p>Usuario no encontrado</p>;

  return (
    <>
      <Navbar />
      <div className="header-details-user">
        <div>
          {editMode ? "Editar" : "Detalles"} <br />
          <span>Usuario</span>
        </div>
      </div>

      <div className="details-user">
        <form onSubmit={formik.handleSubmit}>
          {/* Campo Nombre */}
          <div>
            <label htmlFor="name">Nombre:</label>
            {editMode ? (
              <input
                type="text"
                id="name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            ) : (
              <p>{user.name}</p>
            )}
            {formik.touched.name && formik.errors.name && (
              <div className="text-danger">{formik.errors.name}</div>
            )}
          </div>

          {/* Campo Correo */}
          <div>
            <label htmlFor="email">Correo:</label>
            {editMode ? (
              <input
                type="email"
                id="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            ) : (
              <p>{user.email}</p>
            )}
            {formik.touched.email && formik.errors.email && (
              <div className="text-danger">{formik.errors.email}</div>
            )}
          </div>

          {/* Campo Rol */}
          <div>
            <label htmlFor="role">Rol:</label>
            <br />
            {editMode ? (
              <select
                id="role"
                name="role"
                className="select-role"
                value={formik.values.role}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="" disabled>
                  Selecciona un rol
                </option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
            ) : (
              <p>{user.roles.map((r) => r.name).join(", ")}</p>
            )}
            {formik.touched.role && formik.errors.role && (
              <div className="text-danger">{formik.errors.role}</div>
            )}
          </div>

          {/* Campo Área */}
          <div>
            <label htmlFor="area">Área:</label>
            {editMode ? (
              <select
                id="area"
                name="area"
                value={formik.values.area}
                onChange={(e) => {
                  formik.handleChange(e);
                  formik.setFieldValue("cargo", ""); // Reset cargo when area changes
                }}
                onBlur={formik.handleBlur}
                className="select-role"
              >
                <option value="" disabled>
                  Selecciona un área
                </option>
                {areas.map((area) => (
                  <option key={area.id} value={area.name}>
                    {area.name}
                  </option>
                ))}
              </select>
            ) : (
              <p>{user.area}</p>
            )}
            {formik.touched.area && formik.errors.area && (
              <div className="text-danger">{formik.errors.area}</div>
            )}
          </div>

          {/* Campo Cargo */}
          <div>
            <label htmlFor="cargo">Cargo:</label>
            {editMode ? (
              <select
                id="cargo"
                name="cargo"
                value={formik.values.cargo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="select-role"
                disabled={!formik.values.area}
              >
                <option value="" disabled>
                  {formik.values.area
                    ? "Selecciona un cargo"
                    : "Selecciona un área primero"}
                </option>
                {filteredCargos.map((cargo) => (
                  <option key={cargo.name} value={cargo.name}>
                    {cargo.name}
                  </option>
                ))}
              </select>
            ) : (
              <p>{user.cargo}</p>
            )}
            {formik.touched.cargo && formik.errors.cargo && (
              <div className="text-danger">{formik.errors.cargo}</div>
            )}
          </div>

          {/* Campo Sede */}
          <div>
            <label htmlFor="sede">Sede:</label>
            {editMode ? (
              <select
                id="sede"
                name="sede"
                value={formik.values.sede}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="select-role"
              >
                <option value="" disabled>
                  Selecciona una sede
                </option>
                {sedes.map((sede) => (
                  <option key={sede.id} value={sede.name}>
                    {sede.name}
                  </option>
                ))}
              </select>
            ) : (
              <p>{user.sede}</p>
            )}
            {formik.touched.sede && formik.errors.sede && (
              <div className="text-danger">{formik.errors.sede}</div>
            )}
          </div>

          {/* ... (rest of your component remains the same) ... */}

          {/* Botón para cambiar contraseña (visible en modo edición, si los campos no están visible) */}
          {editMode && !showPasswordFields && (
            <div>
              <button
                type="button"
                className="btn btn-sm btn-outline-warning mt-2"
                onClick={() => setShowPasswordFields(true)}
              >
                Cambiar contraseña
              </button>
            </div>
          )}

          {/* Campos de Nueva Contraseña y Confirmar Contraseña (visible en modo edición, si showPasswordFields es true) */}
          {editMode && showPasswordFields && (
            <>
              <div>
                <label htmlFor="password">Nueva contraseña:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.password && formik.errors.password && (
                  <div className="text-danger">{formik.errors.password}</div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword">Confirmar contraseña:</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword && (
                    <div className="text-danger">
                      {formik.errors.confirmPassword}
                    </div>
                  )}
              </div>
            </>
          )}

          {/* Botones de acción: Guardar y Cancelar (visible solo en modo edición) */}
          {editMode && (
            <div className="button-group mt-3">
              <button type="submit" className="btn btn-primary me-2">
                Guardar
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  formik.setValues({
                    name: user.name,
                    email: user.email,
                    role: user.roles[0]?.name || "",
                    password: "",
                    confirmPassword: "",
                    cargo: user.cargo || "",
                    area: user.area || "",
                    sede: user.sede || "",
                  });
                  setEditMode(false);
                  setShowPasswordFields(false);
                }}
              >
                Cancelar
              </button>
            </div>
          )}
        </form>

        {/* Botones de Editar y Volver a la lista (visible solo en modo de visualización) */}
        {!editMode && (
          <div className="mt-3">
            <button
              type="button"
              className="btn btn-warning me-2"
              onClick={() => setEditMode(true)}
            >
              Editar
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate("/users")}
            >
              Volver a la lista
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default UserDetailEdit;

// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import Swal from "sweetalert2";
// import api from "../api/api";
// import './styles/UserDetailEdit.css'

// const UserDetailEdit = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [editMode, setEditMode] = useState(false);

//   const availableRoles = [
//     { id: 1, name: "Administrador" },
//     { id: 2, name: "Consultor" },
//     { id: 3, name: "Supervisor" },
//     { id: 4, name: "Gestor" },
//     { id: 5, name: "Digitador" },
//   ];

//   const formik = useFormik({
//     initialValues: {
//       name: "",
//       email: "",
//       role: "",
//     },
//     validationSchema: Yup.object({
//       name: Yup.string().required("El nombre es obligatorio"),
//       email: Yup.string().email("Correo inválido").required("El correo es obligatorio"),
//       role: Yup.string().required("El rol es obligatorio"),
//     }),
//     onSubmit: async (values) => {
//       try {
//         await api.put(`/users/${id}`, values);

//         setUser((prev) => ({
//           ...prev,
//           name: values.name,
//           email: values.email,
//           roles: [{ name: values.role }],
//         }));

//         setEditMode(false);
//         Swal.fire({
//           icon: "success",
//           title: "¡Guardado!",
//           text: "El usuario se actualizó correctamente",
//           timer: 1500,
//           showConfirmButton: false,
//         });
//       } catch (error) {
//         console.error(error);
//         Swal.fire({
//           icon: "error",
//           title: "Error",
//           text: "No se pudo actualizar el usuario",
//         });
//       }
//     },
//   });

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await api.get(`/users/${id}`);
//         const data = res.data;
//         setUser(data);
//         formik.setValues({
//           name: data.name,
//           email: data.email,
//           role: data.roles[0]?.name || "", // Asumiendo un solo rol
//         });
//       } catch (error) {
//         Swal.fire({
//           icon: "error",
//           title: "Error",
//           text: "No se pudo cargar el usuario",
//         });
//         navigate("/users");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUser();
//   }, [id]);

//   if (loading) return <p>Cargando...</p>;
//   if (!user) return <p>Usuario no encontrado</p>;

//   return (
//     <>
//       <div className="header-details-user">
//         <div>
//           {editMode ? "Editar" : "Detalles"} <br />
//           <span>Usuario</span>
//         </div>
//       </div>

//       <div className="details-user">
//         <form onSubmit={formik.handleSubmit}>
//           <div>
//             <label htmlFor="name">Nombre:</label>
//             {editMode ? (
//               <input
//                 type="text"
//                 id="name"
//                 name="name"
//                 value={formik.values.name}
//                 onChange={formik.handleChange}
//               />
//             ) : (
//               <p>{user.name}</p>
//             )}
//             {formik.touched.name && formik.errors.name && (
//               <div className="text-danger">{formik.errors.name}</div>
//             )}
//           </div>

//           <div>
//             <label htmlFor="email">Correo:</label>
//             {editMode ? (
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={formik.values.email}
//                 onChange={formik.handleChange}
//               />
//             ) : (
//               <p>{user.email}</p>
//             )}
//             {formik.touched.email && formik.errors.email && (
//               <div className="text-danger">{formik.errors.email}</div>
//             )}
//           </div>

//           <div>
//             <label htmlFor="role">Rol:</label><br />
//             {editMode ? (
//               <select
//                 id="role"
//                 name="role"
//                 className="select-role"
//                 value={formik.values.role}
//                 onChange={formik.handleChange}
//               >
//                 <option value="" disabled>
//                   Selecciona un rol
//                 </option>
//                 {availableRoles.map((role) => (
//                   <option key={role.id} value={role.name}>
//                     {role.name}
//                   </option>
//                 ))}
//               </select>
//             ) : (
//               <p>{user.roles.map((r) => r.name).join(", ")}</p>
//             )}
//             {formik.touched.role && formik.errors.role && (
//               <div className="text-danger">{formik.errors.role}</div>
//             )}
//           </div>

//           {editMode && (
//             <div className="button-group mt-3">
//               <button type="submit" className="btn btn-primary me-2">
//                 Guardar
//               </button>
//               <button
//                 type="button"
//                 className="btn btn-secondary"
//                 onClick={() => {
//                   formik.setValues({
//                     name: user.name,
//                     email: user.email,
//                     role: user.roles[0]?.name || "",
//                   });
//                   setEditMode(false);
//                 }}
//               >
//                 Cancelar
//               </button>
//             </div>
//           )}
//         </form>

//         {!editMode && (
//           <div className="mt-3">
//             <button
//               type="button"
//               className="btn btn-warning me-2"
//               onClick={() => setEditMode(true)}
//             >
//               Editar
//             </button>
//             <button
//               type="button"
//               className="btn btn-outline-secondary"
//               onClick={() => navigate("/users")}
//             >
//               Volver a la lista
//             </button>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default UserDetailEdit;
