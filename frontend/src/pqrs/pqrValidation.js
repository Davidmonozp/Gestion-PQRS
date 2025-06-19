// src/validation/pqrsValidation.js
import * as Yup from 'yup';

const commonContactFields = {
  nombre: Yup.string()
    .required('El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder los 50 caracteres'),
  apellido: Yup.string()
    .required('El apellido es obligatorio')
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder los 50 caracteres'),
  documento_tipo: Yup.string()
    .required('Selecciona un tipo de documento'),
  documento_numero: Yup.string()
    .required('El número de documento es obligatorio')
    .matches(/^\d+$/, 'El número de documento solo debe contener dígitos')
    .min(5, 'El número de documento debe tener al menos 5 dígitos')
    .max(15, 'El número de documento no puede exceder los 15 dígitos'),
  correo: Yup.string()
    .email('Formato de correo electrónico inválido')
    .required('El correo electrónico es obligatorio'),
  telefono: Yup.string()
    .required('El teléfono es obligatorio')
    .matches(/^\d{7,10}$/, 'El teléfono debe tener entre 7 y 10 dígitos numéricos'),
};

export const pqrsSchema = Yup.object().shape({
  // Campos del paciente
  ...commonContactFields, // Reutiliza la validación para los campos del paciente

  sede: Yup.string()
    .required('Selecciona una sede de atención'),
  servicio_prestado: Yup.string()
    .required('Selecciona un servicio prestado'),
  eps: Yup.string()
    .required('Selecciona una EPS o ARL'),
  tipo_solicitud: Yup.string()
    .required('Selecciona un tipo de solicitud'),
  descripcion: Yup.string()
    .required('La descripción es obligatoria')
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(1000, 'La descripción no puede exceder los 1000 caracteres'), // Puedes ajustar el límite de caracteres

  // Lógica condicional para los campos del "registrador"
  registra_otro: Yup.string()
    .required('Debes indicar si registras en nombre de otra persona')
    .oneOf(['si', 'no'], 'Opción inválida'),

  registrador_nombre: Yup.string().when('registra_otro', {
    is: 'si',
    then: (schema) => schema
      .required('El nombre del registrador es obligatorio')
      .min(2, 'El nombre del registrador debe tener al menos 2 caracteres')
      .max(50, 'El nombre del registrador no puede exceder los 50 caracteres'),
    otherwise: (schema) => schema.notRequired().transform((_, originalValue) => originalValue === '' ? undefined : originalValue),
  }),
  registrador_apellido: Yup.string().when('registra_otro', {
    is: 'si',
    then: (schema) => schema
      .required('El apellido del registrador es obligatorio')
      .min(2, 'El apellido del registrador debe tener al menos 2 caracteres')
      .max(50, 'El apellido del registrador no puede exceder los 50 caracteres'),
    otherwise: (schema) => schema.notRequired().transform((_, originalValue) => originalValue === '' ? undefined : originalValue),
  }),
  registrador_documento_tipo: Yup.string().when('registra_otro', {
    is: 'si',
    then: (schema) => schema.required('Selecciona el tipo de documento del registrador'),
    otherwise: (schema) => schema.notRequired().transform((_, originalValue) => originalValue === '' ? undefined : originalValue),
  }),
  registrador_documento_numero: Yup.string().when('registra_otro', {
    is: 'si',
    then: (schema) => schema
      .required('El número de documento del registrador es obligatorio')
      .matches(/^\d+$/, 'El número de documento del registrador solo debe contener dígitos')
      .min(5, 'El número de documento del registrador debe tener al menos 5 dígitos')
      .max(15, 'El número de documento del registrador no puede exceder los 15 dígitos'),
    otherwise: (schema) => schema.notRequired().transform((_, originalValue) => originalValue === '' ? undefined : originalValue),
  }),
  registrador_correo: Yup.string().when('registra_otro', {
    is: 'si',
    then: (schema) => schema
      .email('Formato de correo electrónico del registrador inválido')
      .required('El correo electrónico del registrador es obligatorio'),
    otherwise: (schema) => schema.notRequired().transform((_, originalValue) => originalValue === '' ? undefined : originalValue),
  }),
  registrador_telefono: Yup.string().when('registra_otro', {
    is: 'si',
    then: (schema) => schema
      .required('El teléfono del registrador es obligatorio')
      .matches(/^\d{7,10}$/, 'El teléfono del registrador debe tener entre 7 y 10 dígitos numéricos'),
    otherwise: (schema) => schema.notRequired().transform((_, originalValue) => originalValue === '' ? undefined : originalValue),
  }),
});