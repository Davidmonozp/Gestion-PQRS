

import React, { useEffect, useState } from "react";
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
  // Nuevo estado para controlar la visibilidad de los campos de contraseña
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const availableRoles = [
    { id: 1, name: "Administrador" },
    { id: 2, name: "Consultor" },
    { id: 3, name: "Supervisor" },
    { id: 4, name: "Gestor" },
    { id: 5, name: "Digitador" },
  ];

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      role: "",
      password: "", // Añadir campos de contraseña
      confirmPassword: "", // Añadir campos de contraseña
    },
    // enableReinitialize: true es útil aquí para que el formulario se actualice
    // cuando el usuario se carga inicialmente.
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required("El nombre es obligatorio"),
      email: Yup.string()
        .email("Correo inválido")
        .required("El correo es obligatorio"),
      role: Yup.string().required("El rol es obligatorio"),
      // Validación condicional para contraseña
      password: Yup.string()
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .nullable(), // Permite que sea nulo si no se va a cambiar
      confirmPassword: Yup.string().when("password", {
        is: (val) => !!val, // Si hay un valor en 'password'...
        then: (schema) =>
          schema
            .required("Confirma la contraseña") // ...entonces 'confirmPassword' es requerido
            .oneOf([Yup.ref("password")], "Las contraseñas no coinciden"), // y debe coincidir con 'password'
      }),
    }),
    onSubmit: async (values) => {
      try {
        // Encuentra el objeto de rol completo basándose en el nombre seleccionado
        const selectedRoleObject = availableRoles.find(
          (r) => r.name === values.role
        );

        // Prepara el payload con el ID del rol
        const payload = {
          name: values.name,
          email: values.email,
          // *** CAMBIO CRÍTICO AQUÍ ***
          // Envía el ID del rol, no un objeto con el nombre
          role: values.role, 
          // Asegúrate de que tu backend espera 'role_id'. Si espera solo 'role',
          // entonces sería: role: values.role
        };

        if (showPasswordFields && values.password) {
          payload.password = values.password;
        }

        const res = await api.put(`/users/${id}`, payload);
        const updatedUserFromServer = res.data.user;

        // Actualizar el estado 'user' con los datos devueltos por la API (que sí incluye el objeto de rol completo)
        setUser(updatedUserFromServer);

        setEditMode(false);
        setShowPasswordFields(false);

        // Reiniciar los valores del formulario con los datos actualizados y limpiar contraseñas
        formik.resetForm({
          values: {
            name: updatedUserFromServer.name,
            email: updatedUserFromServer.email,
            // Al resetear el formulario, volvemos a obtener el nombre del rol del objeto completo
            role: updatedUserFromServer.roles[0]?.name || "",
            password: "",
            confirmPassword: "",
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
        console.error("Error al actualizar:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo actualizar el usuario",
        });
      }
    },
  });

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
          role: data.roles[0]?.name || "", // Asumiendo un solo rol
          password: "", // Asegurarse de que estos campos estén vacíos al cargar
          confirmPassword: "", // Asegurarse de que estos campos estén vacíos al cargar
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

    // Llamamos a fetchUser al montar y cuando el ID cambia
    // Incluir formik.setValues en las dependencias para evitar advertencias de React Hook
    // aunque en este caso específico, el ID es la dependencia principal para la recarga de datos.
    fetchUser();
  }, [id, navigate, formik.setValues]);

  if (loading) return <p>Cargando...</p>;
  if (!user) return <p>Usuario no encontrado</p>;

  return (
    <>
    <Navbar/>
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

          {/* Botón para cambiar contraseña (visible en modo edición, si los campos no están visibles) */}
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
                  // Al cancelar, restablece los valores del formulario a los datos originales
                  formik.setValues({
                    name: user.name,
                    email: user.email,
                    role: user.roles[0]?.name || "",
                    password: "", // Asegurarse de limpiar las contraseñas al cancelar
                    confirmPassword: "", // Asegurarse de limpiar las contraseñas al cancelar
                  });
                  setEditMode(false); // Sale del modo de edición
                  setShowPasswordFields(false); // Oculta los campos de contraseña
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