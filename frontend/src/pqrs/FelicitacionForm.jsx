import React, { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { Footer } from "../components/Footer/Footer";
import api from "../api/api";
import "./styles/Pqrs.css";


const felicitacionSchema = Yup.object().shape({
   nombre: Yup.string()
     .matches(
       /^[a-zA-Z0áéíóúüÁÉÍÓÚÜñÑ][a-zA-Z0áéíóúüÁÉÍÓÚÜ\sñÑ]*$/,
       "El nombre no puede contener espacios en blanco"
     )
     // .trim("El nombre no puede consistir solo en espacios en blanco")
     .required("El nombre es obligatorio")
     .min(2, "El nombre debe tener al menos 2 caracteres")
     .max(20, "El nombre no puede exceder los 50 caracteres"),
   segundo_nombre: Yup.string()
    .nullable()
    .notRequired()
    .test(
      "validar-segundo-nombre",
      "El segundo nombre debe tener entre 2 y 20 caracteres y no contener espacios en blanco",
      (value) => {
        if (!value) return true; // ✅ Si está vacío, pasa
        return (
          /^[a-zA-Z0áéíóúüÁÉÍÓÚÜñÑ][a-zA-Z0áéíóúüÁÉÍÓÚÜ\sñÑ]*$/.test(value) &&
          value.length >= 2 &&
          value.length <= 50
        );
      }
    ),
  apellido: Yup.string()
    .matches(
      /^[a-zA-Z0áéíóúüÁÉÍÓÚÜñÑ][a-zA-Z0áéíóúüÁÉÍÓÚÜ\sñÑ]*$/,
      "El apellido no puede contener espacios en blanco"
    )
    // .trim("El apellido no puede consistir solo en espacios en blanco")
    .required("El apellido es obligatorio")
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no puede exceder los 50 caracteres"),
   segundo_apellido: Yup.string()
    .nullable()
   .notRequired()
   .test(
     "validar-segundo-apellido",
     "El segundo apellido debe tener entre 2 y 20 caracteres y no contener espacios en blanco",
     (value) => {
       if (!value) return true; // ✅ Si está vacío, pasa
       return (
         /^[a-zA-Z0áéíóúüÁÉÍÓÚÜñÑ][a-zA-Z0áéíóúüÁÉÍÓÚÜ\sñÑ]*$/.test(value) &&
         value.length >= 2 &&
         value.length <= 20
       );
     }
   ),
  documento_tipo: Yup.string().required("Selecciona un tipo de documento"),
  documento_numero: Yup.string()
    .required("El número de documento es obligatorio")
    .transform((value) => (value ? value.toUpperCase() : value))
    .when("documento_tipo", {
      is: (tipo) => ["PA", "PT", "CE"].includes(tipo),
      then: (schema) =>
        schema
          .matches(/^[A-Z0-9]+$/, "Solo puede contener letras (A-Z) y números")
          .min(5, "Debe tener al menos 5 caracteres")
          .max(15, "No puede exceder los 15 caracteres"),
      otherwise: (schema) =>
        schema
          .matches(/^[0-9]+$/, "Solo puede contener números")
          .min(5, "Debe tener al menos 5 dígitos")
          .max(15, "No puede exceder los 15 dígitos"),
    }),

  telefono: Yup.string()
    .required("El número de celular es obligatorio")
    .matches(/^\d+$/, "El número de celular solo debe contener dígitos")
    .min(10, "El número de celular debe tener al menos 10 dígitos")
    .max(15, "El número de documento no puede exceder los 15 dígitos"),
  correo: Yup.string()
    .email("Formato de correo electrónico inválido")
    .required("El correo electrónico es obligatorio"),
  correo_confirmacion: Yup.string()
    .required("Debes confirmar el correo")
    .oneOf([Yup.ref("correo"), null], "Los correos no coinciden"),
  descripcion: Yup.string()
    .required("La descripción es obligatoria")
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(500, "La descripción no puede exceder los 500 caracteres"),
  sede: Yup.string()
    .required("La sede es obligatoria")
    .max(100, "La sede no puede exceder los 100 caracteres"),
  servicio_prestado: Yup.string().required(
    "El servicio prestado es obligatorio"
  ),
  eps: Yup.string().required("La EPS es obligatoria"),
  politica_aceptada: Yup.boolean().oneOf(
    [true],
    "Debes aceptar la política de tratamiento de datos"
  ),
  clasificaciones: Yup.array()
    .min(1, "Debes seleccionar al menos una clasificación")
    .of(Yup.number()),
});

export default function FelicitacionForm() {
  const [form, setForm] = useState({
    nombre: "",
    segundo_nombre: "",
    apellido: "",
    segundo_apellido: "",
    documento_tipo: "",
    documento_numero: "",
    telefono: "",
    correo: "",
    correo_confirmacion: "",
    sede: "",
    servicio_prestado: "",
    eps: "",
    descripcion: "",
    politica_aceptada: false,
    clasificaciones: [],
  });

  const clasificacionesRef = useRef(null); // ✅ aquí se define el ref

  const [showClasificacionesDropdown, setShowClasificacionesDropdown] =
    useState(false);
  const [listaClasificaciones, setListaClasificaciones] = useState([]);

  // 🔹 Detectar clic fuera
useEffect(() => {
  const handleClickOutside = (e) => {
    if (clasificacionesRef.current && !clasificacionesRef.current.contains(e.target)) {
      setShowClasificacionesDropdown(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  useEffect(() => {
    const fetchClasificaciones = async () => {
      try {
        const res = await api.get("/clasificaciones");
        setListaClasificaciones(res.data);
      } catch (error) {
        console.error("Error al cargar las clasificaciones:", error);
      }
    };

    fetchClasificaciones();
  }, []);

  // 🔹 Manejo del checkbox
  const toggleClasificacion = (id) => {
    setForm((prev) => {
      const alreadySelected = prev.clasificaciones.includes(id);
      return {
        ...prev,
        clasificaciones: alreadySelected
          ? prev.clasificaciones.filter((c) => c !== id)
          : [...prev.clasificaciones, id],
      };
    });
  };

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
    "Positiva",
    "Particular",
  ];
  epsOptions.sort();

  const serviciosPorSede = {
    "Bogota-Norte": [
      "Hidroterapia",
      "Valoración por fisioterapia telemedicina",
      "Psiquiatría",
      "Fisiatría",
    ],
    "Bogota-Centro": [
      "Hidroterapia",
      "Valoración por fisioterapia telemedicina",
      "Programa de Rehabilitación",
    ],
    "Bogota-Sur-Occidente-Rehabilitación": [
      "Programa de Rehabilitación",
      "Neuropediatría",
      "Psiquiatría",
      "Fisiatría",
    ],
    "Bogota-Sur-Occidente-Hidroterapia": [
      "Hidroterapia",
      "Valoración por fisioterapia telemedicina",
    ],
    Ibague: [
      "Hidroterapia",
      "Valoración por fisioterapia telemedicina ",
      "Programa de Rehabilitación",
      "Neuropediatría",
      "Psiquiatría",
      "Fisiatría",
    ],
    Chia: [
      "Programa de Rehabilitación",
      "Neuropediatría",
      "Psiquiatría",
      "Fisiatría",
    ],
    Florencia: [
      "Programa de Rehabilitación",
      "Hidroterapía",
      "Valoración por fisioterapia telemedicina",
      "Neuropediatría",
      "Psiquiatría",
      "Fisiatría",
    ],
    "Cedritos-Divertido": ["Natación", "Yoga", "Pilates"],
  };

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Mejoramos el handleChange para que la validación sea más robusta
  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    let newForm = { ...form, [name]: val };

    // Si la sede cambia, resetea el servicio_prestado
    if (name === "sede") {
      newForm = { ...newForm, servicio_prestado: "" };
    }

    setForm(newForm);

    try {
      await felicitacionSchema.validateAt(name, newForm);
      setErrors((prev) => ({ ...prev, [name]: null }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, [name]: error.message }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Quieres enviar esta felicitación?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, enviar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });

    if (!result.isConfirmed) {
      return;
    }

    setLoading(true);

    try {
      // ✅ Validación del formulario completo
      await felicitacionSchema.validate(form, { abortEarly: false });
      setErrors({});

      // ✅ Incluimos clasificaciones y campos obligatorios por backend
      await api.post("/felicitaciones", {
        ...form,
        tipo_solicitud: "Felicitacion",
        registra_otro: "no",
      });

      Swal.fire({
        title: "¡Éxito!",
        text: "Tu felicitación fue enviada correctamente.",
        icon: "success",
      });

      // ✅ Reset del formulario, incluyendo clasificaciones
      setForm({
        nombre: "",
        segundo_nombre: "",
        apellido: "",
        segundo_apellido: "",
        documento_tipo: "",
        documento_numero: "",
        telefono: "",
        correo: "",
        correo_confirmacion: "",
        sede: "",
        servicio_prestado: "",
        eps: "",
        descripcion: "",
        politica_aceptada: false,
        clasificaciones: [], // 👈 se limpia también
      });
    } catch (error) {
      if (error.inner) {
        const formErrors = {};
        error.inner.forEach((err) => {
          formErrors[err.path] = err.message;
        });
        setErrors(formErrors);

        Swal.fire({
          title: "Faltan campos obligatorios",
          text: "Por favor completa todos los campos requeridos.",
          icon: "warning",
        });
      } else {
        console.error(error.response?.data || error);
        Swal.fire({
          title: "Error",
          text: "Hubo un error al enviar la felicitación.",
          icon: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="pqrs-container-felicitacion">
        <div className="header-pqrs">
          <div>
            Envía tu <span>Felicitación</span>
          </div>
            <h1 className="titulo-form-felicitacion">DATOS DEL PACIENTE-USUARIO:</h1>
        </div>

        <div className="pqrs-main">
          <form onSubmit={handleSubmit} className="pqrs" noValidate>            
            <input
              type="text"
              name="nombre"
              placeholder="Primer nombre"
              value={form.nombre}
              onChange={handleChange}
            />
            {errors.nombre && <p className="error">{errors.nombre}</p>}

            <input
              type="text"
              name="segundo_nombre"
              placeholder="Segundo nombre"
              value={form.segundo_nombre}
              onChange={handleChange}
            />
            {errors.segundo_nombre && (
              <p className="error">{errors.segundo_nombre}</p>
            )}

            <input
              type="text"
              name="apellido"
              placeholder="Primer apellido"
              value={form.apellido}
              onChange={handleChange}
            />
            {errors.apellido && <p className="error">{errors.apellido}</p>}

            <input
              type="text"
              name="segundo_apellido"
              placeholder="Segundo apellido"
              value={form.segundo_apellido}
              onChange={handleChange}
            />
            {errors.segundo_apellido && (
              <p className="error">{errors.segundo_apellido}</p>
            )}

            <select
              name="documento_tipo"
              value={form.documento_tipo}
              onChange={handleChange}
            >
              <option value="">Tipo de documento</option>
              <option value="CC">Cédula de ciudadanía</option>
              <option value="CD">Carné diplomático</option>
              <option value="CN">Certificado nacido vivo</option>
              <option value="CE">Cédula de extranjería</option>
              <option value="DC">Documento Extranjero</option>
              <option value="NIT">NIT</option>
              <option value="PA">Pasaporte</option>
              <option value="PE">Permiso Especial de Permanencia</option>
              <option value="PT">Permiso por Protección Temporal</option>
              <option value="RC">Registro Civil</option>
              <option value="SC">Salvo Conducto</option>
              <option value="TI">Tarjeta de identidad</option>
            </select>
            {errors.documento_tipo && (
              <p className="error">{errors.documento_tipo}</p>
            )}

            <input
              type="text"
              name="documento_numero"
              placeholder="Número de documento"
              value={form.documento_numero}
              onChange={handleChange}
            />
            {errors.documento_numero && (
              <p className="error">{errors.documento_numero}</p>
            )}

            <input
              type="text"
              name="telefono"
              placeholder="Número de celular"
              value={form.telefono}
              onChange={handleChange}
            />
            {errors.telefono && <p className="error">{errors.telefono}</p>}

            <input
              type="email"
              name="correo"
              placeholder="Correo electrónico"
              value={form.correo}
              onChange={handleChange}
            />
            {errors.correo && <p className="error">{errors.correo}</p>}

            <input
              type="email"
              name="correo_confirmacion"
              placeholder="Confirma tu correo"
              value={form.correo_confirmacion}
              onChange={handleChange}
            />
            {errors.correo_confirmacion && (
              <p className="error">{errors.correo_confirmacion}</p>
            )}

            <select name="eps" value={form.eps} onChange={handleChange}>
              <option value="">Selecciona tu EPS</option>
              {epsOptions.map((eps) => (
                <option key={eps} value={eps}>
                  {eps}
                </option>
              ))}
            </select>
            {errors.eps && <p className="error">{errors.eps}</p>}

            <select name="sede" value={form.sede} onChange={handleChange}>
              <option value="">Selecciona una sede</option>
              {Object.keys(serviciosPorSede).map((sede) => (
                <option key={sede} value={sede}>
                  {sede}
                </option>
              ))}
            </select>
            {errors.sede && <p className="error">{errors.sede}</p>}

            {form.sede && (
              <select
                name="servicio_prestado"
                value={form.servicio_prestado}
                onChange={handleChange}
              >
                <option value="">Selecciona un servicio</option>
                {serviciosPorSede[form.sede]?.map((servicio) => (
                  <option key={servicio} value={servicio}>
                    {servicio}
                  </option>
                ))}
              </select>
            )}
            {errors.servicio_prestado && (
              <p className="error">{errors.servicio_prestado}</p>
            )}

            {/* 🔹 Bloque de Clasificaciones con diseño tipo "select" */}
            <div className="clasificaciones-container" ref={clasificacionesRef}>
              {/* Caja que parece un select */}
              <div
                className="clasificaciones-select"
                onClick={() => setShowClasificacionesDropdown((prev) => !prev)}
              >
                <span
                  className={
                    Array.isArray(form.clasificaciones) &&
                    form.clasificaciones.length
                      ? "selected"
                      : "placeholder"
                  }
                >
                  {Array.isArray(form.clasificaciones) &&
                  form.clasificaciones.length
                    ? listaClasificaciones
                        .filter((c) => form.clasificaciones.includes(c.id))
                        .map((c) => c.nombre)
                        .join(", ")
                    : "Selecciona clasificaciones"}
                </span>
                <span
                  className={`clasificaciones-caret ${
                    showClasificacionesDropdown ? "open" : ""
                  }`}
                ></span>
              </div>

              {/* Lista de opciones con checkboxes */}
              {showClasificacionesDropdown && (
                <div
                  className="clasificaciones-options"
                  onClick={(e) => e.stopPropagation()}
                >
                  {listaClasificaciones
                    .filter(
                      (clasificacion) =>
                        ![
                          "Solicitudes de tesorería",
                          "Envío de historia clínica o informes finales",
                          "Política de multas por inasistencia",
                          "Reprogramación de citas",
                        ].includes(clasificacion.nombre) // 👈 Excluye estos nombres
                    )
                    .map((clasificacion) => (
                      <label
                        key={clasificacion.id}
                        className="clasificaciones-option"
                      >
                        <input
                          type="checkbox"
                          value={clasificacion.id}
                          checked={form.clasificaciones.includes(
                            clasificacion.id
                          )}
                          onChange={() => toggleClasificacion(clasificacion.id)}
                        />
                        <span>{clasificacion.nombre}</span>
                      </label>
                    ))}
                </div>
              )}

              {errors.clasificaciones && (
                <p className="error">{errors.clasificaciones}</p>
              )}
            </div>

            <textarea
              name="descripcion"
              placeholder="Describe tu felicitación"
              value={form.descripcion}
              onChange={handleChange}
              rows={5}
            />
            {errors.descripcion && (
              <p className="error">{errors.descripcion}</p>
            )}

            <div className="politica-box politica-box-compact">
              <label className="politica-label">
                <input
                  type="checkbox"
                  name="politica_aceptada"
                  checked={form.politica_aceptada}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      politica_aceptada: e.target.checked,
                    }))
                  }
                />
                <div className="politica-texto">
                  <span className="politica-descripcion">
                    Acepto la{" "}
                    <a
                      href="https://passusips.com/nosotros-politica-manejo-datos"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      política de tratamiento de datos personales
                    </a>{" "}
                    de Passus 👆, pues he leído y estoy de acuerdo con lo
                    expuesto en el manuscrito publicado. <br /> <br />
                    He Comprendido los{" "}
                    <a
                      href="https://passusips.com/nosotros-politica-agendamiento-web"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {" "}
                      Términos y condiciones de Servicio Web{" "}
                    </a>
                    de Passus 👆, pues he leído y estoy de acuerdo con lo
                    expuesto en la información publicada.
                  </span>
                </div>
              </label>
            </div>
            {errors.politica_aceptada && (
              <p className="error">{errors.politica_aceptada}</p>
            )}
            <button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Felicitación"}
            </button>
          </form>
          <div className="pqrs-solicitudes">
            {form.tipo_solicitud !== "Solicitud" && (
              <>
                <h3 className="titulo-clasificaciones">
                  CLASIFICACIÓN DE F-PQR
                </h3>
                <ul>
                  <li className="parrafo-clasificacion">
                    <strong>Agendamiento:</strong> Experiencia al programar,
                    cambiar o cancelar sus citas de manera ágil y oportuna.
                  </li>
                  <li className="parrafo-clasificacion">
                    <strong>Atención de profesional en salud:</strong> Calidad,
                    oportunidad y trato recibido por parte de terapeutas o
                    especialistas durante su atención.
                  </li>
                  <li className="parrafo-clasificacion">
                    <strong>Atención de personal administrativo:</strong>{" "}
                    Claridad, amabilidad y apoyo en trámites administrativos.
                  </li>
                  <li className="parrafo-clasificacion">
                    <strong>Atención en línea de frente (recepción):</strong>
                    Experiencia al ser recibido en la sede y acompañado en el
                    proceso de admisión.
                  </li>
                  <li className="parrafo-clasificacion">
                    <strong>Atención por el call center:</strong>
                    Facilidad de comunicación, tiempos de respuesta y
                    orientación recibida a través de la línea telefónica.
                  </li>
                  <li className="parrafo-clasificacion">
                    <strong>Proceso terapéutico:</strong>
                    Continuidad, calidad y acompañamiento durante su tratamiento
                    o rehabilitación.
                  </li>
                  <li className="parrafo-clasificacion">
                    <strong>Información y comunicación:</strong>
                    Claridad, oportunidad y precisión en la información recibida
                    sobre su atención y trámites.
                  </li>
                  <li className="parrafo-clasificacion">
                    <strong>Infraestructura:</strong>
                    Comodidad, accesibilidad y estado de las instalaciones:
                    consultorios, salas, zonas comunes, piscina, áreas
                    terapéuticas.
                  </li>
                  <li className="parrafo-clasificacion">
                    <strong>Orden y aseo:</strong>
                    Presentación, limpieza y condiciones de higiene en las
                    instalaciones.
                  </li>
                  <li className="parrafo-clasificacion">
                    <strong>Herramientas digitales:</strong>
                    Facilidad de uso y acceso a servicios digitales: página web,
                    agendamiento en línea y otras plataformas.
                  </li>
                </ul>
              </>
            )}

            {form.tipo_solicitud === "Solicitud" && (
              <>
                <h3 className="titulo-clasificaciones">
                  CLASIFICACIÓN DE SOLICITUDES
                </h3>
                <p className="parrafo-clasificacion">
                  Seleccione esta opción cuando lo que necesite sea un trámite o
                  gestión puntual:
                </p>
                <ul>
                  <li className="parrafo-clasificacion">
                    <strong>Agendamiento:</strong>
                    Agendar citas desde la Oficina Virtual
                  </li>
                  <li className="parrafo-clasificacion">
                    <strong>Solicitudes de tesorería:</strong>
                    Trámites relacionados con pagos, facturación o reembolsos.
                  </li>
                  <li className="parrafo-clasificacion">
                    <strong>
                      Envío de historia clínica o informes finales:
                    </strong>
                    Solicitud de copias de su historia clínica o reportes de
                    atención.
                  </li>
                  <li className="parrafo-clasificacion">
                    <strong>Política de multas por inasistencia</strong>
                    Consultas o solicitudes relacionadas con la aplicación de la
                    política de inasistencia a citas.
                  </li>
                  <li className="parrafo-clasificacion">
                    <strong>Reprogramación de citas:</strong>
                    Para programar o cambiar la fecha/hora de una cita.
                  </li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

// import React, { useState, useEffect } from "react";
// import * as Yup from "yup";
// import Swal from "sweetalert2";
// import { Footer } from "../components/Footer/Footer";
// import api from "../api/api";
// import axios from "axios";

// const felicitacionSchema = Yup.object().shape({
//   nombre: Yup.string()
//     .required("El nombre es obligatorio")
//     .min(2, "El nombre debe tener al menos 2 caracteres")
//     .max(50, "El nombre no puede exceder los 50 caracteres"),
//   segundo_nombre: Yup.string()
//     .max(50, "El segundo nombre no puede exceder los 50 caracteres")
//     .nullable(),
//   apellido: Yup.string()
//     .required("El apellido es obligatorio")
//     .min(2, "El apellido debe tener al menos 2 caracteres")
//     .max(50, "El apellido no puede exceder los 50 caracteres"),
//   segundo_apellido: Yup.string()
//     .max(50, "El segundo apellido no puede exceder los 50 caracteres")
//     .nullable(),
//   documento_tipo: Yup.string().required("Selecciona un tipo de documento"),
//   documento_numero: Yup.string()
//     .required("El número de documento es obligatorio")
//     .transform((value) => (value ? value.toUpperCase() : value))
//     .when("documento_tipo", {
//       is: (tipo) => ["PA", "PT", "CE"].includes(tipo),
//       then: (schema) =>
//         schema
//           .matches(/^[A-Z0-9]+$/, "Solo puede contener letras (A-Z) y números")
//           .min(5, "Debe tener al menos 5 caracteres")
//           .max(15, "No puede exceder los 15 caracteres"),
//       otherwise: (schema) =>
//         schema
//           .matches(/^[0-9]+$/, "Solo puede contener números")
//           .min(5, "Debe tener al menos 5 dígitos")
//           .max(15, "No puede exceder los 15 dígitos"),
//     }),

//   telefono: Yup.string()
//     .required("El número de celular es obligatorio")
//     .matches(/^\d+$/, "El número de celular solo debe contener dígitos")
//     .min(10, "El número de celular debe tener al menos 10 dígitos")
//     .max(15, "El número de documento no puede exceder los 15 dígitos"),
//   correo: Yup.string()
//     .email("Formato de correo electrónico inválido")
//     .required("El correo electrónico es obligatorio"),
//   correo_confirmacion: Yup.string()
//     .required("Debes confirmar el correo")
//     .oneOf([Yup.ref("correo"), null], "Los correos no coinciden"),
//   descripcion: Yup.string()
//     .required("La descripción es obligatoria")
//     .min(10, "La descripción debe tener al menos 10 caracteres")
//     .max(500, "La descripción no puede exceder los 500 caracteres"),
//   sede: Yup.string()
//     .required("La sede es obligatoria")
//     .max(100, "La sede no puede exceder los 100 caracteres"),
//   servicio_prestado: Yup.string().required(
//     "El servicio prestado es obligatorio"
//   ),
//   eps: Yup.string().required("La EPS es obligatoria"),
//   politica_aceptada: Yup.boolean().oneOf(
//     [true],
//     "Debes aceptar la política de tratamiento de datos"
//   ),
//   clasificaciones: Yup.array()
//     .min(1, "Debes seleccionar al menos una clasificación")
//     .of(Yup.number()),
// });

// export default function FelicitacionForm() {
//   const [form, setForm] = useState({
//     nombre: "",
//     segundo_nombre: "",
//     apellido: "",
//     segundo_apellido: "",
//     documento_tipo: "",
//     documento_numero: "",
//     telefono: "",
//     correo: "",
//     correo_confirmacion: "",
//     sede: "",
//     servicio_prestado: "",
//     eps: "",
//     descripcion: "",
//     politica_aceptada: false,
//     clasificaciones: [],
//   });

//   const [listaClasificaciones, setListaClasificaciones] = useState([]);

// useEffect(() => {
//   const fetchClasificaciones = async () => {
//     try {
//       const res = await api.get("/clasificaciones");
//       setListaClasificaciones(res.data);
//     } catch (error) {
//       console.error("Error al cargar las clasificaciones:", error);
//     }
//   };

//   fetchClasificaciones();
// }, []);

//   // 🔹 Manejo del checkbox
//   const toggleClasificacion = (id) => {
//     setForm((prev) => {
//       const alreadySelected = prev.clasificaciones.includes(id);
//       return {
//         ...prev,
//         clasificaciones: alreadySelected
//           ? prev.clasificaciones.filter((c) => c !== id)
//           : [...prev.clasificaciones, id],
//       };
//     });
//   };

//   const epsOptions = [
//     "Compensar",
//     "Fomag",
//     "Famisanar",
//     "Nueva Eps",
//     "Sanitas",
//     "Sura",
//     "Aliansalud",
//     "Asmet Salud",
//     "Seguros Bolivar",
//     "Cafam",
//     "Colmédica",
//     "Positiva",
//     "Particular",
//   ];
//   epsOptions.sort();

//   const serviciosPorSede = {
//     "Bogota-Norte": [
//       "Hidroterapia",
//       "Valoración por fisioterapia telemedicina",
//       "Psiquiatría",
//       "Fisiatría",
//     ],
//     "Bogota-Centro": [
//       "Hidroterapia",
//       "Valoración por fisioterapia telemedicina",
//       "Programa de Rehabilitación",
//     ],
//     "Bogota-Sur-Occidente-Rehabilitación": [
//       "Programa de Rehabilitación",
//       "Neuropediatría",
//       "Psiquiatría",
//       "Fisiatría",
//     ],
//     "Bogota-Sur-Occidente-Hidroterapia": [
//       "Hidroterapia",
//       "Valoración por fisioterapia telemedicina",
//     ],
//     Ibague: [
//       "Hidroterapia",
//       "Valoración por fisioterapia telemedicina ",
//       "Programa de Rehabilitación",
//       "Neuropediatría",
//       "Psiquiatría",
//       "Fisiatría",
//     ],
//     Chia: [
//       "Programa de Rehabilitación",
//       "Neuropediatría",
//       "Psiquiatría",
//       "Fisiatría",
//     ],
//     Florencia: [
//       "Programa de Rehabilitación",
//       "Hidroterapía",
//       "Valoración por fisioterapia telemedicina",
//       "Neuropediatría",
//       "Psiquiatría",
//       "Fisiatría",
//     ],
//     "Cedritos-Divertido": ["Natación", "Yoga", "Pilates"],
//   };

//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);

//   // Mejoramos el handleChange para que la validación sea más robusta
//   const handleChange = async (e) => {
//     const { name, value, type, checked } = e.target;
//     const val = type === "checkbox" ? checked : value;

//     let newForm = { ...form, [name]: val };

//     // Si la sede cambia, resetea el servicio_prestado
//     if (name === "sede") {
//       newForm = { ...newForm, servicio_prestado: "" };
//     }

//     setForm(newForm);

//     try {
//       await felicitacionSchema.validateAt(name, newForm);
//       setErrors((prev) => ({ ...prev, [name]: null }));
//     } catch (error) {
//       setErrors((prev) => ({ ...prev, [name]: error.message }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const result = await Swal.fire({
//       title: "¿Estás seguro?",
//       text: "¿Quieres enviar esta felicitación?",
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonText: "Sí, enviar",
//       cancelButtonText: "Cancelar",
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//     });

//     if (!result.isConfirmed) {
//       return;
//     }

//     setLoading(true);

//     try {
//       // ✅ Validación del formulario completo
//       await felicitacionSchema.validate(form, { abortEarly: false });
//       setErrors({});

//       // ✅ Incluimos clasificaciones y campos obligatorios por backend
//       await api.post("/felicitaciones", {
//         ...form,
//         tipo_solicitud: "Felicitacion",
//         registra_otro: "no",
//       });

//       Swal.fire({
//         title: "¡Éxito!",
//         text: "Tu felicitación fue enviada correctamente.",
//         icon: "success",
//       });

//       // ✅ Reset del formulario, incluyendo clasificaciones
//       setForm({
//         nombre: "",
//         segundo_nombre: "",
//         apellido: "",
//         segundo_apellido: "",
//         documento_tipo: "",
//         documento_numero: "",
//         telefono: "",
//         correo: "",
//         correo_confirmacion: "",
//         sede: "",
//         servicio_prestado: "",
//         eps: "",
//         descripcion: "",
//         politica_aceptada: false,
//         clasificaciones: [], // 👈 se limpia también
//       });
//     } catch (error) {
//       if (error.inner) {
//         const formErrors = {};
//         error.inner.forEach((err) => {
//           formErrors[err.path] = err.message;
//         });
//         setErrors(formErrors);

//         Swal.fire({
//           title: "Faltan campos obligatorios",
//           text: "Por favor completa todos los campos requeridos.",
//           icon: "warning",
//         });
//       } else {
//         console.error(error.response?.data || error);
//         Swal.fire({
//           title: "Error",
//           text: "Hubo un error al enviar la felicitación.",
//           icon: "error",
//         });
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <div className="pqrs-container-felicitacion">
//         <div className="header-pqrs">
//           <div>
//             Envía tu <span>Felicitación</span>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="pqrs" noValidate>
//           <input
//             type="text"
//             name="nombre"
//             placeholder="Primer nombre"
//             value={form.nombre}
//             onChange={handleChange}
//           />
//           {errors.nombre && <p className="error">{errors.nombre}</p>}

//           <input
//             type="text"
//             name="segundo_nombre"
//             placeholder="Segundo nombre"
//             value={form.segundo_nombre}
//             onChange={handleChange}
//           />
//           {errors.segundo_nombre && (
//             <p className="error">{errors.segundo_nombre}</p>
//           )}

//           <input
//             type="text"
//             name="apellido"
//             placeholder="Primer apellido"
//             value={form.apellido}
//             onChange={handleChange}
//           />
//           {errors.apellido && <p className="error">{errors.apellido}</p>}

//           <input
//             type="text"
//             name="segundo_apellido"
//             placeholder="Segundo apellido"
//             value={form.segundo_apellido}
//             onChange={handleChange}
//           />
//           {errors.segundo_apellido && (
//             <p className="error">{errors.segundo_apellido}</p>
//           )}

//           <select
//             name="documento_tipo"
//             value={form.documento_tipo}
//             onChange={handleChange}
//           >
//             <option value="">Tipo de documento</option>
//             <option value="CC">Cédula</option>
//             <option value="CD">Carné diplomático</option>
//             <option value="CN">Certificado nacido vivo</option>
//             <option value="CE">Cédula de extranjería</option>
//             <option value="DC">Documento Extranjero</option>
//             <option value="NIT">NIT</option>
//             <option value="PA">Pasaporte</option>
//             <option value="PE">Permiso Especial de Permanencia</option>
//             <option value="PT">Permiso por Protección Temporal</option>
//             <option value="RC">Registro Civil</option>
//             <option value="SC">Salvo Conducto</option>
//             <option value="TI">Tarjeta de identidad</option>
//           </select>
//           {errors.documento_tipo && (
//             <p className="error">{errors.documento_tipo}</p>
//           )}

//           <input
//             type="text"
//             name="documento_numero"
//             placeholder="Número de documento"
//             value={form.documento_numero}
//             onChange={handleChange}
//           />
//           {errors.documento_numero && (
//             <p className="error">{errors.documento_numero}</p>
//           )}

//           <input
//             type="text"
//             name="telefono"
//             placeholder="Número de celular"
//             value={form.telefono}
//             onChange={handleChange}
//           />
//           {errors.telefono && <p className="error">{errors.telefono}</p>}

//           <input
//             type="email"
//             name="correo"
//             placeholder="Correo electrónico"
//             value={form.correo}
//             onChange={handleChange}
//           />
//           {errors.correo && <p className="error">{errors.correo}</p>}

//           <input
//             type="email"
//             name="correo_confirmacion"
//             placeholder="Confirma tu correo"
//             value={form.correo_confirmacion}
//             onChange={handleChange}
//           />
//           {errors.correo_confirmacion && (
//             <p className="error">{errors.correo_confirmacion}</p>
//           )}

//           <select name="eps" value={form.eps} onChange={handleChange}>
//             <option value="">Selecciona tu EPS</option>
//             {epsOptions.map((eps) => (
//               <option key={eps} value={eps}>
//                 {eps}
//               </option>
//             ))}
//           </select>
//           {errors.eps && <p className="error">{errors.eps}</p>}

//           <select name="sede" value={form.sede} onChange={handleChange}>
//             <option value="">Selecciona una sede</option>
//             {Object.keys(serviciosPorSede).map((sede) => (
//               <option key={sede} value={sede}>
//                 {sede}
//               </option>
//             ))}
//           </select>
//           {errors.sede && <p className="error">{errors.sede}</p>}

//           {form.sede && (
//             <select
//               name="servicio_prestado"
//               value={form.servicio_prestado}
//               onChange={handleChange}
//             >
//               <option value="">Selecciona un servicio</option>
//               {serviciosPorSede[form.sede]?.map((servicio) => (
//                 <option key={servicio} value={servicio}>
//                   {servicio}
//                 </option>
//               ))}
//             </select>
//           )}
//           {errors.servicio_prestado && (
//             <p className="error">{errors.servicio_prestado}</p>
//           )}

//           {/* 🔹 Bloque de clasificaciones */}
//           <div>
//             <h3 className="font-bold mb-2">Clasificaciones</h3>
//             {listaClasificaciones.map((clasificacion) => (
//               <label key={clasificacion.id} className="block">
//                 <input
//                   type="checkbox"
//                   value={clasificacion.id}
//                   checked={form.clasificaciones.includes(clasificacion.id)}
//                   onChange={() => toggleClasificacion(clasificacion.id)}
//                 />
//                 <span className="ml-2">{clasificacion.nombre}</span>
//               </label>
//             ))}
//           </div>

//           <textarea
//             name="descripcion"
//             placeholder="Describe tu felicitación"
//             value={form.descripcion}
//             onChange={handleChange}
//             rows={5}
//           />
//           {errors.descripcion && <p className="error">{errors.descripcion}</p>}

//           <div className="politica-box politica-box-compact">
//             <label className="politica-label">
//               <input
//                 type="checkbox"
//                 name="politica_aceptada"
//                 checked={form.politica_aceptada}
//                 onChange={(e) =>
//                   setForm((prev) => ({
//                     ...prev,
//                     politica_aceptada: e.target.checked,
//                   }))
//                 }
//               />
//               <div className="politica-texto">
//                 <span className="politica-descripcion">
//                   Acepto la{" "}
//                   <a
//                     href="https://passusips.com/nosotros-politica-manejo-datos"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                   >
//                     política de tratamiento de datos personales
//                   </a>{" "}
//                   de Passus 👆, pues he leído y estoy de acuerdo con lo expuesto
//                   en el manuscrito publicado. <br /> <br />
//                   He Comprendido los{" "}
//                   <a
//                     href="https://passusips.com/nosotros-politica-agendamiento-web"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                   >
//                     {" "}
//                     Términos y condiciones de Servicio Web{" "}
//                   </a>
//                   de Passus 👆, pues he leído y estoy de acuerdo con lo expuesto
//                   en la información publicada.
//                 </span>
//               </div>
//             </label>
//           </div>
//           {errors.politica_aceptada && (
//             <p className="error">{errors.politica_aceptada}</p>
//           )}
//           <button type="submit" disabled={loading}>
//             {loading ? "Enviando..." : "Enviar Felicitación"}
//           </button>
//         </form>
//       </div>
//       <Footer />
//     </>
//   );
// }
