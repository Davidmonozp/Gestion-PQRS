// TutelaForm.jsx
import React, { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { createTutela } from "./pqrsService";
import "./styles/Pqrs.css";
import { Footer } from "../components/Footer/Footer";


// --- Constantes (puedes importarlas si ya existen) ---
const epsOptions = [
  "Compensar", "Fomag", "Famisanar", "Nueva Eps", "Sanitas", "Sura",
  "Aliansalud", "Asmet Salud", "Seguros Bolivar", "Cafam", "Colmédica",
  "Positiva", "Particular"
].sort();

const serviciosPorSede = {
  "Bogota-Norte": ["Hidroterapia", "Valoración por fisioterapia telemedicina", "Psiquiatría", "Fisiatría"],
  "Bogota-Centro": ["Hidroterapia", "Valoración por fisioterapia telemedicina", "Programa de Rehabilitación"],
  "Bogota-Sur-Occidente-Rehabilitación": ["Programa de Rehabilitación", "Neuropediatría", "Psiquiatría", "Fisiatría"],
  "Bogota-Sur-Occidente-Hidroterapia": ["Hidroterapia", "Valoración por fisioterapia telemedicina"],
  Ibague: ["Hidroterapia", "Valoración por fisioterapia telemedicina", "Programa de Rehabilitación", "Neuropediatría", "Psiquiatría", "Fisiatría"],
  Chia: ["Programa de Rehabilitación", "Neuropediatría", "Psiquiatría", "Fisiatría"],
  Florencia: ["Programa de Rehabilitación", "Hidroterapía", "Valoración por fisioterapia telemedicina", "Neuropediatría", "Psiquiatría", "Fisiatría"],
  Divertido: ["Natación", "Yoga", "Pilates"],
};
const epsRegimenMap = {
  Compensar: ["Contributivo", "Subsidiado"],
  Fomag: ["Especial"],
  Famisanar: ["Contributivo", "Subsidiado"],
  "Nueva Eps": ["Contributivo", "Subsidiado"],
  Sanitas: ["Contributivo", "Subsidiado"],
  Sura: ["Contributivo", "Subsidiado"],
  Aliansalud: ["Contributivo"],
  "Asmet Salud": ["Contributivo", "Subsidiado"],
  "Seguros Bolivar": ["ARL"],
  Cafam: ["Contributivo", "Subsidiado"],
  Colmédica: ["Medicina prepagada"],
  Positiva: ["ARL"],
  Particular: ["Particular"],
};

const parentesco = [
  "Fiscalía",
  "Juzgado",
  "Aseguradora",
  "Secretaria",
  "Otros entes de control"
];
parentesco.sort();
const MAX_CARACTERES_DESCRIPCION = 1500;

// --- Yup schema acorde al controlador PqrTutelaController ---
const tutelaSchema = Yup.object().shape({
  nombre: Yup.string().required("El primer nombre es requerido"),
  segundo_nombre: Yup.string().nullable(),
  apellido: Yup.string().required("El apellido es requerido"),
  segundo_apellido: Yup.string().nullable(),
  documento_tipo: Yup.string().required("Tipo de documento es requerido"),
  documento_numero: Yup.string()
    .required("Número de documento es requerido")
    .test("len-range", "El número de documento debe tener entre 5 y 15 caracteres", (val) => {
      if (!val) return false;
      return val.length >= 5 && val.length <= 15;
    })
    .test("chars-by-type", "Número de documento inválido", function (val) {
      const tipo = this.parent.documento_tipo;
      if (!tipo || !val) return true;
      const upper = String(tipo).toUpperCase();
      if (["PA", "PT", "CE"].includes(upper)) {
        return /^[A-Za-z0-9]+$/.test(val);
      }
      return /^[0-9]+$/.test(val);
    }),
  correo: Yup.string()
    .email("Formato de correo electrónico inválido")
    .required("El correo electrónico es obligatorio"),

  correo_confirmacion: Yup.string()
    .oneOf([Yup.ref("correo"), null], "Los correos no coinciden")
    .required("La confirmación de correo es obligatoria"),
  telefono: Yup.string()
    .required("El teléfono es obligatorio")
    .matches(
      /^\d{10}$/,
      "El teléfono debe tener 10 dígitos numéricos"
    ),
  sede: Yup.string().required("Sede es requerida"),
  servicio_prestado: Yup.string().required("Servicio prestado es requerido"),
  eps: Yup.string().required("EPS es requerida"),
  regimen: Yup.string().required("Seleccione el tipo de afiliación al cual pertenece"),
  descripcion: Yup.string()
    .required("La descripción es obligatoria")
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(3000, "La descripción no puede exceder los 3000 caracteres"),
  archivos: Yup.mixed().nullable(),
  archivos_adicionales: Yup.mixed().nullable(),
  registra_otro: Yup.string().oneOf(["si", "no"]).required(),
  politica_aceptada: Yup.boolean().oneOf(
    [true],
    "Debes aceptar la política de tratamiento de datos"
  ),

  // campos condicionales para registra_otro = 'si'
  clasificacion_tutela: Yup.string().when("tipo_solicitud", {
    is: "Tutela",
    then: (schema) =>
      schema.required("Debes seleccionar una clasificación para la tutela."),
    otherwise: (schema) => schema.notRequired().nullable(), // <-- Esta es la línea corregida
  }),
  radicado_juzgado: Yup.string()
    .max(255, "Máximo 255 caracteres")
    .when("tipo_solicitud", {
      is: "Tutela",
      then: (schema) => schema.required("El radicado del juzgado es obligatorio"),
      otherwise: (schema) => schema.nullable(),
    }),
  tipo_solicitud: Yup.string()
    .required("Selecciona un tipo de solicitud"),

  parentesco: Yup.string().when("registra_otro", {
    is: "si",
    then: (schema) =>
      schema
        .required("El parentesco o entidad es obligatorio")
        .min(3, "El parentesco debe tener al menos 3 caracteres")
        .max(50, "El parentesco no puede exceder los 50 caracteres"),
    otherwise: (schema) =>
      schema
        .notRequired()
        .transform((_, originalValue) =>
          originalValue === "" ? undefined : originalValue
        ),
  }),
  // nombre_juzgado: Yup.string().when("registra_otro", {
  //   is: (val) => val === "si",
  //   then: Yup.string().required("Nombre del juzgado es requerido"),
  //   otherwise: Yup.string().nullable(),
  // }),
  nombre_juzgado: Yup.string().when("registra_otro", {
    is: "si",
    then: (schema) =>
      schema
        .matches(
          /^(?!\s)(?!.*\s$)[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ]+$/,
          "El nombre del juzgado solo puede contener letras, números y espacios (no al inicio o final)"
        )
        .required("Nombre del juzgado es requerido")
        .min(2, "El nombre del juzgado debe tener al menos 2 caracteres")
        .max(50, "El nombre del juzgado no puede exceder los 50 caracteres"),
    otherwise: (schema) =>
      schema
        .notRequired()
        .transform((_, originalValue) =>
          originalValue === "" ? undefined : originalValue
        ),
  }),

  // nombre_juez: Yup.string().when("registra_otro", {
  //   is: (val) => val === "si",
  //   then: Yup.string().required("Nombre del juez es requerido"),
  //   otherwise: Yup.string().nullable(),
  // }),
  nombre_juez: Yup.string().when("registra_otro", {
    is: "si",
    then: (schema) =>
      schema
        .matches(
          /^[a-zA-Z0áéíóúüÁÉÍÓÚÜñÑ][a-zA-Z0áéíóúüÁÉÍÓÚÜ\sñÑ]*$/,
          "El nombre del juez no puede contener espacios en blanco"
        )
        // .trim("El nombre no puede consistir solo en espacios en blanco")
        .required("El nombre del juez es requerido")
        .min(2, "El nombre del juez debe tener al menos 2 caracteres")
        .max(
          20,
          "El nombre del juez no puede exceder los 20 caracteres"
        ),
    otherwise: (schema) =>
      schema
        .notRequired()
        .transform((_, originalValue) =>
          originalValue === "" ? undefined : originalValue
        ),
  }),
  registrador_correo: Yup.string().when("registra_otro", {
    is: "si",
    then: (schema) =>
      schema
        .required("Debe anexar al menos un correo")
        .test(
          "multiple-emails",
          "El correo tiene un formato inválido",
          // "Uno o más correos tienen un formato inválido",
          (value) => {
            if (!value) return false; // requerido
            const correos = value.split(",").map((c) => c.trim());
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return correos.every((c) => regex.test(c));
          }
        ),
    otherwise: (schema) =>
      schema
        .notRequired()
        .transform((_, originalValue) =>
          originalValue === "" ? undefined : originalValue
        )
        .test(
          "multiple-emails",
          "Uno o más correos tienen un formato inválido",
          (value) => {
            if (!value) return true; // si no es requerido, dejar pasar vacío
            const correos = value.split(",").map((c) => c.trim());
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return correos.every((c) => regex.test(c));
          }
        ),
  }),
});

// --- Componente ---
export default function TutelaForm() {
  const [form, setForm] = useState({
    nombre: "",
    segundo_nombre: "",
    apellido: "",
    segundo_apellido: "",
    documento_tipo: "",
    documento_numero: "",
    correo: "",
    correo_confirmacion: "",
    telefono: "",
    sede: "",
    servicio_prestado: "",
    eps: "",
    regimen: "",
    tipo_solicitud: "Tutela", // por defecto para tutela
    radicado_juzgado: "",
    clasificacion_tutela: "",
    accionado: [], // ["Asegurador","Passus"]
    descripcion: "",
    politica_aceptada: false,
    registra_otro: "no",
    nombre_juzgado: "",
    nombre_juez: "",
    registrador_correo: "", // string; se convierte en array al enviar
    parentesco: "",
    fecha_inicio_real: "",
    clasificaciones: [],
  });

  // --- Estados para el dropdown Accionado ---
  const [showAccionadoDropdown, setShowAccionadoDropdown] = useState(false);
  const accionadoRef = useRef(null);
  const [archivos, setArchivos] = useState([]);


  // Cerrar dropdown al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (accionadoRef.current && !accionadoRef.current.contains(e.target)) {
        setShowAccionadoDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const accionadoOptions = ["Asegurador", "Passus"];

  // Si cambias de sede, limpiar servicio
  useEffect(() => {
    setForm((prev) => ({ ...prev, servicio_prestado: "" }));
    // eslint-disable-next-line
  }, [form.sede]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "accionado") {
      // checkbox multiple
      setForm((prev) => {
        const next = new Set(prev.accionado || []);
        if (checked) next.add(value);
        else next.delete(value);
        return { ...prev, accionado: Array.from(next) };
      });
      return;
    }

    if (name === "politica_aceptada") {
      setForm((prev) => ({ ...prev, politica_aceptada: checked }));
      return;
    }

    if (name === "registra_otro") {
      setForm((prev) => ({ ...prev, registra_otro: value }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateField = async (fieldName) => {
    try {
      await tutelaSchema.validateAt(fieldName, form);
      setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [fieldName]: err.message }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    validateField(name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validación completa
      await tutelaSchema.validate(form, { abortEarly: false });

      // Preparar payload
      const payload = { ...form };

      // Convertir correos múltiples
      if (form.registrador_correo) {
        payload.registrador_correo = form.registrador_correo
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else {
        payload.registrador_correo = [];
      }

      // Convertir accionado en array
      if (!Array.isArray(payload.accionado)) {
        payload.accionado = payload.accionado ? [payload.accionado] : [];
      }

      // 👉 **AQUÍ lo crítico: agregar los archivos**
      payload.archivos = archivos;           // tus archivos principales
      payload.archivos_adicionales = [];     // si aún no usas estos

      // Enviar al backend
      const response = await createTutela(payload);

      Swal.fire({
        icon: "success",
        title: "Registrada",
        text: "Tutela registrada con éxito",
        confirmButtonColor: "#00933f",
      });

      // Resetear formulario
      setForm({
        nombre: "",
        segundo_nombre: "",
        apellido: "",
        segundo_apellido: "",
        documento_tipo: "",
        documento_numero: "",
        correo: "",
        correo_confirmacion: "",
        telefono: "",
        sede: "",
        servicio_prestado: "",
        eps: "",
        regimen: "",
        tipo_solicitud: "Tutela",
        radicado_juzgado: "",
        clasificacion_tutela: "",
        accionado: [],
        descripcion: "",
        politica_aceptada: false,
        registra_otro: "no",
        nombre_juzgado: "",
        nombre_juez: "",
        registrador_correo: "",
        parentesco: "",
        fecha_inicio_real: "",
        clasificaciones: [],
      });

      setArchivos([]); // ❗ limpiar archivos también

    } catch (err) {
      if (err.name === "ValidationError" && err.inner) {
        const yupErrors = {};
        err.inner.forEach((eItem) => {
          if (!yupErrors[eItem.path]) {
            yupErrors[eItem.path] = eItem.message;
          }
        });
        setErrors(yupErrors);
        Swal.fire({
          icon: "error",
          title: "Hay errores en el formulario",
          html: Object.values(yupErrors)
            .map((m) => `<div>${m}</div>`)
            .join(""),
          confirmButtonColor: "#d33",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err?.message || "Error procesando la solicitud",
          confirmButtonColor: "#d33",
        });
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div className="pqrs-container">
        <div className="header-pqrs">
          <div>
            Envía tu <span>Tutela</span>
          </div>
          <label className="registra-otro-label">
            ¿Está registrando esta solicitud a nombre de otra persona o
            entidad?
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
          {errors.registra_otro && (
            <p className="error">{errors.registra_otro}</p>
          )}
        </div>
        <br />



        <div className="section-clasificaciones">
          <form onSubmit={handleSubmit} className="pqrs" noValidate>

            {/* Campos que SOLO aparecen y se validan cuando registra_otro === 'si' */}
            {form.registra_otro === "si" && (
              <>
                <h1 className="titulo-form">
                  DATOS DE QUIEN REGISTRA LA TUTELA:
                </h1>
                <br />
                <div className="pqrs-paciente">


                  <div className="floating-label">
                    <input name="nombre_juzgado" placeholder="Nombre del juzgado" value={form.nombre_juzgado} onChange={handleChange} onBlur={handleBlur} />
                    {errors.nombre_juzgado && <p className="error">{errors.nombre_juzgado}</p>}
                  </div>

                  <div className="floating-label">
                    <input name="nombre_juez" placeholder="Nombre completo del juez" value={form.nombre_juez} onChange={handleChange} onBlur={handleBlur} />
                    {errors.nombre_juez && <p className="error">{errors.nombre_juez}</p>}
                  </div>

                  <div className="floating-label">
                    <select
                      id="parentesco"
                      name="parentesco"
                      value={form.parentesco}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    >
                      <option value="" disabled hidden></option>
                      {parentesco.map((opcion) => (
                        <option key={opcion} value={opcion}>
                          {opcion}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="parentesco">Entidad</label>
                    {errors.parentesco && (
                      <p className="error">{errors.parentesco}</p>
                    )}
                  </div>

                  <div className="floating-label">
                    <select
                      name="tipo_solicitud"
                      value={form.tipo_solicitud}
                      onChange={handleChange}
                      onBlur={handleBlur}>
                      <option value="Tutela">Tutela</option>
                    </select>
                    {errors.tipo_solicitud && <p className="error">{errors.tipo_solicitud}</p>}
                  </div>



                  <div className="floating-label">
                    <select
                      id="clasificacion_tutela"
                      name="clasificacion_tutela"
                      value={form.clasificacion_tutela}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    >
                      <option value="" disabled hidden></option>
                      <option value="Acción de tutela o Avoco">
                        Acción de tutela o Avoco
                      </option>
                      <option value="Sentencia o Fallo Tutela">
                        Sentencia o Fallo Tutela
                      </option>
                      <option value="Incidente o apertura de Desacato">
                        Incidente o apertura de Desacato
                      </option>
                      <option value="Desacato">Desacato</option>
                    </select>
                    <label htmlFor="clasificacion_tutela">
                      Clasificación de la tutela
                    </label>
                    {errors.clasificacion_tutela && (
                      <p className="error">{errors.clasificacion_tutela}</p>
                    )}
                  </div>


                  <div className="floating-label">
                    <input
                      id="radicado_juzgado"
                      name="radicado_juzgado"
                      type="text"
                      value={form.radicado_juzgado}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    <label htmlFor="radicado_juzgado">Radicado del juzgado</label>
                    {errors.radicado_juzgado && (
                      <p className="error">{errors.radicado_juzgado}</p>
                    )}
                  </div>

                  {form.tipo_solicitud === "Tutela" && (
                    <div
                      className="accionado-container"
                      ref={accionadoRef}
                      style={{ position: "relative" }}
                    >
                      {/* <label className="accionado-label">Accionado</label> */}
                      <div
                        className="accionado-select"
                        onClick={() => setShowAccionadoDropdown((prev) => !prev)}
                      >
                        <span
                          className={
                            Array.isArray(form.accionado) && form.accionado.length
                              ? "selected"
                              : "placeholder"
                          }
                        >
                          {Array.isArray(form.accionado) && form.accionado.length
                            ? form.accionado.join(", ")
                            : "Accionado"}
                        </span>
                        <span
                          className={`accionado-caret ${showAccionadoDropdown ? "open" : ""
                            }`}
                        ></span>
                      </div>

                      {/* Lista desplegable; stopPropagation evita que el click cierre el menú */}
                      {showAccionadoDropdown && (
                        <div
                          className="accionado-options"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {["Asegurador", "Passus"].map((opcion) => (
                            <label key={opcion} className="accionado-option">
                              <input
                                type="checkbox"
                                value={opcion}
                                checked={
                                  Array.isArray(form.accionado) &&
                                  form.accionado.includes(opcion)
                                }
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setForm((prev) => {
                                    const current = Array.isArray(prev.accionado)
                                      ? prev.accionado
                                      : [];
                                    const updated = checked
                                      ? [...current, opcion]
                                      : current.filter((i) => i !== opcion);
                                    return { ...prev, accionado: updated };
                                  });
                                }}
                              />
                              <span>{opcion}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {errors.accionado && (
                        <p className="error">{errors.accionado}</p>
                      )}
                    </div>
                  )}

                  <div className="floating-label">
                    <input
                      id="registrador_correo"
                      name="registrador_correo"
                      type="text"
                      value={form.registrador_correo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    <label htmlFor="registrador_correo">
                      Correos a notificar
                    </label>
                    {/* <label htmlFor="registrador_correo">Correo(s) del registrador</label>
  <small className="text-gray-500">
    Puedes ingresar varios correos separados por coma. Ej: juan@mail.com, maria@mail.com
  </small> */}
                    {errors.registrador_correo && (
                      <p className="error">{errors.registrador_correo}</p>
                    )}
                  </div>

                  {/* <select name="parentesco" value={form.parentesco} onChange={handleChange} onBlur={handleBlur}>
                  <option value="">Parentesco o entidad</option>
                  {parentesco.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.parentesco && <p className="error">{errors.parentesco}</p>} */}

                  {/* <input name="nombre_juzgado" placeholder="Nombre del juzgado" value={form.nombre_juzgado} onChange={handleChange} onBlur={handleBlur} />
                {errors.nombre_juzgado && <p className="error">{errors.nombre_juzgado}</p>} */}

                  {/* <input name="nombre_juez" placeholder="Nombre del juez" value={form.nombre_juez} onChange={handleChange} onBlur={handleBlur} />
                {errors.nombre_juez && <p className="error">{errors.nombre_juez}</p>} */}
                </div>


              </>

            )}

            {/* Datos básicos */}
            <h1 className="titulo-form-tutela">DATOS DEL PACIENTE-USUARIO:</h1> <br />
            <div className="pqrs-paciente">
              <div className="floating-label">
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                <label htmlFor="nombre">Primer nombre</label>
                {errors.nombre && <p className="error">{errors.nombre}</p>}
              </div>

              <div className="floating-label">
                <input
                  type="text"
                  name="segundo_nombre"
                  value={form.segundo_nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                <label htmlFor="nombre">Segundo nombre</label>
                {errors.segundo_nombre && (
                  <p className="error">{errors.segundo_nombre}</p>
                )}
              </div>

              <div className="floating-label">
                <input
                  type="text"
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                <label htmlFor="apellido">Primer apellido</label>
                {errors.apellido && <p className="error">{errors.apellido}</p>}
              </div>

              <div className="floating-label">
                <input
                  type="text"
                  name="segundo_apellido"
                  value={form.segundo_apellido}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                <label htmlFor="apellido">Segundo apellido</label>
                {errors.segundo_apellido && (
                  <p className="error">{errors.segundo_apellido}</p>
                )}
              </div>

              <div className="floating-label">
                <select
                  id="documento_tipo"
                  name="documento_tipo"
                  value={form.documento_tipo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                >
                  <option value="" disabled hidden></option>
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
                <label htmlFor="documento_tipo">Tipo de documento</label>
                {errors.documento_tipo && (
                  <p className="error">{errors.documento_tipo}</p>
                )}
              </div>


              <div className="floating-label">
                <input
                  type="text"
                  id="documento_numero"
                  name="documento_numero"
                  value={form.documento_numero}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                <label htmlFor="documento_numero">Número de documento</label>
                {errors.documento_numero && (
                  <p className="error">{errors.documento_numero}</p>
                )}
              </div>


              <div className="floating-label">
                <input
                  id="telefono"
                  name="telefono"
                  type="text"
                  value={form.telefono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                <label htmlFor="telefono">Número de Celular</label>
                {errors.telefono && <p className="error">{errors.telefono}</p>}
              </div>

              <div className="floating-label">
                <input
                  id="correo"
                  name="correo"
                  type="email"
                  value={form.correo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                <label htmlFor="correo">Correo</label>
                {errors.correo && <p className="error">{errors.correo}</p>}
              </div>

              <div className="floating-label">
                <input
                  id="correo_confirmacion"
                  name="correo_confirmacion"
                  type="email"
                  value={form.correo_confirmacion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                <label htmlFor="correo_confirmacion">Confirmar correo</label>
                {errors.correo_confirmacion && (
                  <p className="error">{errors.correo_confirmacion}</p>
                )}
              </div>

              <div className="floating-label">
                <select
                  id="eps"
                  name="eps"
                  value={form.eps}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                >
                  {form.sede === "Divertido" ? (
                    <option value="Particular">Particular</option>
                  ) : (
                    <>
                      <option value="" disabled hidden></option>
                      {epsOptions.map((eps) => (
                        <option key={eps} value={eps}>
                          {eps}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <label htmlFor="eps">Asegurador (EPS-ARL)</label>
                {errors.eps && <p className="error">{errors.eps}</p>}
              </div>
              <div
                className={`floating-label regimen-select ${form.regimen ? "has-value" : ""
                  }`}
              >
                <select
                  id="regimen"
                  name="regimen"
                  value={form.regimen}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  disabled={form.regimenLocked}
                >
                  <option value="" disabled hidden></option>
                  {(epsRegimenMap[form.eps] || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <label htmlFor="regimen">Tipo de afiliación</label>
                {errors.regimen && <p className="error">{errors.regimen}</p>}
              </div>

              <div className="floating-label">
                <select
                  id="sede"
                  name="sede"
                  value={form.sede}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                >
                  <option value="" disabled hidden></option>
                  {/* <option value="No he sido atendido">No he sido atendido</option> */}
                  <option value="Bogota-Centro">Bogotá Centro</option>
                  <option value="Bogota-Norte">Bogotá Norte</option>
                  <option value="Bogota-Sur-Occidente-Hidroterapia">
                    Bogotá Sur Occidente Hidroterapia
                  </option>
                  <option value="Bogota-Sur-Occidente-Rehabilitación">
                    Bogotá Sur Occidente Rehabilitación
                  </option>
                  <option value="Chia">Chía</option>
                  <option value="Divertido">Divertido</option>
                  <option value="Florencia">Florencia</option>
                  <option value="Ibague">Ibagué</option>
                </select>
                <label htmlFor="sede">Sede de atención</label>
                {errors.sede && <p className="error">{errors.sede}</p>}
              </div>

              <div className="floating-label">
                <select
                  id="servicio_prestado"
                  name="servicio_prestado"
                  value={form.servicio_prestado}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                >
                  <option value="" disabled hidden></option>
                  {(serviciosPorSede[form.sede] || []).map((servicio) => (
                    <option key={servicio} value={servicio}>
                      {servicio}
                    </option>
                  ))}
                </select>

                <label htmlFor="servicio_prestado">Servicio prestado</label>

                {errors.servicio_prestado && (
                  <p className="error">{errors.servicio_prestado}</p>
                )}
              </div>
            </div>

            <div className="file-input-group">
              <label
                htmlFor="archivos-adicionales"
                className="file-upload-button"
              >
                Subir archivo
              </label>
              <input
                id="archivos-adicionales"
                type="file"
                style={{ display: "none" }}
                multiple
                onChange={(e) => {
                  const nuevos = Array.from(e.target.files);

                  // Filtrar por tamaño (máximo 15MB)
                  const validos = [];
                  nuevos.forEach((file) => {
                    if (file.size > 15 * 1024 * 1024) {
                      Swal.fire({
                        icon: "error",
                        title: "Archivo demasiado grande",
                        text: `El archivo "${file.name}" supera los 15 MB.`,
                      });
                    } else {
                      validos.push(file);
                    }
                  });

                  if (validos.length > 0) {
                    setArchivos((prev) => {
                      // Evitar duplicados usando nombre + tamaño
                      const clavesPrevias = prev.map((f) => f.name + "_" + f.size);
                      const nuevosSinDuplicar = validos.filter(
                        (f) => !clavesPrevias.includes(f.name + "_" + f.size)
                      );

                      return [...prev, ...nuevosSinDuplicar];
                    });
                  }
                }}
              />



              {archivos.length > 0 && (
                <div className="archivo-subido">
                  {archivos.map((file, idx) => (
                    <div key={idx}>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      <button
                        type="button"
                        className="remove-file-button"
                        onClick={() =>
                          setArchivos((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="pqrs-textarea-full">
              <textarea
                name="descripcion"
                placeholder="Describe la situación que deseas reportar"
                value={form.descripcion}
                onChange={handleChange}
                onBlur={handleBlur}
                rows="5"
                required
                maxLength={MAX_CARACTERES_DESCRIPCION}
              />
              {errors.descripcion && (
                <p className="error">{errors.descripcion}</p>
              )}
              <small
                className={`contador-caracteres ${form.descripcion.length > MAX_CARACTERES_DESCRIPCION * 0.9
                  ? "alerta"
                  : ""
                  }`}
              >
                {form.descripcion.length} / {MAX_CARACTERES_DESCRIPCION}{" "}
                caracteres
              </small>
            </div>

            <div className="politica-box politica-box-compact">
              <label className="politica-label">
                <input
                  type="checkbox"
                  name="politica_aceptada"
                  checked={form.politica_aceptada}
                  onChange={handleChange} // Usa handleChange unificado
                  onBlur={handleBlur}
                />
                <div className="politica-texto">
                  <span className="politica-descripcion">
                    Acepto la
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
              {errors.politica_aceptada && (
                <p className="error">{errors.politica_aceptada}</p>
              )}
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar PQR"}
            </button>
          </form>

          {/* Panel derecho: información (mantuve tu estructura) */}
          <div className="pqrs-solicitudes">
            <h3 className="titulo-clasificaciones">INFORMACIÓN - TUTELA</h3>
            <ul>
              <li className="parrafo-clasificacion"><strong>Avoco:</strong> Significa que el juez asume oficialmente el conocimiento del proceso.</li>
              <li className="parrafo-clasificacion"><strong>Sentencia o fallo:</strong> Es la decisión final del juez sobre la tutela.</li>
              <li className="parrafo-clasificacion"><strong>Incidente o apertura de desacato:</strong> Se abre cuando la entidad o persona obligada no cumple la sentencia de tutela.</li>
              <li className="parrafo-clasificacion"><strong>Desacato:</strong> Cuando la entidad o persona no obedece lo que el juez ordenó en la sentencia de tutela.</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}




























// import React from "react";
// import PqrsForm from "./PqrsForm";

// export default function TutelaForm() {
//   const tipoSolicitudOptions = [
//     { value: "Tutela", label: "Tutela" },
//   ];

//   return (
//     <PqrsForm
//       defaultTipoSolicitud="Tutela"
//       tipoSolicitudOptions={tipoSolicitudOptions}
//     />
//   );
// }





