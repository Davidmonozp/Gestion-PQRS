import React, { useEffect, useState, useMemo, useRef } from "react";
import api from "../../api/api";
import "../styles/SeguimientoPqrs.css";
import Swal from "sweetalert2"; // Importa SweetAlert2
import { tienePermiso } from "../../utils/permisoHelper";

// Puedes definir la función de utilidad de filtrado fuera del componente
const filterArrayByProperty = (data, property, filterValue) => {
  if (!data || !Array.isArray(data) || !property || !filterValue) {
    return data;
  }
  const lowerCaseFilterValue = String(filterValue).toLowerCase();
  return data.filter((item) => {
    if (
      item &&
      item.hasOwnProperty(property) &&
      item[property] !== null &&
      item[property] !== undefined
    ) {
      const itemPropertyValue = String(item[property]).toLowerCase();
      return itemPropertyValue.includes(lowerCaseFilterValue);
    }
    return false;
  });
};

export default function SeguimientoPqrs({
  pqr_codigo,
  formData, // No se usa directamente en este componente, pero se mantiene si es necesario en el padre
  estado_respuesta,
}) {
  const [seguimientosBrutos, setSeguimientosBrutos] = useState([]); // Datos SIN filtrar del backend
  const [descripcion, setDescripcion] = useState("");
  const [tipoSeguimiento, setTipoSeguimiento] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedItems, setExpandedItems] = useState([]);
  const [filtroTipoSeguimiento, setFiltroTipoSeguimiento] = useState(""); // Estado para el filtro en el frontend
  const inputFileRef = useRef(null);

  const MAX_CARACTERES_DESCRIPCION = 3000;

  const [adjuntos, setAdjuntos] = useState([]);

  const handleRemoveAttachment = (index) => {
    setAdjuntos((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0 && inputFileRef.current) {
        inputFileRef.current.value = "";
      }
      return updated;
    });
  };



  useEffect(() => {
    if (pqr_codigo) {
      fetchSeguimientosBackend();
    }
  }, [pqr_codigo]); // Solo recargar si cambia el código PQR

  const fetchSeguimientosBackend = async () => {
    // ESTA VALIDACIÓN DE CARACTERES NO DEBE IR AQUÍ.
    // ESTO ES PARA CUANDO SE CARGAN LOS SEGUIMIENTOS, NO CUANDO SE ESCRIBEN.
    // La he eliminado de aquí.
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/pqrs/${pqr_codigo}/seguimientos`);
      setSeguimientosBrutos(res.data.seguimientos); // Guarda los datos tal cual del backend
    } catch (err) {
      console.error(err);
      setError("Error al cargar seguimientos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (descripcion.length > MAX_CARACTERES_DESCRIPCION) {
      Swal.fire({
        icon: "error",
        title: "Límite de caracteres excedido",
        text: `La descripción excede el límite de ${MAX_CARACTERES_DESCRIPCION} caracteres.`,
        confirmButtonText: "Entendido",
      });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("descripcion", descripcion);
      formData.append("tipo_seguimiento", tipoSeguimiento);

      adjuntos.forEach((file, index) => {
        formData.append(`adjuntos[${index}]`, file);
      });

      await api.post(`/pqrs/${pqr_codigo}/seguimientos`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // reset
      setDescripcion("");
      setTipoSeguimiento("");
      setAdjuntos([]);
      fetchSeguimientosBackend();

      Swal.fire({
        icon: "success",
        title: "Seguimiento registrado",
        text: "El seguimiento se ha registrado exitosamente.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      setError("Error al registrar seguimiento");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al registrar el seguimiento. Inténtalo de nuevo.",
        confirmButtonText: "Cerrar",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDescripcion = (id) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const seguimientoDeshabilitado = !["Asignado", "En proceso"].includes(
    estado_respuesta
  );

  // Tipos de seguimiento disponibles (no necesitan useMemo si son estáticos)
  const tiposDeSeguimientoDisponibles = useMemo(
    () => [
      "Comunicación con el asegurador",
      "Comunicación con asesor Externo de Passus",
      "Comunicación entre áreas Passus",
    ],
    []
  );

  // ***** APLICACIÓN DEL FILTRO EN EL FRONTEND *****
  const seguimientosFiltrados = useMemo(() => {
    if (!filtroTipoSeguimiento) {
      return seguimientosBrutos; // Si no hay filtro, muestra todos los seguimientos
    }
    return filterArrayByProperty(
      seguimientosBrutos,
      "tipo_seguimiento",
      filtroTipoSeguimiento
    );
  }, [seguimientosBrutos, filtroTipoSeguimiento]); // Re-calcular solo cuando cambian los datos brutos o el filtro

  // --- Función para manejar el cambio en el textarea de descripción ---
  const handleDescripcionChange = (e) => {
    const text = e.target.value;
    // Solo actualiza la descripción si no excede el límite
    if (text.length <= MAX_CARACTERES_DESCRIPCION) {
      setDescripcion(text);
    } else {
      // Si el usuario intenta escribir más allá del límite,
      // cortamos el texto para que no se almacene más de lo permitido
      // y mostramos la alerta de límite alcanzado.
      setDescripcion(text.substring(0, MAX_CARACTERES_DESCRIPCION));
      Swal.fire({
        icon: "warning", // O 'error'
        title: "Límite de caracteres alcanzado",
        text: `Has alcanzado el límite máximo de ${MAX_CARACTERES_DESCRIPCION} caracteres.`,
        toast: true, // Muestra una notificación pequeña
        position: "top-end", // En la esquina superior derecha
        showConfirmButton: false,
        timer: 3000, // Desaparece después de 3 segundos
        timerProgressBar: true,
      });
    }
  };

  return (
    <div className="seguimiento-container">
      <h2>Seguimiento de la PQR</h2>

      {error && <p className="error">{error}</p>}

      {/* Selector de filtro */}
      <div className="filter-section">
        <label htmlFor="filterTipoSeguimiento">
          Filtrar por tipo de seguimiento:
        </label>
        <select
          id="filterTipoSeguimiento"
          className="styled-input"
          value={filtroTipoSeguimiento}
          onChange={(e) => setFiltroTipoSeguimiento(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          {tiposDeSeguimientoDisponibles.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </div>

      <div className="seguimientos-list">
        {loading && <p>Cargando seguimientos...</p>}
        {!loading && seguimientosFiltrados.length === 0 ? (
          <p>No hay seguimientos registrados para los criterios actuales.</p>
        ) : (
          <ul>
            {seguimientosFiltrados.map(
              (
                item // Renderiza los seguimientos filtrados
              ) => (
                <li key={item.id} className="seguimiento-item">
                  <div
                    onClick={() => toggleDescripcion(item.id)}
                    style={{
                      cursor: "pointer",
                      fontWeight: "bold",
                      color: "rgb(4, 61, 126)",
                      userSelect: "none",
                      textAlign: "start",
                    }}
                  >
                    {item.user
                      ? [
                        item.user?.name,
                        item.user?.segundo_nombre,
                        item.user?.primer_apellido,
                        item.user?.segundo_apellido,
                      ]
                        .filter(Boolean) // quita valores null/undefined/vacíos
                        .join(" ")
                      : "Usuario desconocido"}
                    <span style={{ fontWeight: "normal", display: "block" }}>
                      ({new Date(item.created_at).toLocaleString()})
                    </span>
                  </div>

                  {expandedItems.includes(item.id) && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <p>
                        <strong>Tipo:</strong> {item.tipo_seguimiento} <br />
                        <strong>Descripción:</strong> {item.descripcion}
                      </p>
                      {item.adjuntos && item.adjuntos.length > 0 && (
                        <div style={{ marginTop: "0.5rem" }}>
                          <strong>Archivos adjuntos:</strong>
                          <ul>
                            {item.adjuntos.map((file, idx) => {
                              const extension = file.original_name
                                ? file.original_name
                                  .split(".")
                                  .pop()
                                  .toLowerCase()
                                : "";

                              return (
                                <li key={idx} style={{ marginBottom: "1rem" }}>
                                  {/* Enlace para abrir en otra pestaña */}
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: "blue",
                                      textDecoration: "underline",
                                    }}
                                  >
                                    {file.original_name ||
                                      file.path.split("/").pop()}
                                  </a>

                                  {/* Vista previa en la misma pantalla */}
                                  <div style={{ marginTop: "0.5rem" }}>
                                    {["jpg", "jpeg", "png", "gif"].includes(
                                      extension
                                    ) ? (
                                      <img
                                        src={file.url}
                                        alt={file.original_name}
                                        style={{
                                          maxWidth: "200px",
                                          maxHeight: "200px",
                                          display: "block",
                                          border: "1px solid #ddd",
                                          marginTop: "5px",
                                        }}
                                      />
                                    ) : extension === "pdf" ? (
                                      <iframe
                                        src={file.url}
                                        style={{
                                          width: "100%",
                                          height: "400px",
                                          border: "1px solid #ddd",
                                          marginTop: "5px",
                                        }}
                                        title={file.original_name}
                                      ></iframe>
                                    ) : (
                                      <p
                                        style={{
                                          fontStyle: "italic",
                                          color: "#555",
                                        }}
                                      >
                                        Vista previa no disponible para este
                                        tipo de archivo
                                      </p>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              )
            )}
          </ul>
        )}
      </div>

      {seguimientoDeshabilitado ? (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            border: "1px dashed #ccc",
            color: "#777",
            backgroundColor: "#f9f9f9",
            borderRadius: "6px",
            textAlign: "center",
          }}
        >
          {estado_respuesta === "Cerrado"
            ? "La PQR está cerrada. No se pueden registrar más seguimientos."
            : "Complete todos los campos obligatorios para habilitar el seguimiento."}
        </div>
      ) : (
        tienePermiso([
          "Digitador",
          "Gestor",
          "Supervisor/Atencion al usuario",
          "Administrador",
        ]) && (
          <form onSubmit={handleSubmit} className="seguimiento-form">
            <h3>Registrar Nuevo Seguimiento</h3>
            <label htmlFor="tipoSeguimiento">Tipo de seguimiento:</label>
            <select
              id="tipoSeguimiento"
              className="styled-input"
              value={tipoSeguimiento}
              onChange={(e) => setTipoSeguimiento(e.target.value)}
              required
            >
              <option value="">Seleccione una opción</option>
              {tiposDeSeguimientoDisponibles.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>

            <label htmlFor="descripcionGestion">
              Descripción de la gestión realizada:
            </label>

            <textarea
              id="descripcionGestion"
              value={descripcion}
              // Usa la nueva función de cambio aquí
              onChange={handleDescripcionChange}
              placeholder={`Describe la gestión realizada (máx. ${MAX_CARACTERES_DESCRIPCION} caracteres)...`}
              required
              rows={3}
              maxLength={MAX_CARACTERES_DESCRIPCION} // Añade maxLength para una primera capa de limitación
            />
            {/* Opcional: Contador de caracteres */}
            <small
              style={{
                display: "block",
                textAlign: "right",
                color:
                  descripcion.length > MAX_CARACTERES_DESCRIPCION * 0.9
                    ? "red"
                    : "#555",
              }}
            >
              {descripcion.length} / {MAX_CARACTERES_DESCRIPCION} caracteres
            </small>

            <p>
              <strong>Archivos adjuntos (opcional):</strong>
            </p>
            <input
              ref={inputFileRef}
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files);

                const tooBig = files.find(file => file.size > 7 * 1024 * 1024);
                const invalidFile = files.find(file =>
                  [
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  ].includes(file.type)
                );

                // Si hay algún archivo inválido o muy grande
                if (tooBig || invalidFile) {
                  let title = "";
                  let text = "";

                  if (tooBig) {
                    title = "Archivo demasiado grande";
                    text = "Solo se permiten archivos de máximo 7MB.";
                  } else if (invalidFile) {
                    title = "Tipo de archivo no permitido";
                    text = `El archivo "${invalidFile.name}" no es válido. No se permiten documentos de Word.`;
                  }

                  Swal.fire({
                    icon: "error",
                    title,
                    text,
                    confirmButtonText: "OK",
                  }).then(() => {
                    // Limpiar solo si el archivo es inválido
                    if (inputFileRef.current) {
                      inputFileRef.current.value = "";
                    }
                  });

                  return;
                }

                // ✅ Si todo está bien, agrega los archivos
                setAdjuntos((prev) => [...prev, ...files]);

                // Limpia el input solo si quieres permitir agregar el mismo archivo más de una vez
                if (inputFileRef.current) {
                  inputFileRef.current.value = "";
                }
              }}
            />


            {adjuntos.length > 0 && (
              <div style={{ marginTop: "10px" }}>
                <strong className="archivo-seleccionado">
                  Archivos seleccionados:
                </strong>
                <ul>
                  {adjuntos.map((file, index) => (
                    <li
                      key={index}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        style={{
                          marginLeft: "10px",
                          background: "#df3232",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          padding: "2px 6px",
                        }}
                      >
                        X
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Registrando..." : "Agregar seguimiento"}
            </button>
          </form>
        )
      )}
    </div>
  );
}

// import React, { useEffect, useState } from 'react';
// import api from '../../api/api';
// import '../styles/SeguimientoPqrs.css';

// export default function SeguimientoPqrs({
//   pqr_codigo,
//   formData,
//   estado_respuesta
// }) {
//   const [seguimientos, setSeguimientos] = useState([]);
//   const [descripcion, setDescripcion] = useState('');
//   const [tipoSeguimiento, setTipoSeguimiento] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [expandedItems, setExpandedItems] = useState([]);

//   useEffect(() => {
//     if (pqr_codigo) {
//       fetchSeguimientos();
//     }
//   }, [pqr_codigo]);

//   const fetchSeguimientos = async () => {
//     try {
//       const res = await api.get(`/pqrs/${pqr_codigo}/seguimientos`);
//       setSeguimientos(res.data.seguimientos);
//     } catch (err) {
//       console.error(err);
//       setError('Error al cargar seguimientos');
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       await api.post(`/pqrs/${pqr_codigo}/seguimientos`, {
//         descripcion,
//         tipo_seguimiento: tipoSeguimiento,
//       });
//       setDescripcion('');
//       setTipoSeguimiento('');
//       fetchSeguimientos();
//     } catch (err) {
//       console.error(err);
//       setError('Error al registrar seguimiento');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleDescripcion = (id) => {
//     setExpandedItems((prev) =>
//       prev.includes(id)
//         ? prev.filter((itemId) => itemId !== id)
//         : [...prev, id]
//     );
//   };

//   const seguimientoDeshabilitado = !['Asignado', 'En proceso'].includes(estado_respuesta);

//   return (
//     <div className="seguimiento-container">
//       <h2>Seguimiento de la PQR</h2>

//       {error && <p className="error">{error}</p>}

//       <div className="seguimientos-list">
//         {seguimientos.length === 0 ? (
//           <p>No hay seguimientos registrados.</p>
//         ) : (
//           <ul>
//             {seguimientos.map((item) => (
//               <li key={item.id} className="seguimiento-item">
//                 <div
//                   onClick={() => toggleDescripcion(item.id)}
//                   style={{
//                     cursor: 'pointer',
//                     fontWeight: 'bold',
//                     color: 'rgb(4, 61, 126)',
//                     userSelect: 'none',
//                     textAlign: 'start',
//                   }}
//                 >
//                   {item.user?.name || 'Usuario desconocido'}
//                   <span style={{ fontWeight: 'normal', display: 'block' }}>
//                     ({new Date(item.created_at).toLocaleString()})
//                   </span>
//                 </div>
//                 {expandedItems.includes(item.id) && (
//                   <p style={{ marginTop: '0.5rem' }}>
//                     <strong>Tipo:</strong> {item.tipo_seguimiento} <br />
//                     <strong>Descripción:</strong> {item.descripcion}
//                   </p>
//                 )}
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       {seguimientoDeshabilitado ? (
//         <div
//           style={{
//             marginTop: '1rem',
//             padding: '1rem',
//             border: '1px dashed #ccc',
//             color: '#777',
//             backgroundColor: '#f9f9f9',
//             borderRadius: '6px',
//             textAlign: 'center',
//           }}
//         >
//           {estado_respuesta === 'Cerrado'
//             ? 'La PQR está cerrada. No se pueden registrar más seguimientos.'
//             : 'Complete todos los campos obligatorios para habilitar el seguimiento.'}
//         </div>
//       ) : (
//         <form onSubmit={handleSubmit} className="seguimiento-form">
//           <label>Tipo de seguimiento:</label>
//           <select
//           className='styled-input'
//             value={tipoSeguimiento}
//             onChange={(e) => setTipoSeguimiento(e.target.value)}
//             required
//           >
//             <option value="">Seleccione una opción</option>
//             <option value="Comunicación con el asegurador">Comunicación con el asegurador</option>
//             <option value="Comunicación copn asesor Externo de Passus">Comunicación copn asesor Externo de Passus</option>
//             <option value="Comunicación entre áreas Passus">Comunicación entre áreas Passus</option>
//           </select>

//           <label>Descripción de la gestión realizada:</label>
//           <textarea
//             value={descripcion}
//             onChange={(e) => setDescripcion(e.target.value)}
//             placeholder="Describe la gestión realizada..."
//             required
//             rows={3}
//           />

//           <button type="submit" disabled={loading}>
//             {loading ? 'Registrando...' : 'Agregar seguimiento'}
//           </button>
//         </form>
//       )}
//     </div>
//   );
// }
