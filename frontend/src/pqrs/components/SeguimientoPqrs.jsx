import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import '../styles/SeguimientoPqrs.css';

export default function SeguimientoPqrs({
  pqr_codigo,
  formData,
  estado_respuesta
}) {
  const [seguimientos, setSeguimientos] = useState([]);
  const [descripcion, setDescripcion] = useState('');
  const [tipoSeguimiento, setTipoSeguimiento] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedItems, setExpandedItems] = useState([]);

  useEffect(() => {
    if (pqr_codigo) {
      fetchSeguimientos();
    }
  }, [pqr_codigo]);

  const fetchSeguimientos = async () => {
    try {
      const res = await api.get(`/pqrs/${pqr_codigo}/seguimientos`);
      setSeguimientos(res.data.seguimientos);
    } catch (err) {
      console.error(err);
      setError('Error al cargar seguimientos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post(`/pqrs/${pqr_codigo}/seguimientos`, {
        descripcion,
        tipo_seguimiento: tipoSeguimiento,
      });
      setDescripcion('');
      setTipoSeguimiento('');
      fetchSeguimientos();
    } catch (err) {
      console.error(err);
      setError('Error al registrar seguimiento');
    } finally {
      setLoading(false);
    }
  };

  const toggleDescripcion = (id) => {
    setExpandedItems((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };

  const seguimientoDeshabilitado = !['Asignado', 'En proceso'].includes(estado_respuesta);

  return (
    <div className="seguimiento-container">
      <h2>Seguimiento de la PQR</h2>

      {error && <p className="error">{error}</p>}

      <div className="seguimientos-list">
        {seguimientos.length === 0 ? (
          <p>No hay seguimientos registrados.</p>
        ) : (
          <ul>
            {seguimientos.map((item) => (
              <li key={item.id} className="seguimiento-item">
                <div
                  onClick={() => toggleDescripcion(item.id)}
                  style={{
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: 'rgb(4, 61, 126)',
                    userSelect: 'none',
                    textAlign: 'start',
                  }}
                >
                  {item.user?.name || 'Usuario desconocido'}
                  <span style={{ fontWeight: 'normal', display: 'block' }}>
                    ({new Date(item.created_at).toLocaleString()})
                  </span>
                </div>
                {expandedItems.includes(item.id) && (
                  <p style={{ marginTop: '0.5rem' }}>
                    <strong>Tipo:</strong> {item.tipo_seguimiento} <br />
                    <strong>Descripción:</strong> {item.descripcion}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {seguimientoDeshabilitado ? (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            border: '1px dashed #ccc',
            color: '#777',
            backgroundColor: '#f9f9f9',
            borderRadius: '6px',
            textAlign: 'center',
          }}
        >
          {estado_respuesta === 'Cerrado'
            ? 'La PQR está cerrada. No se pueden registrar más seguimientos.'
            : 'Complete todos los campos obligatorios para habilitar el seguimiento.'}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="seguimiento-form">
          <label>Tipo de seguimiento:</label>
          <select
          className='styled-input'
            value={tipoSeguimiento}
            onChange={(e) => setTipoSeguimiento(e.target.value)}
            required
          >
            <option value="">Seleccione una opción</option>
            <option value="Comunicación con el usuario">Comunicación con el usuario</option>
            <option value="Comunicación interna Passus">Comunicación interna Passus</option>
            <option value="Información General">Información General</option>
          </select>

          <label>Descripción de la gestión realizada:</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Describe la gestión realizada..."
            required
            rows={3}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Agregar seguimiento'}
          </button>
        </form>
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
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [expandedItems, setExpandedItems] = useState([]); // Estado para mostrar/ocultar descripciones

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
//       await api.post(`/pqrs/${pqr_codigo}/seguimientos`, { descripcion });
//       setDescripcion('');
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

//   const seguimientoDeshabilitado = !['Asignado', 'En proceso'].includes(
//     estado_respuesta
//   );

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
//                   }}
//                 >
//                   {item.user?.name || 'Usuario desconocido'}{' '}
//                   <span style={{ fontWeight: 'normal' }}>
//                     ({new Date(item.created_at).toLocaleString()})
//                   </span>
//                 </div>
//                 {expandedItems.includes(item.id) && (
//                   <p style={{ marginTop: '0.5rem' }}>{item.descripcion}</p>
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






















// import React, { useEffect, useState } from 'react';
// import api from '../api/api';
// import "./styles/SeguimientoPqrs.css";

// export default function SeguimientoPqrs({ pqr_codigo }) {
//   const [seguimientos, setSeguimientos] = useState([]);
//   const [descripcion, setDescripcion] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   // Cargar seguimientos al montar
//   useEffect(() => {
//     fetchSeguimientos();
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
//       await api.post(`/pqrs/${pqr_codigo}/seguimientos`, { descripcion });
//       setDescripcion('');
//       fetchSeguimientos();
//     } catch (err) {
//       console.error(err);
//       setError('Error al registrar seguimiento');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="seguimiento-container">
//       <h2>Seguimiento de la PQR</h2>

//       {error && <p className="error">{error}</p>}

//       <div className="seguimientos-list">
//         {seguimientos.length === 0 && <p>No hay seguimientos registrados.</p>}

//         <ul>
//           {seguimientos.map((item) => (
//             <li key={item.id} className="seguimiento-item">
//               <div>
//                 <strong>{item.user?.name || 'Usuario desconocido'}</strong>
//                 <span> ({new Date(item.created_at).toLocaleString()})</span>
//               </div>
//               <p>{item.descripcion}</p>
//             </li>
//           ))}
//         </ul>
//       </div>

//       <form onSubmit={handleSubmit} className="seguimiento-form">
//         <textarea
//           value={descripcion}
//           onChange={(e) => setDescripcion(e.target.value)}
//           placeholder="Describe la gestión realizada..."
//           required
//           rows={3}
//         />
//         <button type="submit" disabled={loading}>
//           {loading ? 'Registrando...' : 'Agregar seguimiento'}
//         </button>
//       </form>
//     </div>
//   );
// }
