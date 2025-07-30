import React, { useState, useEffect, useRef } from "react";
import "../styles/PqrsFilters.css";

function DropdownMultiSelect({
  options,
  selected = [],
  setSelected,
  placeholder,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const toggleOption = (option) => {
    if (!Array.isArray(selected)) return; // Prevención
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
  ];

  const sedes = [
    "Bogota-Norte",
    "Bogota-Centro",
    "Bogota-Sur-Occidente-Rehabilitación",
    "Bogota-Sur-Occidente-Hidroterapia",
    "Ibague",
    "Chia",
    "Florencia",
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

  useEffect(() => {
    setTempFilters(filters); // sincronizar al inicio o al limpiar
  }, [filters]);

  return (
    <>
      <div className="filtros-busqueda">
        <input
          type="text"
          className="input-placeholder"
          placeholder="Buscar por ID ó radicado"
          value={tempFilters.pqr_codigo}
          onChange={(e) =>
            setTempFilters({ ...tempFilters, pqr_codigo: e.target.value })
          }
        />
        <input
          type="text"
          className="input-placeholder"
          placeholder="Número de Documento"
          value={tempFilters.documento_numero}
          onChange={(e) =>
            setTempFilters({ ...tempFilters, documento_numero: e.target.value })
          }
        />
        <input
          type="date"
          className="input-placeholder"
          placeholder="Fecha de Inicio" // Placeholder para claridad
          value={tempFilters.fecha_inicio || ""} // Asegúrate de que no sea undefined
          onChange={(e) =>
            setTempFilters({ ...tempFilters, fecha_inicio: e.target.value })
          }
        />
        <input
          type="date"
          className="input-placeholder"
          placeholder="Fecha de Fin" // Placeholder para claridad
          value={tempFilters.fecha_fin || ""} // Asegúrate de que no sea undefined
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
        <div className="filtro-tipo-solicitud">
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
        <div className="filtro-tipo-solicitud">
          <DropdownMultiSelect
            options={epsOptions}
            selected={tempFilters.eps}
            setSelected={(selected) =>
              setTempFilters({ ...tempFilters, eps: selected })
            }
            placeholder="Seleccione EPS"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setFilters(tempFilters); // ← aplica el filtro real
            onBuscar(); // ← ejecuta la búsqueda
          }}
          title="Buscar"
          className="search-button"
        >
          <i className="fas fa-xl fa-search"></i>
        </button>

        <button
          onClick={() =>
            setTempFilters({
              pqr_codigo: "",
              documento_numero: "",
              servicio_prestado: [],
              tipo_solicitud: [],
              sede: [],
              eps: [],
              // A J U S T E   E N   L I M P I A R   F I L T R O S
              fecha_inicio: "",
              fecha_fin: "",
            })
          }
          title="Limpiar filtros"
        >
          <i className="fas fa-xl fa-eraser"></i>
        </button>

        <p
          className="boton-refrescar"
          onClick={() => window.location.reload()}
          title="Refrescar página"
        >
          <i className="fas fa-xl fa-sync-alt"></i>
        </p>
      </div>
    </>
  );
}

export default PqrsFilters;

// import React, { useState, useEffect, useRef } from "react";
// import "../styles/PqrsFilters.css";

// function DropdownMultiSelect({
//   options,
//   selected = [],
//   setSelected,
//   placeholder,
// }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef();

//   const toggleOption = (option) => {
//     if (!Array.isArray(selected)) return; // Prevención
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
//   ];

//   const sedes = [
//     "Bogota-Norte",
//     "Bogota-Centro",
//     "Bogota-Sur-Occidente-Rehabilitación",
//     "Bogota-Sur-Occidente-Hidroterapia",
//     "Ibague",
//     "Chia",
//     "Florencia",
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

//   return (
//     <>
//       <div className="filtros-busqueda">
//         <input
//           type="text"
//           className="input-placeholder"
//           placeholder="Buscar por ID ó radicado"
//           value={filters.pqr_codigo}
//           onChange={(e) =>
//             setFilters({ ...filters, pqr_codigo: e.target.value })
//           }
//         />
//         <input
//           type="text"
//           className="input-placeholder"
//           placeholder="Número de Documento"
//           value={filters.documento_numero}
//           onChange={(e) =>
//             setFilters({ ...filters, documento_numero: e.target.value })
//           }
//         />

//         <div className="filtro-servicio">
//           <DropdownMultiSelect
//             options={servicios}
//             selected={filters.servicio_prestado}
//             setSelected={(selected) =>
//               setFilters({ ...filters, servicio_prestado: selected })
//             }
//             placeholder="Seleccione el/los servicio(s)"
//           />
//         </div>

//         <div className="filtro-tipo-solicitud">
//           <DropdownMultiSelect
//             options={tiposSolicitud}
//             selected={filters.tipo_solicitud}
//             setSelected={(selected) =>
//               setFilters({ ...filters, tipo_solicitud: selected })
//             }
//             placeholder="Seleccione tipo(s) de solicitud"
//           />
//         </div>
//         <div className="filtro-tipo-solicitud">
//           <DropdownMultiSelect
//             options={sedes}
//             selected={filters.sede}
//             setSelected={(selected) =>
//               setFilters({ ...filters, sede: selected })
//             }
//             placeholder="Seleccione sede(s)"
//             className="dropdown-sede"
//           />
//         </div>
//         <div className="filtro-tipo-solicitud">
//           <DropdownMultiSelect
//             options={epsOptions}
//             selected={filters.eps}
//             setSelected={(selected) =>
//               setFilters({ ...filters, eps: selected })
//             }
//             placeholder="Seleccione EPS"
//           />
//         </div>

//         {/* C A M B I O S   A Q U Í */}
//         <input
//           type="date"
//           className="input-placeholder"
//           placeholder="Fecha de Inicio" // Placeholder para claridad
//           value={filters.fecha_inicio || ""} // Asegúrate de que no sea undefined
//           onChange={(e) =>
//             setFilters({ ...filters, fecha_inicio: e.target.value })
//           }
//         />
//         <input
//           type="date"
//           className="input-placeholder"
//           placeholder="Fecha de Fin" // Placeholder para claridad
//           value={filters.fecha_fin || ""} // Asegúrate de que no sea undefined
//           onChange={(e) =>
//             setFilters({ ...filters, fecha_fin: e.target.value })
//           }
//         />
//         {/* F I N   C A M B I O S */}

//         <button onClick={onBuscar} title="Buscar" className="search-button">
//           <i className="fas fa-xl fa-search"></i>{" "}
//         </button>
//         <button
//           onClick={() =>
//             setFilters({
//               pqr_codigo: "",
//               documento_numero: "",
//               servicio_prestado: [],
//               tipo_solicitud: [],
//               sede: [],
//               eps: [],
//               // A J U S T E   E N   L I M P I A R   F I L T R O S
//               fecha_inicio: "",
//               fecha_fin: "",
//             })
//           }
//           title="Limpiar filtros"
//         >
//           <i className="fas fa-xl fa-eraser"></i>
//         </button>

//         <p
//           className="boton-refrescar"
//           onClick={() => window.location.reload()}
//           title="Refrescar página"
//         >
//           <i className="fas fa-xl fa-sync-alt"></i>
//         </p>
//       </div>
//     </>
//   );
// }

// export default PqrsFilters;
