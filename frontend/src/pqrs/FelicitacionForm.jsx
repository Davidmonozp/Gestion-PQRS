import React, { useState } from "react";
import * as Yup from "yup";
import Swal from "sweetalert2";
import api from "../api/api";

const felicitacionSchema = Yup.object().shape({
  nombre: Yup.string()
    .required("El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder los 50 caracteres"),
  apellido: Yup.string()
    .required("El apellido es obligatorio")
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no puede exceder los 50 caracteres"),
  documento_tipo: Yup.string().required("Selecciona un tipo de documento"),
  documento_numero: Yup.string()
    .required("El número de documento es obligatorio")
    .matches(/^\d+$/, "El número de documento solo debe contener dígitos")
    .min(5, "El número de documento debe tener al menos 5 dígitos")
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
  politica_aceptada: Yup.boolean().oneOf(
    [true],
    "Debes aceptar la política de tratamiento de datos"
  ),
});

export default function FelicitacionForm() {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    documento_tipo: "",
    documento_numero: "",
    correo: "",
    correo_confirmacion: "",
    sede: "",
    descripcion: "",
    politica_aceptada: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    try {
      await felicitacionSchema.validateAt(name, { ...form, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: null }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, [name]: error.message }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Confirmación con SweetAlert antes de enviar
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
      return; // Si cancela, no hacer nada
    }

    setLoading(true);

    try {
      await felicitacionSchema.validate(form, { abortEarly: false });
      setErrors({});

      await api.post("/felicitaciones", {
        ...form,
        tipo_solicitud: "Felicitacion",
        registra_otro: "no",
        servicio_prestado: "No aplica",
        eps: "No aplica",
      });

      Swal.fire({
        title: "¡Éxito!",
        text: "Tu felicitación fue enviada correctamente.",
        icon: "success",
      });

      setForm({
        nombre: "",
        apellido: "",
        documento_tipo: "",
        documento_numero: "",
        correo: "",
        sede: "",
        descripcion: "",
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
    <div className="pqrs-container">
      <div className="header-pqrs">
        <div>
          Envía tu <span>Felicitación</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="pqrs" noValidate>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre/s"
          value={form.nombre}
          onChange={handleChange}
        />
        {errors.nombre && <p className="error">{errors.nombre}</p>}

        <input
          type="text"
          name="apellido"
          placeholder="Apellido/s"
          value={form.apellido}
          onChange={handleChange}
        />
        {errors.apellido && <p className="error">{errors.apellido}</p>}

        <select
          name="documento_tipo"
          value={form.documento_tipo}
          onChange={handleChange}
        >
          <option value="">Tipo de documento</option>
          <option value="CC">Cédula</option>
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

        <select name="sede" value={form.sede} onChange={handleChange}>
          <option value="">Selecciona una sede</option>
          <option value="No he sido atendido">No he sido atendido</option>
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

        <textarea
          name="descripcion"
          placeholder="Describe tu felicitación"
          value={form.descripcion}
          onChange={handleChange}
          rows={5}
        />
        {errors.descripcion && <p className="error">{errors.descripcion}</p>}

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
                Acepto la 
                <a
                  href="https://passusips.com/nosotros-politica-manejo-datos"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  política de tratamiento de datos personales
                </a>{" "}
                de Passus 👆, pues he leído y estoy de acuerdo con lo expuesto
                en el manuscrito publicado. <br /> <br />
                He Comprendido los{" "}
                <a
                  href="https://passusips.com/nosotros-politica-agendamiento-web"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {" "}
                  Términos y condiciones de Servicio Web{" "}
                </a>
                de Passus 👆, pues he leído y estoy de acuerdo con lo expuesto
                en la información publicada.
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
    </div>
  );
}
