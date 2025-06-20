import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import "./styles/PqrsDetail.css";
import { tienePermiso } from "../utils/permisoHelper";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar/Navbar";

function PqrsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pqr, setPqr] = useState(null);
  const [usuarios, setUsuarios] = useState([]); // <-- usuarios para asignar
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [respuestaFinal, setRespuestaFinal] = useState("");
  const [yaTieneFinal, setYaTieneFinal] = useState(false);
  const [mailEnviado, setMailEnviado] = useState(false);

  const [formData, setFormData] = useState({
    atributo_calidad: "",
    fuente: "",
    asignado_a: "",
  });

  useEffect(() => {
    if (
      !tienePermiso([
        "Administrador",
        "Supervisor",
        "Gestor",
        "Consultor",
        "Digitador",
      ])
    ) {
      Swal.fire({
        icon: "error",
        title: "Acceso denegado",
        text: "No tienes permiso para ver esta página",
      }).then(() => navigate("/dashboard"));
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Traer usuarios para el select asignado_a
        const resUsers = await api.get("/users");
        setUsuarios(resUsers.data);

        // Traer detalle PQR
        const res = await api.get(`/pqrs/${id}`);
        const p = res.data.pqr;
        setPqr(p);
        setYaTieneFinal(p.respuestas?.some((r) => r.es_final) || false);
        setMailEnviado(p.respuesta_enviada === 1);
        setFormData({
          atributo_calidad: p.atributo_calidad || "",
          fuente: p.fuente || "",
          asignado_a: p.asignado ? p.asignado.id : "",
        });
      } catch (err) {
        setError("Error cargando la PQRS");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "asignado_a" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedData = {};
    for (const key in formData) {
      if (formData[key] !== "") cleanedData[key] = formData[key];
    }

    try {
      await api.put(`/pqrs/${id}`, cleanedData);
      Swal.fire("Actualizado", "PQRS actualizada correctamente", "success");
    } catch {
      Swal.fire("Error", "No se pudo actualizar", "error");
    }
  };

  const registrarRespuestaFinal = async () => {
    if (!respuestaFinal.trim()) {
      return Swal.fire("Error", "El contenido no puede estar vacío", "warning");
    }
    try {
      await api.post(`/pqrs/${id}/respuesta-final`, {
        contenido: respuestaFinal,
      });
      Swal.fire("Éxito", "Respuesta final registrada", "success").then(() =>
        window.location.reload()
      );
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.error || "Error al registrar",
        "error"
      );
    }
  };

  const enviarAlCiudadano = async () => {
    try {
      const resp = await api.post(`/pqrs/${id}/enviar-respuesta-correo`);
      Swal.fire("Enviado", resp.data.mensaje, "success");
      setMailEnviado(true);
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.error || "No se pudo enviar",
        "error"
      );
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;
  if (!pqr) return <p>No se encontró la PQRS</p>;

  return (
    <>
      <Navbar />
      <div className="pqr-card-container">
        <h2>Detalle y edición de la PQRS #{pqr.id}</h2>
        <div className="pqr-card-columns">
          {/* Columna de datos simples */}
          <div className="pqr-card-col">
            <p>
              <strong>Nombre:</strong> {pqr.nombre} {pqr.apellido}
            </p>
            <p>
              <strong>Tipo Doc:</strong> {pqr.documento_tipo}
            </p>
            <p>
              <strong>No. Doc:</strong> {pqr.documento_numero}
            </p>
            <p>
              <strong>Correo:</strong> {pqr.correo}
            </p>
            <p>
              <strong>Teléfono:</strong> {pqr.telefono || "No proporcionado"}
            </p>
            <p>
              <strong>Sede:</strong> {pqr.sede}
            </p>
            <p>
              <strong>Estado de la respuesta:</strong> {pqr.estado_respuesta}
            </p>
            <p>
              <strong>Respuesta enviada al usuario:</strong>{" "}
              {pqr.respuesta_enviada === 1 ? "Enviada ✅" : "No enviada ❌"}
            </p>
          </div>

          {/* Columna editable */}
          <div className="pqr-card-col">
            <p>
              <strong>Servicio:</strong> {pqr.servicio_prestado}
            </p>
            <p>
              <strong>EPS:</strong> {pqr.eps}
            </p>
            <p>
              <strong>Tipo Solicitud:</strong> {pqr.tipo_solicitud}
            </p>
            <p>
              <strong>Fecha:</strong>{" "}
              {new Date(pqr.created_at).toLocaleString()}
            </p>

            {!["Consultor", "Digitador", "Gestor"].includes(
              localStorage.getItem("role")
            ) && (
              <form onSubmit={handleSubmit}>
                <label>Atributo de Calidad:</label>
                <select
                  name="atributo_calidad"
                  value={formData.atributo_calidad}
                  onChange={handleChange}
                  className="styled-input"
                >
                  <option value="" disabled>
                    Seleccione
                  </option>
                  {[
                    "Accesibilidad",
                    "Continuidad",
                    "Oportunidad",
                    "Pertinencia",
                    "Satisfacción del usuario",
                    "Seguridad",
                  ].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                <label>Fuente:</label>
                <select
                  name="fuente"
                  value={formData.fuente}
                  onChange={handleChange}
                  className="styled-input"
                >
                  <option value="" disabled>
                    Seleccione
                  </option>
                  {[
                    "Formulario de la web",
                    "Correo atención",
                    "Encuesta IPS",
                    "Callcenter",
                    "Presencial",
                  ].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                <label>Asignado a:</label>
                <select
                  name="asignado_a"
                  value={formData.asignado_a}
                  onChange={handleChange}
                  className="styled-input"
                >
                  <option value="" disabled>
                    Seleccione
                  </option>
                  {usuarios.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>

                <button type="submit">Guardar Cambios</button>
              </form>
            )}
          </div>

          {/* Descripción larga */}
          <div className="pqr-card-description-full">
            <p>
              <strong>Descripción:</strong>
            </p>
            <div className="pqr-description-text">{pqr.descripcion}</div>
          </div>

          {/* Sección de respuestas */}
          {pqr?.respuestas?.map((resp) => (
            <div key={resp.id} className="respuesta-card">
              <h4
                className={resp.es_final ? "titulo-final" : "titulo-preliminar"}
              >
                {resp.es_final
                  ? "📌 Respuesta Final"
                  : "📝 Respuesta Preliminar"}
              </h4>
              <p>
                <strong>Fecha:</strong>{" "}
                {new Date(resp.created_at).toLocaleString()}
              </p>
              <div className="contenido-respuesta">{resp.contenido}</div>
            </div>
          ))}

          {/* Formulario para crear respuesta final */}
          {tienePermiso(["Supervisor", "Gestor", "Administrador"]) &&
            !yaTieneFinal && (
              <div className="pqr-card-section pqr-card-col">
                <h3>Registrar Respuesta Final</h3>
                <textarea
                  value={respuestaFinal}
                  onChange={(e) => setRespuestaFinal(e.target.value)}
                  rows="5"
                  placeholder="Escribe la respuesta final..."
                  className="styled-input"
                />
                <button onClick={registrarRespuestaFinal}>
                  Registrar Respuesta Final
                </button>
              </div>
            )}

          {/* Botón para enviar respuesta final por correo */}
          {!["Gestor", "Digitador"].includes(localStorage.getItem("role")) &&
            yaTieneFinal &&
            !mailEnviado && (
              <div style={{ margin: "1em 0" }}>
                <button onClick={enviarAlCiudadano} className="styled-button">
                  Enviar Respuesta Final al Usuario
                </button>
              </div>
            )}
        </div>
      </div>
    </>
  );
}

export default PqrsDetail;

// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/api";
// import "./styles/PqrsDetail.css";
// import { tienePermiso } from "../utils/permisoHelper";
// import Swal from "sweetalert2";
// import Navbar from "../components/Navbar/Navbar";

// function PqrsDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [pqr, setPqr] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [respuestaFinal, setRespuestaFinal] = useState("");
//   const [yaTieneFinal, setYaTieneFinal] = useState(false);
//   const [mailEnviado, setMailEnviado] = useState(false);

//   const [formData, setFormData] = useState({
//     atributo_calidad: "",
//     fuente: "",
//     asignado_a: "",
//   });

//   useEffect(() => {
//     if (
//       !tienePermiso([
//         "Administrador",
//         "Supervisor",
//         "Gestor",
//         "Consultor",
//         "Digitador",
//       ])
//     ) {
//       Swal.fire({
//         icon: "error",
//         title: "Acceso denegado",
//         text: "No tienes permiso para ver esta página",
//       }).then(() => navigate("/dashboard"));
//       return;
//     }

//     const fetchData = async () => {
//       try {
//         const res = await api.get(`/pqrs/${id}`);
//         const p = res.data.pqr;
//         setPqr(p);
//         setYaTieneFinal(p.respuestas.some((r) => r.es_final));
//         setMailEnviado(p.respuesta_enviada === 1);
//         setFormData({
//           atributo_calidad: p.atributo_calidad || "",
//           fuente: p.fuente || "",
//           asignado_a: p.asignado ? p.asignado.id : "",
//         });
//       } catch (err) {
//         setError("Error cargando la PQRS");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [id, navigate]);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const cleanedData = {};
//     for (const key in formData) {
//       if (formData[key] !== "") cleanedData[key] = formData[key];
//     }

//     try {
//       await api.put(`/pqrs/${id}`, cleanedData);
//       Swal.fire("Actualizado", "PQRS actualizada correctamente", "success");
//     } catch {
//       Swal.fire("Error", "No se pudo actualizar", "error");
//     }
//   };

//   const registrarRespuestaFinal = async () => {
//     if (!respuestaFinal.trim()) {
//       return Swal.fire("Error", "El contenido no puede estar vacío", "warning");
//     }
//     try {
//       await api.post(`/pqrs/${id}/respuesta-final`, {
//         contenido: respuestaFinal,
//       });
//       Swal.fire("Éxito", "Respuesta final registrada", "success").then(() =>
//         window.location.reload()
//       );
//     } catch (err) {
//       Swal.fire(
//         "Error",
//         err.response?.data?.error || "Error al registrar",
//         "error"
//       );
//     }
//   };

//   const enviarAlCiudadano = async () => {
//     try {
//       const resp = await api.post(`/pqrs/${id}/enviar-respuesta-correo`);
//       Swal.fire("Enviado", resp.data.mensaje, "success");
//       setMailEnviado(true);
//     } catch (err) {
//       Swal.fire(
//         "Error",
//         err.response?.data?.error || "No se pudo enviar",
//         "error"
//       );
//     }
//   };

//   if (loading) return <p>Cargando...</p>;
//   if (error) return <p>{error}</p>;
//   if (!pqr) return <p>No se encontró la PQRS</p>;

//   return (
//     <>
//       <Navbar />
//       <div className="pqr-card-container">
//         <h2>Detalle y edición de la PQRS #{pqr.id}</h2>
//         <div className="pqr-card-columns">
//           {/* Columna de datos simples */}
//           <div className="pqr-card-col">
//             <p>
//               <strong>Nombre:</strong> {pqr.nombre} {pqr.apellido}
//             </p>
//             <p>
//               <strong>Tipo Doc:</strong> {pqr.documento_tipo}
//             </p>
//             <p>
//               <strong>No. Doc:</strong> {pqr.documento_numero}
//             </p>
//             <p>
//               <strong>Correo:</strong> {pqr.correo}
//             </p>
//             <p>
//               <strong>Teléfono:</strong> {pqr.telefono || "No proporcionado"}
//             </p>
//             <p>
//               <strong>Sede:</strong> {pqr.sede}
//             </p>
//             <p>
//               <strong>Estado de la respuesta:</strong> {pqr.estado_respuesta}
//             </p>
//           </div>

//           {/* Columna editable */}
//           <div className="pqr-card-col">
//             <p>
//               <strong>Servicio:</strong> {pqr.servicio_prestado}
//             </p>
//             <p>
//               <strong>EPS:</strong> {pqr.eps}
//             </p>
//             <p>
//               <strong>Tipo Solicitud:</strong> {pqr.tipo_solicitud}
//             </p>
//             <p>
//               <strong>Fecha:</strong>{" "}
//               {new Date(pqr.created_at).toLocaleString()}
//             </p>

//             {!["Consultor", "Digitador", "Gestor"].includes(
//               localStorage.getItem("role")
//             ) && (
//               <form onSubmit={handleSubmit}>
//                 <label>Atributo de Calidad:</label>
//                 <select
//                   name="atributo_calidad"
//                   value={formData.atributo_calidad}
//                   onChange={handleChange}
//                   className="styled-input"
//                 >
//                   <option value="" disabled>
//                     Seleccione
//                   </option>
//                   {[
//                     "Accesibilidad",
//                     "Continuidad",
//                     "Oportunidad",
//                     "Pertinencia",
//                     "Satisfacción del usuario",
//                     "Seguridad",
//                   ].map((opt) => (
//                     <option key={opt} value={opt}>
//                       {opt}
//                     </option>
//                   ))}
//                 </select>

//                 <label>Fuente:</label>
//                 <select
//                   name="fuente"
//                   value={formData.fuente}
//                   onChange={handleChange}
//                   className="styled-input"
//                 >
//                   <option value="" disabled>
//                     Seleccione
//                   </option>
//                   {[
//                     "Formulario de la web",
//                     "Correo atención",
//                     "Encuesta IPS",
//                     "Callcenter",
//                     "Presencial",
//                   ].map((opt) => (
//                     <option key={opt} value={opt}>
//                       {opt}
//                     </option>
//                   ))}
//                 </select>

//                 <label>Asignado a:</label>
//                 <select
//                   name="asignado_a"
//                   value={formData.asignado_a}
//                   onChange={handleChange}
//                   className="styled-input"
//                 >
//                   <option value="" disabled>
//                     Seleccione
//                   </option>
//                   {pqr.asignado && (
//                     <option value={pqr.asignado.id}>{pqr.asignado.name}</option>
//                   )}
//                 </select>

//                 <button type="submit">Guardar Cambios</button>
//               </form>
//             )}
//           </div>

//           {/* Descripción larga */}
//           <div className="pqr-card-description-full">
//             <p>
//               <strong>Descripción:</strong>
//             </p>
//             <div className="pqr-description-text">{pqr.descripcion}</div>
//           </div>

//           {/* Sección de respuestas */}
//           {pqr.respuestas.map((resp) => (
//             <div key={resp.id} className="respuesta-card">
//               <h4
//                 className={resp.es_final ? "titulo-final" : "titulo-preliminar"}
//               >
//                 {resp.es_final
//                   ? "📌 Respuesta Final"
//                   : "📝 Respuesta Preliminar"}
//               </h4>
//               <p>
//                 <strong>Fecha:</strong>{" "}
//                 {new Date(resp.created_at).toLocaleString()}
//               </p>
//               <div className="contenido-respuesta">{resp.contenido}</div>
//             </div>
//           ))}

//           {/* Formulario para crear respuesta final */}
//           {tienePermiso(["Supervisor", "Gestor", "Administrador"]) &&
//             !yaTieneFinal && (
//               <div className="pqr-card-section pqr-card-col">
//                 <h3>Registrar Respuesta Final</h3>
//                 <textarea
//                   value={respuestaFinal}
//                   onChange={(e) => setRespuestaFinal(e.target.value)}
//                   rows="5"
//                   placeholder="Escribe la respuesta final..."
//                   className="styled-input"
//                 />
//                 <button onClick={registrarRespuestaFinal}>
//                   Registrar Respuesta Final
//                 </button>
//               </div>
//             )}

//           {/* Botón para enviar respuesta final por correo */}
//           {!["Gestor", "Digitador"].includes(localStorage.getItem("role")) &&
//             yaTieneFinal &&
//             !mailEnviado && (
//               <div style={{ margin: "1em 0" }}>
//                 <button onClick={enviarAlCiudadano} className="styled-button">
//                   Enviar Respuesta Final al Usuario
//                 </button>
//               </div>
//             )}
//         </div>
//       </div>
//     </>
//   );
// }

// export default PqrsDetail;
