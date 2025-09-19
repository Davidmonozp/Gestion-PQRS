// src/validation/pqrsValidation.js
import * as Yup from "yup";



export const getFilesSchema = (subOpcionHistoria, historiaClinicaOptions) => {
  // Inicializa un objeto vacío para el esquema de archivos.
  const schemaObject = {};

  // Verifica si la opción de historia clínica seleccionada tiene requisitos definidos.
  const requisitosActuales = historiaClinicaOptions[subOpcionHistoria];

  if (requisitosActuales && Array.isArray(requisitosActuales)) {
    // Itera sobre cada requisito para construir el esquema de validación.
    requisitosActuales.forEach((req) => {
      // La clave del esquema es el 'id' del requisito.
      schemaObject[req.id] = Yup.mixed()
        .required("Este archivo es obligatorio.")
        .test(
          "is-file",
          "Debe subir un archivo.",
          // La validación se hace a nivel de campo: ¿es un archivo?
          (value) => value && value instanceof File
        );
    });
  }

  // Retorna el esquema de Yup para los archivos.
  // Yup.object().shape() construye el esquema con las validaciones definidas.
  return Yup.object().shape(schemaObject);
};
const commonContactFields = {
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
};



export const pqrsSchema = Yup.object().shape({
  // Campos del paciente
  ...commonContactFields, // Reutiliza la validación para los campos del paciente
  fecha_inicio_real: Yup.date() // Cambiado a Yup.date()
    .nullable() // Para permitir que sea nulo si no es requerido
    .transform((value, originalValue) => {
      // Esta transformación es crucial para que Yup pueda parsear la cadena
      // que viene de tu input (e.g., "YYYY-MM-DDTHH:MM" o "YYYY-MM-DD HH:MM:SS")
      // en un objeto Date válido.
      if (originalValue) {
        // Intenta crear un objeto Date
        const date = new Date(originalValue);
        // Si el objeto Date es "Invalid Date", devuelve null
        // para que Yup lo marque como inválido.
        return isNaN(date.getTime()) ? null : date;
      }
      return null; // Si no hay valor original, devuelve null
    })
    .when("$isLoggedIn", {
      is: true,
      then: (schema) =>
        schema
          .required(
            "La fecha y hora de inicio real es obligatoria para usuarios logeados."
          )
          .typeError(
            "La fecha y hora de inicio real debe ser una fecha y hora válida."
          ), // Mensaje para cuando no se puede parsear
      otherwise: (schema) => schema.notRequired().nullable(),
    }),

  sede: Yup.string().required("Selecciona una sede de atención"),

  regimen: Yup.string().required("Seleccione el tipo de afiliación al cual pertenece"),

  servicio_prestado: Yup.string().required("Selecciona primero una sede para escoger un servicio"),

  eps: Yup.string().required("Selecciona una EPS o ARL"),

  tipo_solicitud: Yup.string().required("Selecciona un tipo de solicitud"),

  radicado_juzgado: Yup.string()
  .max(255, "Máximo 255 caracteres")
  .when("tipo_solicitud", {
    is: "Tutela",
    then: (schema) => schema.required("El radicado del juzgado es obligatorio"),
    otherwise: (schema) => schema.nullable(),
  }),

  clasificacion_tutela: Yup.string().when("tipo_solicitud", {
    is: "Tutela",
    then: (schema) =>
      schema.required("Debes seleccionar una clasificación para la tutela."),
    otherwise: (schema) => schema.notRequired().nullable(), // <-- Esta es la línea corregida
  }),

  clasificaciones: Yup.array()
    .min(1, "Debes seleccionar al menos una clasificación.")
    .required("Debes seleccionar al menos una clasificación."),


  accionado: Yup.array().when("tipo_solicitud", {
    is: "Tutela",
    then: (schema) =>
      schema
        .min(1, "Debes seleccionar al menos un accionado para la tutela.")
        .required("Debes seleccionar al menos un accionado para la tutela."),
    otherwise: (schema) => schema.notRequired().nullable(), // <-- Esta es la línea corregida
  }),


  fuente: Yup.string().when("$isLoggedIn", {
    is: true,
    then: (schema) =>
      schema
        .required("La fuente es requerida para usuarios logeados.")
        .oneOf(
          [
            "Formulario de la web",
            "Correo atención al usuario",
            "Correo de Agendamiento NAC",
            "Encuesta de satisfacción IPS",
            "Callcenter",
            "Presencial",
            "Correo de Notificaciones IPS"
          ],
          "Valor de fuente inválido."
        ),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),

  descripcion: Yup.string()
    .required("La descripción es obligatoria")
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(3000, "La descripción no puede exceder los 3000 caracteres"),

  politica_aceptada: Yup.boolean().oneOf(
    [true],
    "Debes aceptar la política de tratamiento de datos"
  ),

  // Lógica condicional para los campos del "registrador"
  registra_otro: Yup.string()
    .required("Debes indicar si registras en nombre de otra persona")
    .oneOf(["si", "no"], "Opción inválida"),

  registrador_nombre: Yup.string().when("registra_otro", {
    is: "si",
    then: (schema) =>
      schema
        .matches(
          /^[a-zA-Z0áéíóúüÁÉÍÓÚÜñÑ][a-zA-Z0áéíóúüÁÉÍÓÚÜ\sñÑ]*$/,
          "El nombre no puede contener espacios en blanco"
        )
        // .trim("El nombre no puede consistir solo en espacios en blanco")
        .required("El nombre del solicitante es obligatorio")
        .min(2, "El nombre del solicitante debe tener al menos 2 caracteres")
        .max(
          20,
          "El nombre del solicitante no puede exceder los 20 caracteres"
        ),
    otherwise: (schema) =>
      schema
        .notRequired()
        .transform((_, originalValue) =>
          originalValue === "" ? undefined : originalValue
        ),
  }),

  registrador_segundo_nombre: Yup.string()
    .notRequired()
    .transform((_, originalValue) =>
      originalValue === "" ? undefined : originalValue
    )
    .test(
      "valid-registrador-segundo-nombre",
      "El segundo nombre del solicitante debe tener entre 2 y 20 caracteres y no contener espacios en blanco",
      (value) => {
        if (!value) return true; // ✅ si está vacío pasa
        return (
          /^[a-zA-Z0áéíóúüÁÉÍÓÚÜñÑ][a-zA-Z0áéíóúüÁÉÍÓÚÜ\sñÑ]*$/.test(value) &&
          value.length >= 2 &&
          value.length <= 20
        );
      }
    ),


  registrador_apellido: Yup.string().when("registra_otro", {
    is: "si",
    then: (schema) =>
      schema
        .matches(
          /^[a-zA-Z0áéíóúüÁÉÍÓÚÜñÑ][a-zA-Z0áéíóúüÁÉÍÓÚÜ\sñÑ]*$/,
          "El apellido no puede contener espacios en blanco"
        )
        .required("El apellido del solicitante es obligatorio")
        .min(2, "El apellido del solicitante debe tener al menos 2 caracteres")
        .max(
          20,
          "El apellido del solicitante no puede exceder los 20 caracteres"
        ),
    otherwise: (schema) =>
      schema
        .notRequired()
        .transform((_, originalValue) =>
          originalValue === "" ? undefined : originalValue
        ),
  }),

  registrador_segundo_apellido: Yup.string()
    .notRequired()
    .transform((_, originalValue) =>
      originalValue === "" ? undefined : originalValue
    )
    .test(
      "valid-registrador-segundo-apellido",
      "El segundo nombre del solicitante debe tener entre 2 y 20 caracteres y no contener espacios en blanco",
      (value) => {
        if (!value) return true; // ✅ si está vacío pasa
        return (
          /^[a-zA-Z0áéíóúüÁÉÍÓÚÜñÑ][a-zA-Z0áéíóúüÁÉÍÓÚÜ\sñÑ]*$/.test(value) &&
          value.length >= 2 &&
          value.length <= 20
        );
      }
    ),


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

  registrador_documento_tipo: Yup.string().when(["registra_otro", "parentesco"], {
    is: (registra_otro, parentesco) =>
      registra_otro === "si" && parentesco !== "Ente de control" && parentesco !== "Asegurador",
    then: (schema) =>
      schema.required("Selecciona el tipo de documento del solicitante"),
    otherwise: (schema) =>
      schema
        .notRequired()
        .transform((_, originalValue) =>
          originalValue === "" ? undefined : originalValue
        ),
  }),


  registrador_documento_numero: Yup.string().when(["registra_otro", "parentesco"], {
    is: (registra_otro, parentesco) =>
      registra_otro === "si" && parentesco !== "Ente de control" && parentesco !== "Asegurador",
    then: (schema) =>
      schema
        .required("El número de documento del solicitante es obligatorio")
        .matches(
          /^[a-zA-Z0-9-]+$/,
          "El número de documento solo puede contener letras, números y guiones, sin espacios en blanco"
        )
        .min(
          5,
          "El número de documento del solicitante debe tener al menos 5 dígitos"
        )
        .max(
          15,
          "El número de documento del solicitante no puede exceder los 15 dígitos"
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
        .required("El correo electrónico del solicitante es obligatorio")
        .test(
          "multiple-emails",
          "El correo tienen un formato inválido",
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


  registrador_telefono: Yup.string().when("registra_otro", {
    is: "si",
    then: (schema) =>
      schema
        .required("El teléfono del solicitante es obligatorio")
        .matches(
          /^\d{7,10}$/,
          "El teléfono del solicitante debe tener entre 7 y 10 dígitos numéricos"
        ),
    otherwise: (schema) =>
      schema
        .notRequired()
        .transform((_, originalValue) =>
          originalValue === "" ? undefined : originalValue
        ),
  }),
  registrador_cargo: Yup.string().when("parentesco", {
    is: (val) => val === "Ente de control" || val === "Asegurador",
    then: (schema) =>
      schema.required("El cargo es obligatorio"),
    otherwise: (schema) => schema.nullable(),
  }),

  nombre_entidad: Yup.string().when("parentesco", {
    is: (val) => val === "Ente de control" || val === "Asegurador",
    then: (schema) =>
      schema.required("El nombre de la entidad es obligatorio").max(100),
    otherwise: (schema) => schema.nullable(),
  }),

});





































