import "../styles/PanelDespegable.css";

export const PanelDespegable = () => {
  return (
    <>
      <input type="checkbox" className="checkbox-panel" id="check" />
      <label htmlFor="check" className="menu-panel">
        ⬅️
      </label>
      <div className="left-panel">
        <ul className="ul-panel">
          <li className="li-panel">
            ¿Fue difícil acceder? 👉 <strong>Accesibilidad</strong>
          </li>
          <li className="li-panel">
            ¿Se demoró mucho la atención? 👉 <strong>Oportunidad</strong>
          </li>
          <li className="li-panel">
            ¿Se puso en riesgo al paciente? 👉 <strong>Seguridad</strong>
          </li>
          <li className="li-panel">
            ¿El servicio sí era el adecuado? 👉 <strong>Pertinencia</strong> 
          </li>
          <li className="li-panel">
            ¿Se interrumpió su proceso? 👉 <strong>Continuidad</strong>
          </li>
          <li className="li-panel">
            ¿Le dieron atención completa? 👉 <strong>Integralidad</strong>
          </li>
          <li className="li-panel">
            ¿El servicio dio resultados? 👉 <strong>Efectividad</strong>
          </li>
        </ul>
      </div>
    </>
  );
};
