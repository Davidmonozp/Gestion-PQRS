import "../styles/GlosarioIconos.css";

export const GlosarioIconos = () => {
    return (
        <>
            <input type="checkbox" className="checkbox" id="check" />
            <label htmlFor="check" className="menu">
                ⬅️
            </label>
            <div className="left-panel-glosario">
                <ul className="ul-panel-glosario">
                    <li className="li-panel-glosario">
                        <i className="fa-solid fa-clone icono-duplicada"></i>
                        <strong> → Duplicada // </strong>
                         <i className="fa-solid fa-link" style={{ color: 'green', fontSize: '12px' }}></i>
                        <strong> → Asociada // </strong>
                        <i className="fa-solid fa-check pqr-icon success" ></i>
                        <strong> → Respuesta preliminar registrada // </strong>
                         <i className="fa-solid fa-clock pqr-icon pending"></i>
                        <strong> → Pendiente de respuesta preliminar</strong>
                    </li>
                    {/* <li className="li-panel-glosario">
                        <i className="fa-solid fa-link" style={{ color: 'green', fontSize: '12px' }}></i>
                        <strong> → Asociada // </strong>
                        <i className="fa-solid fa-check pqr-icon success" ></i>
                        <strong> → Respuesta preliminar registrada // </strong>
                         <i className="fa-solid fa-clock pqr-icon pending"></i>
                        <strong> → Pendiente de respuesta preliminar</strong>
                    </li>
                    <li className="li-panel-glosario">
                        <i className="fa-solid fa-check pqr-icon success" ></i>
                        <strong> → Respuesta preliminar registrada</strong>
                    </li>
                    <li className="li-panel-glosario">
                        <i className="fa-solid fa-clock pqr-icon pending"></i>
                        <strong> → Pendiente de respuesta preliminar</strong>
                    </li> */}
                </ul>
            </div>
        </>
    );
};
