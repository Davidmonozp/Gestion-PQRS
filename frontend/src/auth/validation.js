import * as Yup from "yup";

export const loginSchema = Yup.object({
  userName: Yup.string().min(7,"Usuario inválido").required("Requerido"),
  password: Yup.string().min(5, "Mínimo 5 caracteres").required("Requerido"),
});

export const registerSchema = Yup.object().shape({
  name: Yup.string()
    .max(100, 'El nombre no puede tener más de 100 caracteres')
    .required('El nombre es obligatorio'),
  userName: Yup.string()
    .max(50, 'El userName no puede tener mas de 50 caracteres')
    .required('El nombre de usuario es obligatorio'),
  email: Yup.string()
    .email('Debes ingresar un correo válido')
    .required('El correo es obligatorio'),
  password: Yup.string()
    .min(5, 'La contraseña debe tener al menos 5 caracteres')
    .max(20, 'La contraseña no puede tener más de 20 caracteres')
    .required('La contraseña es obligatoria'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Las contraseñas no coinciden')
    .required('Confirma la contraseña'),
});
