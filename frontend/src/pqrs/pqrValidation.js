// src/validation/pqrsValidation.js
import * as Yup from "yup";

const commonContactFields = {
  nombre: Yup.string()
    .required("El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder los 50 caracteres"),

  segundo_nombre: Yup.string()
    .notRequired()
    .test(
      'longitud del nombre',
      'El segundo nombre debe tener entre 2 y 50 caracteres',
      value => !value || (value.length >= 2 && value.length <= 50)
    ),

  apellido: Yup.string()
    .required("El apellido es obligatorio")
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no puede exceder los 50 caracteres"),

  segundo_apellido: Yup.string()
    .notRequired()
    .test(
      'longitud del apellido',
      'El segundo apellido debe tener entre 2 y 50 caracteres',
      value => !value || (value.length >= 2 && value.length <= 50)
    ),

  documento_tipo: Yup.string().required("Selecciona un tipo de documento"),

  documento_numero: Yup.string()
    .required("El número de documento es obligatorio")
    .matches(
      /^[a-zA-Z0-9-]+$/,
      "El número de documento solo puede contener letras, números y guiones"
    )
    .min(5, "El número de documento debe tener al menos 5 dígitos")
    .max(15, "El número de documento no puede exceder los 15 dígitos"),

  correo: Yup.string()
    .email("Formato de correo electrónico inválido")
    .required("El correo electrónico es obligatorio"),

  correo_confirmacion: Yup.string()
    .oneOf([Yup.ref("correo"), null], "Los correos no coinciden")
    .required("La confirmación de correo es obligatoria"),

  telefono: Yup.string()
    .required("El teléfono es obligatorio")
    .matches(
      /^\d{7,10}$/,
      "El teléfono debe tener entre 7 y 10 dígitos numéricos"
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

  regimen: Yup.string().required("Seleccione el regimen al cual pertenece"),

  servicio_prestado: Yup.string().required("Selecciona un servicio prestado"),

  eps: Yup.string().required("Selecciona una EPS o ARL"),

  tipo_solicitud: Yup.string().required("Selecciona un tipo de solicitud"),

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
          ],
          "Valor de fuente inválido."
        ),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),

  descripcion: Yup.string()
    .required("La descripción es obligatoria")
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(5000, "La descripción no puede exceder los 5000 caracteres"),

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
        .required("El nombre del registrador es obligatorio")
        .min(2, "El nombre del registrador debe tener al menos 2 caracteres")
        .max(
          50,
          "El nombre del registrador no puede exceder los 50 caracteres"
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
      'valid-length',
      'El segundo nombre del registrador debe tener entre 2 y 50 caracteres',
      (value) => !value || (value.length >= 2 && value.length <= 50)
    ),

  registrador_apellido: Yup.string().when("registra_otro", {
    is: "si",
    then: (schema) =>
      schema
        .required("El apellido del registrador es obligatorio")
        .min(2, "El apellido del registrador debe tener al menos 2 caracteres")
        .max(
          50,
          "El apellido del registrador no puede exceder los 50 caracteres"
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
      'valid-length',
      'El segundo apellido del registrador debe tener entre 2 y 50 caracteres',
      (value) => !value || (value.length >= 2 && value.length <= 50)
    ),

  parentesco: Yup.string().when("registra_otro", {
    is: "si",
    then: (schema) =>
      schema
        .required("El parentesco es obligatorio")
        .min(3, "El parentesco debe tener al menos 3 caracteres")
        .max(50, "El parentesco no puede exceder los 50 caracteres"),
    otherwise: (schema) =>
      schema
        .notRequired()
        .transform((_, originalValue) =>
          originalValue === "" ? undefined : originalValue
        ),
  }),

  registrador_documento_tipo: Yup.string().when("registra_otro", {
    is: "si",
    then: (schema) =>
      schema.required("Selecciona el tipo de documento del registrador"),
    otherwise: (schema) =>
      schema
        .notRequired()
        .transform((_, originalValue) =>
          originalValue === "" ? undefined : originalValue
        ),
  }),

  registrador_documento_numero: Yup.string().when("registra_otro", {
    is: "si",
    then: (schema) =>
      schema
        .required("El número de documento del registrador es obligatorio")
        .matches(
          /^[a-zA-Z0-9-]+$/,
          "El número de documento solo puede contener letras, números y guiones"
        )
        .min(
          5,
          "El número de documento del registrador debe tener al menos 5 dígitos"
        )
        .max(
          15,
          "El número de documento del registrador no puede exceder los 15 dígitos"
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
        .email("Formato de correo electrónico del registrador inválido")
        .required("El correo electrónico del registrador es obligatorio"),
    otherwise: (schema) =>
      schema
        .notRequired()
        .transform((_, originalValue) =>
          originalValue === "" ? undefined : originalValue
        ),
  }),

  registrador_telefono: Yup.string().when("registra_otro", {
    is: "si",
    then: (schema) =>
      schema
        .required("El teléfono del registrador es obligatorio")
        .matches(
          /^\d{7,10}$/,
          "El teléfono del registrador debe tener entre 7 y 10 dígitos numéricos"
        ),
    otherwise: (schema) =>
      schema
        .notRequired()
        .transform((_, originalValue) =>
          originalValue === "" ? undefined : originalValue
        ),
  }),
});
