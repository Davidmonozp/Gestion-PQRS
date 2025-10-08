import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPqr } from "./pqrsService"; // Asegúrate de tener createPqr y updatePqr si los usas
import "./styles/Pqrs.css";
import Swal from "sweetalert2";
import { pqrsSchema, getFilesSchema } from "./pqrValidation";
import Modal from "../components/Modal/Modal";
import { Footer } from "../components/Footer/Footer";
import api from "../api/api";
import * as Yup from "yup";

// Función auxiliar para formatear la fecha a YYYY-MM-DD
const formatDateToISO = (date) => {
  if (!date) return "";
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Nueva función auxiliar para formatear a YYYY-MM-DD HH:MM (hora local)
const formatDateToISOWithTime = (dateInput) => {
  if (!dateInput) return "";

  // Intentar crear un objeto Date. Si ya es un Date, usarlo directamente.
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);

  // Verifica si la fecha es válida. Si new Date() no puede parsear, d.getTime() será NaN.
  if (isNaN(d.getTime())) {
    console.warn("Fecha inválida pasada a formatDateToISOWithTime:", dateInput);
    return "";
  }

  // Obtener componentes de la fecha en la zona horaria local
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
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
  "Divertido": ["Natación", "Yoga", "Pilates"],
};

const parentesco = [
  "Hijo/a",
  "Asegurador",
  "Ente de control",
  "Otro Familiar",
  "Padre",
  "Madre",
  "Hermano/a",
  "Nieto/a",
  "Abuelo/a",
  "Esposo/a",
];
parentesco.sort();

// Descripciones para cada tipo de solicitud
const tipoSolicitudDescriptions = {
  Peticion: {
    title: "Petición",
    description:
      "Requerimiento a través de la cual una persona por motivos de interés general o particular solicita la intervención de la entidad para la resolución de una situación, la prestación de un servicio, la información o requerimiento de copia de documentos, entre otros. (Derecho de Petición).",
  },
  Queja: {
    title: "Queja",
    description:
      "Es la manifestación de una inconformidad presentada respecto a los servicios recibidos tales como el trato por parte de los trabajadores y profesionales de la salud, condiciones físicas del entorno, o deficiencias en la atención.",
  },
  Reclamo: {
    title: "Reclamo",
    description:
      "Es la exigencia formal que se presenta ante una irregularidad, incumplimiento o afectación directa en la prestación del servicio de salud, que requiere respuesta, corrección, o compensación.",
  },
};

function PqrsForm({
  defaultTipoSolicitud,
  readOnlyTipoSolicitud,
  tipoSolicitudOptions,
  pqrData = null, // Para edición de PQR existente
}) {
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
    regimenLocked: false,
    tipo_solicitud: defaultTipoSolicitud || "",
    radicado_juzgado: "",
    clasificacion_tutela: "",
    accionado: [],
    descripcion: "",
    politica_aceptada: false,
    registra_otro: "no",
    registrador_nombre: "",
    registrador_segundo_nombre: "",
    registrador_apellido: "",
    registrador_segundo_apellido: "",
    registrador_documento_tipo: "",
    registrador_documento_numero: "",
    registrador_correo: "",
    registrador_telefono: "",
    parentesco: "",
    registrador_cargo: "",
    nombre_entidad: "",
    fuente: "Formulario de la web",
    fecha_inicio_real: "", // Se inicializa como cadena vacía, se llenará en useEffect
    clasificaciones: [],
  });

  const [archivos, setArchivos] = useState([]);
  const [archivosPorRequisito, setArchivosPorRequisito] = useState({});
  const [subOpcionHistoria, setSubOpcionHistoria] = useState("");
  const historiaClinicaOptions = {
    "Paciente directo": [
      {
        id: "hc-directo-cedula",
        label: (
          <span className="label-historia">
            Fotocopia de la cédula de ciudadanía.
          </span>
        ),
      },
      {
        id: "hc-directo-formato",
        label: (
          <span className="label-historia">
            Diligenciar formato: Solicitud por paciente.
          </span>
        ),
      },
    ],
    "Tercero autorizado": [
      {
        id: "hc-tercero-cedulas",
        label: (
          <span className="label-historia">
            Fotocopia de la cédula del paciente y del autorizado.
          </span>
        ),
      },
      {
        id: "hc-tercero-parentesco",
        label: (
          <span className="label-historia">
            Soporte que acredite el parentesco (registro civil, acta de
            matrimonio).
          </span>
        ),
      },
      {
        id: "hc-tercero-formato",
        label: (
          <span className="label-historia">
            Diligenciar formato: Solicitud por Tercero.
          </span>
        ),
      },
    ],
    "Paciente menor de edad": [
      {
        id: "hc-menor-registro",
        label: (
          <span className="label-historia">
            Registro civil o tarjeta de identidad (según edad).
          </span>
        ),
      },
      {
        id: "hc-menor-parentesco",
        label: (
          <span className="label-historia">
            Registro civil que acredite el parentesco o documento que certifique
            la representación legal.
          </span>
        ),
      },
      {
        id: "hc-menor-cedula",
        label: (
          <span className="label-historia">
            Cédula de ciudadanía de los padres.
          </span>
        ),
      },
      {
        id: "hc-menor-formato",
        label: (
          <span className="label-historia">
            Diligenciar formato: Solicitud por Tercero.
          </span>
        ),
      },
    ],
    "Paciente incapacitado o declarado interdicto": [
      {
        id: "hc-incapacitado-certificado",
        label: (
          <span className="label-historia">
            Certificado médico que evidencie el estado de salud del paciente.
          </span>
        ),
      },
      {
        id: "hc-incapacitado-parentesco",
        label: (
          <span className="label-historia">
            Documentos que acrediten el parentesco o la representación legal.
          </span>
        ),
      },
      {
        id: "hc-incapacitado-cedula",
        label: (
          <span className="label-historia">
            Cédula del paciente y del familiar o representante.
          </span>
        ),
      },
      {
        id: "hc-incapacitado-interdiccion",
        label: (
          <span className="label-historia">
            En caso de interdicción, adjuntar la sentencia de interdicción y
            copia de la cédula del curador.
          </span>
        ),
      },
      {
        id: "hc-incapacitado-formato",
        label: (
          <span className="label-historia">
            Diligenciar formato: Solicitud de historia clínica por tercero.
          </span>
        ),
      },
    ],
  };
  useEffect(() => {
    // 1. Prioridad más alta: si se registra a otro, siempre será "Tercero autorizado"
    if (form.registra_otro === "si") {
      setSubOpcionHistoria("Tercero autorizado");
    }
    // 2. Siguiente prioridad: si el tipo de documento es "TI" (Tarjeta de Identidad), es un menor de edad
    else if (
      form.documento_tipo === "TI" ||
      form.documento_tipo === "RC" ||
      form.documento_tipo === "CN"
    ) {
      setSubOpcionHistoria("Paciente menor de edad");
    }
    // 3. Siguiente prioridad: si el tipo de documento es diferente de "TI" (Tarjeta de Identidad), es un paciente directo
    else if (
      form.documento_tipo !== "TI" ||
      form.documento_tipo !== "RC" ||
      form.documento_tipo !== "CN"
    ) {
      setSubOpcionHistoria("Paciente directo");
    }
    // 4. Si ninguna condición se cumple, el dropdown se reinicia
    else {
      setSubOpcionHistoria("");
    }
  }, [form.registra_otro, form.documento_tipo]);

  useEffect(() => {
    if (form.sede === "Divertido") {
      setForm((prev) => ({
        ...prev,
        eps: "Particular",
        regimen: "Particular",
      }));
    }
  }, [form.sede]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const isLoggedIn = !!localStorage.getItem("token"); // Verifica si el usuario está logeado
  // Estado para mostrar/ocultar el dropdown de Accionado
  const [showAccionadoDropdown, setShowAccionadoDropdown] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    description: "",
  });
  const MAX_CARACTERES_DESCRIPCION = 1500;

  const accionadoRef = useRef(null);
  const clasificacionesRef = useRef(null);
  const [availableClasificaciones, setAvailableClasificaciones] = useState([]);
  const [showClasificacionesDropdown, setShowClasificacionesDropdown] =
    useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accionadoRef.current && !accionadoRef.current.contains(e.target)) {
        setShowAccionadoDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        clasificacionesRef.current &&
        !clasificacionesRef.current.contains(event.target)
      ) {
        setShowClasificacionesDropdown(false);
      }
    }

    if (showClasificacionesDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showClasificacionesDropdown]);

  // Efecto para inicializar el formulario (ej. al cargar el componente o al recibir pqrData)
  useEffect(() => {
    const fetchClasificaciones = async () => {
      try {
        const response = await api.get("/clasificaciones");
        setAvailableClasificaciones(response.data);
      } catch (err) {
        console.error("Error cargando clasificaciones", err);
      }
    };
    fetchClasificaciones();

    // Si se provee un defaultTipoSolicitud y es diferente al actual, actualiza
    if (
      defaultTipoSolicitud !== undefined &&
      form.tipo_solicitud !== defaultTipoSolicitud
    ) {
      setForm((prev) => ({
        ...prev,
        tipo_solicitud: defaultTipoSolicitud,
      }));
    }

    // Lógica para fecha_inicio_real
    setForm((prev) => {
      let initialFechaInicioReal = prev.fecha_inicio_real;

      if (isLoggedIn) {
        // Si hay pqrData y tiene fecha_inicio_real, la usamos y la formateamos
        if (pqrData && pqrData.fecha_inicio_real) {
          initialFechaInicioReal = formatDateToISOWithTime(
            pqrData.fecha_inicio_real
          );
        } else if (!prev.fecha_inicio_real) {
          // Si está logeado y no hay fecha_inicio_real previa, inicializa con la fecha y hora actual
          initialFechaInicioReal = formatDateToISOWithTime(new Date());
        }
      } else {
        // Si no está logeado, el campo debe estar vacío
        initialFechaInicioReal = "";
      }

      return {
        ...prev,
        fecha_inicio_real: initialFechaInicioReal,
      };
    });

    // Cargar datos de PQR para edición si pqrData está presente
    if (pqrData) {
      setForm((prev) => ({
        ...prev,
        nombre: pqrData.nombre || "",
        segundo_nombre: pqrData.segundo_nombre || "",
        apellido: pqrData.apellido || "",
        segundo_apellido: pqrData.segundo_apellido || "",
        documento_tipo: pqrData.documento_tipo || "",
        documento_numero: pqrData.documento_numero || "",
        correo: pqrData.correo || "",
        correo_confirmacion: pqrData.correo || "", // Asumiendo que el correo es también el de confirmación en edición
        telefono: pqrData.telefono || "",
        sede: pqrData.sede || "",
        servicio_prestado: pqrData.servicio_prestado || "",
        eps: pqrData.eps || "",
        regimen: pqrData.regimen || "",
        tipo_solicitud: pqrData.tipo_solicitud || defaultTipoSolicitud || "",
        radicado_juzgado: pqrData.radicado_juzgado || "",
        clasificacion_tutela: pqrData.clasificacion_tutela || "",
        accionado: pqrData.accionado || "",
        descripcion: pqrData.descripcion || "",
        fuente: pqrData.fuente || "Formulario de la web",
        registra_otro: pqrData.registra_otro === "si" ? "si" : "no",
        registrador_nombre: pqrData.registrador_nombre || "",
        registrador_segundo_nombre: pqrData.registrador_segundo_nombre || "",
        registrador_apellido: pqrData.registrador_apellido || "",
        registrador_segundo_apellido:
          pqrData.registrador_segundo_apellido || "",
        registrador_documento_tipo: pqrData.registrador_documento_tipo || "",
        registrador_documento_numero:
          pqrData.registrador_documento_numero || "",
        registrador_correo: pqrData.registrador_correo || "",
        registrador_telefono: pqrData.registrador_telefono || "",
        parentesco: pqrData.parentesco || "",
        registrador_cargo: pqrData.registrador_cargo || "",
        nombre_entidad: pqrData.nombre_entidad || "",
        politica_aceptada: pqrData.politica_aceptada === "true", // O el valor que use tu API
        clasificaciones: pqrData.clasificaciones
          ? pqrData.clasificaciones.map((c) => c.id)
          : [],
      }));
    }
  }, [defaultTipoSolicitud, isLoggedIn, pqrData]);

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;

      if (name === "tipo_solicitud" && readOnlyTipoSolicitud) {
        return;
      }

      setForm((prev) => {
        // 🔹 Manejo especial para "clasificaciones" múltiples
        if (name === "clasificaciones") {
          const valueInt = parseInt(value, 10);
          let updatedClasificaciones = [...(prev.clasificaciones || [])];

          if (checked) {
            if (!updatedClasificaciones.includes(valueInt)) {
              updatedClasificaciones.push(valueInt);
            }
          } else {
            updatedClasificaciones = updatedClasificaciones.filter(
              (id) => id !== valueInt
            );
          }

          return {
            ...prev,
            clasificaciones: updatedClasificaciones,
          };
        }

        // 🔹 Manejo especial para "accionado" múltiple
        if (name === "accionado") {
          let updatedAccionado = [...(prev.accionado || [])];

          if (type === "checkbox") {
            if (checked) {
              updatedAccionado.push(value);
            } else {
              updatedAccionado = updatedAccionado.filter(
                (item) => item !== value
              );
            }
          } else {
            updatedAccionado = value; // Si viene de un multiselect
          }

          return {
            ...prev,
            accionado: updatedAccionado,
          };
        }

        // 🔹 Si cambia la sede, limpiar servicio_prestado
        if (name === "sede") {
          return {
            ...prev,
            sede: value,
            servicio_prestado: "",
          };
        }

        // 🔹 Lógica para tipo de solicitud y clasificacion_tutela
        if (name === "tipo_solicitud") {
          const newState = {
            ...prev,
            [name]: value,
          };
          if (value !== "Tutela") {
            newState.clasificacion_tutela = "";
          }

          // Mostrar modal de ayuda (si aplica)
          if (tipoSolicitudDescriptions[value]) {
            setModalContent(tipoSolicitudDescriptions[value]);
            setShowModal(true);
          } else {
            setShowModal(false);
            setModalContent({ title: "", description: "" });
          }

          return newState;
        }

        // 🔹 Si cambia EPS, asignar régimen según opciones
        if (name === "eps") {
          if (!value) {
            return { ...prev, eps: "", regimen: "", regimenLocked: false };
          }

          const opciones = epsRegimenMap[value] || [];

          return {
            ...prev,
            eps: value,
            regimen: opciones.length === 1 ? opciones[0] : "", // autoselecciona si hay solo una
            regimenLocked: opciones.length === 1, // bloquea si hay solo una
          };
        }

        // 🔹 Manejo normal (otros inputs)
        let newValue = value;
        if (type === "checkbox") {
          newValue = checked;
        } else if (name === "fecha_inicio_real") {
          newValue = formatDateToISOWithTime(value);
        }

        return {
          ...prev,
          [name]: newValue,
        };
      });
    },
    [readOnlyTipoSolicitud, setForm, setModalContent, setShowModal]
  );

  const handleBlur = async (e) => {
    const { name } = e.target;
    try {
      // Pasamos el estado completo y el contexto para validación condicional
      await pqrsSchema.validateAt(name, form, { context: { isLoggedIn } });
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, [name]: error.message }));
    }
  };

  // Manejo de archivos por requisito con validación de tamaño
  const handleFileChange = (e, requisitoId) => {
    const selectedFile = e.target.files[0]; // solo 1 archivo por requisito
    if (!selectedFile) return;

    // Validar tamaño (7MB)
    if (selectedFile.size > 7 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "Archivo demasiado grande",
        html: `El archivo <b>${selectedFile.name}</b> supera el tamaño máximo (7 MB).`,
        confirmButtonColor: "#d33",
      });
      e.target.value = ""; // reset input
      return;
    }

    // Guardar archivo en el estado (clave = requisitoId)
    setArchivosPorRequisito((prev) => ({
      ...prev,
      [requisitoId]: selectedFile,
    }));

    e.target.value = ""; // reset input
  };

  // Eliminar archivo por requisito
  const removeFile = (requisitoId) => {
    setArchivosPorRequisito((prev) => {
      const updated = { ...prev };
      delete updated[requisitoId];
      return updated;
    });
  };

  // ---- Validación de archivos obligatorios ----
  const validateArchivos = (
    clasificaciones,
    availableClasificaciones,
    archivosPorRequisito,
    subOpcionHistoria,
    historiaClinicaOptions,
    fileInputsConfig
  ) => {
    let errors = {};

    clasificaciones.forEach((clasificacionId) => {
      const clasificacionObj = availableClasificaciones.find(
        (c) => c.id === clasificacionId
      );
      if (!clasificacionObj) return;

      const nombreClasificacion = clasificacionObj.nombre;

      // Caso especial: Historia clínica
      if (
        nombreClasificacion.toLowerCase() ===
        "envío de historia clínica o informes finales".toLowerCase()
      ) {
        if (!subOpcionHistoria) {
          errors["subOpcionHistoria"] = "Seleccione una opción.";
        } else {
          historiaClinicaOptions[subOpcionHistoria].forEach((req) => {
            if (!archivosPorRequisito[req.id]) {
              errors[req.id] = "Este archivo es obligatorio.";
            }
          });
        }
        return;
      }

      // Caso especial: Solicitudes de tesorería
      // Caso especial: Solicitudes de tesorería
      if (
        nombreClasificacion.toLowerCase() ===
        "solicitudes de tesorería".toLowerCase()
      ) {
        const inputsTesoreria = fileInputsConfig[nombreClasificacion] || [];
        inputsTesoreria.forEach((input) => {
          if (input.archivos) {
            input.archivos.forEach((archivo) => {
              const isRequired =
                archivo.required === undefined ? true : archivo.required;
              if (isRequired && !archivosPorRequisito[archivo.id]) {
                errors[archivo.id] = "Este archivo es obligatorio.";
              }
            });
          }
        });
        return;
      }

      if (
        nombreClasificacion.toLowerCase() ===
        "política de multas por inasistencia".toLowerCase()
      ) {
        const inputsMultas = fileInputsConfig[nombreClasificacion] || [];
        inputsMultas.forEach((input) => {
          if (input.archivos) {
            input.archivos.forEach((archivo) => {
              const isRequired =
                archivo.required === undefined ? true : archivo.required;
              if (isRequired && !archivosPorRequisito[archivo.id]) {
                errors[archivo.id] = "Este archivo es obligatorio.";
              }
            });
          }
        });
        return;
      }

      // Otras clasificaciones: validar solo si tienen archivos definidos
      const inputs = fileInputsConfig[nombreClasificacion] || [];
      inputs.forEach((input) => {
        if (input.required && input.archivos) {
          input.archivos.forEach((req) => {
            if (!archivosPorRequisito[req.id]) {
              errors[req.id] = "Este archivo es obligatorio.";
            }
          });
        }
      });
    });

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const allErrors = {};

      // 1. Validar esquema principal (campos normales)
      try {
        await pqrsSchema.validate(form, {
          abortEarly: false,
          context: { isLoggedIn },
        });
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          err.inner.forEach(({ path, message }) => {
            allErrors[path] = message;
          });
        } else {
          throw err;
        }
      }

      // 2. Validar archivos obligatorios por clasificación
      const archivoErrors = validateArchivos(
        form.clasificaciones,
        availableClasificaciones,
        archivosPorRequisito,
        subOpcionHistoria,
        historiaClinicaOptions,
        fileInputsConfig
      );

      Object.assign(allErrors, archivoErrors);

      // 3. Si hay errores, mostrar y detener
      if (Object.keys(allErrors).length > 0) {
        setErrors(allErrors);
        Swal.fire({
          icon: "error",
          title: "Error de validación",
          text: "Por favor, revisa los campos y adjunta todos los archivos obligatorios.",
          confirmButtonColor: "#d33",
        });
        setLoading(false);
        return;
      }

      // 4. Confirmación de envío
      const confirm = await Swal.fire({
        title: "¿Confirmas el envío de tu PQR?",
        text: "Una vez enviada no podrás editar la información.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, enviar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
      });

      if (!confirm.isConfirmed) {
        setLoading(false);
        return;
      }

      Swal.fire({
        title: "Enviando PQR...",
        text: "Por favor espera mientras procesamos tu solicitud.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // 5. Construir FormData
      const formData = new FormData();

      // Archivos
      Object.values(archivosPorRequisito).forEach((file) => {
        formData.append("archivos[]", file);
      });

      archivos.forEach((file) => {
        formData.append("archivos_adicionales[]", file);
      });
      // Campos del formulario
      Object.entries(form).forEach(([key, value]) => {
        if (key.startsWith("registrador_") && form.registra_otro === "no")
          return;
        if (key === "parentesco" && form.registra_otro === "no") return;

        if (
          key === "registrador_cargo" &&
          form.parentesco !== "Ente de control" &&
          form.parentesco !== "Asegurador"
        )
          return;

        if (
          key === "nombre_entidad" &&
          form.parentesco !== "Ente de control" &&
          form.parentesco !== "Asegurador"
        )
          return;

        if (key === "politica_aceptada") {
          formData.append(key, value ? "true" : "false");
          return;
        }

        if (key === "fecha_inicio_real") {
          if (isLoggedIn && value) formData.append(key, value);
          return;
        }

        if (key === "clasificacion_tutela") {
          if (form.tipo_solicitud === "Tutela" && value) {
            formData.append(key, value);
          }
          return;
        }

        if (key === "accionado") {
          if (form.tipo_solicitud === "Tutela" && Array.isArray(value)) {
            value.forEach((item) => {
              formData.append("accionado[]", item);
            });
          }
          return;
        }

        if (key === "clasificaciones") {
          if (Array.isArray(value) && value.length > 0) {
            value.forEach((id) => {
              formData.append("clasificaciones[]", id);
            });
          }
          return;
        }

        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });

      // 6. Enviar a backend
      if (pqrData && pqrData.pqr_codigo) {
        console.warn(
          "Función de actualización no implementada, creando en su lugar"
        );
        await createPqr(formData);
      } else {
        await createPqr(formData);

        // Determina los destinatarios del correo basándose en la lógica del parentesco
        let mensajeDestinatario = "";

        if (form.tipo_solicitud !== "Tutela") {
          if (
            form.parentesco === "Asegurador" ||
            form.parentesco === "Ente de control"
          ) {
            // Si el parentesco es Asegurador o Ente de control, el correo solo va al registrador.
            mensajeDestinatario = `El número de radicado será enviado al correo <strong>${form.registrador_correo}</strong>.`;
          } else {
            // Si no, el correo va al paciente y al registrador (si este existe).
            if (form.registrador_correo) {
              mensajeDestinatario = `El número de radicado será enviado a los correos <strong>${form.correo}</strong> y <strong>${form.registrador_correo}</strong>.`;
            } else {
              mensajeDestinatario = `El número de radicado será enviado al correo <strong>${form.correo}</strong>.`;
            }
          }
        }

        // Muestra el mensaje de SweetAlert2 con el texto dinámico
        Swal.fire({
          icon: "success",
          title: "¡PQR enviada!",
          html: `Tu PQRS ha sido enviada con éxito.<br/>${mensajeDestinatario}`,
          confirmButtonColor: "#3085d6",
        });
      }

      // 7. Reset de formulario si es nuevo
      if (!pqrData) {
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
          tipo_solicitud: defaultTipoSolicitud || "",
          clasificaciones: [],
          descripcion: "",
          politica_aceptada: false,
          registra_otro: "no",
          registrador_nombre: "",
          registrador_segundo_nombre: "",
          registrador_apellido: "",
          registrador_segundo_apellido: "",
          registrador_documento_tipo: "",
          registrador_documento_numero: "",
          registrador_correo: "",
          registrador_telefono: "",
          parentesco: "",
          fuente: "Formulario de la web",
          fecha_inicio_real: isLoggedIn
            ? formatDateToISOWithTime(new Date())
            : "",
        });
        setArchivosPorRequisito({});
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Ocurrió un error al enviar la PQR.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Lista de clasificaciones especiales de "Solicitud"
  const clasificacionesSolicitud = [
    "Agendamiento",
    "Solicitudes de tesorería",
    "Envío de historia clínica o informes finales",
    "Política de multas por inasistencia",
    "Reprogramación de citas",
  ];

  // 🔹 Filtrar clasificaciones según tipo_solicitud
  let filteredClasificaciones;

  if (form.tipo_solicitud === "Solicitud") {
    // Solo mostrar estas 5
    filteredClasificaciones = availableClasificaciones.filter((c) =>
      clasificacionesSolicitud.includes(c.nombre)
    );
  } else {
    // Mostrar todas EXCEPTO las de Solicitud (menos Agendamiento que siempre entra)
    filteredClasificaciones = availableClasificaciones.filter(
      (c) =>
        !clasificacionesSolicitud.includes(c.nombre) ||
        c.nombre === "Agendamiento"
    );
  }

  // Definimos un "diccionario" con las clasificaciones y los inputs que deben renderizar
  const fileInputsConfig = {
    Agendamiento: [
      {
        id: "Agendamiento",
        label: (
          <>
            <a
              href="https://oficinavirtual.passusips.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="enlace-sin-subrayado" // Se ha agregado una clase para el estilo
            >
              ¡Agenda tus citas!
            </a>{" "}
            de Hidroterapia, Valoraciones iniciales de Programa de
            Rehabilitación, Consultas especializadas o Clases de natación
            <br /> <br />
          </>
        ),
      },
    ],
    "Reprogramación de citas": [
      {
        id: "Reprogramación de citas",
        label: <>Adjuntar:</>,
        required: true,
        archivos: [
          {
            id: "soporte_incapacidad_medica",
            name: "Soporte de incapacidad médica",
          },
        ],
      },
    ],

    "Política de multas por inasistencia": [
      {
        id: "politica_multas_inasistencia",
        label: <>Adjuntar:</>,
        required: true,
        archivos: [
          { id: "justificacion_medica", name: "Justificación médica" },
          {
            id: "soporte_fuerza_mayor",
            name: "Soporte de situación de fuerza mayor (si aplica)",
            required: false,
          },
        ],
      },
    ],

    "Envío de historia clínica o informes finales": [
      {
        id: "Envío de historia clínica o informes finales",
        required: true,
        label: (
          <>
            Adjuntar si es paciente directo:
            <ul className="lista-archivos">
              <li>Fotocopia de la cédula de ciudadanía.</li>
              <li>Diligenciar formato: Solicitud por paciente.</li>
            </ul>
            Adjuntar si es un tercero autorizado:
            <ul className="lista-archivos">
              <li>Fotocopia de la cédula del paciente y del autorizado.</li>
              <li>
                Soporte que acredite el parentesco (registro civil, acta de
                matrimonio).
              </li>
              <li>Diligenciar formato: Solicitud por Tercero.</li>
            </ul>
            Paciente menor de edad:
            <ul className="lista-archivos">
              <li>Registro civil o tarjeta de identidad (según edad).</li>
              <li>
                Registro civil que acredite el parentesco o documento que
                certifique la representación legal.
              </li>
              <li>Cédula de ciudadanía de los padres.</li>
              <li>Diligenciar formato: Solicitud por Tercero.</li>
            </ul>
          </>
        ),
        archivos: [
          // Paciente directo
          {
            id: "hc-directo-cedula",
            name: "Fotocopia de la cédula de ciudadanía",
          },
          {
            id: "hc-directo-formato",
            name: "Diligenciar formato: Solicitud por paciente",
          },

          // Tercero autorizado
          {
            id: "hc-tercero-cedulas",
            name: "Fotocopia de la cédula del paciente y del autorizado",
          },
          {
            id: "hc-tercero-parentesco",
            name: "Soporte de parentesco (registro civil, acta de matrimonio)",
          },
          {
            id: "hc-tercero-formato",
            name: "Diligenciar formato: Solicitud por Tercero",
          },

          // Paciente menor de edad
          {
            id: "hc-menor-registro",
            name: "Registro civil o tarjeta de identidad (según edad)",
          },
          {
            id: "hc-menor-parentesco",
            name: "Registro civil de parentesco o documento de representación legal",
          },
          { id: "hc-menor-cedula", name: "Cédula de ciudadanía de los padres" },
          {
            id: "hc-menor-formato",
            name: "Diligenciar formato: Solicitud por Tercero",
          },
        ],
      },
    ],

    "Solicitudes de tesorería": [
      {
        id: "solicitudes_tesoreria",
        label: <>Adjuntar:</>,
        required: true,
        archivos: [
          { id: "certificacion_bancaria", name: "Certificación bancaria" }, // requerido por defecto
          {
            id: "carta_autorizacion",
            name: "Carta de autorización de consignación a un tercero (si aplica).",
            required: false,
          }, // opcional
          { id: "soporte_medico", name: "Soporte médico" }, // requerido
          { id: "soporte_pago", name: "Soporte de pago o transacción" }, // requerido
        ],
      },
    ],
  };

  return (
    <>
      <div className="pqrs-container">
        <div className="header-pqrs">
          <div>
            Envía tu <span>PQR</span>
          </div>
          <label className="registra-otro-label">
            ¿Está registrando esta solicitud en nombre de otra persona o
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
          <form className="pqrs" onSubmit={handleSubmit} noValidate>
            {form.registra_otro === "si" && (
              <>
                <h1 className="titulo-form">
                  DATOS DE QUIEN REGISTRA LA SOLICITUD:
                </h1>
                <br />
                <div className="pqrs-otro">
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
                    <label htmlFor="parentesco">Parentesco o entidad</label>
                    {errors.parentesco && (
                      <p className="error">{errors.parentesco}</p>
                    )}
                  </div>
                  {(form.parentesco === "Ente de control" ||
                    form.parentesco === "Asegurador") && (
                    <div className="floating-label">
                      <input
                        id="nombre_entidad"
                        name="nombre_entidad"
                        value={form.nombre_entidad}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        // 🔹 Solo requerido si el parentesco es "Ente de control" o "Entidad"
                        required={
                          form.parentesco === "Ente de control" ||
                          form.parentesco === "Asegurador"
                        }
                      />
                      <label htmlFor="nombre_entidad">
                        Nombre de la entidad
                      </label>
                      {errors.nombre_entidad && (
                        <p className="error">{errors.nombre_entidad}</p>
                      )}
                    </div>
                  )}

                  <div className="floating-label">
                    <input
                      id="registrador_nombre"
                      name="registrador_nombre"
                      value={form.registrador_nombre}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    <label htmlFor="registrador_nombre">
                      Primer nombre de quien registra
                    </label>
                    {errors.registrador_nombre && (
                      <p className="error">{errors.registrador_nombre}</p>
                    )}
                  </div>

                  <div className="floating-label">
                    <input
                      id="registrador_segundo_nombre"
                      name="registrador_segundo_nombre"
                      value={form.registrador_segundo_nombre}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    <label htmlFor="registrador_nombre">
                      Segundo nombre de quien registra
                    </label>
                    {errors.registrador_segundo_nombre && (
                      <p className="error">
                        {errors.registrador_segundo_nombre}
                      </p>
                    )}
                  </div>

                  <div className="floating-label">
                    <input
                      id="registrador_apellido"
                      name="registrador_apellido"
                      value={form.registrador_apellido}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    <label htmlFor="registrador_apellido">
                      Primer apellido de quien registra
                    </label>
                    {errors.registrador_apellido && (
                      <p className="error">{errors.registrador_apellido}</p>
                    )}
                  </div>

                  <div className="floating-label">
                    <input
                      id="registrador_segundo_apellido"
                      name="registrador_segundo_apellido"
                      value={form.registrador_segundo_apellido}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    <label htmlFor="registrador_apellido">
                      Segundo apellido de quien registra
                    </label>
                    {errors.registrador_segundo_apellido && (
                      <p className="error">
                        {errors.registrador_segundo_apellido}
                      </p>
                    )}
                  </div>

                  {form.parentesco !== "Ente de control" &&
                    form.parentesco !== "Asegurador" && (
                      <div className="floating-label">
                        <select
                          id="registrador_documento_tipo"
                          name="registrador_documento_tipo"
                          value={form.registrador_documento_tipo}
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
                          <option value="PE">
                            Permiso Especial de Permanencia
                          </option>
                          <option value="PT">
                            Permiso por Protección Temporal
                          </option>
                          <option value="RC">Registro Civil</option>
                          <option value="SC">Salvo Conducto</option>
                          <option value="TI">Tarjeta de identidad</option>
                        </select>
                        <label htmlFor="registrador_documento_tipo">
                          Tipo de documento
                        </label>
                        {errors.registrador_documento_tipo && (
                          <p className="error">
                            {errors.registrador_documento_tipo}
                          </p>
                        )}
                      </div>
                    )}

                  {form.parentesco !== "Ente de control" &&
                    form.parentesco !== "Asegurador" && (
                      <div className="floating-label">
                        <input
                          id="registrador_documento_numero"
                          name="registrador_documento_numero"
                          type="text" // Mantener como text para permitir guiones/letras si NIT lo requiere
                          value={form.registrador_documento_numero}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required
                        />
                        <label htmlFor="registrador_documento_numero">
                          Número de documento
                        </label>
                        {errors.registrador_documento_numero && (
                          <p className="error">
                            {errors.registrador_documento_numero}
                          </p>
                        )}
                      </div>
                    )}

                  <div className="floating-label">
                    <input
                      id="registrador_telefono"
                      name="registrador_telefono"
                      type="text"
                      value={form.registrador_telefono}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    <label htmlFor="registrador_telefono">
                      Número de Celular
                    </label>
                    {errors.registrador_telefono && (
                      <p className="error">{errors.registrador_telefono}</p>
                    )}
                  </div>

                  {(form.parentesco === "Ente de control" ||
                    form.parentesco === "Asegurador") && (
                    <div className="floating-label">
                      <input
                        id="registrador_cargo"
                        name="registrador_cargo"
                        value={form.registrador_cargo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required={
                          form.parentesco === "Ente de control" ||
                          form.parentesco === "Asegurador"
                        }
                      />
                      <label htmlFor="registrador_cargo">Cargo</label>
                      {errors.registrador_cargo && (
                        <p className="error">{errors.registrador_cargo}</p>
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
                      Correo del registrador
                    </label>
                    {/* <label htmlFor="registrador_correo">Correo(s) del registrador</label>
  <small className="text-gray-500">
    Puedes ingresar varios correos separados por coma. Ej: juan@mail.com, maria@mail.com
  </small> */}
                    {errors.registrador_correo && (
                      <p className="error">{errors.registrador_correo}</p>
                    )}
                  </div>
                </div>
              </>
            )}
            <h1 className="titulo-form">DATOS DEL PACIENTE-USUARIO:</h1> <br />
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
                className={`floating-label regimen-select ${
                  form.regimen ? "has-value" : ""
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
                  id="tipo_solicitud"
                  name="tipo_solicitud"
                  value={form.tipo_solicitud}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  disabled={readOnlyTipoSolicitud}
                >
                  <option value="" disabled hidden></option>
                  {(
                    tipoSolicitudOptions || [
                      { value: "Peticion", label: "Petición" },
                      { value: "Queja", label: "Queja" },
                      { value: "Reclamo", label: "Reclamo" },
                    ]
                  ).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <label htmlFor="tipo_solicitud">Tipo de solicitud</label>
                {errors.tipo_solicitud && (
                  <p className="error">{errors.tipo_solicitud}</p>
                )}
              </div>

              {form.tipo_solicitud === "Tutela" && (
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
)}

              {/* 🟢 Campo Clasificaciones */}
              <div
                className="clasificaciones-container"
                ref={clasificacionesRef}
              >
                {/* Caja que parece un select */}
                <div
                  className="clasificaciones-select"
                  onClick={() =>
                    setShowClasificacionesDropdown((prev) => !prev)
                  }
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
                      ? availableClasificaciones
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
                    {filteredClasificaciones.map((clas) => (
                      <label key={clas.id} className="clasificaciones-option">
                        <input
                          type="checkbox"
                          value={clas.id}
                          checked={form.clasificaciones.includes(clas.id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setForm((prev) => {
                              const current = Array.isArray(
                                prev.clasificaciones
                              )
                                ? prev.clasificaciones
                                : [];

                              let updated;

                              if (form.tipo_solicitud === "Solicitud") {
                                // 🔹 Si es "Solicitud", solo permitimos una clasificación
                                updated = checked ? [clas.id] : [];
                              } else {
                                // 🔹 Si no es "Solicitud", funciona como multi-selección normal
                                updated = checked
                                  ? [...current, clas.id]
                                  : current.filter((id) => id !== clas.id);
                              }

                              return { ...prev, clasificaciones: updated };
                            });
                          }}
                        />
                        <span>{clas.nombre}</span>
                      </label>
                    ))}
                  </div>
                )}

                {errors.clasificaciones && (
                  <p className="error">{errors.clasificaciones}</p>
                )}
              </div>

              {/* 🟢 Renderizado condicional para el campo de clasificación de tutela */}
              {form.tipo_solicitud === "Tutela" && (
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
              )}

              {/* 🟢 Campo Accionado solo para tipo Tutela */}
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
                      className={`accionado-caret ${
                        showAccionadoDropdown ? "open" : ""
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

              {/* CAMPO DE FECHA DE INICIO REAL - VISIBLE SOLO SI EL USUARIO ESTÁ LOGEADO */}
              {isLoggedIn && (
                <div className="floating-label">
                  {" "}
                  <input
                    type="datetime-local" // Correcto para fecha y hora
                    id="fecha_inicio_real"
                    name="fecha_inicio_real"
                    value={
                      form.fecha_inicio_real
                        ? (() => {
                            const date = new Date(form.fecha_inicio_real); // Obtener componentes de fecha y hora local
                            const year = date.getFullYear();
                            const month = (date.getMonth() + 1)
                              .toString()
                              .padStart(2, "0");
                            const day = date
                              .getDate()
                              .toString()
                              .padStart(2, "0");
                            const hours = date
                              .getHours()
                              .toString()
                              .padStart(2, "0");
                            const minutes = date
                              .getMinutes()
                              .toString()
                              .padStart(2, "0");

                            return `${year}-${month}-${day}T${hours}:${minutes}`;
                          })()
                        : ""
                    }
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />{" "}
                  <label htmlFor="fecha_inicio_real">
                    Fecha y Hora de Inicio Real de la PQR:{" "}
                  </label>{" "}
                  {errors.fecha_inicio_real && (
                    <p className="error">{errors.fecha_inicio_real}</p>
                  )}{" "}
                </div>
              )}

              {isLoggedIn && (
                <div className="floating-label">
                  <select
                    id="fuente"
                    name="fuente"
                    value={form.fuente}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    disabled={readOnlyTipoSolicitud}
                  >
                    <option value="" disabled hidden></option>
                    <option value="Callcenter">Callcenter</option>
                    <option value="Correo atención al usuario">
                      Correo atención al usuario
                    </option>
                    <option value="Correo de Agendamiento NAC">
                      Correo de Agendamiento NAC
                    </option>
                    <option value="Encuesta de satisfacción IPS">
                      Encuesta de satisfacción IPS
                    </option>
                    <option value="Formulario de la web">
                      Formulario de la web
                    </option>
                    <option value="Presencial">Presencial</option>
                    <option value="Correo de Notificaciones IPS">
                      Correo de Notificaciones IPS
                    </option>
                  </select>
                  <label htmlFor="fuente">Origen</label>
                  {errors.fuente && <p className="error">{errors.fuente}</p>}
                </div>
              )}
            </div>
            {/* 🔹 Si la clasificación seleccionada está en fileInputsConfig → muestra su(s) botón(es) */}
            {Object.entries(fileInputsConfig).map(([clasificacion, inputs]) =>
              availableClasificaciones.some(
                (c) =>
                  Array.isArray(form.clasificaciones) &&
                  form.clasificaciones &&
                  form.clasificaciones.includes(c.id) &&
                  c.nombre.toLowerCase() === clasificacion.toLowerCase()
              ) ? (
                <div key={clasificacion} className="file-input-group">
                  {clasificacion ===
                  "Envío de historia clínica o informes finales" ? (
                    <>
                      {/* Lógica para la historia clínica */}
                      <div className="subopcion-historia">
                        <label>Seleccione quién hace la solicitud:</label>
                        <select
                          value={subOpcionHistoria}
                          onChange={(e) => setSubOpcionHistoria(e.target.value)}
                          className={`${
                            errors["subOpcionHistoria"] ? "input-error" : ""
                          }`}
                        >
                          <option value="">-- Seleccione una opción --</option>
                          {Object.keys(historiaClinicaOptions).map((op) => (
                            <option key={op} value={op}>
                              {op}
                            </option>
                          ))}
                        </select>
                        {errors["subOpcionHistoria"] && (
                          <p className="error-message">
                            {errors["subOpcionHistoria"]}
                          </p>
                        )}
                      </div>
                      {subOpcionHistoria &&
                        historiaClinicaOptions[subOpcionHistoria].map((req) => {
                          const requisitoId = req.id;
                          const archivo = archivosPorRequisito[requisitoId];

                          return (
                            <div key={requisitoId} className="file-input-group">
                              <li className="flex items-center">
                                {archivo ? (
                                  <>
                                    <span>{req.label}</span>
                                    <span className="icono-carga-archivo">
                                      ✔️
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span>{req.label}</span>
                                    {req.required && (
                                      <span className="text-red-500">*</span>
                                    )}
                                    <label
                                      htmlFor={`file-upload-${requisitoId}`}
                                      className="file-upload-button ml-auto"
                                    >
                                      Subir archivo
                                    </label>
                                    <input
                                      id={`file-upload-${requisitoId}`}
                                      type="file"
                                      style={{ display: "none" }}
                                      onChange={(e) =>
                                        handleFileChange(e, requisitoId)
                                      }
                                    />
                                  </>
                                )}
                              </li>
                              {archivo && (
                                <div className="archivo-subido">
                                  {archivo.name} (
                                  {(archivo.size / 1024 / 1024).toFixed(2)} MB)
                                  <button
                                    type="button"
                                    className="remove-file-button"
                                    onClick={() => removeFile(requisitoId)}
                                  >
                                    X
                                  </button>
                                </div>
                              )}
                              {errors[requisitoId] && (
                                <p className="error-message text-red-500 text-sm mt-1">
                                  {errors[requisitoId]}
                                </p>
                              )}
                            </div>
                          );
                        })}
                    </>
                  ) : (
                    /* Lógica unificada para todas las demás clasificaciones */
                    <>
                      {inputs.map((input) => (
                        <div key={input.id}>
                          <div className="file-upload-text">
                            {input.label}{" "}
                            {/* Muestra la etiqueta con la lista <ul> si está definida así */}
                            {input.archivos && (
                              <ul className="lista-archivos">
                                {input.archivos.map((req) => {
                                  const requisitoId = req.id;
                                  const archivo =
                                    archivosPorRequisito[requisitoId];
                                  const hasError = errors[requisitoId];

                                  return (
                                    <div
                                      key={requisitoId}
                                      className="requisito-con-archivo"
                                    >
                                      <li className="requisito-item">
                                        <span>{req.name}</span>

                                        {archivo && (
                                          <span className="text-green-600 font-bold">
                                            ✔️
                                          </span>
                                        )}

                                        {!archivo && (
                                          <label
                                            htmlFor={`file-upload-${requisitoId}`}
                                            className="file-upload-button"
                                          >
                                            Subir archivo
                                          </label>
                                        )}

                                        <input
                                          id={`file-upload-${requisitoId}`}
                                          type="file"
                                          style={{ display: "none" }}
                                          onChange={(e) =>
                                            handleFileChange(e, requisitoId)
                                          }
                                        />
                                      </li>

                                      {archivo && (
                                        <div className="archivo-subido">
                                          {archivo.name} (
                                          {(archivo.size / 1024 / 1024).toFixed(
                                            2
                                          )}{" "}
                                          MB)
                                          <button
                                            type="button"
                                            className="remove-file-button"
                                            onClick={() =>
                                              removeFile(requisitoId)
                                            }
                                          >
                                            X
                                          </button>
                                        </div>
                                      )}

                                      {hasError && (
                                        <p className="error-message text-red-500 text-sm mt-1">
                                          {hasError}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ) : null
            )}
            {/* 🔹 ÚNICO bloque de archivos adicionales SIEMPRE visible */}
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

                  // Filtrar por tamaño (máximo 7MB)
                  const validos = [];
                  nuevos.forEach((file) => {
                    if (file.size > 7 * 1024 * 1024) {
                      Swal.fire({
                        icon: "error",
                        title: "Archivo demasiado grande",
                        text: `El archivo "${file.name}" supera los 7 MB.`,
                      });
                    } else {
                      validos.push(file);
                    }
                  });

                  if (validos.length > 0) {
                    setArchivos((prev) => [...prev, ...validos]);
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
                className={`contador-caracteres ${
                  form.descripcion.length > MAX_CARACTERES_DESCRIPCION * 0.9
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
                    <strong>Agendamiento: </strong>
                    Agendar citas desde la Oficina Virtual
                  </li>
                  <li className="parrafo-clasificacion">
                    <strong>Solicitudes de tesorería: </strong>
                    Trámites relacionados con pagos, facturación o reembolsos.
                  </li>
                  <li className="parrafo-clasificacion">
                    <strong>
                      Envío de historia clínica o informes finales:{" "}
                    </strong>
                    Solicitud de copias de su historia clínica o reportes de
                    atención.
                  </li>
                  <li className="parrafo-clasificacion">
                    <strong>Política de multas por inasistencia: </strong>
                    Consultas o solicitudes relacionadas con la aplicación de la
                    política de inasistencia a citas.
                  </li>
                  <li className="parrafo-clasificacion">
                    <strong>Reprogramación de citas: </strong>
                    Para programar o cambiar la fecha/hora de una cita.
                  </li>
                </ul>
              </>
            )}
          </div>
        </div>
        <Modal
          show={showModal}
          onClose={() => setShowModal(false)}
          title={modalContent.title}
          description={modalContent.description}
        />
      </div>

      <Footer />
    </>
  );
}

export default PqrsForm;

// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { createPqr } from "./pqrsService"; // Asegúrate de tener createPqr y updatePqr si los usas
// import "./styles/Pqrs.css";
// import Swal from "sweetalert2";
// import { pqrsSchema, getFilesSchema } from "./pqrValidation";
// import Modal from "../components/Modal/Modal";
// import { Footer } from "../components/Footer/Footer";
// import api from "../api/api";
// import * as Yup from "yup";

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

// const epsRegimenMap = {
//   Compensar: ["Contributivo", "Subsidiado"],
//   Fomag: ["Especial"],
//   Famisanar: ["Contributivo", "Subsidiado"],
//   "Nueva Eps": ["Contributivo", "Subsidiado"],
//   Sanitas: ["Contributivo", "Subsidiado"],
//   Sura: ["Contributivo", "Subsidiado"],
//   Aliansalud: ["Contributivo"],
//   "Asmet Salud": ["Contributivo", "Subsidiado"],
//   "Seguros Bolivar": ["ARL"],
//   Cafam: ["Contributivo", "Subsidiado"],
//   Colmédica: ["Medicina prepagada"],
//   Positiva: ["ARL"],
//   Particular: ["Particular"],
// };

// const serviciosPorSede = {
//   "Bogota-Norte": [
//     "Hidroterapia",
//     "Valoración por fisioterapia telemedicina",
//     "Psiquiatría",
//     "Fisiatría",
//   ],
//   "Bogota-Centro": [
//     "Hidroterapia",
//     "Valoración por fisioterapia telemedicina",
//     "Programa de Rehabilitación",
//   ],
//   "Bogota-Sur-Occidente-Rehabilitación": [
//     "Programa de Rehabilitación",
//     "Neuropediatría",
//     "Psiquiatría",
//     "Fisiatría",
//   ],
//   "Bogota-Sur-Occidente-Hidroterapia": [
//     "Hidroterapia",
//     "Valoración por fisioterapia telemedicina",
//   ],
//   Ibague: [
//     "Hidroterapia",
//     "Valoración por fisioterapia telemedicina ",
//     "Programa de Rehabilitación",
//     "Neuropediatría",
//     "Psiquiatría",
//     "Fisiatría",
//   ],
//   Chia: [
//     "Programa de Rehabilitación",
//     "Neuropediatría",
//     "Psiquiatría",
//     "Fisiatría",
//   ],
//   Florencia: [
//     "Programa de Rehabilitación",
//     "Hidroterapía",
//     "Valoración por fisioterapia telemedicina",
//     "Neuropediatría",
//     "Psiquiatría",
//     "Fisiatría",
//   ],
//   "Cedritos-Divertido": ["Natación", "Yoga", "Pilates"],
// };

// const parentesco = [
//   "Hijo/a",
//   "Asegurador",
//   "Ente de control",
//   "Otro Familiar",
//   "Padre",
//   "Madre",
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
//       "Requerimiento a través de la cual una persona por motivos de interés general o particular solicita la intervención de la entidad para la resolución de una situación, la prestación de un servicio, la información o requerimiento de copia de documentos, entre otros. (Derecho de Petición).",
//   },
//   Queja: {
//     title: "Queja",
//     description:
//       "Es la manifestación de una inconformidad presentada respecto a los servicios recibidos tales como el trato por parte de los trabajadores y profesionales de la salud, condiciones físicas del entorno, o deficiencias en la atención.",
//   },
//   Reclamo: {
//     title: "Reclamo",
//     description:
//       "Es la exigencia formal que se presenta ante una irregularidad, incumplimiento o afectación directa en la prestación del servicio de salud, que requiere respuesta, corrección, o compensación.",
//   },
// };

// function PqrsForm({
//   defaultTipoSolicitud,
//   readOnlyTipoSolicitud,
//   tipoSolicitudOptions,
//   pqrData = null, // Para edición de PQR existente
// }) {
//   const [form, setForm] = useState({
//     nombre: "",
//     segundo_nombre: "",
//     apellido: "",
//     segundo_apellido: "",
//     documento_tipo: "",
//     documento_numero: "",
//     correo: "",
//     correo_confirmacion: "",
//     telefono: "",
//     sede: "",
//     servicio_prestado: "",
//     eps: "",
//     regimen: "",
//     regimenLocked: false,
//     tipo_solicitud: defaultTipoSolicitud || "",
//     clasificacion_tutela: "",
//     accionado: [],
//     descripcion: "",
//     politica_aceptada: false,
//     registra_otro: "no",
//     registrador_nombre: "",
//     registrador_segundo_nombre: "",
//     registrador_apellido: "",
//     registrador_segundo_apellido: "",
//     registrador_documento_tipo: "",
//     registrador_documento_numero: "",
//     registrador_correo: "",
//     registrador_telefono: "",
//     parentesco: "",
//     registrador_cargo: "",
//     nombre_entidad: "",
//     fuente: "Formulario de la web",
//     fecha_inicio_real: "", // Se inicializa como cadena vacía, se llenará en useEffect
//     clasificaciones: [],
//   });

//   const [archivos, setArchivos] = useState([]);
//   const [archivosPorRequisito, setArchivosPorRequisito] = useState({});
//   const [subOpcionHistoria, setSubOpcionHistoria] = useState("");
//   const historiaClinicaOptions = {
//     "Paciente directo": [
//       {
//         id: "hc-directo-cedula",
//         label: (
//           <span className="label-historia">
//             Fotocopia de la cédula de ciudadanía.
//           </span>
//         ),
//       },
//       {
//         id: "hc-directo-formato",
//         label: (
//           <span className="label-historia">
//             Diligenciar formato: Solicitud por paciente.
//           </span>
//         ),
//       },
//     ],
//     "Tercero autorizado": [
//       {
//         id: "hc-tercero-cedulas",
//         label: (
//           <span className="label-historia">
//             Fotocopia de la cédula del paciente y del autorizado.
//           </span>
//         ),
//       },
//       {
//         id: "hc-tercero-parentesco",
//         label: (
//           <span className="label-historia">
//             Soporte que acredite el parentesco (registro civil, acta de
//             matrimonio).
//           </span>
//         ),
//       },
//       {
//         id: "hc-tercero-formato",
//         label: (
//           <span className="label-historia">
//             Diligenciar formato: Solicitud por Tercero.
//           </span>
//         ),
//       },
//     ],
//     "Paciente menor de edad": [
//       {
//         id: "hc-menor-registro",
//         label: (
//           <span className="label-historia">
//             Registro civil o tarjeta de identidad (según edad).
//           </span>
//         ),
//       },
//       {
//         id: "hc-menor-parentesco",
//         label: (
//           <span className="label-historia">
//             Registro civil que acredite el parentesco o documento que certifique
//             la representación legal.
//           </span>
//         ),
//       },
//       {
//         id: "hc-menor-cedula",
//         label: (
//           <span className="label-historia">
//             Cédula de ciudadanía de los padres.
//           </span>
//         ),
//       },
//       {
//         id: "hc-menor-formato",
//         label: (
//           <span className="label-historia">
//             Diligenciar formato: Solicitud por Tercero.
//           </span>
//         ),
//       },
//     ],
//     "Paciente incapacitado o declarado interdicto": [
//       {
//         id: "hc-incapacitado-certificado",
//         label: (
//           <span className="label-historia">
//             Certificado médico que evidencie el estado de salud del paciente.
//           </span>
//         ),
//       },
//       {
//         id: "hc-incapacitado-parentesco",
//         label: (
//           <span className="label-historia">
//             Documentos que acrediten el parentesco o la representación legal.
//           </span>
//         ),
//       },
//       {
//         id: "hc-incapacitado-cedula",
//         label: (
//           <span className="label-historia">
//             Cédula del paciente y del familiar o representante.
//           </span>
//         ),
//       },
//       {
//         id: "hc-incapacitado-interdiccion",
//         label: (
//           <span className="label-historia">
//             En caso de interdicción, adjuntar la sentencia de interdicción y
//             copia de la cédula del curador.
//           </span>
//         ),
//       },
//       {
//         id: "hc-incapacitado-formato",
//         label: (
//           <span className="label-historia">
//             Diligenciar formato: Solicitud de historia clínica por tercero.
//           </span>
//         ),
//       },
//     ],
//   };
//   useEffect(() => {
//     // 1. Prioridad más alta: si se registra a otro, siempre será "Tercero autorizado"
//     if (form.registra_otro === "si") {
//       setSubOpcionHistoria("Tercero autorizado");
//     }
//     // 2. Siguiente prioridad: si el tipo de documento es "TI" (Tarjeta de Identidad), es un menor de edad
//     else if (
//       form.documento_tipo === "TI" ||
//       form.documento_tipo === "RC" ||
//       form.documento_tipo === "CN"
//     ) {
//       setSubOpcionHistoria("Paciente menor de edad");
//     }
//     // 3. Siguiente prioridad: si el tipo de documento es diferente de "TI" (Tarjeta de Identidad), es un paciente directo
//     else if (
//       form.documento_tipo !== "TI" ||
//       form.documento_tipo !== "RC" ||
//       form.documento_tipo !== "CN"
//     ) {
//       setSubOpcionHistoria("Paciente directo");
//     }
//     // 4. Si ninguna condición se cumple, el dropdown se reinicia
//     else {
//       setSubOpcionHistoria("");
//     }
//   }, [form.registra_otro, form.documento_tipo]);

//   useEffect(() => {
//     if (form.sede === "Cedritos-Divertido") {
//       setForm((prev) => ({
//         ...prev,
//         eps: "Particular",
//         regimen: "Particular",
//       }));
//     }
//   }, [form.sede]);

//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});
//   const isLoggedIn = !!localStorage.getItem("token"); // Verifica si el usuario está logeado
//   // Estado para mostrar/ocultar el dropdown de Accionado
//   const [showAccionadoDropdown, setShowAccionadoDropdown] = useState(false);

//   const [showModal, setShowModal] = useState(false);
//   const [modalContent, setModalContent] = useState({
//     title: "",
//     description: "",
//   });
//   const MAX_CARACTERES_DESCRIPCION = 1500;

//   const accionadoRef = useRef(null);
//   const clasificacionesRef = useRef(null);
//   const [availableClasificaciones, setAvailableClasificaciones] = useState([]);
//   const [showClasificacionesDropdown, setShowClasificacionesDropdown] =
//     useState(false);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (accionadoRef.current && !accionadoRef.current.contains(e.target)) {
//         setShowAccionadoDropdown(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (
//         clasificacionesRef.current &&
//         !clasificacionesRef.current.contains(event.target)
//       ) {
//         setShowClasificacionesDropdown(false);
//       }
//     }

//     if (showClasificacionesDropdown) {
//       document.addEventListener("mousedown", handleClickOutside);
//     } else {
//       document.removeEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showClasificacionesDropdown]);

//   // Efecto para inicializar el formulario (ej. al cargar el componente o al recibir pqrData)
//   useEffect(() => {
//     const fetchClasificaciones = async () => {
//       try {
//         const response = await api.get("/clasificaciones");
//         setAvailableClasificaciones(response.data);
//       } catch (err) {
//         console.error("Error cargando clasificaciones", err);
//       }
//     };
//     fetchClasificaciones();

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
//         segundo_nombre: pqrData.segundo_nombre || "",
//         apellido: pqrData.apellido || "",
//         segundo_apellido: pqrData.segundo_apellido || "",
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
//         clasificacion_tutela: pqrData.clasificacion_tutela || "",
//         accionado: pqrData.accionado || "",
//         descripcion: pqrData.descripcion || "",
//         fuente: pqrData.fuente || "Formulario de la web",
//         registra_otro: pqrData.registra_otro === "si" ? "si" : "no",
//         registrador_nombre: pqrData.registrador_nombre || "",
//         registrador_segundo_nombre: pqrData.registrador_segundo_nombre || "",
//         registrador_apellido: pqrData.registrador_apellido || "",
//         registrador_segundo_apellido:
//           pqrData.registrador_segundo_apellido || "",
//         registrador_documento_tipo: pqrData.registrador_documento_tipo || "",
//         registrador_documento_numero:
//           pqrData.registrador_documento_numero || "",
//         registrador_correo: pqrData.registrador_correo || "",
//         registrador_telefono: pqrData.registrador_telefono || "",
//         parentesco: pqrData.parentesco || "",
//         registrador_cargo: pqrData.registrador_cargo || "",
//         nombre_entidad: pqrData.nombre_entidad || "",
//         politica_aceptada: pqrData.politica_aceptada === "true", // O el valor que use tu API
//         clasificaciones: pqrData.clasificaciones
//           ? pqrData.clasificaciones.map((c) => c.id)
//           : [],
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
//         // 🔹 Manejo especial para "clasificaciones" múltiples
//         if (name === "clasificaciones") {
//           const valueInt = parseInt(value, 10);
//           let updatedClasificaciones = [...(prev.clasificaciones || [])];

//           if (checked) {
//             if (!updatedClasificaciones.includes(valueInt)) {
//               updatedClasificaciones.push(valueInt);
//             }
//           } else {
//             updatedClasificaciones = updatedClasificaciones.filter(
//               (id) => id !== valueInt
//             );
//           }

//           return {
//             ...prev,
//             clasificaciones: updatedClasificaciones,
//           };
//         }

//         // 🔹 Manejo especial para "accionado" múltiple
//         if (name === "accionado") {
//           let updatedAccionado = [...(prev.accionado || [])];

//           if (type === "checkbox") {
//             if (checked) {
//               updatedAccionado.push(value);
//             } else {
//               updatedAccionado = updatedAccionado.filter(
//                 (item) => item !== value
//               );
//             }
//           } else {
//             updatedAccionado = value; // Si viene de un multiselect
//           }

//           return {
//             ...prev,
//             accionado: updatedAccionado,
//           };
//         }

//         // 🔹 Si cambia la sede, limpiar servicio_prestado
//         if (name === "sede") {
//           return {
//             ...prev,
//             sede: value,
//             servicio_prestado: "",
//           };
//         }

//         // 🔹 Lógica para tipo de solicitud y clasificacion_tutela
//         if (name === "tipo_solicitud") {
//           const newState = {
//             ...prev,
//             [name]: value,
//           };
//           if (value !== "Tutela") {
//             newState.clasificacion_tutela = "";
//           }

//           // Mostrar modal de ayuda (si aplica)
//           if (tipoSolicitudDescriptions[value]) {
//             setModalContent(tipoSolicitudDescriptions[value]);
//             setShowModal(true);
//           } else {
//             setShowModal(false);
//             setModalContent({ title: "", description: "" });
//           }

//           return newState;
//         }

//         // 🔹 Si cambia EPS, asignar régimen según opciones
//         if (name === "eps") {
//           if (!value) {
//             return { ...prev, eps: "", regimen: "", regimenLocked: false };
//           }

//           const opciones = epsRegimenMap[value] || [];

//           return {
//             ...prev,
//             eps: value,
//             regimen: opciones.length === 1 ? opciones[0] : "", // autoselecciona si hay solo una
//             regimenLocked: opciones.length === 1, // bloquea si hay solo una
//           };
//         }

//         // 🔹 Manejo normal (otros inputs)
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
//     },
//     [readOnlyTipoSolicitud, setForm, setModalContent, setShowModal]
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

//   // Manejo de archivos por requisito con validación de tamaño
//   const handleFileChange = (e, requisitoId) => {
//     const selectedFile = e.target.files[0]; // solo 1 archivo por requisito
//     if (!selectedFile) return;

//     // Validar tamaño (7MB)
//     if (selectedFile.size > 7 * 1024 * 1024) {
//       Swal.fire({
//         icon: "error",
//         title: "Archivo demasiado grande",
//         html: `El archivo <b>${selectedFile.name}</b> supera el tamaño máximo (7 MB).`,
//         confirmButtonColor: "#d33",
//       });
//       e.target.value = ""; // reset input
//       return;
//     }

//     // Guardar archivo en el estado (clave = requisitoId)
//     setArchivosPorRequisito((prev) => ({
//       ...prev,
//       [requisitoId]: selectedFile,
//     }));

//     e.target.value = ""; // reset input
//   };

//   // Eliminar archivo por requisito
//   const removeFile = (requisitoId) => {
//     setArchivosPorRequisito((prev) => {
//       const updated = { ...prev };
//       delete updated[requisitoId];
//       return updated;
//     });
//   };

//   // ---- Validación de archivos obligatorios ----
//   const validateArchivos = (
//     clasificaciones,
//     availableClasificaciones,
//     archivosPorRequisito,
//     subOpcionHistoria,
//     historiaClinicaOptions,
//     fileInputsConfig
//   ) => {
//     let errors = {};

//     clasificaciones.forEach((clasificacionId) => {
//       const clasificacionObj = availableClasificaciones.find(
//         (c) => c.id === clasificacionId
//       );
//       if (!clasificacionObj) return;

//       const nombreClasificacion = clasificacionObj.nombre;

//       // Caso especial: Historia clínica
//       if (
//         nombreClasificacion.toLowerCase() ===
//         "envío de historia clínica o informes finales".toLowerCase()
//       ) {
//         if (!subOpcionHistoria) {
//           errors["subOpcionHistoria"] = "Seleccione una opción.";
//         } else {
//           historiaClinicaOptions[subOpcionHistoria].forEach((req) => {
//             if (!archivosPorRequisito[req.id]) {
//               errors[req.id] = "Este archivo es obligatorio.";
//             }
//           });
//         }
//         return;
//       }

//       // Caso especial: Solicitudes de tesorería
//       // Caso especial: Solicitudes de tesorería
//       if (
//         nombreClasificacion.toLowerCase() ===
//         "solicitudes de tesorería".toLowerCase()
//       ) {
//         const inputsTesoreria = fileInputsConfig[nombreClasificacion] || [];
//         inputsTesoreria.forEach((input) => {
//           if (input.archivos) {
//             input.archivos.forEach((archivo) => {
//               const isRequired =
//                 archivo.required === undefined ? true : archivo.required;
//               if (isRequired && !archivosPorRequisito[archivo.id]) {
//                 errors[archivo.id] = "Este archivo es obligatorio.";
//               }
//             });
//           }
//         });
//         return;
//       }

//       if (
//         nombreClasificacion.toLowerCase() ===
//         "política de multas por inasistencia".toLowerCase()
//       ) {
//         const inputsMultas = fileInputsConfig[nombreClasificacion] || [];
//         inputsMultas.forEach((input) => {
//           if (input.archivos) {
//             input.archivos.forEach((archivo) => {
//               const isRequired =
//                 archivo.required === undefined ? true : archivo.required;
//               if (isRequired && !archivosPorRequisito[archivo.id]) {
//                 errors[archivo.id] = "Este archivo es obligatorio.";
//               }
//             });
//           }
//         });
//         return;
//       }

//       // Otras clasificaciones: validar solo si tienen archivos definidos
//       const inputs = fileInputsConfig[nombreClasificacion] || [];
//       inputs.forEach((input) => {
//         if (input.required && input.archivos) {
//           input.archivos.forEach((req) => {
//             if (!archivosPorRequisito[req.id]) {
//               errors[req.id] = "Este archivo es obligatorio.";
//             }
//           });
//         }
//       });
//     });

//     return errors;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrors({});

//     try {
//       const allErrors = {};

//       // 1. Validar esquema principal (campos normales)
//       try {
//         await pqrsSchema.validate(form, {
//           abortEarly: false,
//           context: { isLoggedIn },
//         });
//       } catch (err) {
//         if (err instanceof Yup.ValidationError) {
//           err.inner.forEach(({ path, message }) => {
//             allErrors[path] = message;
//           });
//         } else {
//           throw err;
//         }
//       }

//       // 2. Validar archivos obligatorios por clasificación
//       const archivoErrors = validateArchivos(
//         form.clasificaciones,
//         availableClasificaciones,
//         archivosPorRequisito,
//         subOpcionHistoria,
//         historiaClinicaOptions,
//         fileInputsConfig
//       );

//       Object.assign(allErrors, archivoErrors);

//       // 3. Si hay errores, mostrar y detener
//       if (Object.keys(allErrors).length > 0) {
//         setErrors(allErrors);
//         Swal.fire({
//           icon: "error",
//           title: "Error de validación",
//           text: "Por favor, revisa los campos y adjunta todos los archivos obligatorios.",
//           confirmButtonColor: "#d33",
//         });
//         setLoading(false);
//         return;
//       }

//       // 4. Confirmación de envío
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

//       Swal.fire({
//         title: "Enviando PQR...",
//         text: "Por favor espera mientras procesamos tu solicitud.",
//         allowOutsideClick: false,
//         didOpen: () => Swal.showLoading(),
//       });

//       // 5. Construir FormData
//       const formData = new FormData();

//       // Archivos
//       Object.values(archivosPorRequisito).forEach((file) => {
//         formData.append("archivos[]", file);
//       });

//       archivos.forEach((file) => {
//         formData.append("archivos_adicionales[]", file);
//       });
//       // Campos del formulario
//       Object.entries(form).forEach(([key, value]) => {
//         if (key.startsWith("registrador_") && form.registra_otro === "no")
//           return;
//         if (key === "parentesco" && form.registra_otro === "no") return;

//         if (
//           key === "registrador_cargo" &&
//           form.parentesco !== "Ente de control" &&
//           form.parentesco !== "Asegurador"
//         )
//           return;

//         if (
//           key === "nombre_entidad" &&
//           form.parentesco !== "Ente de control" &&
//           form.parentesco !== "Asegurador"
//         )
//           return;

//         if (key === "politica_aceptada") {
//           formData.append(key, value ? "true" : "false");
//           return;
//         }

//         if (key === "fecha_inicio_real") {
//           if (isLoggedIn && value) formData.append(key, value);
//           return;
//         }

//         if (key === "clasificacion_tutela") {
//           if (form.tipo_solicitud === "Tutela" && value) {
//             formData.append(key, value);
//           }
//           return;
//         }

//         if (key === "accionado") {
//           if (form.tipo_solicitud === "Tutela" && Array.isArray(value)) {
//             value.forEach((item) => {
//               formData.append("accionado[]", item);
//             });
//           }
//           return;
//         }

//         if (key === "clasificaciones") {
//           if (Array.isArray(value) && value.length > 0) {
//             value.forEach((id) => {
//               formData.append("clasificaciones[]", id);
//             });
//           }
//           return;
//         }

//         if (value !== null && value !== undefined && value !== "") {
//           formData.append(key, value);
//         }
//       });

//       // 6. Enviar a backend
//       if (pqrData && pqrData.pqr_codigo) {
//         console.warn(
//           "Función de actualización no implementada, creando en su lugar"
//         );
//         await createPqr(formData);
//       } else {
//         await createPqr(formData);

//         // Determina los destinatarios del correo basándose en la lógica del parentesco
//      let mensajeDestinatario = "";

// if (form.tipo_solicitud !== "Tutela") {
//   if (
//     form.parentesco === "Asegurador" ||
//     form.parentesco === "Ente de control"
//   ) {
//     // Si el parentesco es Asegurador o Ente de control, el correo solo va al registrador.
//     mensajeDestinatario = `El número de radicado será enviado al correo <strong>${form.registrador_correo}</strong>.`;
//   } else {
//     // Si no, el correo va al paciente y al registrador (si este existe).
//     if (form.registrador_correo) {
//       mensajeDestinatario = `El número de radicado será enviado a los correos <strong>${form.correo}</strong> y <strong>${form.registrador_correo}</strong>.`;
//     } else {
//       mensajeDestinatario = `El número de radicado será enviado al correo <strong>${form.correo}</strong>.`;
//     }
//   }
// }

//         // Muestra el mensaje de SweetAlert2 con el texto dinámico
//         Swal.fire({
//           icon: "success",
//           title: "¡PQR enviada!",
//           html: `Tu PQRS ha sido enviada con éxito.<br/>${mensajeDestinatario}`,
//           confirmButtonColor: "#3085d6",
//         });
//       }

//       // 7. Reset de formulario si es nuevo
//       if (!pqrData) {
//         setForm({
//           nombre: "",
//           segundo_nombre: "",
//           apellido: "",
//           segundo_apellido: "",
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
//           clasificaciones: [],
//           descripcion: "",
//           politica_aceptada: false,
//           registra_otro: "no",
//           registrador_nombre: "",
//           registrador_segundo_nombre: "",
//           registrador_apellido: "",
//           registrador_segundo_apellido: "",
//           registrador_documento_tipo: "",
//           registrador_documento_numero: "",
//           registrador_correo: "",
//           registrador_telefono: "",
//           parentesco: "",
//           fuente: "Formulario de la web",
//           fecha_inicio_real: isLoggedIn
//             ? formatDateToISOWithTime(new Date())
//             : "",
//         });
//         setArchivosPorRequisito({});
//       }
//     } catch (err) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: err.message || "Ocurrió un error al enviar la PQR.",
//         confirmButtonColor: "#d33",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔹 Lista de clasificaciones especiales de "Solicitud"
//   const clasificacionesSolicitud = [
//     "Agendamiento",
//     "Solicitudes de tesorería",
//     "Envío de historia clínica o informes finales",
//     "Política de multas por inasistencia",
//     "Reprogramación de citas",
//   ];

//   // 🔹 Filtrar clasificaciones según tipo_solicitud
//   let filteredClasificaciones;

//   if (form.tipo_solicitud === "Solicitud") {
//     // Solo mostrar estas 5
//     filteredClasificaciones = availableClasificaciones.filter((c) =>
//       clasificacionesSolicitud.includes(c.nombre)
//     );
//   } else {
//     // Mostrar todas EXCEPTO las de Solicitud (menos Agendamiento que siempre entra)
//     filteredClasificaciones = availableClasificaciones.filter(
//       (c) =>
//         !clasificacionesSolicitud.includes(c.nombre) ||
//         c.nombre === "Agendamiento"
//     );
//   }

//   // Definimos un "diccionario" con las clasificaciones y los inputs que deben renderizar
//   const fileInputsConfig = {
//     Agendamiento: [
//       {
//         id: "Agendamiento",
//         label: (
//           <>
//             <a
//               href="https://oficinavirtual.passusips.com/login"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="enlace-sin-subrayado" // Se ha agregado una clase para el estilo
//             >
//               ¡Agenda tus citas!
//             </a>{" "}
//             de Hidroterapia, Valoraciones iniciales de Programa de
//             Rehabilitación, Consultas especializadas o Clases de natación
//             <br /> <br />
//           </>
//         ),
//       },
//     ],
//     "Reprogramación de citas": [
//       {
//         id: "Reprogramación de citas",
//         label: <>Adjuntar:</>,
//         required: true,
//         archivos: [
//           {
//             id: "soporte_incapacidad_medica",
//             name: "Soporte de incapacidad médica",
//           },
//         ],
//       },
//     ],

//     "Política de multas por inasistencia": [
//       {
//         id: "politica_multas_inasistencia",
//         label: <>Adjuntar:</>,
//         required: true,
//         archivos: [
//           { id: "justificacion_medica", name: "Justificación médica" },
//           {
//             id: "soporte_fuerza_mayor",
//             name: "Soporte de situación de fuerza mayor (si aplica)",
//             required: false,
//           },
//         ],
//       },
//     ],

//     "Envío de historia clínica o informes finales": [
//       {
//         id: "Envío de historia clínica o informes finales",
//         required: true,
//         label: (
//           <>
//             Adjuntar si es paciente directo:
//             <ul className="lista-archivos">
//               <li>Fotocopia de la cédula de ciudadanía.</li>
//               <li>Diligenciar formato: Solicitud por paciente.</li>
//             </ul>
//             Adjuntar si es un tercero autorizado:
//             <ul className="lista-archivos">
//               <li>Fotocopia de la cédula del paciente y del autorizado.</li>
//               <li>
//                 Soporte que acredite el parentesco (registro civil, acta de
//                 matrimonio).
//               </li>
//               <li>Diligenciar formato: Solicitud por Tercero.</li>
//             </ul>
//             Paciente menor de edad:
//             <ul className="lista-archivos">
//               <li>Registro civil o tarjeta de identidad (según edad).</li>
//               <li>
//                 Registro civil que acredite el parentesco o documento que
//                 certifique la representación legal.
//               </li>
//               <li>Cédula de ciudadanía de los padres.</li>
//               <li>Diligenciar formato: Solicitud por Tercero.</li>
//             </ul>
//           </>
//         ),
//         archivos: [
//           // Paciente directo
//           {
//             id: "hc-directo-cedula",
//             name: "Fotocopia de la cédula de ciudadanía",
//           },
//           {
//             id: "hc-directo-formato",
//             name: "Diligenciar formato: Solicitud por paciente",
//           },

//           // Tercero autorizado
//           {
//             id: "hc-tercero-cedulas",
//             name: "Fotocopia de la cédula del paciente y del autorizado",
//           },
//           {
//             id: "hc-tercero-parentesco",
//             name: "Soporte de parentesco (registro civil, acta de matrimonio)",
//           },
//           {
//             id: "hc-tercero-formato",
//             name: "Diligenciar formato: Solicitud por Tercero",
//           },

//           // Paciente menor de edad
//           {
//             id: "hc-menor-registro",
//             name: "Registro civil o tarjeta de identidad (según edad)",
//           },
//           {
//             id: "hc-menor-parentesco",
//             name: "Registro civil de parentesco o documento de representación legal",
//           },
//           { id: "hc-menor-cedula", name: "Cédula de ciudadanía de los padres" },
//           {
//             id: "hc-menor-formato",
//             name: "Diligenciar formato: Solicitud por Tercero",
//           },
//         ],
//       },
//     ],

//     "Solicitudes de tesorería": [
//       {
//         id: "solicitudes_tesoreria",
//         label: <>Adjuntar:</>,
//         required: true,
//         archivos: [
//           { id: "certificacion_bancaria", name: "Certificación bancaria" }, // requerido por defecto
//           {
//             id: "carta_autorizacion",
//             name: "Carta de autorización de consignación a un tercero (si aplica).",
//             required: false,
//           }, // opcional
//           { id: "soporte_medico", name: "Soporte médico" }, // requerido
//           { id: "soporte_pago", name: "Soporte de pago o transacción" }, // requerido
//         ],
//       },
//     ],
//   };

//   return (
//     <>
//       <div className="pqrs-container">
//         <div className="header-pqrs">
//           <div>
//             Envía tu <span>PQR</span>
//           </div>
//           <label className="registra-otro-label">
//             ¿Está registrando esta solicitud en nombre de otra persona o
//             entidad?
//           </label>
//           <div className="radio-group">
//             <label>
//               <input
//                 type="radio"
//                 name="registra_otro"
//                 value="no"
//                 checked={form.registra_otro === "no"}
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//               />
//               No
//             </label>
//             <label>
//               <input
//                 type="radio"
//                 name="registra_otro"
//                 value="si"
//                 checked={form.registra_otro === "si"}
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//               />
//               Sí
//             </label>
//           </div>
//           {errors.registra_otro && (
//             <p className="error">{errors.registra_otro}</p>
//           )}
//         </div>
//         <br />

//         <div className="section-clasificaciones">
//           <form className="pqrs" onSubmit={handleSubmit} noValidate>
//             {form.registra_otro === "si" && (
//               <>
//                 <h1 className="titulo-form">
//                   DATOS DE QUIEN REGISTRA LA SOLICITUD:
//                 </h1>
//                 <br />
//                 <div className="pqrs-otro">
//                   <div className="floating-label">
//                     <select
//                       id="parentesco"
//                       name="parentesco"
//                       value={form.parentesco}
//                       onChange={handleChange}
//                       onBlur={handleBlur}
//                       required
//                     >
//                       <option value="" disabled hidden></option>
//                       {parentesco.map((opcion) => (
//                         <option key={opcion} value={opcion}>
//                           {opcion}
//                         </option>
//                       ))}
//                     </select>
//                     <label htmlFor="parentesco">Parentesco o entidad</label>
//                     {errors.parentesco && (
//                       <p className="error">{errors.parentesco}</p>
//                     )}
//                   </div>
//                   {(form.parentesco === "Ente de control" ||
//                     form.parentesco === "Asegurador") && (
//                     <div className="floating-label">
//                       <input
//                         id="nombre_entidad"
//                         name="nombre_entidad"
//                         value={form.nombre_entidad}
//                         onChange={handleChange}
//                         onBlur={handleBlur}
//                         // 🔹 Solo requerido si el parentesco es "Ente de control" o "Entidad"
//                         required={
//                           form.parentesco === "Ente de control" ||
//                           form.parentesco === "Asegurador"
//                         }
//                       />
//                       <label htmlFor="nombre_entidad">
//                         Nombre de la entidad
//                       </label>
//                       {errors.nombre_entidad && (
//                         <p className="error">{errors.nombre_entidad}</p>
//                       )}
//                     </div>
//                   )}

//                   <div className="floating-label">
//                     <input
//                       id="registrador_nombre"
//                       name="registrador_nombre"
//                       value={form.registrador_nombre}
//                       onChange={handleChange}
//                       onBlur={handleBlur}
//                       required
//                     />
//                     <label htmlFor="registrador_nombre">
//                       Primer nombre de quien registra
//                     </label>
//                     {errors.registrador_nombre && (
//                       <p className="error">{errors.registrador_nombre}</p>
//                     )}
//                   </div>

//                   <div className="floating-label">
//                     <input
//                       id="registrador_segundo_nombre"
//                       name="registrador_segundo_nombre"
//                       value={form.registrador_segundo_nombre}
//                       onChange={handleChange}
//                       onBlur={handleBlur}
//                       required
//                     />
//                     <label htmlFor="registrador_nombre">
//                       Segundo nombre de quien registra
//                     </label>
//                     {errors.registrador_segundo_nombre && (
//                       <p className="error">
//                         {errors.registrador_segundo_nombre}
//                       </p>
//                     )}
//                   </div>

//                   <div className="floating-label">
//                     <input
//                       id="registrador_apellido"
//                       name="registrador_apellido"
//                       value={form.registrador_apellido}
//                       onChange={handleChange}
//                       onBlur={handleBlur}
//                       required
//                     />
//                     <label htmlFor="registrador_apellido">
//                       Primer apellido de quien registra
//                     </label>
//                     {errors.registrador_apellido && (
//                       <p className="error">{errors.registrador_apellido}</p>
//                     )}
//                   </div>

//                   <div className="floating-label">
//                     <input
//                       id="registrador_segundo_apellido"
//                       name="registrador_segundo_apellido"
//                       value={form.registrador_segundo_apellido}
//                       onChange={handleChange}
//                       onBlur={handleBlur}
//                       required
//                     />
//                     <label htmlFor="registrador_apellido">
//                       Segundo apellido de quien registra
//                     </label>
//                     {errors.registrador_segundo_apellido && (
//                       <p className="error">
//                         {errors.registrador_segundo_apellido}
//                       </p>
//                     )}
//                   </div>

//                   {form.parentesco !== "Ente de control" &&
//                     form.parentesco !== "Asegurador" && (
//                       <div className="floating-label">
//                         <select
//                           id="registrador_documento_tipo"
//                           name="registrador_documento_tipo"
//                           value={form.registrador_documento_tipo}
//                           onChange={handleChange}
//                           onBlur={handleBlur}
//                           required
//                         >
//                           <option value="" disabled hidden></option>
//                           <option value="CC">Cédula de ciudadanía</option>
//                           <option value="CD">Carné diplomático</option>
//                           <option value="CN">Certificado nacido vivo</option>
//                           <option value="CE">Cédula de extranjería</option>
//                           <option value="DC">Documento Extranjero</option>
//                           <option value="NIT">NIT</option>
//                           <option value="PA">Pasaporte</option>
//                           <option value="PE">
//                             Permiso Especial de Permanencia
//                           </option>
//                           <option value="PT">
//                             Permiso por Protección Temporal
//                           </option>
//                           <option value="RC">Registro Civil</option>
//                           <option value="SC">Salvo Conducto</option>
//                           <option value="TI">Tarjeta de identidad</option>
//                         </select>
//                         <label htmlFor="registrador_documento_tipo">
//                           Tipo de documento
//                         </label>
//                         {errors.registrador_documento_tipo && (
//                           <p className="error">
//                             {errors.registrador_documento_tipo}
//                           </p>
//                         )}
//                       </div>
//                     )}

//                   {form.parentesco !== "Ente de control" &&
//                     form.parentesco !== "Asegurador" && (
//                       <div className="floating-label">
//                         <input
//                           id="registrador_documento_numero"
//                           name="registrador_documento_numero"
//                           type="text" // Mantener como text para permitir guiones/letras si NIT lo requiere
//                           value={form.registrador_documento_numero}
//                           onChange={handleChange}
//                           onBlur={handleBlur}
//                           required
//                         />
//                         <label htmlFor="registrador_documento_numero">
//                           Número de documento
//                         </label>
//                         {errors.registrador_documento_numero && (
//                           <p className="error">
//                             {errors.registrador_documento_numero}
//                           </p>
//                         )}
//                       </div>
//                     )}

//                   <div className="floating-label">
//                     <input
//                       id="registrador_correo"
//                       name="registrador_correo"
//                       type="email"
//                       value={form.registrador_correo}
//                       onChange={handleChange}
//                       onBlur={handleBlur}
//                       required
//                     />
//                     <label htmlFor="registrador_correo">Correo</label>
//                     {errors.registrador_correo && (
//                       <p className="error">{errors.registrador_correo}</p>
//                     )}
//                   </div>

//                   <div className="floating-label">
//                     <input
//                       id="registrador_telefono"
//                       name="registrador_telefono"
//                       type="text"
//                       value={form.registrador_telefono}
//                       onChange={handleChange}
//                       onBlur={handleBlur}
//                       required
//                     />
//                     <label htmlFor="registrador_telefono">
//                       Número de Celular
//                     </label>
//                     {errors.registrador_telefono && (
//                       <p className="error">{errors.registrador_telefono}</p>
//                     )}
//                   </div>

//                   {(form.parentesco === "Ente de control" ||
//                     form.parentesco === "Asegurador") && (
//                     <div className="floating-label">
//                       <input
//                         id="registrador_cargo"
//                         name="registrador_cargo"
//                         value={form.registrador_cargo}
//                         onChange={handleChange}
//                         onBlur={handleBlur}
//                         required={
//                           form.parentesco === "Ente de control" ||
//                           form.parentesco === "Asegurador"
//                         }
//                       />
//                       <label htmlFor="registrador_cargo">Cargo</label>
//                       {errors.registrador_cargo && (
//                         <p className="error">{errors.registrador_cargo}</p>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </>
//             )}
//             <h1 className="titulo-form">DATOS DEL PACIENTE-USUARIO:</h1> <br />
//             <div className="pqrs-paciente">
//               <div className="floating-label">
//                 <input
//                   type="text"
//                   name="nombre"
//                   value={form.nombre}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   required
//                 />
//                 <label htmlFor="nombre">Primer nombre</label>
//                 {errors.nombre && <p className="error">{errors.nombre}</p>}
//               </div>

//               <div className="floating-label">
//                 <input
//                   type="text"
//                   name="segundo_nombre"
//                   value={form.segundo_nombre}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   required
//                 />
//                 <label htmlFor="nombre">Segundo nombre</label>
//                 {errors.segundo_nombre && (
//                   <p className="error">{errors.segundo_nombre}</p>
//                 )}
//               </div>

//               <div className="floating-label">
//                 <input
//                   type="text"
//                   name="apellido"
//                   value={form.apellido}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   required
//                 />
//                 <label htmlFor="apellido">Primer apellido</label>
//                 {errors.apellido && <p className="error">{errors.apellido}</p>}
//               </div>

//               <div className="floating-label">
//                 <input
//                   type="text"
//                   name="segundo_apellido"
//                   value={form.segundo_apellido}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   required
//                 />
//                 <label htmlFor="apellido">Segundo apellido</label>
//                 {errors.segundo_apellido && (
//                   <p className="error">{errors.segundo_apellido}</p>
//                 )}
//               </div>

//               <div className="floating-label">
//                 <select
//                   id="documento_tipo"
//                   name="documento_tipo"
//                   value={form.documento_tipo}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   required
//                 >
//                   <option value="" disabled hidden></option>
//                   <option value="CC">Cédula de ciudadanía</option>
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
//                 <label htmlFor="documento_tipo">Tipo de documento</label>
//                 {errors.documento_tipo && (
//                   <p className="error">{errors.documento_tipo}</p>
//                 )}
//               </div>

//               <div className="floating-label">
//                 <input
//                   type="text"
//                   id="documento_numero"
//                   name="documento_numero"
//                   value={form.documento_numero}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   required
//                 />
//                 <label htmlFor="documento_numero">Número de documento</label>
//                 {errors.documento_numero && (
//                   <p className="error">{errors.documento_numero}</p>
//                 )}
//               </div>

//               <div className="floating-label">
//                 <input
//                   id="correo"
//                   name="correo"
//                   type="email"
//                   value={form.correo}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   required
//                 />
//                 <label htmlFor="correo">Correo</label>
//                 {errors.correo && <p className="error">{errors.correo}</p>}
//               </div>

//               <div className="floating-label">
//                 <input
//                   id="correo_confirmacion"
//                   name="correo_confirmacion"
//                   type="email"
//                   value={form.correo_confirmacion}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   required
//                 />
//                 <label htmlFor="correo_confirmacion">Confirmar correo</label>
//                 {errors.correo_confirmacion && (
//                   <p className="error">{errors.correo_confirmacion}</p>
//                 )}
//               </div>

//               <div className="floating-label">
//                 <input
//                   id="telefono"
//                   name="telefono"
//                   type="text"
//                   value={form.telefono}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   required
//                 />
//                 <label htmlFor="telefono">Número de Celular</label>
//                 {errors.telefono && <p className="error">{errors.telefono}</p>}
//               </div>

//               <div className="floating-label">
//                 <select
//                   id="sede"
//                   name="sede"
//                   value={form.sede}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   required
//                 >
//                   <option value="" disabled hidden></option>
//                   {/* <option value="No he sido atendido">No he sido atendido</option> */}
//                   <option value="Bogota-Centro">Bogotá Centro</option>
//                   <option value="Bogota-Norte">Bogotá Norte</option>
//                   <option value="Bogota-Sur-Occidente-Hidroterapia">
//                     Bogotá Sur Occidente Hidroterapia
//                   </option>
//                   <option value="Bogota-Sur-Occidente-Rehabilitación">
//                     Bogotá Sur Occidente Rehabilitación
//                   </option>
//                   <option value="Cedritos-Divertido">Cedritos-Divertido</option>
//                   <option value="Chia">Chía</option>
//                   <option value="Florencia">Florencia</option>
//                   <option value="Ibague">Ibagué</option>
//                 </select>
//                 <label htmlFor="sede">Sede de atención</label>
//                 {errors.sede && <p className="error">{errors.sede}</p>}
//               </div>

//               <div className="floating-label">
//                 <select
//                   id="servicio_prestado"
//                   name="servicio_prestado"
//                   value={form.servicio_prestado}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   required
//                 >
//                   <option value="" disabled hidden></option>
//                   {(serviciosPorSede[form.sede] || []).map((servicio) => (
//                     <option key={servicio} value={servicio}>
//                       {servicio}
//                     </option>
//                   ))}
//                 </select>

//                 <label htmlFor="servicio_prestado">Servicio prestado</label>

//                 {errors.servicio_prestado && (
//                   <p className="error">{errors.servicio_prestado}</p>
//                 )}
//               </div>

//               <div className="floating-label">
//                 <select
//                   id="eps"
//                   name="eps"
//                   value={form.eps}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   required
//                 >
//                   {form.sede === "Cedritos-Divertido" ? (
//                     <option value="Particular">Particular</option>
//                   ) : (
//                     <>
//                       <option value="" disabled hidden></option>
//                       {epsOptions.map((eps) => (
//                         <option key={eps} value={eps}>
//                           {eps}
//                         </option>
//                       ))}
//                     </>
//                   )}
//                 </select>
//                 <label htmlFor="eps">Asegurador (EPS-ARL)</label>
//                 {errors.eps && <p className="error">{errors.eps}</p>}
//               </div>

//               <div
//                 className={`floating-label regimen-select ${
//                   form.regimen ? "has-value" : ""
//                 }`}
//               >
//                 <select
//                   id="regimen"
//                   name="regimen"
//                   value={form.regimen}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   required
//                   disabled={form.regimenLocked}
//                 >
//                   <option value="" disabled hidden></option>
//                   {(epsRegimenMap[form.eps] || []).map((opt) => (
//                     <option key={opt} value={opt}>
//                       {opt}
//                     </option>
//                   ))}
//                 </select>
//                 <label htmlFor="regimen">Tipo de afiliación</label>
//                 {errors.regimen && <p className="error">{errors.regimen}</p>}
//               </div>

//               <div className="floating-label">
//                 <select
//                   id="tipo_solicitud"
//                   name="tipo_solicitud"
//                   value={form.tipo_solicitud}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   required
//                   disabled={readOnlyTipoSolicitud}
//                 >
//                   <option value="" disabled hidden></option>
//                   {(
//                     tipoSolicitudOptions || [
//                       { value: "Peticion", label: "Petición" },
//                       { value: "Queja", label: "Queja" },
//                       { value: "Reclamo", label: "Reclamo" },
//                     ]
//                   ).map((option) => (
//                     <option key={option.value} value={option.value}>
//                       {option.label}
//                     </option>
//                   ))}
//                 </select>
//                 <label htmlFor="tipo_solicitud">Tipo de solicitud</label>
//                 {errors.tipo_solicitud && (
//                   <p className="error">{errors.tipo_solicitud}</p>
//                 )}
//               </div>

//               {/* 🟢 Campo Clasificaciones */}
//               <div
//                 className="clasificaciones-container"
//                 ref={clasificacionesRef}
//               >
//                 {/* Caja que parece un select */}
//                 <div
//                   className="clasificaciones-select"
//                   onClick={() =>
//                     setShowClasificacionesDropdown((prev) => !prev)
//                   }
//                 >
//                   <span
//                     className={
//                       Array.isArray(form.clasificaciones) &&
//                       form.clasificaciones.length
//                         ? "selected"
//                         : "placeholder"
//                     }
//                   >
//                     {Array.isArray(form.clasificaciones) &&
//                     form.clasificaciones.length
//                       ? availableClasificaciones
//                           .filter((c) => form.clasificaciones.includes(c.id))
//                           .map((c) => c.nombre)
//                           .join(", ")
//                       : "Selecciona clasificaciones"}
//                   </span>
//                   <span
//                     className={`clasificaciones-caret ${
//                       showClasificacionesDropdown ? "open" : ""
//                     }`}
//                   ></span>
//                 </div>

//                 {/* Lista de opciones con checkboxes */}
//                 {showClasificacionesDropdown && (
//                   <div
//                     className="clasificaciones-options"
//                     onClick={(e) => e.stopPropagation()}
//                   >
//                     {filteredClasificaciones.map((clas) => (
//                       <label key={clas.id} className="clasificaciones-option">
//                         <input
//                           type="checkbox"
//                           value={clas.id}
//                           checked={form.clasificaciones.includes(clas.id)}
//                           onChange={(e) => {
//                             const checked = e.target.checked;
//                             setForm((prev) => {
//                               const current = Array.isArray(
//                                 prev.clasificaciones
//                               )
//                                 ? prev.clasificaciones
//                                 : [];

//                               let updated;

//                               if (form.tipo_solicitud === "Solicitud") {
//                                 // 🔹 Si es "Solicitud", solo permitimos una clasificación
//                                 updated = checked ? [clas.id] : [];
//                               } else {
//                                 // 🔹 Si no es "Solicitud", funciona como multi-selección normal
//                                 updated = checked
//                                   ? [...current, clas.id]
//                                   : current.filter((id) => id !== clas.id);
//                               }

//                               return { ...prev, clasificaciones: updated };
//                             });
//                           }}
//                         />
//                         <span>{clas.nombre}</span>
//                       </label>
//                     ))}
//                   </div>
//                 )}

//                 {errors.clasificaciones && (
//                   <p className="error">{errors.clasificaciones}</p>
//                 )}
//               </div>

//               {/* 🟢 Renderizado condicional para el campo de clasificación de tutela */}
//               {form.tipo_solicitud === "Tutela" && (
//                 <div className="floating-label">
//                   <select
//                     id="clasificacion_tutela"
//                     name="clasificacion_tutela"
//                     value={form.clasificacion_tutela}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     required
//                   >
//                     <option value="" disabled hidden></option>
//                     <option value="Acción de tutela o Avoco">
//                       Acción de tutela o Avoco
//                     </option>
//                     <option value="Sentencia o Fallo Tutela">
//                       Sentencia o Fallo Tutela
//                     </option>
//                     <option value="Incidente o apertura de Desacato">
//                       Incidente o apertura de Desacato
//                     </option>
//                     <option value="Desacato">Desacato</option>
//                   </select>
//                   <label htmlFor="clasificacion_tutela">
//                     Clasificación de la tutela
//                   </label>
//                   {errors.clasificacion_tutela && (
//                     <p className="error">{errors.clasificacion_tutela}</p>
//                   )}
//                 </div>
//               )}

//               {/* 🟢 Campo Accionado solo para tipo Tutela */}
//               {form.tipo_solicitud === "Tutela" && (
//                 <div
//                   className="accionado-container"
//                   ref={accionadoRef}
//                   style={{ position: "relative" }}
//                 >
//                   {/* <label className="accionado-label">Accionado</label> */}
//                   <div
//                     className="accionado-select"
//                     onClick={() => setShowAccionadoDropdown((prev) => !prev)}
//                   >
//                     <span
//                       className={
//                         Array.isArray(form.accionado) && form.accionado.length
//                           ? "selected"
//                           : "placeholder"
//                       }
//                     >
//                       {Array.isArray(form.accionado) && form.accionado.length
//                         ? form.accionado.join(", ")
//                         : "Accionado"}
//                     </span>
//                     <span
//                       className={`accionado-caret ${
//                         showAccionadoDropdown ? "open" : ""
//                       }`}
//                     ></span>
//                   </div>

//                   {/* Lista desplegable; stopPropagation evita que el click cierre el menú */}
//                   {showAccionadoDropdown && (
//                     <div
//                       className="accionado-options"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       {["Asegurador", "Passus"].map((opcion) => (
//                         <label key={opcion} className="accionado-option">
//                           <input
//                             type="checkbox"
//                             value={opcion}
//                             checked={
//                               Array.isArray(form.accionado) &&
//                               form.accionado.includes(opcion)
//                             }
//                             onChange={(e) => {
//                               const checked = e.target.checked;
//                               setForm((prev) => {
//                                 const current = Array.isArray(prev.accionado)
//                                   ? prev.accionado
//                                   : [];
//                                 const updated = checked
//                                   ? [...current, opcion]
//                                   : current.filter((i) => i !== opcion);
//                                 return { ...prev, accionado: updated };
//                               });
//                             }}
//                           />
//                           <span>{opcion}</span>
//                         </label>
//                       ))}
//                     </div>
//                   )}

//                   {errors.accionado && (
//                     <p className="error">{errors.accionado}</p>
//                   )}
//                 </div>
//               )}

//               {/* CAMPO DE FECHA DE INICIO REAL - VISIBLE SOLO SI EL USUARIO ESTÁ LOGEADO */}
//               {isLoggedIn && (
//                 <div className="floating-label">
//                   {" "}
//                   <input
//                     type="datetime-local" // Correcto para fecha y hora
//                     id="fecha_inicio_real"
//                     name="fecha_inicio_real"
//                     value={
//                       form.fecha_inicio_real
//                         ? (() => {
//                             const date = new Date(form.fecha_inicio_real); // Obtener componentes de fecha y hora local
//                             const year = date.getFullYear();
//                             const month = (date.getMonth() + 1)
//                               .toString()
//                               .padStart(2, "0");
//                             const day = date
//                               .getDate()
//                               .toString()
//                               .padStart(2, "0");
//                             const hours = date
//                               .getHours()
//                               .toString()
//                               .padStart(2, "0");
//                             const minutes = date
//                               .getMinutes()
//                               .toString()
//                               .padStart(2, "0");

//                             return `${year}-${month}-${day}T${hours}:${minutes}`;
//                           })()
//                         : ""
//                     }
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                   />{" "}
//                   <label htmlFor="fecha_inicio_real">
//                     Fecha y Hora de Inicio Real de la PQR:{" "}
//                   </label>{" "}
//                   {errors.fecha_inicio_real && (
//                     <p className="error">{errors.fecha_inicio_real}</p>
//                   )}{" "}
//                 </div>
//               )}

//               {isLoggedIn && (
//                 <div className="floating-label">
//                   <select
//                     id="fuente"
//                     name="fuente"
//                     value={form.fuente}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     required
//                     disabled={readOnlyTipoSolicitud}
//                   >
//                     <option value="" disabled hidden></option>
//                     <option value="Callcenter">Callcenter</option>
//                     <option value="Correo atención al usuario">
//                       Correo atención al usuario
//                     </option>
//                     <option value="Correo de Agendamiento NAC">
//                       Correo de Agendamiento NAC
//                     </option>
//                     <option value="Encuesta de satisfacción IPS">
//                       Encuesta de satisfacción IPS
//                     </option>
//                     <option value="Formulario de la web">
//                       Formulario de la web
//                     </option>
//                     <option value="Presencial">Presencial</option>
//                     <option value="Correo de Notificaciones IPS">
//                       Correo de Notificaciones IPS
//                     </option>
//                   </select>
//                   <label htmlFor="fuente">Origen</label>
//                   {errors.fuente && <p className="error">{errors.fuente}</p>}
//                 </div>
//               )}
//             </div>
//             {/* 🔹 Si la clasificación seleccionada está en fileInputsConfig → muestra su(s) botón(es) */}
//             {Object.entries(fileInputsConfig).map(([clasificacion, inputs]) =>
//               availableClasificaciones.some(
//                 (c) =>
//                   Array.isArray(form.clasificaciones) &&
//                   form.clasificaciones &&
//                   form.clasificaciones.includes(c.id) &&
//                   c.nombre.toLowerCase() === clasificacion.toLowerCase()
//               ) ? (
//                 <div key={clasificacion} className="file-input-group">
//                   {clasificacion ===
//                   "Envío de historia clínica o informes finales" ? (
//                     <>
//                       {/* Lógica para la historia clínica */}
//                       <div className="subopcion-historia">
//                         <label>Seleccione quién hace la solicitud:</label>
//                         <select
//                           value={subOpcionHistoria}
//                           onChange={(e) => setSubOpcionHistoria(e.target.value)}
//                           className={`${
//                             errors["subOpcionHistoria"] ? "input-error" : ""
//                           }`}
//                         >
//                           <option value="">-- Seleccione una opción --</option>
//                           {Object.keys(historiaClinicaOptions).map((op) => (
//                             <option key={op} value={op}>
//                               {op}
//                             </option>
//                           ))}
//                         </select>
//                         {errors["subOpcionHistoria"] && (
//                           <p className="error-message">
//                             {errors["subOpcionHistoria"]}
//                           </p>
//                         )}
//                       </div>
//                       {subOpcionHistoria &&
//                         historiaClinicaOptions[subOpcionHistoria].map((req) => {
//                           const requisitoId = req.id;
//                           const archivo = archivosPorRequisito[requisitoId];

//                           return (
//                             <div key={requisitoId} className="file-input-group">
//                               <li className="flex items-center">
//                                 {archivo ? (
//                                   <>
//                                     <span>{req.label}</span>
//                                     <span className="icono-carga-archivo">
//                                       ✔️
//                                     </span>
//                                   </>
//                                 ) : (
//                                   <>
//                                     <span>{req.label}</span>
//                                     {req.required && (
//                                       <span className="text-red-500">*</span>
//                                     )}
//                                     <label
//                                       htmlFor={`file-upload-${requisitoId}`}
//                                       className="file-upload-button ml-auto"
//                                     >
//                                       Subir archivo
//                                     </label>
//                                     <input
//                                       id={`file-upload-${requisitoId}`}
//                                       type="file"
//                                       style={{ display: "none" }}
//                                       onChange={(e) =>
//                                         handleFileChange(e, requisitoId)
//                                       }
//                                     />
//                                   </>
//                                 )}
//                               </li>
//                               {archivo && (
//                                 <div className="archivo-subido">
//                                   {archivo.name} (
//                                   {(archivo.size / 1024 / 1024).toFixed(2)} MB)
//                                   <button
//                                     type="button"
//                                     className="remove-file-button"
//                                     onClick={() => removeFile(requisitoId)}
//                                   >
//                                     X
//                                   </button>
//                                 </div>
//                               )}
//                               {errors[requisitoId] && (
//                                 <p className="error-message text-red-500 text-sm mt-1">
//                                   {errors[requisitoId]}
//                                 </p>
//                               )}
//                             </div>
//                           );
//                         })}
//                     </>
//                   ) : (
//                     /* Lógica unificada para todas las demás clasificaciones */
//                     <>
//                       {inputs.map((input) => (
//                         <div key={input.id}>
//                           <div className="file-upload-text">
//                             {input.label}{" "}
//                             {/* Muestra la etiqueta con la lista <ul> si está definida así */}
//                             {input.archivos && (
//                               <ul className="lista-archivos">
//                                 {input.archivos.map((req) => {
//                                   const requisitoId = req.id;
//                                   const archivo =
//                                     archivosPorRequisito[requisitoId];
//                                   const hasError = errors[requisitoId];

//                                   return (
//                                     <div
//                                       key={requisitoId}
//                                       className="requisito-con-archivo"
//                                     >
//                                       <li className="requisito-item">
//                                         <span>{req.name}</span>

//                                         {archivo && (
//                                           <span className="text-green-600 font-bold">
//                                             ✔️
//                                           </span>
//                                         )}

//                                         {!archivo && (
//                                           <label
//                                             htmlFor={`file-upload-${requisitoId}`}
//                                             className="file-upload-button"
//                                           >
//                                             Subir archivo
//                                           </label>
//                                         )}

//                                         <input
//                                           id={`file-upload-${requisitoId}`}
//                                           type="file"
//                                           style={{ display: "none" }}
//                                           onChange={(e) =>
//                                             handleFileChange(e, requisitoId)
//                                           }
//                                         />
//                                       </li>

//                                       {archivo && (
//                                         <div className="archivo-subido">
//                                           {archivo.name} (
//                                           {(archivo.size / 1024 / 1024).toFixed(
//                                             2
//                                           )}{" "}
//                                           MB)
//                                           <button
//                                             type="button"
//                                             className="remove-file-button"
//                                             onClick={() =>
//                                               removeFile(requisitoId)
//                                             }
//                                           >
//                                             X
//                                           </button>
//                                         </div>
//                                       )}

//                                       {hasError && (
//                                         <p className="error-message text-red-500 text-sm mt-1">
//                                           {hasError}
//                                         </p>
//                                       )}
//                                     </div>
//                                   );
//                                 })}
//                               </ul>
//                             )}
//                           </div>
//                         </div>
//                       ))}
//                     </>
//                   )}
//                 </div>
//               ) : null
//             )}
//             {/* 🔹 ÚNICO bloque de archivos adicionales SIEMPRE visible */}
//             <div className="file-input-group">
//               <label
//                 htmlFor="archivos-adicionales"
//                 className="file-upload-button"
//               >
//                 Subir archivo
//               </label>
//               <input
//                 id="archivos-adicionales"
//                 type="file"
//                 style={{ display: "none" }}
//                 multiple
//                 onChange={(e) => {
//                   const nuevos = Array.from(e.target.files);

//                   // Filtrar por tamaño (máximo 7MB)
//                   const validos = [];
//                   nuevos.forEach((file) => {
//                     if (file.size > 7 * 1024 * 1024) {
//                       Swal.fire({
//                         icon: "error",
//                         title: "Archivo demasiado grande",
//                         text: `El archivo "${file.name}" supera los 7 MB.`,
//                       });
//                     } else {
//                       validos.push(file);
//                     }
//                   });

//                   if (validos.length > 0) {
//                     setArchivos((prev) => [...prev, ...validos]);
//                   }
//                 }}
//               />

//               {archivos.length > 0 && (
//                 <div className="archivo-subido">
//                   {archivos.map((file, idx) => (
//                     <div key={idx}>
//                       {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
//                       <button
//                         type="button"
//                         className="remove-file-button"
//                         onClick={() =>
//                           setArchivos((prev) =>
//                             prev.filter((_, i) => i !== idx)
//                           )
//                         }
//                       >
//                         X
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//             <div className="pqrs-textarea-full">
//               <textarea
//                 name="descripcion"
//                 placeholder="Describe la situación que deseas reportar"
//                 value={form.descripcion}
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//                 rows="5"
//                 required
//                 maxLength={MAX_CARACTERES_DESCRIPCION}
//               />
//               {errors.descripcion && (
//                 <p className="error">{errors.descripcion}</p>
//               )}
//               <small
//                 className={`contador-caracteres ${
//                   form.descripcion.length > MAX_CARACTERES_DESCRIPCION * 0.9
//                     ? "alerta"
//                     : ""
//                 }`}
//               >
//                 {form.descripcion.length} / {MAX_CARACTERES_DESCRIPCION}{" "}
//                 caracteres
//               </small>
//             </div>
//             <div className="politica-box politica-box-compact">
//               <label className="politica-label">
//                 <input
//                   type="checkbox"
//                   name="politica_aceptada"
//                   checked={form.politica_aceptada}
//                   onChange={handleChange} // Usa handleChange unificado
//                   onBlur={handleBlur}
//                 />
//                 <div className="politica-texto">
//                   <span className="politica-descripcion">
//                     Acepto la
//                     <a
//                       href="https://passusips.com/nosotros-politica-manejo-datos"
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       política de tratamiento de datos personales
//                     </a>{" "}
//                     de Passus 👆, pues he leído y estoy de acuerdo con lo
//                     expuesto en el manuscrito publicado. <br /> <br />
//                     He Comprendido los{" "}
//                     <a
//                       href="https://passusips.com/nosotros-politica-agendamiento-web"
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       {" "}
//                       Términos y condiciones de Servicio Web{" "}
//                     </a>
//                     de Passus 👆, pues he leído y estoy de acuerdo con lo
//                     expuesto en la información publicada.
//                   </span>
//                 </div>
//               </label>
//               {errors.politica_aceptada && (
//                 <p className="error">{errors.politica_aceptada}</p>
//               )}
//             </div>
//             <button type="submit" disabled={loading}>
//               {loading ? "Enviando..." : "Enviar PQR"}
//             </button>
//           </form>

//           <div className="pqrs-solicitudes">
//             {form.tipo_solicitud !== "Solicitud" && (
//               <>
//                 <h3 className="titulo-clasificaciones">
//                   CLASIFICACIÓN DE F-PQR
//                 </h3>
//                 <ul>
//                   <li className="parrafo-clasificacion">
//                     <strong>Agendamiento:</strong> Experiencia al programar,
//                     cambiar o cancelar sus citas de manera ágil y oportuna.
//                   </li>
//                   <li className="parrafo-clasificacion">
//                     <strong>Atención de profesional en salud:</strong> Calidad,
//                     oportunidad y trato recibido por parte de terapeutas o
//                     especialistas durante su atención.
//                   </li>
//                   <li className="parrafo-clasificacion">
//                     <strong>Atención de personal administrativo:</strong>{" "}
//                     Claridad, amabilidad y apoyo en trámites administrativos.
//                   </li>
//                   <li className="parrafo-clasificacion">
//                     <strong>Atención en línea de frente (recepción):</strong>
//                     Experiencia al ser recibido en la sede y acompañado en el
//                     proceso de admisión.
//                   </li>
//                   <li className="parrafo-clasificacion">
//                     <strong>Atención por el call center:</strong>
//                     Facilidad de comunicación, tiempos de respuesta y
//                     orientación recibida a través de la línea telefónica.
//                   </li>
//                   <li className="parrafo-clasificacion">
//                     <strong>Proceso terapéutico:</strong>
//                     Continuidad, calidad y acompañamiento durante su tratamiento
//                     o rehabilitación.
//                   </li>
//                   <li className="parrafo-clasificacion">
//                     <strong>Información y comunicación:</strong>
//                     Claridad, oportunidad y precisión en la información recibida
//                     sobre su atención y trámites.
//                   </li>
//                   <li className="parrafo-clasificacion">
//                     <strong>Infraestructura:</strong>
//                     Comodidad, accesibilidad y estado de las instalaciones:
//                     consultorios, salas, zonas comunes, piscina, áreas
//                     terapéuticas.
//                   </li>
//                   <li className="parrafo-clasificacion">
//                     <strong>Orden y aseo:</strong>
//                     Presentación, limpieza y condiciones de higiene en las
//                     instalaciones.
//                   </li>
//                   <li className="parrafo-clasificacion">
//                     <strong>Herramientas digitales:</strong>
//                     Facilidad de uso y acceso a servicios digitales: página web,
//                     agendamiento en línea y otras plataformas.
//                   </li>
//                 </ul>
//               </>
//             )}

//             {form.tipo_solicitud === "Solicitud" && (
//               <>
//                 <h3 className="titulo-clasificaciones">
//                   CLASIFICACIÓN DE SOLICITUDES
//                 </h3>
//                 <p className="parrafo-clasificacion">
//                   Seleccione esta opción cuando lo que necesite sea un trámite o
//                   gestión puntual:
//                 </p>
//                 <ul>
//                   <li className="parrafo-clasificacion">
//                     <strong>Agendamiento: </strong>
//                     Agendar citas desde la Oficina Virtual
//                   </li>
//                   <li className="parrafo-clasificacion">
//                     <strong>Solicitudes de tesorería: </strong>
//                     Trámites relacionados con pagos, facturación o reembolsos.
//                   </li>
//                   <li className="parrafo-clasificacion">
//                     <strong>
//                       Envío de historia clínica o informes finales:{" "}
//                     </strong>
//                     Solicitud de copias de su historia clínica o reportes de
//                     atención.
//                   </li>
//                   <li className="parrafo-clasificacion">
//                     <strong>Política de multas por inasistencia: </strong>
//                     Consultas o solicitudes relacionadas con la aplicación de la
//                     política de inasistencia a citas.
//                   </li>
//                   <li className="parrafo-clasificacion">
//                     <strong>Reprogramación de citas: </strong>
//                     Para programar o cambiar la fecha/hora de una cita.
//                   </li>
//                 </ul>
//               </>
//             )}
//           </div>
//         </div>
//         <Modal
//           show={showModal}
//           onClose={() => setShowModal(false)}
//           title={modalContent.title}
//           description={modalContent.description}
//         />
//       </div>

//       <Footer />
//     </>
//   );
// }

// export default PqrsForm;
