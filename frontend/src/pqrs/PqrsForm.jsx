import React, { useState, useEffect } from "react"; // Importa useEffect
import { createPqr } from "./pqrsService";
import "./styles/Pqrs.css";
import Swal from "sweetalert2";
import { pqrsSchema } from "./pqrValidation";

const epsOptions = [
  "Compensar",
  "Fomag",
  "Famisanar",
  "Nueva Eps",
  "Sanitas",
  "Sura",
  "Aliansalud",
  "Asmet Salud",
  "Seguros Bolivar",
  "Cafam",
  "Colmédica",
];
const serviciosPrestados = [
  "Hidroterapia",
  "Programa-Rehabilitacion",
  "Neuropediatria",
  "Psiquiatria",
  "Fisiatria",
  "Acuamotricidad",
  "Natacion-infantil",
  "Natacion-jovenes-adultos",
  "Yoga",
  "Yoga-acuatico",
  "Mindfulness",
  "Pilates",
  "Pilates-acuatico",
];

// Recibe las nuevas props: defaultTipoSolicitud y readOnlyTipoSolicitud
function PqrsForm({ defaultTipoSolicitud, readOnlyTipoSolicitud }) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    documento_tipo: "",
    documento_numero: "",
    correo: "",
    telefono: "",
    sede: "",
    servicio_prestado: "",
    eps: "",
    // Inicializa tipo_solicitud con la prop defaultTipoSolicitud si se proporciona,
    // de lo contrario, con una cadena vacía.
    tipo_solicitud: defaultTipoSolicitud || "",
    descripcion: "",
    registra_otro: "no", // Valor inicial para el radio button
    registrador_nombre: "",
    registrador_apellido: "",
    registrador_documento_tipo: "",
    registrador_documento_numero: "",
    registrador_correo: "",
    registrador_telefono: "",
  });

  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // Estado para almacenar los errores de validación

  // Usar useEffect para actualizar el tipo_solicitud si defaultTipoSolicitud cambia
  // Esto es útil si el componente PqrsForm se reutiliza y la prop cambia.
  useEffect(() => {
    if (defaultTipoSolicitud !== undefined && form.tipo_solicitud !== defaultTipoSolicitud) {
      setForm(prev => ({
        ...prev,
        tipo_solicitud: defaultTipoSolicitud
      }));
      // Opcional: Validar este campo al inicializarlo si es importante
      // try {
      //   pqrsSchema.validateAt('tipo_solicitud', { tipo_solicitud: defaultTipoSolicitud });
      //   setErrors(prev => ({ ...prev, tipo_solicitud: undefined }));
      // } catch (error) {
      //   setErrors(prev => ({ ...prev, tipo_solicitud: error.message }));
      // }
    }
  }, [defaultTipoSolicitud]); // Dependencia de defaultTipoSolicitud


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Si el campo es 'tipo_solicitud' y 'readOnlyTipoSolicitud' es true, no permitimos cambios
    if (name === "tipo_solicitud" && readOnlyTipoSolicitud) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Aquí NO limpiamos el error inmediatamente, sino que esperamos al blur
  };

  // Nueva función para manejar el evento onBlur
  const handleBlur = async (e) => {
    const { name, value } = e.target;

    // Si el campo es 'tipo_solicitud' y 'readOnlyTipoSolicitud' es true, no validamos al perder el foco
    if (name === "tipo_solicitud" && readOnlyTipoSolicitud) {
        return;
    }

    try {
      // Validar solo el campo que ha perdido el foco
      await pqrsSchema.validateAt(name, form); // Usamos validateAt para validar un campo específico
      setErrors((prev) => ({ ...prev, [name]: undefined })); // Limpia el error si la validación es exitosa
    } catch (error) {
      setErrors((prev) => ({ ...prev, [name]: error.message })); // Establece el error
    }
  };

  const handleFileChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({}); // Limpiar todos los errores al intentar enviar el formulario completo

    try {
      // Validar el formulario completo con Yup antes de enviar
      await pqrsSchema.validate(form, { abortEarly: false });

      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        // Asegúrate de no enviar campos de registrador si 'registra_otro' es 'no'
        if (key.startsWith("registrador_") && form.registra_otro === "no") {
          return;
        }
        formData.append(key, value);
      });

      if (archivo) {
        formData.append("archivo", archivo);
      }

      await createPqr(formData);

      Swal.fire({
        icon: "success",
        title: "¡PQR enviada!",
        text: "Tu PQRS ha sido enviada con éxito.",
        confirmButtonColor: "#3085d6",
      });

      // Limpiar el formulario después del envío exitoso
      setForm({
        nombre: "",
        apellido: "",
        documento_tipo: "",
        documento_numero: "",
        correo: "",
        telefono: "",
        sede: "",
        servicio_prestado: "",
        eps: "",
        // Al limpiar, vuelve a usar defaultTipoSolicitud si existe, de lo contrario, vacío.
        tipo_solicitud: defaultTipoSolicitud || "",
        descripcion: "",
        registra_otro: "no",
        registrador_nombre: "",
        registrador_apellido: "",
        registrador_documento_tipo: "",
        registrador_documento_numero: "",
        registrador_correo: "",
        registrador_telefono: "",
      });
      setArchivo(null);
    } catch (err) {
      if (err.inner) {
        // Errores de validación de Yup al enviar
        const formErrors = {};
        err.inner.forEach(({ path, message }) => {
          if (!formErrors[path]) {
            formErrors[path] = message;
          }
        });
        setErrors(formErrors);

        Swal.fire({
          icon: "error",
          title: "Error de validación",
          text: "Por favor, revisa los campos marcados en el formulario.",
          confirmButtonColor: "#d33",
        });
      } else {
        // Otros errores (ej. de la API)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Ocurrió un error al enviar la PQR.",
          confirmButtonColor: "#d33",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pqrs-container">
      <div className="header-pqrs">
        <div>
          Envía tu <span>PQR-S</span>
        </div>
      </div>
      <br />

      <label>
        ¿Está registrando esta solicitud en nombre de otra persona o empresa?
      </label>
      <div className="radio-group">
        <label>
          <input
            type="radio"
            name="registra_otro"
            value="no"
            checked={form.registra_otro === "no"}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          No
        </label>
        <label>
          <input
            type="radio"
            name="registra_otro"
            value="si"
            checked={form.registra_otro === "si"}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          Sí
        </label>
      </div>

      <form className="pqrs" onSubmit={handleSubmit} noValidate>
        {form.registra_otro === "si" && (
          <>
            <h1 className="titulo-form">
              Datos de quien registra la solicitud:
            </h1>
            <div className="pqrs-otro">
              <div>
                <input
                  name="registrador_nombre"
                  placeholder="Nombre"
                  value={form.registrador_nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.registrador_nombre && (
                  <p className="error">{errors.registrador_nombre}</p>
                )}
              </div>
              <div>
                <input
                  name="registrador_apellido"
                  placeholder="Apellido"
                  value={form.registrador_apellido}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.registrador_apellido && (
                  <p className="error">{errors.registrador_apellido}</p>
                )}
              </div>
              <div>
                <select
                  name="registrador_documento_tipo"
                  value={form.registrador_documento_tipo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="" hidden>
                    Tipo de documento
                  </option>
                  <option value="CC">Cédula de ciudadanía</option>
                  <option value="CE">Cédula de extranjería</option>
                  <option value="TI">Tarjeta de identidad</option>
                </select>
                {errors.registrador_documento_tipo && (
                  <p className="error">{errors.registrador_documento_tipo}</p>
                )}
              </div>
              <div>
                <input
                  name="registrador_documento_numero"
                  placeholder="Número de documento"
                  value={form.registrador_documento_numero}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.registrador_documento_numero && (
                  <p className="error">{errors.registrador_documento_numero}</p>
                )}
              </div>
              <div>
                <input
                  name="registrador_correo"
                  type="email"
                  placeholder="Correo"
                  value={form.registrador_correo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.registrador_correo && (
                  <p className="error">{errors.registrador_correo}</p>
                )}
              </div>
              <div>
                <input
                  name="registrador_telefono"
                  placeholder="Teléfono"
                  value={form.registrador_telefono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.registrador_telefono && (
                  <p className="error">{errors.registrador_telefono}</p>
                )}
              </div>
            </div>
          </>
        )}

        <h1 className="titulo-form">Datos del paciente</h1>
        <div className="pqrs-paciente">
          <div>
            <input
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.nombre && <p className="error">{errors.nombre}</p>}
          </div>
          <div>
            <input
              name="apellido"
              placeholder="Apellido"
              value={form.apellido}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.apellido && <p className="error">{errors.apellido}</p>}
          </div>
          <div>
            <select
              name="documento_tipo"
              value={form.documento_tipo}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <option value="" hidden>
                Tipo de documento
              </option>
              <option value="CC">Cédula de ciudadanía</option>
              <option value="CE">Cédula de extranjería</option>
              <option value="TI">Tarjeta de identidad</option>
            </select>
            {errors.documento_tipo && (
              <p className="error">{errors.documento_tipo}</p>
            )}
          </div>
          <div>
            <input
              name="documento_numero"
              placeholder="Número de documento"
              value={form.documento_numero}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.documento_numero && (
              <p className="error">{errors.documento_numero}</p>
            )}
          </div>
          <div>
            <input
              name="correo"
              type="email"
              placeholder="Correo"
              value={form.correo}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.correo && <p className="error">{errors.correo}</p>}
          </div>
          <div>
            <input
              name="telefono"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.telefono && <p className="error">{errors.telefono}</p>}
          </div>
          <div>
            <select
              name="sede"
              value={form.sede}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <option value="" hidden>
                Sede de atención
              </option>
              <option value="Bogota-Sur-Occidente-Rehabilitación">
                Bogotá-Sur-Occidente-Rehabilitación
              </option>
              <option value="Bogota-Sur-Occidente-Hidroterapia">
                Bogotá-Sur-Occidente-Hidroterapia
              </option>
              <option value="Bogota-Norte-Hidroterapia">
                Bogotá-Norte-Hidroterapia
              </option>
              <option value="Bogota-Centro-Hidroterapia">
                Bogotá-Centro-Hidroterapia
              </option>
              <option value="Chia-Rehabilitacion">Chia-Rehabilitacion</option>
              <option value="Florencia-Hidroterapia-Rehabilitacion">
                Florencia-Hidroterapia-Rehabilitacion
              </option>
              <option value="Ibague-Hidroterapia-Rehabilitacion">
                Ibagué-Hidroterapia-Rehabilitacion
              </option>
            </select>
            {errors.sede && <p className="error">{errors.sede}</p>}
          </div>
          <div>
            <select
              name="servicio_prestado"
              value={form.servicio_prestado}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <option value="" hidden>
                Servicio prestado
              </option>
              {serviciosPrestados.map((servicio) => (
                <option key={servicio} value={servicio}>
                  {servicio
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
            {errors.servicio_prestado && (
              <p className="error">{errors.servicio_prestado}</p>
            )}
          </div>
          <div>
            <select
              name="eps"
              value={form.eps}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <option value="" hidden>
                EPS ó ARL
              </option>
              {epsOptions.map((eps) => (
                <option key={eps} value={eps}>
                  {eps}
                </option>
              ))}
            </select>
            {errors.eps && <p className="error">{errors.eps}</p>}
          </div>
          <div>
            <select
              name="tipo_solicitud"
              value={form.tipo_solicitud}
              onChange={handleChange}
              onBlur={handleBlur}
              // Deshabilita el select si readOnlyTipoSolicitud es true
              disabled={readOnlyTipoSolicitud}
            >
              <option value="" hidden>
                Tipo de solicitud
              </option>
              <option value="Felicitacion">Felicitación</option>
              <option value="Peticion">Petición</option>
              <option value="Queja">Queja</option>
              <option value="Reclamo">Reclamo</option>
              <option value="Solicitud">Solicitud</option>
            </select>
            {errors.tipo_solicitud && (
              <p className="error">{errors.tipo_solicitud}</p>
            )}
          </div>
          <div>
            <textarea
              name="descripcion"
              placeholder="Describe la situación que deseas reportar"
              value={form.descripcion}
              onChange={handleChange}
              onBlur={handleBlur}
              rows="5"
            />
            {errors.descripcion && (
              <p className="error">{errors.descripcion}</p>
            )}
          </div>
          <input type="file" onChange={handleFileChange} />

          <button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar PQRS"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PqrsForm;




























// import React, { useState } from "react";
// import { createPqr } from "./pqrsService";
// import "./styles/Pqrs.css";
// import Swal from "sweetalert2";
// import { pqrsSchema } from "./pqrValidation";

// const epsOptions = [
//   "Compensar",
//   "Fomag",
//   "Famisanar",
//   "Nueva Eps",
//   "Sanitas",
//   "Sura",
//   "Aliansalud",
//   "Asmet Salud",
//   "Seguros Bolivar",
//   "Cafam",
//   "Colmédica",
// ];
// const serviciosPrestados = [
//   "Hidroterapia",
//   "Programa-Rehabilitacion",
//   "Neuropediatria",
//   "Psiquiatria",
//   "Fisiatria",
//   "Acuamotricidad",
//   "Natacion-infantil",
//   "Natacion-jovenes-adultos",
//   "Yoga",
//   "Yoga-acuatico",
//   "Mindfulness",
//   "Pilates",
//   "Pilates-acuatico",
// ];

// function PqrsForm() {
//   const [form, setForm] = useState({
//     nombre: "",
//     apellido: "",
//     documento_tipo: "",
//     documento_numero: "",
//     correo: "",
//     telefono: "",
//     sede: "",
//     servicio_prestado: "",
//     eps: "",
//     tipo_solicitud: "",
//     descripcion: "",
//     registra_otro: "no", // Valor inicial para el radio button
//     registrador_nombre: "",
//     registrador_apellido: "",
//     registrador_documento_tipo: "",
//     registrador_documento_numero: "",
//     registrador_correo: "",
//     registrador_telefono: "",
//   });

//   const [archivo, setArchivo] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({}); // Estado para almacenar los errores de validación

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setForm((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//     // Aquí NO limpiamos el error inmediatamente, sino que esperamos al blur
//   };

//   // Nueva función para manejar el evento onBlur
//   const handleBlur = async (e) => {
//     const { name, value } = e.target;
//     try {
//       // Validar solo el campo que ha perdido el foco
//       await pqrsSchema.validateAt(name, form); // Usamos validateAt para validar un campo específico
//       setErrors((prev) => ({ ...prev, [name]: undefined })); // Limpia el error si la validación es exitosa
//     } catch (error) {
//       setErrors((prev) => ({ ...prev, [name]: error.message })); // Establece el error
//     }
//   };

//   const handleFileChange = (e) => {
//     setArchivo(e.target.files[0]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrors({}); // Limpiar todos los errores al intentar enviar el formulario completo

//     try {
//       // Validar el formulario completo con Yup antes de enviar
//       await pqrsSchema.validate(form, { abortEarly: false });

//       const formData = new FormData();

//       Object.entries(form).forEach(([key, value]) => {
//         if (key.startsWith("registrador_") && form.registra_otro === "no") {
//           return;
//         }
//         formData.append(key, value);
//       });

//       if (archivo) {
//         formData.append("archivo", archivo);
//       }

//       await createPqr(formData);

//       Swal.fire({
//         icon: "success",
//         title: "¡PQR enviada!",
//         text: "Tu PQRS ha sido enviada con éxito.",
//         confirmButtonColor: "#3085d6",
//       });

//       // Limpiar el formulario después del envío exitoso
//       setForm({
//         nombre: "",
//         apellido: "",
//         documento_tipo: "",
//         documento_numero: "",
//         correo: "",
//         telefono: "",
//         sede: "",
//         servicio_prestado: "",
//         eps: "",
//         tipo_solicitud: "",
//         descripcion: "",
//         registra_otro: "no",
//         registrador_nombre: "",
//         registrador_apellido: "",
//         registrador_documento_tipo: "",
//         registrador_documento_numero: "",
//         registrador_correo: "",
//         registrador_telefono: "",
//       });
//       setArchivo(null);
//     } catch (err) {
//       if (err.inner) {
//         // Errores de validación de Yup al enviar
//         const formErrors = {};
//         err.inner.forEach(({ path, message }) => {
//           if (!formErrors[path]) {
//             formErrors[path] = message;
//           }
//         });
//         setErrors(formErrors);

//         Swal.fire({
//           icon: "error",
//           title: "Error de validación",
//           text: "Por favor, revisa los campos marcados en el formulario.",
//           confirmButtonColor: "#d33",
//         });
//       } else {
//         // Otros errores (ej. de la API)
//         Swal.fire({
//           icon: "error",
//           title: "Error",
//           text: err.message || "Ocurrió un error al enviar la PQR.",
//           confirmButtonColor: "#d33",
//         });
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="pqrs-container">
//       <div className="header-pqrs">
//         <div>
//           Envía tu <span>PQRS</span>
//         </div>
//       </div>
//       <br />

//       <label>
//         ¿Está registrando esta solicitud en nombre de otra persona o empresa?
//       </label>
//       <div className="radio-group">
//         <label>
//           <input
//             type="radio"
//             name="registra_otro"
//             value="no"
//             checked={form.registra_otro === "no"}
//             onChange={handleChange}
//             onBlur={handleBlur}
//           />
//           No
//         </label>
//         <label>
//           <input
//             type="radio"
//             name="registra_otro"
//             value="si"
//             checked={form.registra_otro === "si"}
//             onChange={handleChange}
//             onBlur={handleBlur}
//           />
//           Sí
//         </label>
//       </div>

//       <form className="pqrs" onSubmit={handleSubmit} noValidate>
//         {form.registra_otro === "si" && (
//           <>
//             <h1 className="titulo-form">
//               Datos de quien registra la solicitud:
//             </h1>
//             <div className="pqrs-otro">
//               <div>
//                 <input
//                   name="registrador_nombre"
//                   placeholder="Nombre"
//                   value={form.registrador_nombre}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                 />
//                 {errors.registrador_nombre && (
//                   <p className="error">{errors.registrador_nombre}</p>
//                 )}
//               </div>
//               <div>
//                 <input
//                   name="registrador_apellido"
//                   placeholder="Apellido"
//                   value={form.registrador_apellido}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                 />
//                 {errors.registrador_apellido && (
//                   <p className="error">{errors.registrador_apellido}</p>
//                 )}
//               </div>
//               <div>
//                 <select
//                   name="registrador_documento_tipo"
//                   value={form.registrador_documento_tipo}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                 >
//                   <option value="" hidden>
//                     Tipo de documento
//                   </option>
//                   <option value="CC">Cédula de ciudadanía</option>
//                   <option value="CE">Cédula de extranjería</option>
//                   <option value="TI">Tarjeta de identidad</option>
//                 </select>
//                 {errors.registrador_documento_tipo && (
//                   <p className="error">{errors.registrador_documento_tipo}</p>
//                 )}
//               </div>
//               <div>
//                 <input
//                   name="registrador_documento_numero"
//                   placeholder="Número de documento"
//                   value={form.registrador_documento_numero}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                 />
//                 {errors.registrador_documento_numero && (
//                   <p className="error">{errors.registrador_documento_numero}</p>
//                 )}
//               </div>
//               <div>
//                 <input
//                   name="registrador_correo"
//                   type="email"
//                   placeholder="Correo"
//                   value={form.registrador_correo}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                 />
//                 {errors.registrador_correo && (
//                   <p className="error">{errors.registrador_correo}</p>
//                 )}
//               </div>
//               <div>
//                 <input
//                   name="registrador_telefono"
//                   placeholder="Teléfono"
//                   value={form.registrador_telefono}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                 />
//                 {errors.registrador_telefono && (
//                   <p className="error">{errors.registrador_telefono}</p>
//                 )}
//               </div>
//             </div>
//           </>
//         )}

//         <h1 className="titulo-form">Datos del paciente</h1>
//         <div className="pqrs-paciente">
//           <div>
//             <input
//               name="nombre"
//               placeholder="Nombre"
//               value={form.nombre}
//               onChange={handleChange}
//               onBlur={handleBlur}
//             />
//             {errors.nombre && <p className="error">{errors.nombre}</p>}
//           </div>
//           <div>
//             <input
//               name="apellido"
//               placeholder="Apellido"
//               value={form.apellido}
//               onChange={handleChange}
//               onBlur={handleBlur}
//             />
//             {errors.apellido && <p className="error">{errors.apellido}</p>}
//           </div>
//           <div>
//             <select
//               name="documento_tipo"
//               value={form.documento_tipo}
//               onChange={handleChange}
//               onBlur={handleBlur}
//             >
//               <option value="" hidden>
//                 Tipo de documento
//               </option>
//               <option value="CC">Cédula de ciudadanía</option>
//               <option value="CE">Cédula de extranjería</option>
//               <option value="TI">Tarjeta de identidad</option>
//             </select>
//             {errors.documento_tipo && (
//               <p className="error">{errors.documento_tipo}</p>
//             )}
//           </div>
//           <div>
//             <input
//               name="documento_numero"
//               placeholder="Número de documento"
//               value={form.documento_numero}
//               onChange={handleChange}
//               onBlur={handleBlur}
//             />
//             {errors.documento_numero && (
//               <p className="error">{errors.documento_numero}</p>
//             )}
//           </div>
//           <div>
//             <input
//               name="correo"
//               type="email"
//               placeholder="Correo"
//               value={form.correo}
//               onChange={handleChange}
//               onBlur={handleBlur}
//             />
//             {errors.correo && <p className="error">{errors.correo}</p>}
//           </div>
//           <div>
//             <input
//               name="telefono"
//               placeholder="Teléfono"
//               value={form.telefono}
//               onChange={handleChange}
//               onBlur={handleBlur}
//             />
//             {errors.telefono && <p className="error">{errors.telefono}</p>}
//           </div>
//           <div>
//             <select
//               name="sede"
//               value={form.sede}
//               onChange={handleChange}
//               onBlur={handleBlur}
//             >
//               <option value="" hidden>
//                 Sede de atención
//               </option>
//               <option value="Bogota-Sur-Occidente-Rehabilitación">
//                 Bogotá-Sur-Occidente-Rehabilitación
//               </option>
//               <option value="Bogota-Sur-Occidente-Hidroterapia">
//                 Bogotá-Sur-Occidente-Hidroterapia
//               </option>
//               <option value="Bogota-Norte-Hidroterapia">
//                 Bogotá-Norte-Hidroterapia
//               </option>
//               <option value="Bogota-Centro-Hidroterapia">
//                 Bogotá-Centro-Hidroterapia
//               </option>
//               <option value="Chia-Rehabilitacion">Chia-Rehabilitacion</option>
//               <option value="Florencia-Hidroterapia-Rehabilitacion">
//                 Florencia-Hidroterapia-Rehabilitacion
//               </option>
//               <option value="Ibague-Hidroterapia-Rehabilitacion">
//                 Ibagué-Hidroterapia-Rehabilitacion
//               </option>
//             </select>
//             {errors.sede && <p className="error">{errors.sede}</p>}
//           </div>
//           <div>
//             <select
//               name="servicio_prestado"
//               value={form.servicio_prestado}
//               onChange={handleChange}
//               onBlur={handleBlur}
//             >
//               <option value="" hidden>
//                 Servicio prestado
//               </option>
//               {serviciosPrestados.map((servicio) => (
//                 <option key={servicio} value={servicio}>
//                   {servicio
//                     .replace(/-/g, " ")
//                     .replace(/\b\w/g, (c) => c.toUpperCase())}
//                 </option>
//               ))}
//             </select>
//             {errors.servicio_prestado && (
//               <p className="error">{errors.servicio_prestado}</p>
//             )}
//           </div>
//           <div>
//             <select
//               name="eps"
//               value={form.eps}
//               onChange={handleChange}
//               onBlur={handleBlur}
//             >
//               <option value="" hidden>
//                 EPS ó ARL
//               </option>
//               {epsOptions.map((eps) => (
//                 <option key={eps} value={eps}>
//                   {eps}
//                 </option>
//               ))}
//             </select>
//             {errors.eps && <p className="error">{errors.eps}</p>}
//           </div>
//           <div>
//             <select
//               name="tipo_solicitud"
//               value={form.tipo_solicitud}
//               onChange={handleChange}
//               onBlur={handleBlur}
//             >
//               <option value="" hidden>
//                 Tipo de solicitud
//               </option>
//               <option value="Felicitacion">Felicitación</option>
//               <option value="Peticion">Petición</option>
//               <option value="Queja">Queja</option>
//               <option value="Reclamo">Reclamo</option>
//               <option value="Solicitud">Solicitud</option>
//             </select>
//             {errors.tipo_solicitud && (
//               <p className="error">{errors.tipo_solicitud}</p>
//             )}
//           </div>
//           <div>
//             <textarea
//               name="descripcion"
//               placeholder="Describe la situación que deseas reportar"
//               value={form.descripcion}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               rows="5"
//             />
//             {errors.descripcion && (
//               <p className="error">{errors.descripcion}</p>
//             )}
//           </div>
//           <input type="file" onChange={handleFileChange} />

//           <button type="submit" disabled={loading}>
//             {loading ? "Enviando..." : "Enviar PQRS"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default PqrsForm;






