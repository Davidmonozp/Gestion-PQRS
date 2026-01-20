import "../styles/IndicacionFormato.css";

export const IndicacionFormato = () => {
    return (
        <>
            <input type="checkbox" className="checkbox-formato" id="check" />
            <label htmlFor="check" className="menu-formato">
                ⬅️
            </label>
            <div className="left-panel-formato">
                <ul className="ul-panel-formato">
                    <li className="li-panel-formato">
                        <strong className="negrilla-formato">Formato 1:</strong> Cuando definitivamente, No tengo nada que ver con las pretensiones. Ejemplo, estén solicitándonos servicios que nosotros no prestamos: Sillas de ruedas, Prótesis, Acompañamientos sombra, Pañales, Ensures, transportes. Aquí se envía la respuesta tal como está en el formato N.1
                    </li>
                    <li className="li-panel-formato">
                        <strong className="negrilla-formato">Formato 2:</strong> Si nos vinculan por los servicios que si estamos brindando se debe leer muy bien los hechos y las pretensiones. Ejemplo, el usuario puede indicar que no ha podido acceder al servicio de hidroterapia con nosotros, y cuando revisamos el usuario no tiene autorización aun por la Eps no la ha generado, entonces la Respuesta es, no contamos con la autorización y requerimos de ella para poder realizar el proceso de agendamiento.
                    </li>

                </ul>
            </div>
        </>
    )
}
