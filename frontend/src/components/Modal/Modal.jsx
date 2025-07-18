import React, { useState, useEffect } from 'react';
import './Modal.css'; 

const Modal = ({ show, onClose, title, description }) => {

  const [shouldRender, setShouldRender] = useState(show);


  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    if (show) {
      
      setShouldRender(true); 
      setAnimateOut(false);  
    } else {
      // Si la prop 'show' es false (el padre quiere ocultar el modal)
      setAnimateOut(true); 

    
      const timer = setTimeout(() => {
        setShouldRender(false); // Una vez que la animación de salida ha terminado, desmontamos el modal.
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [show]); 

  
  if (!shouldRender) {
    return null;
  }

  // Determinamos las clases de animación.
  const animationClass = `animate__animated ${animateOut ? 'animate__zoomOut' : 'animate__zoomIn'}`;

  return (
    <div className="modal-overlay">
      {/* Aplicamos las clases de animación al div del contenido del modal */}
      <div className={`modal-content ${animationClass}`}>
        <h2>{title}</h2>
        <p>{description}</p>
        <button onClick={onClose} className="modal-close-button">Cerrar</button>
      </div>
    </div>
  );
};

export default Modal;