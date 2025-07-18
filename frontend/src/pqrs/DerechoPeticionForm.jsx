import React from "react";
import PqrsForm from "./PqrsForm";

export default function DerechoPeticionForm() {
  const tipoSolicitudOptions = [
    { value: "Derecho de peticion", label: "Derecho de petición" },
  ];

  return (
    <PqrsForm
      defaultTipoSolicitud="Derecho de peticion"
      tipoSolicitudOptions={tipoSolicitudOptions}
    />
  );
}












// import React, { useState, useEffect, useCallback } from "react";
// import { createPqr } from "./pqrsService"; // Asegúrate de tener createPqr y updatePqr si los usas
// import "./styles/Pqrs.css";
// import Swal from "sweetalert2";
// import { pqrsSchema } from "./pqrValidation"; // Asegúrate de que esto sea pqrsValidation.js
// import Modal from "../components/Modal/Modal";

// // Función auxiliar para formatear la fecha a YYYY-MM-DD
// const formatDateToISO = (date) => {
//   if (!date) return "";
//   if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
//     return date;
//   }
//   const d = new Date(date);
//   const year = d.getFullYear();
//   const month = (d.getMonth() + 1).toString().padStart(2, "0");
//   const day = d.getDate().toString().padStart(2, "0");
//   return `${year}-${month}-${day}`;
// };

// // Nueva función auxiliar para formatear a YYYY-MM-DD HH:MM (hora local)
// const formatDateToISOWithTime = (dateInput) => {
//   if (!dateInput) return "";

//   // Intentar crear un objeto Date. Si ya es un Date, usarlo directamente.
//   const d = dateInput instanceof Date ? dateInput : new Date(dateInput);

//   // Verifica si la fecha es válida. Si new Date() no puede parsear, d.getTime() será NaN.
//   if (isNaN(d.getTime())) {
//     console.warn("Fecha inválida pasada a formatDateToISOWithTime:", dateInput);
//     return "";
//   }

//   // Obtener componentes de la fecha en la zona horaria local
//   const year = d.getFullYear();
//   const month = (d.getMonth() + 1).toString().padStart(2, "0");
//   const day = d.getDate().toString().padStart(2, "0");
//   const hours = d.getHours().toString().padStart(2, "0");
//   const minutes = d.getMinutes().toString().padStart(2, "0");

//   return `${year}-${month}-${day} ${hours}:${minutes}`;
// };

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
//   "Positiva",
//   "Particular",
// ];
// epsOptions.sort();

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
//   "Valoracion inicial",
// ];
// serviciosPrestados.sort();

// const parentesco = [
//   "Hijo/a",
//   "Contacto",
//   "Empleado",
//   "Entidad",
//   "Ente de control",
//   "Otro Familiar",
//   "Padre",
//   "Madre",
//   "Desconocido",
//   "Hermano/a",
//   "Nieto/a",
//   "Abuelo/a",
//   "Esposo/a",
// ];
// parentesco.sort();

// // Descripciones para cada tipo de solicitud
// const tipoSolicitudDescriptions = {
//   Peticion: {
//     title: "Petición",
//     description:
//       "Una petición es una solicitud respetuosa que se hace a la entidad para requerir información, una copia de documentos, o para formular una consulta.",
//   },
//   Queja: {
//     title: "Queja",
//     description:
//       "Una queja es la manifestación de inconformidad con la atención o el servicio recibido, o con el incumplimiento de una obligación por parte de la entidad o su personal.",
//   },
//   Reclamo: {
//     title: "Reclamo",
//     description:
//       "Un reclamo es una exigencia que se hace a la entidad por la vulneración o amenaza de un derecho, o por la prestación deficiente de un servicio. Generalmente busca una solución o compensación.",
//   },
// };

// function PqrsForm({
//   defaultTipoSolicitud,
//   readOnlyTipoSolicitud,
//   pqrData = null, // Para edición de PQR existente
// }) {
//   const [form, setForm] = useState({
//     nombre: "",
//     apellido: "",
//     documento_tipo: "",
//     documento_numero: "",
//     correo: "",
//     correo_confirmacion: "",
//     telefono: "",
//     sede: "",
//     servicio_prestado: "",
//     eps: "",
//     regimen: "",
//     tipo_solicitud: defaultTipoSolicitud || "",
//     descripcion: "",
//     politica_aceptada: false,
//     registra_otro: "no",
//     registrador_nombre: "",
//     registrador_apellido: "",
//     registrador_documento_tipo: "",
//     registrador_documento_numero: "",
//     registrador_correo: "",
//     registrador_telefono: "",
//     parentesco: "",
//     fuente: "Formulario de la web",
//     fecha_inicio_real: "", // Se inicializa como cadena vacía, se llenará en useEffect
//   });

//   const [archivos, setArchivos] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});
//   const isLoggedIn = !!localStorage.getItem("token"); // Verifica si el usuario está logeado

//   const [showModal, setShowModal] = useState(false);
//   const [modalContent, setModalContent] = useState({
//     title: "",
//     description: "",
//   });

//   // Efecto para inicializar el formulario (ej. al cargar el componente o al recibir pqrData)
//   useEffect(() => {
//     // Si se provee un defaultTipoSolicitud y es diferente al actual, actualiza
//     if (
//       defaultTipoSolicitud !== undefined &&
//       form.tipo_solicitud !== defaultTipoSolicitud
//     ) {
//       setForm((prev) => ({
//         ...prev,
//         tipo_solicitud: defaultTipoSolicitud,
//       }));
//     }

//     // Lógica para fecha_inicio_real
//     setForm((prev) => {
//       let initialFechaInicioReal = prev.fecha_inicio_real;

//       if (isLoggedIn) {
//         // Si hay pqrData y tiene fecha_inicio_real, la usamos y la formateamos
//         if (pqrData && pqrData.fecha_inicio_real) {
//           initialFechaInicioReal = formatDateToISOWithTime(
//             pqrData.fecha_inicio_real
//           );
//         } else if (!prev.fecha_inicio_real) {
//           // Si está logeado y no hay fecha_inicio_real previa, inicializa con la fecha y hora actual
//           initialFechaInicioReal = formatDateToISOWithTime(new Date());
//         }
//       } else {
//         // Si no está logeado, el campo debe estar vacío
//         initialFechaInicioReal = "";
//       }

//       return {
//         ...prev,
//         fecha_inicio_real: initialFechaInicioReal,
//       };
//     });

//     // Cargar datos de PQR para edición si pqrData está presente
//     if (pqrData) {
//       setForm((prev) => ({
//         ...prev,
//         nombre: pqrData.nombre || "",
//         apellido: pqrData.apellido || "",
//         documento_tipo: pqrData.documento_tipo || "",
//         documento_numero: pqrData.documento_numero || "",
//         correo: pqrData.correo || "",
//         correo_confirmacion: pqrData.correo || "", // Asumiendo que el correo es también el de confirmación en edición
//         telefono: pqrData.telefono || "",
//         sede: pqrData.sede || "",
//         servicio_prestado: pqrData.servicio_prestado || "",
//         eps: pqrData.eps || "",
//         regimen: pqrData.regimen || "",
//         tipo_solicitud: pqrData.tipo_solicitud || defaultTipoSolicitud || "",
//         descripcion: pqrData.descripcion || "",
//         fuente: pqrData.fuente || "Formulario de la web",
//         registra_otro: pqrData.registra_otro === "si" ? "si" : "no",
//         registrador_nombre: pqrData.registrador_nombre || "",
//         registrador_apellido: pqrData.registrador_apellido || "",
//         registrador_documento_tipo: pqrData.registrador_documento_tipo || "",
//         registrador_documento_numero:
//           pqrData.registrador_documento_numero || "",
//         registrador_correo: pqrData.registrador_correo || "",
//         registrador_telefono: pqrData.registrador_telefono || "",
//         parentesco: pqrData.parentesco || "",
//         politica_aceptada: pqrData.politica_aceptada === "true", // O el valor que use tu API
//       }));
//     }
//   }, [defaultTipoSolicitud, isLoggedIn, pqrData]);

//   const handleChange = useCallback(
//     (e) => {
//       const { name, value, type, checked } = e.target;

//       if (name === "tipo_solicitud" && readOnlyTipoSolicitud) {
//         return;
//       }

//       setForm((prev) => {
//         let newValue = value;
//         if (type === "checkbox") {
//           newValue = checked;
//         } else if (name === "fecha_inicio_real") {
//           newValue = formatDateToISOWithTime(value);
//         }
//         return {
//           ...prev,
//           [name]: newValue,
//         };
//       });

//       // Lógica para mostrar descripciones de tipo de solicitud en un modal
//       if (name === "tipo_solicitud") {
//         if (tipoSolicitudDescriptions[value]) {
//           // Primero actualiza el contenido
//           setModalContent(tipoSolicitudDescriptions[value]);
//           // Luego muestra el modal
//           setShowModal(true);
//         } else {
//           // Si el valor no es una opción válida, cierra el modal y limpia el contenido
//           setShowModal(false);
//           setModalContent({ title: "", description: "" }); // Limpiar al cerrar
//         }
//       }
//     },
//     [readOnlyTipoSolicitud, setForm, setModalContent, setShowModal] // Añade todas las dependencias que cambian
//   );

//   const handleBlur = async (e) => {
//     const { name } = e.target;
//     try {
//       // Pasamos el estado completo y el contexto para validación condicional
//       await pqrsSchema.validateAt(name, form, { context: { isLoggedIn } });
//       setErrors((prev) => ({ ...prev, [name]: undefined }));
//     } catch (error) {
//       setErrors((prev) => ({ ...prev, [name]: error.message }));
//     }
//   };

//   const handleFileChange = (e) => {
//     const selectedFiles = Array.from(e.target.files);

//     const invalidFiles = selectedFiles.filter(
//       (file) => file.size > 7 * 1024 * 1024
//     ); // 7 MB

//     if (invalidFiles.length > 0) {
//       Swal.fire({
//         icon: "error",
//         title: "Archivo demasiado grande",
//         html: `Los siguientes archivos superan el tamaño máximo (7 MB):<br>${invalidFiles
//           .map((f) => `<b>${f.name}</b>`)
//           .join("<br>")}`,
//         confirmButtonColor: "#d33",
//       });
//       e.target.value = ""; // Limpiar el input de archivos
//       return;
//     }

//     setArchivos((prevArchivos) => [...prevArchivos, ...selectedFiles]);
//     e.target.value = ""; // Limpiar el input para permitir la selección de los mismos archivos de nuevo
//   };

//   const removeFile = (fileToRemove) => {
//     setArchivos((prevArchivos) =>
//       prevArchivos.filter((file) => file !== fileToRemove)
//     );
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true); // Inicia el spinner
//     setErrors({}); // Limpia errores previos

//     try {
//       // Validar todo el formulario antes de enviar
//       await pqrsSchema.validate(form, {
//         abortEarly: false, // Mostrar todos los errores, no solo el primero
//         context: { isLoggedIn }, // Pasar el contexto a Yup
//       });

//       const confirm = await Swal.fire({
//         title: "¿Confirmas el envío de tu PQR?",
//         text: "Una vez enviada no podrás editar la información.",
//         icon: "question",
//         showCancelButton: true,
//         confirmButtonText: "Sí, enviar",
//         cancelButtonText: "Cancelar",
//         confirmButtonColor: "#3085d6",
//         cancelButtonColor: "#d33",
//       });

//       if (!confirm.isConfirmed) {
//         setLoading(false);
//         return;
//       }

//       const formData = new FormData();
//       archivos.forEach((file, idx) => {
//         formData.append("archivos[]", file);
//       });

//       // Añadir campos del formulario a formData
//       Object.entries(form).forEach(([key, value]) => {
//         // No enviar campos del registrador si registra_otro es 'no'
//         if (key.startsWith("registrador_") && form.registra_otro === "no") {
//           return;
//         }
//         if (key === "parentesco" && form.registra_otro === "no") {
//           return; // También omitir parentesco si no se registra a otro
//         }

//         // Convertir booleanos a 'true'/'false' strings si el backend lo requiere
//         if (key === "politica_aceptada") {
//           formData.append(key, value ? "true" : "false");
//           return;
//         }

//         // Manejo específico para fecha_inicio_real
//         if (key === "fecha_inicio_real") {
//           if (isLoggedIn && value) {
//             // value ya está en YYYY-MM-DD HH:MM:SS gracias a handleChange
//             formData.append(key, value);
//           }
//           return; // Siempre retornar para evitar que se añada dos veces o con valor incorrecto
//         }

//         // Añadir otros campos si tienen valor
//         if (value !== null && value !== undefined && value !== "") {
//           formData.append(key, value);
//         }
//       });

//       // Log para depuración: qué se enviará en formData
//       // for (let pair of formData.entries()) {
//       //   console.log(pair[0] + ": " + pair[1]);
//       // }

//       // Decidir si crear o actualizar
//       if (pqrData && pqrData.pqr_codigo) {
//         // Aquí asumirías una función para actualizar, por ejemplo:
//         // await updatePqr(pqrData.pqr_codigo, formData);
//         // Si no tienes updatePqr, esta parte no se usará
//         console.warn("Función de actualización (updatePqr) no implementada.");
//         Swal.fire({
//           icon: "info",
//           title: "¡Funcionalidad de Actualización no implementada!",
//           text: "Esta PQR no se actualizó porque la función `updatePqr` no está definida. Se procede como un envío nuevo.",
//           confirmButtonColor: "#3085d6",
//         });
//         await createPqr(formData); // Opcional: si la actualizacion falla, intentar crear
//       } else {
//         await createPqr(formData);
//         Swal.fire({
//           icon: "success",
//           title: "¡PQR enviada!",
//           text: "Tu PQRS ha sido enviada con éxito.",
//           confirmButtonColor: "#3085d6",
//         });
//       }

//       // Resetear el formulario solo si es un envío nuevo (no una edición)
//       if (!pqrData) {
//         setForm({
//           nombre: "",
//           apellido: "",
//           documento_tipo: "",
//           documento_numero: "",
//           correo: "",
//           correo_confirmacion: "",
//           telefono: "",
//           sede: "",
//           servicio_prestado: "",
//           eps: "",
//           regimen: "",
//           tipo_solicitud: defaultTipoSolicitud || "",
//           descripcion: "",
//           politica_aceptada: false,
//           registra_otro: "no",
//           registrador_nombre: "",
//           registrador_apellido: "",
//           registrador_documento_tipo: "",
//           registrador_documento_numero: "",
//           registrador_correo: "",
//           registrador_telefono: "",
//           parentesco: "",
//           fuente: "Formulario de la web",
//           // Resetear fecha_inicio_real a la hora actual si está logeado, o vacía si no
//           fecha_inicio_real: isLoggedIn
//             ? formatDateToISOWithTime(new Date())
//             : "",
//         });
//         setArchivos([]); // Limpiar archivos también
//       }
//     } catch (err) {
//       if (err.inner) {
//         // Errores de validación de Yup
//         const formErrors = {};
//         err.inner.forEach(({ path, message }) => {
//           if (!formErrors[path]) {
//             formErrors[path] = message; // Toma el primer mensaje de error para cada campo
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
//         // Otros errores (ej. error de red, error de la API)
//         Swal.fire({
//           icon: "error",
//           title: "Error",
//           text: err.message || "Ocurrió un error al enviar la PQR.",
//           confirmButtonColor: "#d33",
//         });
//       }
//     } finally {
//       setLoading(false); // Siempre desactiva el spinner al finalizar
//     }
//   };

//   return (
//     <div className="pqrs-container">
//       <div className="header-pqrs">
//         <div>
//           Registro de <span>Derecho de petición</span>
//         </div>
//       </div>
//       <br />

//       <label className="registra-otro-label">
//         ¿Está registrando esta solicitud en nombre de otra persona o entidad?
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
//       {errors.registra_otro && <p className="error">{errors.registra_otro}</p>}

//       <form className="pqrs" onSubmit={handleSubmit} noValidate>
//         {form.registra_otro === "si" && (
//           <>
//             <h1 className="titulo-form">
//               Datos de quien registra la solicitud:
//             </h1>
//             <br />
//             <div className="pqrs-otro">
//               <div className="floating-label">
//                 <input
//                   id="registrador_nombre"
//                   name="registrador_nombre"
//                   value={form.registrador_nombre}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   required
//                 />
//                 <label htmlFor="registrador_nombre">
//                   Nombres/persona ó nombre/entidad
//                 </label>
//                 {errors.registrador_nombre && (
//                   <p className="error">{errors.registrador_nombre}</p>
//                 )}
//               </div>

//               <div className="floating-label">
//                 <input
//                   id="registrador_apellido"
//                   name="registrador_apellido"
//                   value={form.registrador_apellido}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   required
//                 />
//                 <label htmlFor="registrador_apellido">
//                   Apellidos ó razón social
//                 </label>
//                 {errors.registrador_apellido && (
//                   <p className="error">{errors.registrador_apellido}</p>
//                 )}
//               </div>

//               <div className="floating-label">
//                 <select
//                   id="parentesco"
//                   name="parentesco"
//                   value={form.parentesco}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   required
//                 >
//                   <option value="" disabled hidden></option>
//                   {parentesco.map((opcion) => (
//                     <option key={opcion} value={opcion}>
//                       {opcion}
//                     </option>
//                   ))}
//                 </select>
//                 <label htmlFor="parentesco">Parentesco</label>
//                 {errors.parentesco && (
//                   <p className="error">{errors.parentesco}</p>
//                 )}
//               </div>

//               <div className="floating-label">
//                 <select
//                   id="registrador_documento_tipo"
//                   name="registrador_documento_tipo"
//                   value={form.registrador_documento_tipo}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   required
//                 >
//                   <option value="" disabled hidden></option>
//                   <option value="CC">Cédula</option>
//                   <option value="CD">Carné diplomático</option>
//                   <option value="CN">Certificado nacido vivo</option>
//                   <option value="CE">Cédula de extranjería</option>
//                   <option value="DC">Documento Extranjero</option>
//                   <option value="NIT">NIT</option>
//                   <option value="PA">Pasaporte</option>
//                   <option value="PE">Permiso Especial de Permanencia</option>
//                   <option value="PT">Permiso por Protección Temporal</option>
//                   <option value="RC">Registro Civil</option>
//                   <option value="SC">Salvo Conducto</option>
//                   <option value="TI">Tarjeta de identidad</option>
//                 </select>
//                 <label htmlFor="registrador_documento_tipo">
//                   Tipo de documento
//                 </label>
//                 {errors.registrador_documento_tipo && (
//                   <p className="error">{errors.registrador_documento_tipo}</p>
//                 )}
//               </div>

//               <div className="floating-label">
//                 <input
//                   id="registrador_documento_numero"
//                   name="registrador_documento_numero"
//                   type="text" // Mantener como text para permitir guiones/letras si NIT lo requiere
//                   value={form.registrador_documento_numero}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   required
//                 />
//                 <label htmlFor="registrador_documento_numero">
//                   Número de documento
//                 </label>
//                 {errors.registrador_documento_numero && (
//                   <p className="error">{errors.registrador_documento_numero}</p>
//                 )}
//               </div>

//               <div className="floating-label">
//                 <input
//                   id="registrador_correo"
//                   name="registrador_correo"
//                   type="email"
//                   value={form.registrador_correo}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   required
//                 />
//                 <label htmlFor="registrador_correo">Correo</label>
//                 {errors.registrador_correo && (
//                   <p className="error">{errors.registrador_correo}</p>
//                 )}
//               </div>

//               <div className="floating-label">
//                 <input
//                   id="registrador_telefono"
//                   name="registrador_telefono"
//                   type="text"
//                   value={form.registrador_telefono}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   required
//                 />
//                 <label htmlFor="registrador_telefono">Número de Celular</label>
//                 {errors.registrador_telefono && (
//                   <p className="error">{errors.registrador_telefono}</p>
//                 )}
//               </div>
//             </div>
//           </>
//         )}
//         <h1 className="titulo-form">Datos del paciente</h1> <br />
//         <div className="pqrs-paciente">
//           <div className="floating-label">
//             <input
//               type="text"
//               name="nombre"
//               value={form.nombre}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               required
//             />
//             <label htmlFor="nombre">Nombre</label>
//             {errors.nombre && <p className="error">{errors.nombre}</p>}
//           </div>

//           <div className="floating-label">
//             <input
//               type="text"
//               name="apellido"
//               value={form.apellido}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               required
//             />
//             <label htmlFor="apellido">Apellido</label>
//             {errors.apellido && <p className="error">{errors.apellido}</p>}
//           </div>

//           <div className="floating-label">
//             <select
//               id="documento_tipo"
//               name="documento_tipo"
//               value={form.documento_tipo}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               required
//             >
//               <option value="" disabled hidden></option>
//               <option value="CC">Cédula</option>
//               <option value="CD">Carné diplomático</option>
//               <option value="CN">Certificado nacido vivo</option>
//               <option value="CE">Cédula de extranjería</option>
//               <option value="DC">Documento Extranjero</option>
//               <option value="NIT">NIT</option>
//               <option value="PA">Pasaporte</option>
//               <option value="PE">Permiso Especial de Permanencia</option>
//               <option value="PT">Permiso por Protección Temporal</option>
//               <option value="RC">Registro Civil</option>
//               <option value="SC">Salvo Conducto</option>
//               <option value="TI">Tarjeta de identidad</option>
//             </select>
//             <label htmlFor="documento_tipo">Tipo de documento</label>
//             {errors.documento_tipo && (
//               <p className="error">{errors.documento_tipo}</p>
//             )}
//           </div>

//           <div className="floating-label">
//             <input
//               type="text"
//               id="documento_numero"
//               name="documento_numero"
//               value={form.documento_numero}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               required
//             />
//             <label htmlFor="documento_numero">Número de documento</label>
//             {errors.documento_numero && (
//               <p className="error">{errors.documento_numero}</p>
//             )}
//           </div>

//           <div className="floating-label">
//             <input
//               id="correo"
//               name="correo"
//               type="email"
//               value={form.correo}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               required
//             />
//             <label htmlFor="correo">Correo</label>
//             {errors.correo && <p className="error">{errors.correo}</p>}
//           </div>

//           <div className="floating-label">
//             <input
//               id="correo_confirmacion"
//               name="correo_confirmacion"
//               type="email"
//               value={form.correo_confirmacion}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               required
//             />
//             <label htmlFor="correo_confirmacion">Confirmar correo</label>
//             {errors.correo_confirmacion && (
//               <p className="error">{errors.correo_confirmacion}</p>
//             )}
//           </div>

//           <div className="floating-label">
//             <input
//               id="telefono"
//               name="telefono"
//               type="text"
//               value={form.telefono}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               required
//             />
//             <label htmlFor="telefono">Número de Celular</label>
//             {errors.telefono && <p className="error">{errors.telefono}</p>}
//           </div>

//           <div className="floating-label">
//             <select
//               id="sede"
//               name="sede"
//               value={form.sede}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               required
//             >
//               <option value="" disabled hidden></option>
//               <option value="No he sido atendido">No he sido atendido</option>
//               <option value="Bogota-Sur-Occidente-Rehabilitación">
//                 Bogotá-Sur-Occidente-Rehabilitación
//               </option>
//               <option value="Bogota-Sur-Occidente-Hidroterapia">
//                 Bogotá-Sur-Occidente-Hidroterapia
//               </option>
//               <option value="Bogota-Norte-Hidroterapia">Bogotá-Norte</option>
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
//             <label htmlFor="sede">Sede de atención</label>
//             {errors.sede && <p className="error">{errors.sede}</p>}
//           </div>

//           <div className="floating-label">
//             <select
//               id="regimen"
//               name="regimen"
//               value={form.regimen}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               required
//             >
//               <option value="" disabled hidden></option>
//               <option value="ARL">ARL</option>
//               <option value="Contributivo">Contributivo</option>
//               <option value="Especial">Especial (Fomag) </option>
//               <option value="Medicina prepagada">Medicina prepagada</option>
//               <option value="Particular">Particular</option>
//               <option value="Subsidiado">Subsidiado</option>
//             </select>
//             <label htmlFor="regimen">Tipo de asegurador</label>
//             {errors.regimen && <p className="error">{errors.regimen}</p>}
//           </div>

//           <div className="floating-label">
//             <select
//               id="servicio_prestado"
//               name="servicio_prestado"
//               value={form.servicio_prestado}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               required
//             >
//               <option value="" disabled hidden></option>
//               {serviciosPrestados.map((servicio) => (
//                 <option key={servicio} value={servicio}>
//                   {servicio
//                     .replace(/-/g, " ")
//                     .replace(/\b\w/g, (c) => c.toUpperCase())}
//                 </option>
//               ))}
//             </select>
//             <label htmlFor="servicio_prestado">Servicio prestado</label>

//             {errors.servicio_prestado && (
//               <p className="error">{errors.servicio_prestado}</p>
//             )}
//           </div>

//           <div className="floating-label">
//             <select
//               id="eps"
//               name="eps"
//               value={form.eps}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               required
//             >
//               <option value="" disabled hidden></option>
//               {epsOptions.map((eps) => (
//                 <option key={eps} value={eps}>
//                   {eps}
//                 </option>
//               ))}
//             </select>
//             <label htmlFor="eps">Entidad</label>
//             {errors.eps && <p className="error">{errors.eps}</p>}
//           </div>

//           <div className="floating-label">
//             <select
//               id="tipo_solicitud"
//               name="tipo_solicitud"
//               value={form.tipo_solicitud}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               required
//               disabled={readOnlyTipoSolicitud}
//             >
//               <option value="" disabled hidden></option>
//               <option value="Derecho de peticion">Derecho de petición</option>
//             </select>
//             <label htmlFor="tipo_solicitud">Tipo de solicitud</label>
//             {errors.tipo_solicitud && (
//               <p className="error">{errors.tipo_solicitud}</p>
//             )}
//           </div>

//           {/* CAMPO DE FECHA DE INICIO REAL - VISIBLE SOLO SI EL USUARIO ESTÁ LOGEADO */}
//           {isLoggedIn && (
//             <div className="floating-label">
//               {" "}
//               <input
//                 type="datetime-local" // Correcto para fecha y hora
//                 id="fecha_inicio_real"
//                 name="fecha_inicio_real"
//                 value={
//                   form.fecha_inicio_real
//                     ? (() => {
//                         const date = new Date(form.fecha_inicio_real); // Obtener componentes de fecha y hora local
//                         const year = date.getFullYear();
//                         const month = (date.getMonth() + 1)
//                           .toString()
//                           .padStart(2, "0");
//                         const day = date.getDate().toString().padStart(2, "0");
//                         const hours = date
//                           .getHours()
//                           .toString()
//                           .padStart(2, "0");
//                         const minutes = date
//                           .getMinutes()
//                           .toString()
//                           .padStart(2, "0");

//                         return `${year}-${month}-${day}T${hours}:${minutes}`;
//                       })()
//                     : ""
//                 }
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//               />{" "}
//               <label htmlFor="fecha_inicio_real">
//                 Fecha y Hora de Inicio Real de la PQR:{" "}
//               </label>{" "}
//               {errors.fecha_inicio_real && (
//                 <p className="error">{errors.fecha_inicio_real}</p>
//               )}{" "}
//             </div>
//           )}

//           {isLoggedIn && (
//             <div className="floating-label">
//               <select
//                 id="fuente"
//                 name="fuente"
//                 value={form.fuente}
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//                 required
//                 disabled={readOnlyTipoSolicitud}
//               >
//                 <option value="" disabled hidden></option>
//                 <option value="Callcenter">Callcenter</option>
//                 <option value="Correo atención al usuario">
//                   Correo atención al usuario
//                 </option>
//                 <option value="Correo de Agendamiento NAC">
//                   Correo de Agendamiento NAC
//                 </option>
//                 <option value="Encuesta de satisfacción IPS">
//                   Encuesta de satisfacción IPS
//                 </option>
//                 <option value="Formulario de la web">
//                   Formulario de la web
//                 </option>
//                 <option value="Presencial">Presencial</option>
//               </select>
//               <label htmlFor="fuente">Fuente</label>
//               {errors.fuente && <p className="error">{errors.fuente}</p>}
//             </div>
//           )}
//         </div>
//         <div className="pqrs-textarea-full">
//           <textarea
//             name="descripcion"
//             placeholder="Describe la situación que deseas reportar"
//             value={form.descripcion}
//             onChange={handleChange}
//             onBlur={handleBlur}
//             rows="5"
//             required
//           />
//           {errors.descripcion && <p className="error">{errors.descripcion}</p>}
//         </div>
//         <div className="file-input-group">
//           {/* <label htmlFor="file-upload" className="file-upload-button">
//             Adjuntar Archivos (Máx. 7MB c/u)
//           </label> */}
//           <input
//             id="file-upload"
//             type="file"
//             multiple
//             onChange={handleFileChange}
//             // style={{ display: "none" }} // Oculta el input file por defecto
//           />
//         </div>
//         {archivos.length > 0 && (
//           <div className="selected-files">
//             <h3>Archivos seleccionados:</h3>
//             <ul>
//               {archivos.map((file, index) => (
//                 <li key={index}>
//                   {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
//                   <button
//                     type="button"
//                     onClick={() => removeFile(file)}
//                     className="remove-file-button"
//                   >
//                     X
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//         <div className="politica-box politica-box-compact">
//           <label className="politica-label">
//             <input
//               type="checkbox"
//               name="politica_aceptada"
//               checked={form.politica_aceptada}
//               onChange={handleChange} // Usa handleChange unificado
//               onBlur={handleBlur}
//             />
//             <div className="politica-texto">
//               <span className="politica-descripcion">
//                 Acepto la
//                 <a
//                   href="https://passusips.com/nosotros-politica-manejo-datos"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   política de tratamiento de datos personales
//                 </a>{" "}
//                 de Passus 👆, pues he leído y estoy de acuerdo con lo expuesto
//                 en el manuscrito publicado. <br /> <br />
//                 He Comprendido los{" "}
//                 <a
//                   href="https://passusips.com/nosotros-politica-agendamiento-web"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   {" "}
//                   Términos y condiciones de Servicio Web{" "}
//                 </a>
//                 de Passus 👆, pues he leído y estoy de acuerdo con lo expuesto
//                 en la información publicada.
//               </span>
//             </div>
//           </label>
//           {errors.politica_aceptada && (
//             <p className="error">{errors.politica_aceptada}</p>
//           )}
//         </div>
//         <button type="submit" disabled={loading}>
//           {loading ? "Enviando..." : "Enviar PQR"}
//         </button>
//       </form>
//       <Modal
//         show={showModal}
//         onClose={() => setShowModal(false)}
//         title={modalContent.title}
//         description={modalContent.description}
//       />
//     </div>
//   );
// }

// export default PqrsForm;
