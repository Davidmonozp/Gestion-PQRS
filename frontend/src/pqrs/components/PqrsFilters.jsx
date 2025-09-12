import React, { useState, useEffect, useRef } from "react";
import "../styles/PqrsFilters.css";
import api from "../../api/api";

// El componente DropdownMultiSelect es el mismo, no se necesita modificarlo.
function DropdownMultiSelect({
  options,
  selected = [],
  setSelected,
  placeholder,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const toggleOption = (option) => {
    if (!Array.isArray(selected)) return;
    if (selected.includes(option)) {
      setSelected(selected.filter((o) => o !== option));
    } else {
      setSelected([...selected, option]);
    }
  };

  const handleClickOutside = (e) => {
    if (ref.current && !ref.current.contains(e.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="multi-select-container" ref={ref}>
      <div className="multi-select-display" onClick={() => setOpen(!open)}>
        {Array.isArray(selected) && selected.length > 0
          ? selected.join(", ")
          : placeholder}
        <span className="arrow">{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div className="multi-select-dropdown">
          {options.map((option) => (
            <label key={option} className="dropdown-item">
              <input
                type="checkbox"
                checked={Array.isArray(selected) && selected.includes(option)}
                onChange={() => toggleOption(option)}
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function PqrsFilters({ filters, setFilters, onBuscar }) {
  const [tempFilters, setTempFilters] = useState(filters);

  // Opciones existentes
  const servicios = [
    "Hidroterapia",
    "Programa Rehabilitación",
    "Neuropediatría",
    "Psiquiatría",
    "Fisiatría",
    "Acuamotricidad",
    "Natación infantil",
    "Natación jóvenes-adultos",
    "Yoga",
    "Yoga acuático",
    "Mindfulness",
    "Pilates",
    "Pilates acuático",
  ];
  servicios.sort();

  const tiposSolicitud = [
    "Felicitación",
    "Petición",
    "Queja",
    "Reclamo",
    "Solicitud",
    "Tutela",
    "Derecho de peticion",
  ];

  const sedes = [
    "Bogota-Norte",
    "Bogota-Centro",
    "Bogota-Sur-Occidente-Rehabilitación",
    "Bogota-Sur-Occidente-Hidroterapia",
    "Ibague",
    "Chia",
    "Florencia",
    "Cedritos-Divertido",
  ];

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

  const [clasificacionesOptions, setClasificacionesOptions] = useState([]);

  useEffect(() => {
    api.get("/clasificaciones").then((res) => {
      // asume que el backend devuelve [{id: 1, nombre: "..."}, ...]
      setClasificacionesOptions(
        res.data.map((c) => ({
          value: c.id,
          label: c.nombre,
        }))
      );
    });
  }, []);

  // Nuevo conjunto de opciones para 'respuesta_enviada'
  const respuestaEnviadaOptions = [
    { label: "PQR-S Enviadas", value: 1 },
    { label: "PQR-S No enviadas", value: 0 },
  ];

  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const handleRespuestaChange = (selectedValues) => {
    // Convierte las etiquetas seleccionadas ("Sí", "No") a sus valores numéricos (1, 0)
    const selectedNumericValues = selectedValues.map(
      (label) =>
        respuestaEnviadaOptions.find((opt) => opt.label === label).value
    );
    setTempFilters({
      ...tempFilters,
      respuesta_enviada: selectedNumericValues,
    });
  };

  // Mapea los valores numéricos de vuelta a etiquetas para que el dropdown las muestre
  const getRespuestaLabels = (values) => {
    if (!Array.isArray(values)) return [];
    return values.map(
      (value) =>
        respuestaEnviadaOptions.find((opt) => opt.value === value)?.label
    );
  };

  return (
    <>
      <div className="filtros-busqueda">
        <input
          type="text"
          className="input-placeholder"
          placeholder="Buscar por ID ó radicado"
          value={tempFilters.pqr_codigo || ""}
          onChange={(e) =>
            setTempFilters({ ...tempFilters, pqr_codigo: e.target.value })
          }
        />
        <input
          type="text"
          className="input-placeholder"
          placeholder="Número de Documento"
          value={tempFilters.documento_numero || ""}
          onChange={(e) =>
            setTempFilters({ ...tempFilters, documento_numero: e.target.value })
          }
        />
        <input
          type="date"
          className="input-placeholder"
          placeholder="Fecha de Inicio"
          value={tempFilters.fecha_inicio || ""}
          onChange={(e) =>
            setTempFilters({ ...tempFilters, fecha_inicio: e.target.value })
          }
        />
        <input
          type="date"
          className="input-placeholder"
          placeholder="Fecha de Fin"
          value={tempFilters.fecha_fin || ""}
          onChange={(e) =>
            setTempFilters({ ...tempFilters, fecha_fin: e.target.value })
          }
        />

        <div className="filtro-servicio">
          <DropdownMultiSelect
            options={servicios}
            selected={tempFilters.servicio_prestado}
            setSelected={(selected) =>
              setTempFilters({ ...tempFilters, servicio_prestado: selected })
            }
            placeholder="Seleccione el/los servicio(s)"
          />
        </div>

        <div className="filtro-tipo-solicitud">
          <DropdownMultiSelect
            options={tiposSolicitud}
            selected={tempFilters.tipo_solicitud}
            setSelected={(selected) =>
              setTempFilters({ ...tempFilters, tipo_solicitud: selected })
            }
            placeholder="Seleccione tipo(s) de solicitud"
          />
        </div>

        <div className="filtro-clasificaciones">
          <DropdownMultiSelect
            options={clasificacionesOptions.map((opt) => opt.label)} // muestra nombres
            selected={tempFilters.clasificacionesNombres || []} // nombres seleccionados
            setSelected={(selectedNames) => {
              // 1. Guardar los nombres seleccionados (para mostrar en el dropdown)
              // 2. Mapear esos nombres a IDs (para enviar al backend)
              const selectedIds = clasificacionesOptions
                .filter((opt) => selectedNames.includes(opt.label))
                .map((opt) => opt.value);

              setTempFilters({
                ...tempFilters,
                clasificaciones: selectedIds, // lo que usa el backend
                clasificacionesNombres: selectedNames, // solo para UI
              });
            }}
            placeholder="Seleccione clasificación(es)"
          />
        </div>

        <div className="filtro-sede">
          <DropdownMultiSelect
            options={sedes}
            selected={tempFilters.sede}
            setSelected={(selected) =>
              setTempFilters({ ...tempFilters, sede: selected })
            }
            placeholder="Seleccione sede(s)"
            className="dropdown-sede"
          />
        </div>

        <div className="filtro-eps">
          <DropdownMultiSelect
            options={epsOptions}
            selected={tempFilters.eps}
            setSelected={(selected) =>
              setTempFilters({ ...tempFilters, eps: selected })
            }
            placeholder="Seleccione EPS"
          />
        </div>

        {/* --- Nuevo Filtro: Estado de Respuesta --- */}
        <div className="filtro-respuesta">
          <DropdownMultiSelect
            options={respuestaEnviadaOptions.map((opt) => opt.label)}
            selected={getRespuestaLabels(tempFilters.respuesta_enviada)}
            setSelected={handleRespuestaChange}
            placeholder="Estado de la PQR-S"
          />
        </div>
        <div className="iconos-filtros">
          <button
            type="button"
            onClick={() => {
              setFilters(tempFilters);
              onBuscar();
            }}
            title="Buscar"
            className="search-button"
          >
            <i className="fas fa-xl fa-search">
              <span className="texto-iconos">Buscar</span>
            </i>
          </button>

          <button
            type="button"
            className="eraser-button"
            onClick={() =>
              setTempFilters({
                pqr_codigo: "",
                documento_numero: "",
                servicio_prestado: [],
                tipo_solicitud: [],
                sede: [],
                eps: [],
                fecha_inicio: "",
                fecha_fin: "",
                respuesta_enviada: [],
                clasificaciones: [],
                clasificacionesNombres: [],
              })
            }
            title="Limpiar filtros"
          >
            <i className="fas fa-xl fa-eraser">
              <span className="texto-iconos">Limpiar</span>
            </i>
          </button>

          <button
            type="button"
            className="boton-refrescar"
            onClick={() => window.location.reload()}
            title="Refrescar página"
          >
            <i className="fas fa-xl fa-sync-alt">
              <span className="texto-iconos">Actualizar</span>
            </i>
          </button>
        </div>
      </div>
    </>
  );
}

export default PqrsFilters;

// import React, { useState, useEffect, useRef } from "react";
// import "../styles/PqrsFilters.css";

// // El componente DropdownMultiSelect es el mismo, no se necesita modificarlo.
// function DropdownMultiSelect({
//   options,
//   selected = [],
//   setSelected,
//   placeholder,
// }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef();

//   const toggleOption = (option) => {
//     if (!Array.isArray(selected)) return;
//     if (selected.includes(option)) {
//       setSelected(selected.filter((o) => o !== option));
//     } else {
//       setSelected([...selected, option]);
//     }
//   };

//   const handleClickOutside = (e) => {
//     if (ref.current && !ref.current.contains(e.target)) {
//       setOpen(false);
//     }
//   };

//   useEffect(() => {
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <div className="multi-select-container" ref={ref}>
//       <div className="multi-select-display" onClick={() => setOpen(!open)}>
//         {Array.isArray(selected) && selected.length > 0
//           ? selected.join(", ")
//           : placeholder}
//         <span className="arrow">{open ? "▲" : "▼"}</span>
//       </div>
//       {open && (
//         <div className="multi-select-dropdown">
//           {options.map((option) => (
//             <label key={option} className="dropdown-item">
//               <input
//                 type="checkbox"
//                 checked={Array.isArray(selected) && selected.includes(option)}
//                 onChange={() => toggleOption(option)}
//               />
//               {option}
//             </label>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// function PqrsFilters({ filters, setFilters, onBuscar }) {
//   const [tempFilters, setTempFilters] = useState(filters);

//   // Opciones existentes
//   const servicios = [
//     "Hidroterapia",
//     "Programa Rehabilitación",
//     "Neuropediatría",
//     "Psiquiatría",
//     "Fisiatría",
//     "Acuamotricidad",
//     "Natación infantil",
//     "Natación jóvenes-adultos",
//     "Yoga",
//     "Yoga acuático",
//     "Mindfulness",
//     "Pilates",
//     "Pilates acuático",
//   ];
//   servicios.sort();

//   const tiposSolicitud = [
//     "Felicitación",
//     "Petición",
//     "Queja",
//     "Reclamo",
//     "Solicitud",
//     "Tutela",
//     "Derecho de peticion",
//   ];

//   const sedes = [
//     "Bogota-Norte",
//     "Bogota-Centro",
//     "Bogota-Sur-Occidente-Rehabilitación",
//     "Bogota-Sur-Occidente-Hidroterapia",
//     "Ibague",
//     "Chia",
//     "Florencia",
//     "Cedritos-Divertido",
//   ];

//   const epsOptions = [
//     "Compensar",
//     "Fomag",
//     "Famisanar",
//     "Nueva Eps",
//     "Sanitas",
//     "Sura",
//     "Aliansalud",
//     "Asmet Salud",
//     "Seguros Bolivar",
//     "Cafam",
//     "Colmédica",
//     "Positiva",
//     "Particular",
//   ];
//   epsOptions.sort();

//   // Nuevo conjunto de opciones para 'respuesta_enviada'
//   const respuestaEnviadaOptions = [
//     { label: "PQR-S Enviadas", value: 1 },
//     { label: "PQR-S No enviadas", value: 0 },
//   ];

//   useEffect(() => {
//     setTempFilters(filters);
//   }, [filters]);

//   const handleRespuestaChange = (selectedValues) => {
//     // Convierte las etiquetas seleccionadas ("Sí", "No") a sus valores numéricos (1, 0)
//     const selectedNumericValues = selectedValues.map(
//       (label) =>
//         respuestaEnviadaOptions.find((opt) => opt.label === label).value
//     );
//     setTempFilters({
//       ...tempFilters,
//       respuesta_enviada: selectedNumericValues,
//     });
//   };

//   // Mapea los valores numéricos de vuelta a etiquetas para que el dropdown las muestre
//   const getRespuestaLabels = (values) => {
//     if (!Array.isArray(values)) return [];
//     return values.map(
//       (value) =>
//         respuestaEnviadaOptions.find((opt) => opt.value === value)?.label
//     );
//   };

//   return (
//     <>
//       <div className="filtros-busqueda">
//         <input
//           type="text"
//           className="input-placeholder"
//           placeholder="Buscar por ID ó radicado"
//           value={tempFilters.pqr_codigo || ""}
//           onChange={(e) =>
//             setTempFilters({ ...tempFilters, pqr_codigo: e.target.value })
//           }
//         />
//         <input
//           type="text"
//           className="input-placeholder"
//           placeholder="Número de Documento"
//           value={tempFilters.documento_numero || ""}
//           onChange={(e) =>
//             setTempFilters({ ...tempFilters, documento_numero: e.target.value })
//           }
//         />
//         <input
//           type="date"
//           className="input-placeholder"
//           placeholder="Fecha de Inicio"
//           value={tempFilters.fecha_inicio || ""}
//           onChange={(e) =>
//             setTempFilters({ ...tempFilters, fecha_inicio: e.target.value })
//           }
//         />
//         <input
//           type="date"
//           className="input-placeholder"
//           placeholder="Fecha de Fin"
//           value={tempFilters.fecha_fin || ""}
//           onChange={(e) =>
//             setTempFilters({ ...tempFilters, fecha_fin: e.target.value })
//           }
//         />

//         <div className="filtro-servicio">
//           <DropdownMultiSelect
//             options={servicios}
//             selected={tempFilters.servicio_prestado}
//             setSelected={(selected) =>
//               setTempFilters({ ...tempFilters, servicio_prestado: selected })
//             }
//             placeholder="Seleccione el/los servicio(s)"
//           />
//         </div>

//         <div className="filtro-tipo-solicitud">
//           <DropdownMultiSelect
//             options={tiposSolicitud}
//             selected={tempFilters.tipo_solicitud}
//             setSelected={(selected) =>
//               setTempFilters({ ...tempFilters, tipo_solicitud: selected })
//             }
//             placeholder="Seleccione tipo(s) de solicitud"
//           />
//         </div>

//         <div className="filtro-sede">
//           <DropdownMultiSelect
//             options={sedes}
//             selected={tempFilters.sede}
//             setSelected={(selected) =>
//               setTempFilters({ ...tempFilters, sede: selected })
//             }
//             placeholder="Seleccione sede(s)"
//             className="dropdown-sede"
//           />
//         </div>

//         <div className="filtro-eps">
//           <DropdownMultiSelect
//             options={epsOptions}
//             selected={tempFilters.eps}
//             setSelected={(selected) =>
//               setTempFilters({ ...tempFilters, eps: selected })
//             }
//             placeholder="Seleccione EPS"
//           />
//         </div>

//         {/* --- Nuevo Filtro: Estado de Respuesta --- */}
//         <div className="filtro-respuesta">
//           <DropdownMultiSelect
//             options={respuestaEnviadaOptions.map((opt) => opt.label)}
//             selected={getRespuestaLabels(tempFilters.respuesta_enviada)}
//             setSelected={handleRespuestaChange}
//             placeholder="Estado de la PQR-S"
//           />
//         </div>
//         <div className="iconos-filtros">
//           <button
//             type="button"
//             onClick={() => {
//               setFilters(tempFilters);
//               onBuscar();
//             }}
//             title="Buscar"
//             className="search-button"
//           >
//             <i className="fas fa-xl fa-search">
//               <span className="texto-iconos">Buscar</span>
//             </i>
//           </button>

//           <button
//             type="button"
//             className="eraser-button"
//             onClick={() =>
//               setTempFilters({
//                 pqr_codigo: "",
//                 documento_numero: "",
//                 servicio_prestado: [],
//                 tipo_solicitud: [],
//                 sede: [],
//                 eps: [],
//                 fecha_inicio: "",
//                 fecha_fin: "",
//                 respuesta_enviada: [],
//               })
//             }
//             title="Limpiar filtros"
//           >
//             <i className="fas fa-xl fa-eraser">
//               <span className="texto-iconos">Limpiar</span>
//             </i>
//           </button>

//           <button
//             type="button"
//             className="boton-refrescar"
//             onClick={() => window.location.reload()}
//             title="Refrescar página"
//           >
//             <i className="fas fa-xl fa-sync-alt">
//               <span className="texto-iconos">Actualizar</span>
//             </i>
//           </button>
//         </div>
//       </div>
//     </>
//   );
// }

// export default PqrsFilters;
