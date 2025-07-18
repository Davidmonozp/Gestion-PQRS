import * as Yup from "yup";

export const loginSchema = Yup.object({
  userName: Yup.string().min(7, "Usuario inválido").required("Requerido"),
  password: Yup.string().min(5, "Mínimo 5 caracteres").required("Requerido"),
});

export const registerSchema = Yup.object().shape({
  name: Yup.string()
    .transform((value) => value.trim())
    .min(7, "El nombre no puede tener menos de 7 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres")
    .required("El nombre es obligatorio")
    .test(
      "no-solo-espacios",
      "El nombre no puede contener solo espacios en blanco",
      (value) => value && value.trim().length > 0
    ),

  userName: Yup.string()
    .transform((value) => value.trim())
    .min(7, "El nombre no puede tener menos de 7 caracteres")
    .max(50, "El userName no puede tener más de 50 caracteres")
    .required("El nombre de usuario es obligatorio")
    .test(
      "no-solo-espacios",
      "El nombre de usuario no puede contener solo espacios",
      (value) => value && value.trim().length > 0
    ),
  email: Yup.string()
    .transform((value) => value.trim())
    .email("Debes ingresar un correo válido")
    .required("El correo es obligatorio"),
  documento_numero: Yup.string()
    .transform((value) => value.trim())
    .required("El número de documento es obligatorio")
    .min(6, "El número de documento debe tener al menos 6 dígitos")
    .max(30, "El número de documento no puede tener más de 30 dígitos")
    .test(
      "no-solo-espacios",
      "El número de documento no puede contener solo espacios",
      (value) => value && value.trim().length > 0
    ),
  password: Yup.string()
    .transform((value) => value.trim())
    .min(5, "La contraseña debe tener al menos 5 caracteres")
    .max(20, "La contraseña no puede tener más de 20 caracteres")
    .required("La contraseña es obligatoria"),

  password_confirmation: Yup.string()
    .oneOf([Yup.ref("password"), null], "Las contraseñas no coinciden")
    .required("Confirma la contraseña"),
});
