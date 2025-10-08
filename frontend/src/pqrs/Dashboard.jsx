import { useEffect, useState } from "react";
import "./styles/Dashboard.css";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
    LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
    Legend
} from "recharts";
import api from "../api/api";
import Navbar from "../components/Navbar/Navbar";
import { Version } from "../components/Footer/Version";
import DropDownMultiSelect from "./components/DropDownMultiselect";
import { NavLink } from "react-router-dom";

export default function DashboardPqrs() {
    // Estados de datos
    const [porMes, setPorMes] = useState([]);
    const [porAnio, setPorAnio] = useState([]);
    const [porTipo, setPorTipo] = useState([]);
    const [porEps, setPorEps] = useState([]);
    const [porAtributoCalidad, setPorAtributoCalidad] = useState([]);
    const [resumenGlobal, setResumenGlobal] = useState({});
    const [resumenFiltrado, setResumenFiltrado] = useState({});
    const [porEstadoRespuesta, setPorEstadoRespuesta] = useState([]);
    const [promedioRespuesta, setPromedioRespuesta] = useState(null);
    const [promedioRespuestaFormato, setPromedioRespuestaFormato] = useState(null);
    const [epsSeleccionadas, setEpsSeleccionadas] = useState([]);
    const [porSedeTipo, setPorSedeTipo] = useState([]);
    const [clasificaciones, setClasificaciones] = useState([]);
    const [clasificacionesSeleccionadas, setClasificacionesSeleccionadas] = useState([]);



    // Estados de filtros
    const [mesesSeleccionados, setMesesSeleccionados] = useState([]);
    const [atributosCalidadSeleccionados, setAtributosCalidadSeleccionados] = useState([]);
    const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
    const [sedesSeleccionadas, setSedesSeleccionadas] = useState([]);
    const [tiposSolicitudSeleccionados, setTiposSolicitudSeleccionados] = useState([]);
    const [porServicio, setPorServicio] = useState([]);
    const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
    const [clasificacionPorTipo, setClasificacionPorTipo] = useState([]);

    const totalPacientes = 5343;
    const pacientesSeptiembre = [
        { tipo: "Felicitaciones", cantidad: 4 },
        { tipo: "Peticiones", cantidad: 95 },
        { tipo: "Quejas", cantidad: 52 },
        { tipo: "Reclamos", cantidad: 30 },
        { tipo: "Tutelas", cantidad: 2 },
        { tipo: "Solicitudes", cantidad: 152 },
    ];
    const pqrsConPorcentaje = pacientesSeptiembre.map((item) => ({
        ...item,
        porcentaje: ((item.cantidad / totalPacientes) * 100).toFixed(2),
    }));

    const tipoColor = {
        "Solicitud": "#10b981",
        "Queja": "#e9ec1e",
        "Reclamo": "#ef4444",
        "Peticion": "#2325a7ff",      // si tu backend usa "Peticion" sin tilde
        "Petición": "#2325a7ff",      // incluye la versión con tilde si aplica
        "Tutela": "#f59e0b",
        "Felicitacion": "#3b82f6",
        "Felicitación": "#3b82f6"
    };

    const defaultColors = ["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#2325a7ff", "#e9ec1e"];


    // Opciones
    const sedes = [
        { value: "Bogota-Norte", label: "Bogota-Norte" },
        { value: "Bogota-Centro", label: "Bogota-Centro" },
        { value: "Bogota-Sur-Occidente-Rehabilitación", label: "Bogota-Sur-Occidente-Rehabilitación" },
        { value: "Bogota-Sur-Occidente-Hidroterapia", label: "Bogota-Sur-Occidente-Hidroterapia" },
        { value: "Ibague", label: "Ibague" },
        { value: "Chía", label: "Chía" },
        { value: "Florencia", label: "Florencia" },
        { value: "Cedritos-Divertido", label: "Cedritos-Divertido" },
    ];
    // si tus sedes vienen en formato { value, label }:
    const sedesLabels = sedes.map((s) => s.label);

    const clasificacionesAbreviadas = {
        "Agendamiento": "Agendamiento",
        "Atención de profesional en salud": "Profesional en salud",
        "Atención de personal administrativo": "Personal administrativo",
        "Atención en línea de frente (recepción)": "Línea de frente (recepción)",
        "Atención por el call center": "Call center",
        "Proceso terapéutico": "Proceso terapéutico",
        "Información y comunicación": "Inf y comunicación",
        "Infraestructura": "Infraestructura",
        "Orden y aseo": "Orden y aseo",
        "Herramientas digitales": "Herramientas digitales",
        "Solicitudes de tesorería": "Solicitudes de tesorería",
        "Envío de historia clínica o informes finales": "Envío HC o informes finales",
        "Política de multas por inasistencia": "Multas por inasistencia",
        "Reprogramación de citas": "Reprog. de citas",
    }

    const meses = [
        { value: 1, label: "Enero" },
        { value: 2, label: "Febrero" },
        { value: 3, label: "Marzo" },
        { value: 4, label: "Abril" },
        { value: 5, label: "Mayo" },
        { value: 6, label: "Junio" },
        { value: 7, label: "Julio" },
        { value: 8, label: "Agosto" },
        { value: 9, label: "Septiembre" },
        { value: 10, label: "Octubre" },
        { value: 11, label: "Noviembre" },
        { value: 12, label: "Diciembre" },
    ];

    const atributosCalidad = [
        { value: "Accesibilidad", label: "Accesibilidad" },
        { value: "Continuidad", label: "Continuidad" },
        { value: "Efectividad", label: "Efectividad" },
        { value: "Integralidad", label: "Integralidad" },
        { value: "Oportunidad", label: "Oportunidad" },
        { value: "Pertinencia", label: "Pertinencia" },
        { value: "Seguridad", label: "Seguridad" },
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
    ].sort().map(eps => ({ value: eps, label: eps }));

    const tiposSolicitudOptions = [
        { value: "Queja", label: "Queja" },
        { value: "Reclamo", label: "Reclamo" },
        { value: "Peticion", label: "Petición" },
        { value: "Solicitud", label: "Solicitud" },
        { value: "Tutela", label: "Tutela" },
        { value: "Derecho de petición", label: "Derecho de petición" },
        { value: "Felicitacion", label: "Felicitación" },
    ];

    const serviciosOptions = [
        { label: "Hidroterapia", value: "Hidroterapia" },
        { label: "Programa de Rehabilitación", value: "Programa de Rehabilitación" },
        { label: "Neuropediatría", value: "Neuropediatría" },
        { label: "Psiquiatría", value: "Psiquiatría" },
        { label: "Fisiatría", value: "Fisiatría" },
        { label: "Acuamotricidad", value: "Acuamotricidad" },
        { label: "Natación", value: "Natación" },
        { label: "Yoga", value: "Yoga" },
        { label: "Pilates", value: "Pilates" },
        { label: "Valoración por fisioterapia telemedicina", value: "Valoración por fisioterapia telemedicina" },
    ];


    const acortarNombreSede = (nombre) => {
        if (!nombre || typeof nombre !== 'string') {
            return nombre;
        }

        // Opción 1: Reemplazar palabras largas por abreviaturas
        let nombreAbreviado = nombre
            .replace('Bogota-Sur-Occidente-Rehabilitación', 'Bgta-Sur-Occ-RHB.')
            .replace('Bogota-Sur-Occidente-Hidroterapia', 'Bgta-Sur-Occ-HD.')
            .replace('Cedritos-Divertido', 'Cedr.Divertido.');

        return nombreAbreviado;
    };

    // Función para cargar todas las gráficas filtradas
    const fetchDatos = () => {
        const params = {
            anio: anioSeleccionado,
            sede: sedesSeleccionadas.length > 0 ? sedesSeleccionadas : undefined,
            mes: mesesSeleccionados.length > 0 ? mesesSeleccionados : undefined,
            atributo_calidad: atributosCalidadSeleccionados.length > 0 ? atributosCalidadSeleccionados : undefined,
            eps: epsSeleccionadas.length > 0 ? epsSeleccionadas : undefined,
            tipo_solicitud: tiposSolicitudSeleccionados.length
                ? tiposSolicitudSeleccionados.map(t => t.value || t)
                : undefined,
            servicio_prestado: serviciosSeleccionados.length
                ? serviciosSeleccionados.map(s => s.value || s)
                : undefined,
            clasificacion: clasificacionesSeleccionadas.length
                ? clasificacionesSeleccionadas.map(c => c.value || c)
                : undefined,
            clasificacion_id: clasificacionesSeleccionadas.length
                ? clasificacionesSeleccionadas.map(c => c.value)
                : undefined,
        };

        api.get("/por-mes", { params }).then(res => setPorMes(Array.isArray(res.data) ? res.data : []));
        api.get("/por-tipo", { params }).then(res => setPorTipo(Array.isArray(res.data) ? res.data : []));
        api.get("/por-eps", { params }).then(res => setPorEps(Array.isArray(res.data) ? res.data : []));
        api.get("/por-atributo", { params }).then(res => setPorAtributoCalidad(Array.isArray(res.data) ? res.data : []));
        api.get("/por-anio").then(res => setPorAnio(Array.isArray(res.data) ? res.data : []));
        api.get("/resumen-global").then(res => setResumenGlobal(res.data || {}));
        api.get("/clasificacion-por-tipo-solicitud", { params })
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : [];
                setClasificacionPorTipo(data);
            })
            .catch(err => {
                console.error("Error cargando clasificación por tipo:", err);
                setClasificacionPorTipo([]);
            });
    };
    useEffect(() => {
        fetchDatos();

        // Llamar API de promedio
        api.get("/promedio-tiempo-respuesta")
            .then((res) => {
                setPromedioRespuesta(res.data.promedio_horas_decimal);
                setPromedioRespuestaFormato(res.data.formato);
            })
            .catch((err) => console.error("Error cargando promedio:", err));

    }, [sedesSeleccionadas, mesesSeleccionados, atributosCalidadSeleccionados, anioSeleccionado, tiposSolicitudSeleccionados, serviciosSeleccionados]);

    // Ejecutar al montar el componente y al cambiar filtros
    useEffect(() => {
        fetchDatos();
    }, [sedesSeleccionadas, mesesSeleccionados, atributosCalidadSeleccionados, anioSeleccionado, epsSeleccionadas, tiposSolicitudSeleccionados, serviciosSeleccionados, clasificacionesSeleccionadas]);

    // Resumen filtrado
    const fetchResumenFiltrado = () => {
        api.get("/resumen-filtrado", {
            params: {
                sede: sedesSeleccionadas.length > 0 ? sedesSeleccionadas : undefined,
                mes: mesesSeleccionados || undefined,
                atributo_calidad: atributosCalidadSeleccionados.length > 0 ? atributosCalidadSeleccionados : undefined,
                anio: anioSeleccionado || undefined,
                eps: epsSeleccionadas.length > 0 ? epsSeleccionadas : undefined,
                tipo_solicitud: tiposSolicitudSeleccionados.length
                    ? tiposSolicitudSeleccionados.map(t => t.value || t)
                    : undefined,
                servicio_prestado: serviciosSeleccionados.length
                    ? serviciosSeleccionados.map(s => s.value || s)
                    : undefined,
                clasificacion: clasificacionesSeleccionadas,
            },
        })
            .then((res) => setResumenFiltrado(res.data || {}))
            .catch(() => setResumenFiltrado({}));
    };

    useEffect(() => {
        fetchResumenFiltrado();
    }, [sedesSeleccionadas, mesesSeleccionados, atributosCalidadSeleccionados, anioSeleccionado, epsSeleccionadas, tiposSolicitudSeleccionados, serviciosSeleccionados, clasificacionesSeleccionadas]);

    // useEffect ya dentro de DashboardPqrs
    useEffect(() => {
        const params = {
            anio: anioSeleccionado || undefined,
            sede: sedesSeleccionadas.length > 0 ? sedesSeleccionadas : undefined,
            mes: mesesSeleccionados.length > 0 ? mesesSeleccionados : undefined,
            atributo_calidad: atributosCalidadSeleccionados.length > 0 ? atributosCalidadSeleccionados : undefined,
            eps: epsSeleccionadas.length > 0 ? epsSeleccionadas : undefined,
            tipo_solicitud: tiposSolicitudSeleccionados.length
                ? tiposSolicitudSeleccionados.map(t => t.value || t)
                : undefined,
            servicio_prestado: serviciosSeleccionados.length
                ? serviciosSeleccionados.map(s => s.value || s)
                : undefined,
            clasificacion: clasificacionesSeleccionadas,
        };

        api
            .get("/por-estado-respuesta", { params })
            .then((res) => setPorEstadoRespuesta(res.data || []))
            .catch((err) => {
                console.error("Error cargando estado respuesta:", err);
                setPorEstadoRespuesta([]);
            });
    }, [
        anioSeleccionado,
        JSON.stringify(sedesSeleccionadas),
        JSON.stringify(mesesSeleccionados),
        JSON.stringify(atributosCalidadSeleccionados),
        JSON.stringify(epsSeleccionadas),
        JSON.stringify(tiposSolicitudSeleccionados),
        JSON.stringify(serviciosSeleccionados),
        JSON.stringify(clasificacionesSeleccionadas),
    ]);

    useEffect(() => {
        const params = {
            anio: anioSeleccionado || undefined,
            sede: sedesSeleccionadas.length > 0 ? sedesSeleccionadas : undefined,
            mes: mesesSeleccionados.length > 0 ? mesesSeleccionados : undefined,
            atributo_calidad: atributosCalidadSeleccionados.length > 0 ? atributosCalidadSeleccionados : undefined,
            eps: epsSeleccionadas.length > 0 ? epsSeleccionadas : undefined,
            tipo_solicitud: tiposSolicitudSeleccionados.length
                ? tiposSolicitudSeleccionados.map(t => t.value || t)
                : undefined,
            servicio_prestado: serviciosSeleccionados.length
                ? serviciosSeleccionados.map(s => s.value || s)
                : undefined,
            clasificacion: clasificacionesSeleccionadas,
        };

        api.get("/por-servicio-prestado", { params })
            .then(res => setPorServicio(res.data.data || []))
            .catch(err => console.error(err));
    }, [
        anioSeleccionado,
        JSON.stringify(sedesSeleccionadas || []),
        JSON.stringify(mesesSeleccionados || []),
        JSON.stringify(atributosCalidadSeleccionados || []),
        JSON.stringify(epsSeleccionadas || []),
        JSON.stringify(tiposSolicitudSeleccionados || []),
        JSON.stringify(serviciosSeleccionados || []),
        JSON.stringify(clasificacionesSeleccionadas),
    ]);

    useEffect(() => {
        const params = {
            anio: anioSeleccionado,
            sede: sedesSeleccionadas.length ? sedesSeleccionadas : undefined,
            mes: mesesSeleccionados.length ? mesesSeleccionados : undefined,
            eps: epsSeleccionadas.length ? epsSeleccionadas : undefined,
            atributo_calidad: atributosCalidadSeleccionados.length ? atributosCalidadSeleccionados : undefined,
            estado_tiempo: undefined,
            tipo_solicitud: tiposSolicitudSeleccionados.length ? tiposSolicitudSeleccionados.map(t => t.value || t) : undefined,
            servicio_prestado: serviciosSeleccionados.length
                ? serviciosSeleccionados.map(s => s.value || s)
                : undefined,
            clasificacion: clasificacionesSeleccionadas,
        };

        api.get("/pqrs/por-sede-tipo-solicitud", { params })
            .then((res) => setPorSedeTipo(res.data || []))
            .catch(() => setPorSedeTipo([]));
    }, [anioSeleccionado, mesesSeleccionados, sedesSeleccionadas, epsSeleccionadas, atributosCalidadSeleccionados, tiposSolicitudSeleccionados, serviciosSeleccionados, clasificacionesSeleccionadas]);


    useEffect(() => {
        const params = {
            anio: anioSeleccionado,
            sede: sedesSeleccionadas.length ? sedesSeleccionadas : undefined,
            mes: mesesSeleccionados.length ? mesesSeleccionados : undefined,
            eps: epsSeleccionadas.length ? epsSeleccionadas : undefined,
            atributo_calidad: atributosCalidadSeleccionados.length ? atributosCalidadSeleccionados : undefined,
            tipo_solicitud: tiposSolicitudSeleccionados.length
                ? tiposSolicitudSeleccionados.map(t => t.value || t)
                : undefined,
            servicio_prestado: serviciosSeleccionados.length
                ? serviciosSeleccionados.map(s => s.value || s)
                : undefined,
            clasificacion: clasificacionesSeleccionadas,
        };

        api.get("/clasificacion-por-tipo-solicitud", { params })
            .then((res) => setClasificacionPorTipo(res.data || []))
            .catch(() => setClasificacionPorTipo([]));
    }, [
        anioSeleccionado,
        JSON.stringify(sedesSeleccionadas),
        JSON.stringify(mesesSeleccionados),
        JSON.stringify(atributosCalidadSeleccionados),
        JSON.stringify(epsSeleccionadas),
        JSON.stringify(tiposSolicitudSeleccionados),
        JSON.stringify(serviciosSeleccionados),
        JSON.stringify(clasificacionesSeleccionadas),
    ]);

    const tiposSolicitud = [
        ...new Set(
            clasificacionPorTipo.flatMap(item =>
                Object.keys(item).filter(key => key !== "clasificacion")
            )
        )
    ];

    useEffect(() => {
        api.get("/clasificaciones") // ajusta según tu endpoint real
            .then((res) => {
                // Si tu API devuelve [{id: 1, nombre: "Agendamiento"}, ...]
                const opciones = res.data.map(c => ({
                    label: c.nombre,
                    value: c.nombre, // o c.id si filtras por ID en backend
                }));
                setClasificaciones(opciones);
            })
            .catch((err) => console.error("Error cargando clasificaciones", err));
    }, []);

    return (
        <>
            <Navbar />
            <div className="atributo-calidad">
                <button className="boton-dash-interno">
                    <NavLink to="/dash-interno" style={{ textDecoration: "none", color: "inherit" }}>
                        Ir a Dash Interno
                    </NavLink>
                </button>
            </div>
            <div className="container-dashboard">
                {/* Tarjetas resumen */}
                <div className="resumen-container">
                    <div className="card-dash total">
                        <h2>{resumenFiltrado.total ?? 0}</h2>
                        <p>Total PQRS</p>
                    </div>
                    <div className="card-dash pendientes">
                        <h2>{resumenFiltrado.pendientes ?? 0}</h2>
                        <p>PQRS Pendientes</p>
                    </div>
                    <div className="card-dash resueltas">
                        <h2>{resumenFiltrado.resueltas ?? 0}</h2>
                        <p>PQRS Resueltas</p>
                    </div>
                    <div className="card-dash promedio-respuesta">
                        <h2>{promedioRespuestaFormato}</h2>
                        <p>Promedio de Respuesta por PQRS</p>
                    </div>
                    {/* <div className="card-dash porcentaje-quejas">
                        <h2>5555 pacientes atendidos septiembre</h2>
                        <p>Total FPQRS 336</p>
                        <p>15.42% Quejas (52)</p>
                    </div> */}
                </div>

                {/* Filtros */}
                <div className="datos">
                    <div className="atributo-calidad">
                        <div className="anio">
                            <select value={anioSeleccionado} onChange={(e) => setAnioSeleccionado(e.target.value)}>
                                <option value="">Seleccione un año</option>
                                {porAnio.map((a) => (
                                    <option key={a.anio} value={a.anio}>{a.anio}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="servicio-prestado-dashboard">
                        <DropDownMultiSelect
                            options={serviciosOptions}
                            selected={serviciosSeleccionados}
                            setSelected={setServiciosSeleccionados}
                            placeholder="Seleccione servicio(s) prestado"
                            searchable={true}
                        />
                    </div>

                    <div className="tipo-solicitud">
                        <DropDownMultiSelect
                            options={tiposSolicitudOptions}
                            selected={tiposSolicitudSeleccionados}
                            setSelected={setTiposSolicitudSeleccionados}
                            placeholder="Seleccione tipo de solicitud"
                            searchable={true}
                        />
                    </div>

                    <div className="atributo-calidad">
                        <DropDownMultiSelect
                            options={epsOptions}
                            selected={epsSeleccionadas}
                            setSelected={setEpsSeleccionadas}
                            placeholder="Seleccione EPS"
                            searchable={true}
                        />
                    </div>

                    <div className="sedes-dashboard">
                        <DropDownMultiSelect
                            options={sedes}
                            selected={sedesSeleccionadas}
                            setSelected={setSedesSeleccionadas}
                            placeholder="Seleccione sede(s)"
                            searchable={true}
                        />
                    </div>
                    <div className="mes">
                        <DropDownMultiSelect
                            options={meses}
                            selected={mesesSeleccionados}
                            setSelected={setMesesSeleccionados}
                            placeholder="Seleccione mes(es)"
                            searchable={true}
                        />
                    </div>
                    {/* <div className="dia">
                        <select value={diaSeleccionado} onChange={(e) => setDiaSeleccionado(e.target.value)}>
                            <option value="">-- Seleccione un día --</option>
                            {Array.from({ length: 31 }, (_, index) => (
                                <option key={index + 1} value={index + 1}>{index + 1}</option>
                            ))}
                        </select>
                    </div> */}
                    <div className="atributo-calidad">
                        <DropDownMultiSelect
                            options={atributosCalidad}
                            selected={atributosCalidadSeleccionados}
                            setSelected={setAtributosCalidadSeleccionados}
                            placeholder="Seleccione atributo(s)"
                            searchable={true}
                        />
                    </div>
                    <div className="clasificacion">
                        <DropDownMultiSelect
                            options={clasificaciones}
                            selected={clasificacionesSeleccionadas}
                            setSelected={setClasificacionesSeleccionadas}
                            placeholder="Seleccione clasificación(es)"
                            searchable={true}
                        />
                    </div>
                </div>

                {/* <div className="container-programa">
                    <div className="card-filtro hdt">
                        <h2>
                            {porServicio.find(s => s.servicio_prestado === "Hidroterapia")?.cantidad ?? 0}
                        </h2>
                        <h2>
                            Hidroterapia (
                            {porServicio.find(s => s.servicio_prestado === "Hidroterapia")?.porcentaje ?? 0}%)
                        </h2>
                    </div>

                    <div className="card-filtro rbh">
                        <h2>
                            {porServicio.find(s => s.servicio_prestado === "Programa de Rehabilitación")?.cantidad ?? 0}
                        </h2>
                        <h2>
                            Rehabilitación (
                            {porServicio.find(s => s.servicio_prestado === "Programa de Rehabilitación")?.porcentaje ?? 0}
                            %)
                        </h2>
                    </div>

                    <div className="card-filtro rbh">
                        <h2><strong> SECCION EN DESARROLLO</strong></h2>
                        <h2>% Quejas por pacientes atendidos</h2>
                    </div>
                </div> */}
                <div className="charts-container2">
                    <div className="chart-card">
                        <h3>PQRS por tipo de solicitud</h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={porTipo}
                                    dataKey="cantidad"
                                    nameKey="tipo_solicitud"
                                    outerRadius={100}
                                    label
                                >
                                    {porTipo.map((entry, index) => {
                                        const key = (entry.tipo_solicitud || "").trim();
                                        const fill = tipoColor[key] ?? defaultColors[index % defaultColors.length];
                                        return <Cell key={`cell-${index}`} fill={fill} />;
                                    })}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="custom-legend">
                            {porTipo.map((entry, index) => {
                                const key = (entry.tipo_solicitud || "").trim();
                                const color = tipoColor[key] ?? defaultColors[index % defaultColors.length];
                                return (
                                    <div key={index} className="legend-item">
                                        <span className="legend-color" style={{ backgroundColor: color }}></span>
                                        <span className="legend-text">{entry.tipo_solicitud}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="chart-card">
                        <h3>PQRS por EPS</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={porEps}
                                layout="vertical"
                                margin={{ top: 10, right: 10, left: -57, bottom: 10 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                {/* Cantidad en el eje X */}
                                <XAxis type="number" />
                                {/* EPS en el eje Y */}
                                <YAxis dataKey="eps" type="category" width={150} />
                                <Tooltip />
                                <Bar dataKey="cantidad" fill="#6366f1" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>


                    <div className="chart-card">
                        <h3>PQRS por Atributo de Calidad</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={porAtributoCalidad} margin={{ top: 10, right: 10, left: -30, bottom: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="atributo_calidad"
                                    angle={-35}         // 🔄 Rotación en grados
                                    textAnchor="end"    // 📍 Alinea el texto al final
                                    interval={0}        // 🔒 Muestra todos los ticks
                                />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="cantidad" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gráficas */}
                <div className="charts-container">
                    {/* <div className="filtro-datos">
                        <div className="card-filtro total">
                            <h2>{resumenFiltrado.total ?? 0}</h2>
                            <p>Total PQRS</p>
                        </div>
                        <div className="card-filtro pendientes">
                            <h2>{resumenFiltrado.pendientes ?? 0}</h2>
                            <p>PQRS Pendientes</p>
                        </div>
                        <div className="card-filtro resueltas">
                            <h2>{resumenFiltrado.resueltas ?? 0}</h2>
                            <p>PQRS Resueltas</p>
                        </div>
                    </div> */}
                    <div className="chart-card">
                        <h3>PQRS por estado de respuesta</h3>
                        {porEstadoRespuesta.length > 0 ? (
                            <ResponsiveContainer width="100%" height={380}>
                                <BarChart
                                    data={porEstadoRespuesta.filter(item => item.cantidad > 0)}
                                    layout="vertical"
                                    margin={{ top: 10, right: 10, left: -15, bottom: -10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis type="category" dataKey="estado_tiempo" width={140} />
                                    <Tooltip />
                                    <Bar dataKey="cantidad" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p>No hay datos con los filtros seleccionados</p>
                        )}
                    </div>

                    <div className="chart-card">
                        <h3>PQRS por mes</h3>
                        <ResponsiveContainer width="100%" height={380}>
                            <BarChart
                                data={porMes.filter(m => m.cantidad > 0)}
                                margin={{ top: 20, right: 10, left: -30, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="mes"
                                    tickFormatter={(mes) =>
                                        meses.find((m) => m.value === mes)?.label || mes
                                    }
                                    angle={-35}
                                    textAnchor="end"
                                    interval={0}
                                />
                                <YAxis />
                                <Tooltip
                                    labelFormatter={(mes) =>
                                        meses.find((m) => m.value === mes)?.label || mes
                                    }
                                />
                                <Bar dataKey="cantidad" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="chart-card">
                        <h3>PQRS por Servicio Prestado</h3>
                        {porServicio.length > 0 ? (
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart margin={{ top: 20, right: 40, bottom: -30, left: 180 }}>
                                    <Pie
                                        data={porServicio}
                                        dataKey="cantidad"
                                        nameKey="servicio_prestado"
                                        cx="50%"
                                        cy="60%"
                                        outerRadius={100}
                                        label={({ value, percent }) =>
                                            ` ${value} (${(percent * 100).toFixed(1)}%)`
                                        }
                                    >
                                        {porServicio.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={[
                                                    "#8884d8",
                                                    "#82ca9d",
                                                    "#e6b822ff",
                                                    "#ff8042",
                                                    "#0564b6ff",
                                                    "#05775eff",
                                                ][index % 6]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name, props) => [
                                            `${value} (${(props.payload.porcentaje || (props.percent * 100)).toFixed(1)}%)`,
                                            props.payload.servicio_prestado,
                                        ]}
                                    />
                                    <Legend
                                        layout="vertical"
                                        align="right"
                                        verticalAlign="bottom"
                                        wrapperStyle={{ top: 10, fontSize: 15 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                        ) : (
                            <p>No hay datos con los filtros seleccionados</p>
                        )}
                    </div>
                    {/* <div className="chart-card">
                        <h3>PQRS por año</h3>
                        <ResponsiveContainer width="100%" height={270}>
                            <LineChart data={porAnio}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="anio" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="cantidad" stroke="#10b981" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div> */}
                </div>

                <div className="charts-container3">
                    <div className="chart-card">
                        <h3>PQRS por sede y tipo de solicitud</h3>
                        {porSedeTipo.length > 0 ? (
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart
                                    data={porSedeTipo}
                                    margin={{ top: 20, right: 30, left: 5, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="sede"
                                        angle={-45}
                                        textAnchor="end"
                                        interval={0}
                                        height={80}
                                        fontSize={10}
                                        tickFormatter={acortarNombreSede}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />

                                    {/* Ajusta estos nombres según tu backend */}
                                    <Line type="monotone" dataKey="Queja" stroke="#e9ec1e" strokeWidth={2} />
                                    <Line type="monotone" dataKey="Reclamo" stroke="#ef4444" strokeWidth={2} />
                                    <Line type="monotone" dataKey="Peticion" stroke="#2325a7ff" strokeWidth={2} />
                                    <Line type="monotone" dataKey="Solicitud" stroke="#10b981" strokeWidth={2} />
                                    <Line type="monotone" dataKey="Tutela" stroke="#f59e0b" strokeWidth={2} />
                                    {/* <Line type="monotone" dataKey="Derecho de petición" stroke="#b40c90ff" strokeWidth={2} /> */}
                                    <Line type="monotone" dataKey="Felicitacion" stroke="#3b82f6" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p>No hay datos con los filtros seleccionados</p>
                        )}
                    </div>

                    <div className="chart-card">
                        <h3>PQRS por Clasificación</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                data={clasificacionPorTipo}
                                margin={{ top: 20, right: 10, left: -20, bottom: 10 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="clasificacion"
                                    angle={-30}
                                    textAnchor="end"
                                    interval={0}
                                    height={80}
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={(value) => clasificacionesAbreviadas[value] || value}
                                />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Legend />

                                <Bar dataKey="Queja" stackId="a" fill="#e9ec1e" />
                                <Bar dataKey="Reclamo" stackId="a" fill="#ef4444" />
                                <Bar dataKey="Peticion" stackId="a" fill="#2325a7ff" />
                                <Bar dataKey="Solicitud" stackId="a" fill="#10b981" />
                                <Bar dataKey="Tutela" stackId="a" fill="#f59e0b" />
                                <Bar dataKey="Felicitacion" stackId="a" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="charts-container4">
                    <div className="chart-card">
                        <h3>{totalPacientes} Pacientes atendidos en Septiembre</h3>
                        <h2>Total FPQRS: 336</h2>

                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={pqrsConPorcentaje}
                                    dataKey="cantidad"
                                    nameKey="tipo"
                                    outerRadius={100}
                                    label={({ payload }) => `${payload.porcentaje}%`}
                                >
                                    {pqrsConPorcentaje.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={[
                                                "#3b82f6",
                                                "#2325a7ff",
                                                "#e9ec1e",
                                                "#ef4444",
                                                "#f59e0b",
                                                "#10b981",
                                            ][index % 6]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, name, props) =>
                                        `${value} (${props.payload.porcentaje}%)`
                                    }
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="custom-legend">
                            {pqrsConPorcentaje.map((entry, index) => (
                                <div key={index} className="legend-item">
                                    <span
                                        className="legend-color"
                                        style={{
                                            backgroundColor: [
                                                "#3b82f6",
                                                "#2325a7ff",
                                                "#e9ec1e",
                                                "#ef4444",
                                                "#f59e0b",
                                                "#10b981",
                                            ][index % 6],
                                        }}
                                    ></span>
                                    <span className="legend-text">
                                        {entry.tipo}: {entry.cantidad} ({entry.porcentaje}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <Version />
        </>
    );
}










































// import { useEffect, useState } from "react";
// import "./styles/Dashboard.css";
// import {
//     BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
//     LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
//     Legend
// } from "recharts";
// import api from "../api/api";
// import Navbar from "../components/Navbar/Navbar";
// import { Version } from "../components/Footer/Version";
// import DropDownMultiSelect from "./components/DropDownMultiselect";
// import { NavLink } from "react-router-dom";

// export default function DashboardPqrs() {
//     // Estados de datos
//     const [porMes, setPorMes] = useState([]);
//     const [porAnio, setPorAnio] = useState([]);
//     const [porTipo, setPorTipo] = useState([]);
//     const [porEps, setPorEps] = useState([]);
//     const [porAtributoCalidad, setPorAtributoCalidad] = useState([]);
//     const [resumenGlobal, setResumenGlobal] = useState({});
//     const [resumenFiltrado, setResumenFiltrado] = useState({});
//     const [porEstadoRespuesta, setPorEstadoRespuesta] = useState([]);
//     const [promedioRespuesta, setPromedioRespuesta] = useState(null);
//     const [promedioRespuestaFormato, setPromedioRespuestaFormato] = useState(null);
//     const [epsSeleccionadas, setEpsSeleccionadas] = useState([]);
//     const [porSedeTipo, setPorSedeTipo] = useState([]);
//     const [clasificaciones, setClasificaciones] = useState([]);
//     const [clasificacionesSeleccionadas, setClasificacionesSeleccionadas] = useState([]);



//     // Estados de filtros
//     const [mesesSeleccionados, setMesesSeleccionados] = useState([]);
//     const [atributosCalidadSeleccionados, setAtributosCalidadSeleccionados] = useState([]);
//     const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
//     const [sedesSeleccionadas, setSedesSeleccionadas] = useState([]);
//     const [tiposSolicitudSeleccionados, setTiposSolicitudSeleccionados] = useState([]);
//     const [porServicio, setPorServicio] = useState([]);
//     const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
//     const [clasificacionPorTipo, setClasificacionPorTipo] = useState([]);

//     const totalPacientes = 5343;
//     const pacientesSeptiembre = [
//         { tipo: "Felicitaciones", cantidad: 4 },
//         { tipo: "Peticiones", cantidad: 95 },
//         { tipo: "Quejas", cantidad: 52 },
//         { tipo: "Reclamos", cantidad: 30 },
//         { tipo: "Tutelas", cantidad: 2 },
//         { tipo: "Solicitudes", cantidad: 152 },
//     ];
//     const pqrsConPorcentaje = pacientesSeptiembre.map((item) => ({
//         ...item,
//         porcentaje: ((item.cantidad / totalPacientes) * 100).toFixed(2),
//     }));


//     // Opciones
//     const sedes = [
//         { value: "Bogota-Norte", label: "Bogota-Norte" },
//         { value: "Bogota-Centro", label: "Bogota-Centro" },
//         { value: "Bogota-Sur-Occidente-Rehabilitación", label: "Bogota-Sur-Occidente-Rehabilitación" },
//         { value: "Bogota-Sur-Occidente-Hidroterapia", label: "Bogota-Sur-Occidente-Hidroterapia" },
//         { value: "Ibague", label: "Ibague" },
//         { value: "Chía", label: "Chía" },
//         { value: "Florencia", label: "Florencia" },
//         { value: "Cedritos-Divertido", label: "Cedritos-Divertido" },
//     ];
//     // si tus sedes vienen en formato { value, label }:
//     const sedesLabels = sedes.map((s) => s.label);

//     const clasificacionesAbreviadas = {
//         "Agendamiento": "Agendamiento",
//         "Atención de profesional en salud": "Profesional en salud",
//         "Atención de personal administrativo": "Personal administrativo",
//         "Atención en línea de frente (recepción)": "Línea de frente (recepción)",
//         "Atención por el call center": "Call center",
//         "Proceso terapéutico": "Proceso terapéutico",
//         "Información y comunicación": "Inf y comunicación",
//         "Infraestructura": "Infraestructura",
//         "Orden y aseo": "Orden y aseo",
//         "Herramientas digitales": "Herramientas digitales",
//         "Solicitudes de tesorería": "Solicitudes de tesorería",
//         "Envío de historia clínica o informes finales": "Envío HC o informes finales",
//         "Política de multas por inasistencia": "Multas por inasistencia",
//         "Reprogramación de citas": "Reprog. de citas",
//     }

//     const meses = [
//         { value: 1, label: "Enero" },
//         { value: 2, label: "Febrero" },
//         { value: 3, label: "Marzo" },
//         { value: 4, label: "Abril" },
//         { value: 5, label: "Mayo" },
//         { value: 6, label: "Junio" },
//         { value: 7, label: "Julio" },
//         { value: 8, label: "Agosto" },
//         { value: 9, label: "Septiembre" },
//         { value: 10, label: "Octubre" },
//         { value: 11, label: "Noviembre" },
//         { value: 12, label: "Diciembre" },
//     ];

//     const atributosCalidad = [
//         { value: "Accesibilidad", label: "Accesibilidad" },
//         { value: "Continuidad", label: "Continuidad" },
//         { value: "Efectividad", label: "Efectividad" },
//         { value: "Integralidad", label: "Integralidad" },
//         { value: "Oportunidad", label: "Oportunidad" },
//         { value: "Pertinencia", label: "Pertinencia" },
//         { value: "Seguridad", label: "Seguridad" },
//     ];

//     const epsOptions = [
//         "Compensar",
//         "Fomag",
//         "Famisanar",
//         "Nueva Eps",
//         "Sanitas",
//         "Sura",
//         "Aliansalud",
//         "Asmet Salud",
//         "Seguros Bolivar",
//         "Cafam",
//         "Colmédica",
//         "Positiva",
//         "Particular",
//     ].sort().map(eps => ({ value: eps, label: eps }));

//     const tiposSolicitudOptions = [
//         { value: "Queja", label: "Queja" },
//         { value: "Reclamo", label: "Reclamo" },
//         { value: "Peticion", label: "Petición" },
//         { value: "Solicitud", label: "Solicitud" },
//         { value: "Tutela", label: "Tutela" },
//         { value: "Derecho de petición", label: "Derecho de petición" },
//         { value: "Felicitacion", label: "Felicitación" },
//     ];

//     const serviciosOptions = [
//         { label: "Hidroterapia", value: "Hidroterapia" },
//         { label: "Programa de Rehabilitación", value: "Programa de Rehabilitación" },
//         { label: "Neuropediatría", value: "Neuropediatría" },
//         { label: "Psiquiatría", value: "Psiquiatría" },
//         { label: "Fisiatría", value: "Fisiatría" },
//         { label: "Acuamotricidad", value: "Acuamotricidad" },
//         { label: "Natación", value: "Natación" },
//         { label: "Yoga", value: "Yoga" },
//         { label: "Pilates", value: "Pilates" },
//         { label: "Valoración por fisioterapia telemedicina", value: "Valoración por fisioterapia telemedicina" },
//     ];


//     const acortarNombreSede = (nombre) => {
//         if (!nombre || typeof nombre !== 'string') {
//             return nombre;
//         }

//         // Opción 1: Reemplazar palabras largas por abreviaturas
//         let nombreAbreviado = nombre
//             .replace('Bogota-Sur-Occidente-Rehabilitación', 'Bgta-Sur-Occ-RHB.')
//             .replace('Bogota-Sur-Occidente-Hidroterapia', 'Bgta-Sur-Occ-HD.')
//             .replace('Cedritos-Divertido', 'Cedr.Divertido.');

//         return nombreAbreviado;
//     };

//     // Función para cargar todas las gráficas filtradas
//     const fetchDatos = () => {
//         const params = {
//             anio: anioSeleccionado,
//             sede: sedesSeleccionadas.length > 0 ? sedesSeleccionadas : undefined,
//             mes: mesesSeleccionados.length > 0 ? mesesSeleccionados : undefined,
//             atributo_calidad: atributosCalidadSeleccionados.length > 0 ? atributosCalidadSeleccionados : undefined,
//             eps: epsSeleccionadas.length > 0 ? epsSeleccionadas : undefined,
//             tipo_solicitud: tiposSolicitudSeleccionados.length
//                 ? tiposSolicitudSeleccionados.map(t => t.value || t)
//                 : undefined,
//             servicio_prestado: serviciosSeleccionados.length
//                 ? serviciosSeleccionados.map(s => s.value || s)
//                 : undefined,
//         };

//         api.get("/por-mes", { params }).then(res => setPorMes(Array.isArray(res.data) ? res.data : []));
//         api.get("/por-tipo", { params }).then(res => setPorTipo(Array.isArray(res.data) ? res.data : []));
//         api.get("/por-eps", { params }).then(res => setPorEps(Array.isArray(res.data) ? res.data : []));
//         api.get("/por-atributo", { params }).then(res => setPorAtributoCalidad(Array.isArray(res.data) ? res.data : []));
//         api.get("/por-anio").then(res => setPorAnio(Array.isArray(res.data) ? res.data : []));
//         api.get("/resumen-global").then(res => setResumenGlobal(res.data || {}));
//     };
//     useEffect(() => {
//         fetchDatos();

//         // Llamar API de promedio
//         api.get("/promedio-tiempo-respuesta")
//             .then((res) => {
//                 setPromedioRespuesta(res.data.promedio_horas_decimal);
//                 setPromedioRespuestaFormato(res.data.formato);
//             })
//             .catch((err) => console.error("Error cargando promedio:", err));

//     }, [sedesSeleccionadas, mesesSeleccionados, atributosCalidadSeleccionados, anioSeleccionado, tiposSolicitudSeleccionados, serviciosSeleccionados]);

//     // Ejecutar al montar el componente y al cambiar filtros
//     useEffect(() => {
//         fetchDatos();
//     }, [sedesSeleccionadas, mesesSeleccionados, atributosCalidadSeleccionados, anioSeleccionado, epsSeleccionadas, tiposSolicitudSeleccionados, serviciosSeleccionados]);

//     // Resumen filtrado
//     const fetchResumenFiltrado = () => {
//         api.get("/resumen-filtrado", {
//             params: {
//                 sede: sedesSeleccionadas.length > 0 ? sedesSeleccionadas : undefined,
//                 mes: mesesSeleccionados || undefined,
//                 atributo_calidad: atributosCalidadSeleccionados.length > 0 ? atributosCalidadSeleccionados : undefined,
//                 anio: anioSeleccionado || undefined,
//                 eps: epsSeleccionadas.length > 0 ? epsSeleccionadas : undefined,
//                 tipo_solicitud: tiposSolicitudSeleccionados.length
//                     ? tiposSolicitudSeleccionados.map(t => t.value || t)
//                     : undefined,
//                 servicio_prestado: serviciosSeleccionados.length
//                     ? serviciosSeleccionados.map(s => s.value || s)
//                     : undefined,
//             },
//         })
//             .then((res) => setResumenFiltrado(res.data || {}))
//             .catch(() => setResumenFiltrado({}));
//     };

//     useEffect(() => {
//         fetchResumenFiltrado();
//     }, [sedesSeleccionadas, mesesSeleccionados, atributosCalidadSeleccionados, anioSeleccionado, epsSeleccionadas, tiposSolicitudSeleccionados, serviciosSeleccionados]);

//     // useEffect ya dentro de DashboardPqrs
//     useEffect(() => {
//         const params = {
//             anio: anioSeleccionado || undefined,
//             sede: sedesSeleccionadas.length > 0 ? sedesSeleccionadas : undefined,
//             mes: mesesSeleccionados.length > 0 ? mesesSeleccionados : undefined,
//             atributo_calidad: atributosCalidadSeleccionados.length > 0 ? atributosCalidadSeleccionados : undefined,
//             eps: epsSeleccionadas.length > 0 ? epsSeleccionadas : undefined,
//             tipo_solicitud: tiposSolicitudSeleccionados.length
//                 ? tiposSolicitudSeleccionados.map(t => t.value || t)
//                 : undefined,
//             servicio_prestado: serviciosSeleccionados.length
//                 ? serviciosSeleccionados.map(s => s.value || s)
//                 : undefined,
//         };

//         api
//             .get("/por-estado-respuesta", { params })
//             .then((res) => setPorEstadoRespuesta(res.data || []))
//             .catch((err) => {
//                 console.error("Error cargando estado respuesta:", err);
//                 setPorEstadoRespuesta([]);
//             });
//     }, [
//         anioSeleccionado,
//         JSON.stringify(sedesSeleccionadas),
//         JSON.stringify(mesesSeleccionados),
//         JSON.stringify(atributosCalidadSeleccionados),
//         JSON.stringify(epsSeleccionadas),
//         JSON.stringify(tiposSolicitudSeleccionados),
//         JSON.stringify(serviciosSeleccionados),
//     ]);

//     useEffect(() => {
//         const params = {
//             anio: anioSeleccionado || undefined,
//             sede: sedesSeleccionadas.length > 0 ? sedesSeleccionadas : undefined,
//             mes: mesesSeleccionados.length > 0 ? mesesSeleccionados : undefined,
//             atributo_calidad: atributosCalidadSeleccionados.length > 0 ? atributosCalidadSeleccionados : undefined,
//             eps: epsSeleccionadas.length > 0 ? epsSeleccionadas : undefined,
//             tipo_solicitud: tiposSolicitudSeleccionados.length
//                 ? tiposSolicitudSeleccionados.map(t => t.value || t)
//                 : undefined,
//             servicio_prestado: serviciosSeleccionados.length
//                 ? serviciosSeleccionados.map(s => s.value || s)
//                 : undefined,
//         };

//         api.get("/por-servicio-prestado", { params })
//             .then(res => setPorServicio(res.data.data || []))
//             .catch(err => console.error(err));
//     }, [
//         anioSeleccionado,
//         JSON.stringify(sedesSeleccionadas || []),
//         JSON.stringify(mesesSeleccionados || []),
//         JSON.stringify(atributosCalidadSeleccionados || []),
//         JSON.stringify(epsSeleccionadas || []),
//         JSON.stringify(tiposSolicitudSeleccionados || []),
//         JSON.stringify(serviciosSeleccionados || []),
//     ]);

//     useEffect(() => {
//         const params = {
//             anio: anioSeleccionado,
//             sede: sedesSeleccionadas.length ? sedesSeleccionadas : undefined,
//             mes: mesesSeleccionados.length ? mesesSeleccionados : undefined,
//             eps: epsSeleccionadas.length ? epsSeleccionadas : undefined,
//             atributo_calidad: atributosCalidadSeleccionados.length ? atributosCalidadSeleccionados : undefined,
//             estado_tiempo: undefined,
//             tipo_solicitud: tiposSolicitudSeleccionados.length ? tiposSolicitudSeleccionados.map(t => t.value || t) : undefined,
//             servicio_prestado: serviciosSeleccionados.length
//                 ? serviciosSeleccionados.map(s => s.value || s)
//                 : undefined,
//         };

//         api.get("/pqrs/por-sede-tipo-solicitud", { params })
//             .then((res) => setPorSedeTipo(res.data || []))
//             .catch(() => setPorSedeTipo([]));
//     }, [anioSeleccionado, mesesSeleccionados, sedesSeleccionadas, epsSeleccionadas, atributosCalidadSeleccionados, tiposSolicitudSeleccionados, serviciosSeleccionados,]);


//     useEffect(() => {
//         const params = {
//             anio: anioSeleccionado,
//             sede: sedesSeleccionadas.length ? sedesSeleccionadas : undefined,
//             mes: mesesSeleccionados.length ? mesesSeleccionados : undefined,
//             eps: epsSeleccionadas.length ? epsSeleccionadas : undefined,
//             atributo_calidad: atributosCalidadSeleccionados.length ? atributosCalidadSeleccionados : undefined,
//             tipo_solicitud: tiposSolicitudSeleccionados.length
//                 ? tiposSolicitudSeleccionados.map(t => t.value || t)
//                 : undefined,
//             servicio_prestado: serviciosSeleccionados.length
//                 ? serviciosSeleccionados.map(s => s.value || s)
//                 : undefined,
//         };

//         api.get("/clasificacion-por-tipo-solicitud", { params })
//             .then((res) => setClasificacionPorTipo(res.data || []))
//             .catch(() => setClasificacionPorTipo([]));
//     }, [
//         anioSeleccionado,
//         JSON.stringify(sedesSeleccionadas),
//         JSON.stringify(mesesSeleccionados),
//         JSON.stringify(atributosCalidadSeleccionados),
//         JSON.stringify(epsSeleccionadas),
//         JSON.stringify(tiposSolicitudSeleccionados),
//         JSON.stringify(serviciosSeleccionados),
//     ]);
//     const tiposSolicitud = [
//         ...new Set(
//             clasificacionPorTipo.flatMap(item =>
//                 Object.keys(item).filter(key => key !== "clasificacion")
//             )
//         )
//     ];

//     useEffect(() => {
//         api.get("/clasificaciones") // ajusta según tu endpoint real
//             .then((res) => {
//                 // Si tu API devuelve [{id: 1, nombre: "Agendamiento"}, ...]
//                 const opciones = res.data.map(c => ({
//                     label: c.nombre,
//                     value: c.nombre, // o c.id si filtras por ID en backend
//                 }));
//                 setClasificaciones(opciones);
//             })
//             .catch((err) => console.error("Error cargando clasificaciones", err));
//     }, []);

//     return (
//         <>
//             <Navbar />
//             <div className="atributo-calidad">
//                 <button className="boton-dash-interno">
//                     <NavLink to="/dash-interno" style={{ textDecoration: "none", color: "inherit" }}>
//                         Ir a Dash Interno
//                     </NavLink>
//                 </button>
//             </div>
//             <div className="container-dashboard">
//                 {/* Tarjetas resumen */}
//                 <div className="resumen-container">
//                     <div className="card-dash total">
//                         <h2>{resumenFiltrado.total ?? 0}</h2>
//                         <p>Total PQRS</p>
//                     </div>
//                     <div className="card-dash pendientes">
//                         <h2>{resumenFiltrado.pendientes ?? 0}</h2>
//                         <p>PQRS Pendientes</p>
//                     </div>
//                     <div className="card-dash resueltas">
//                         <h2>{resumenFiltrado.resueltas ?? 0}</h2>
//                         <p>PQRS Resueltas</p>
//                     </div>
//                     <div className="card-dash promedio-respuesta">
//                         <h2>{promedioRespuestaFormato}</h2>
//                         <p>Promedio de Respuesta por PQRS</p>
//                     </div>
//                     {/* <div className="card-dash porcentaje-quejas">
//                         <h2>5555 pacientes atendidos septiembre</h2>
//                         <p>Total FPQRS 336</p>
//                         <p>15.42% Quejas (52)</p>
//                     </div> */}
//                 </div>

//                 {/* Filtros */}
//                 <div className="datos">
//                     <div className="atributo-calidad">
//                         <div className="anio">
//                             <select value={anioSeleccionado} onChange={(e) => setAnioSeleccionado(e.target.value)}>
//                                 <option value="">Seleccione un año</option>
//                                 {porAnio.map((a) => (
//                                     <option key={a.anio} value={a.anio}>{a.anio}</option>
//                                 ))}
//                             </select>
//                         </div>
//                     </div>
//                     <div className="servicio-prestado-dashboard">
//                         <DropDownMultiSelect
//                             options={serviciosOptions}
//                             selected={serviciosSeleccionados}
//                             setSelected={setServiciosSeleccionados}
//                             placeholder="Seleccione servicio(s) prestado"
//                             searchable={true}
//                         />
//                     </div>

//                     <div className="tipo-solicitud">
//                         <DropDownMultiSelect
//                             options={tiposSolicitudOptions}
//                             selected={tiposSolicitudSeleccionados}
//                             setSelected={setTiposSolicitudSeleccionados}
//                             placeholder="Seleccione tipo de solicitud"
//                             searchable={true}
//                         />
//                     </div>

//                     <div className="atributo-calidad">
//                         <DropDownMultiSelect
//                             options={epsOptions}
//                             selected={epsSeleccionadas}
//                             setSelected={setEpsSeleccionadas}
//                             placeholder="Seleccione EPS"
//                             searchable={true}
//                         />
//                     </div>

//                     <div className="sedes-dashboard">
//                         <DropDownMultiSelect
//                             options={sedes}
//                             selected={sedesSeleccionadas}
//                             setSelected={setSedesSeleccionadas}
//                             placeholder="Seleccione sede(s)"
//                             searchable={true}
//                         />
//                     </div>
//                     <div className="mes">
//                         <DropDownMultiSelect
//                             options={meses}
//                             selected={mesesSeleccionados}
//                             setSelected={setMesesSeleccionados}
//                             placeholder="Seleccione mes(es)"
//                             searchable={true}
//                         />
//                     </div>
//                     {/* <div className="dia">
//                         <select value={diaSeleccionado} onChange={(e) => setDiaSeleccionado(e.target.value)}>
//                             <option value="">-- Seleccione un día --</option>
//                             {Array.from({ length: 31 }, (_, index) => (
//                                 <option key={index + 1} value={index + 1}>{index + 1}</option>
//                             ))}
//                         </select>
//                     </div> */}
//                     <div className="atributo-calidad">
//                         <DropDownMultiSelect
//                             options={atributosCalidad}
//                             selected={atributosCalidadSeleccionados}
//                             setSelected={setAtributosCalidadSeleccionados}
//                             placeholder="Seleccione atributo(s)"
//                             searchable={true}
//                         />
//                     </div>
//                     <div className="clasificacion">
//                         <DropDownMultiSelect
//                             options={clasificaciones} // lista con las clasificaciones disponibles
//                             selected={clasificacionesSeleccionadas}
//                             setSelected={setClasificacionesSeleccionadas}
//                             placeholder="Seleccione clasificación(es)"
//                             searchable={true}
//                         />
//                     </div>
//                 </div>

//                 {/* <div className="container-programa">
//                     <div className="card-filtro hdt">
//                         <h2>
//                             {porServicio.find(s => s.servicio_prestado === "Hidroterapia")?.cantidad ?? 0}
//                         </h2>
//                         <h2>
//                             Hidroterapia (
//                             {porServicio.find(s => s.servicio_prestado === "Hidroterapia")?.porcentaje ?? 0}%)
//                         </h2>
//                     </div>

//                     <div className="card-filtro rbh">
//                         <h2>
//                             {porServicio.find(s => s.servicio_prestado === "Programa de Rehabilitación")?.cantidad ?? 0}
//                         </h2>
//                         <h2>
//                             Rehabilitación (
//                             {porServicio.find(s => s.servicio_prestado === "Programa de Rehabilitación")?.porcentaje ?? 0}
//                             %)
//                         </h2>
//                     </div>

//                     <div className="card-filtro rbh">
//                         <h2><strong> SECCION EN DESARROLLO</strong></h2>
//                         <h2>% Quejas por pacientes atendidos</h2>
//                     </div>
//                 </div> */}
//                 <div className="charts-container2">
//                     <div className="chart-card">
//                         <h3>PQRS por tipo de solicitud</h3>
//                         <ResponsiveContainer width="100%" height={260}>
//                             <PieChart>
//                                 <Pie
//                                     data={porTipo}
//                                     dataKey="cantidad"
//                                     nameKey="tipo_solicitud"
//                                     outerRadius={100}
//                                     label
//                                 >
//                                     {porTipo.map((entry, index) => (
//                                         <Cell
//                                             key={`cell-${index}`}
//                                             fill={["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#2325a7ff", "#e9ec1e"][index % 6]}
//                                         />
//                                     ))}
//                                 </Pie>
//                                 <Tooltip />
//                             </PieChart>
//                         </ResponsiveContainer>

//                         <div className="custom-legend">
//                             {porTipo.map((entry, index) => (
//                                 <div key={index} className="legend-item">
//                                     <span
//                                         className="legend-color"
//                                         style={{ backgroundColor: ["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#2325a7ff", "#e9ec1e"][index % 6] }}
//                                     ></span>
//                                     <span className="legend-text">{entry.tipo_solicitud}</span>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     <div className="chart-card">
//                         <h3>PQRS por EPS</h3>
//                         <ResponsiveContainer width="100%" height={300}>
//                             <BarChart
//                                 data={porEps}
//                                 layout="vertical"
//                                 margin={{ top: 10, right: 10, left: -57, bottom: 10 }}
//                             >
//                                 <CartesianGrid strokeDasharray="3 3" />
//                                 {/* Cantidad en el eje X */}
//                                 <XAxis type="number" />
//                                 {/* EPS en el eje Y */}
//                                 <YAxis dataKey="eps" type="category" width={150} />
//                                 <Tooltip />
//                                 <Bar dataKey="cantidad" fill="#6366f1" />
//                             </BarChart>
//                         </ResponsiveContainer>
//                     </div>


//                     <div className="chart-card">
//                         <h3>PQRS por Atributo de Calidad</h3>
//                         <ResponsiveContainer width="100%" height={300}>
//                             <BarChart data={porAtributoCalidad} margin={{ top: 10, right: 10, left: -30, bottom: 30 }}>
//                                 <CartesianGrid strokeDasharray="3 3" />
//                                 <XAxis
//                                     dataKey="atributo_calidad"
//                                     angle={-35}         // 🔄 Rotación en grados
//                                     textAnchor="end"    // 📍 Alinea el texto al final
//                                     interval={0}        // 🔒 Muestra todos los ticks
//                                 />
//                                 <YAxis />
//                                 <Tooltip />
//                                 <Bar dataKey="cantidad" fill="#10b981" />
//                             </BarChart>
//                         </ResponsiveContainer>
//                     </div>
//                 </div>

//                 {/* Gráficas */}
//                 <div className="charts-container">
//                     {/* <div className="filtro-datos">
//                         <div className="card-filtro total">
//                             <h2>{resumenFiltrado.total ?? 0}</h2>
//                             <p>Total PQRS</p>
//                         </div>
//                         <div className="card-filtro pendientes">
//                             <h2>{resumenFiltrado.pendientes ?? 0}</h2>
//                             <p>PQRS Pendientes</p>
//                         </div>
//                         <div className="card-filtro resueltas">
//                             <h2>{resumenFiltrado.resueltas ?? 0}</h2>
//                             <p>PQRS Resueltas</p>
//                         </div>
//                     </div> */}
//                     <div className="chart-card">
//                         <h3>PQRS por estado de respuesta</h3>
//                         {porEstadoRespuesta.length > 0 ? (
//                             <ResponsiveContainer width="100%" height={380}>
//                                 <BarChart
//                                     data={porEstadoRespuesta.filter(item => item.cantidad > 0)}
//                                     layout="vertical"
//                                     margin={{ top: 10, right: 10, left: -15, bottom: -10 }}
//                                 >
//                                     <CartesianGrid strokeDasharray="3 3" />
//                                     <XAxis type="number" />
//                                     <YAxis type="category" dataKey="estado_tiempo" width={140} />
//                                     <Tooltip />
//                                     <Bar dataKey="cantidad" fill="#3b82f6" />
//                                 </BarChart>
//                             </ResponsiveContainer>
//                         ) : (
//                             <p>No hay datos con los filtros seleccionados</p>
//                         )}
//                     </div>

//                     <div className="chart-card">
//                         <h3>PQRS por mes</h3>
//                         <ResponsiveContainer width="100%" height={380}>
//                             <BarChart
//                                 data={porMes.filter(m => m.cantidad > 0)}
//                                 margin={{ top: 20, right: 10, left: -30, bottom: 20 }}
//                             >
//                                 <CartesianGrid strokeDasharray="3 3" />
//                                 <XAxis
//                                     dataKey="mes"
//                                     tickFormatter={(mes) =>
//                                         meses.find((m) => m.value === mes)?.label || mes
//                                     }
//                                     angle={-35}
//                                     textAnchor="end"
//                                     interval={0}
//                                 />
//                                 <YAxis />
//                                 <Tooltip
//                                     labelFormatter={(mes) =>
//                                         meses.find((m) => m.value === mes)?.label || mes
//                                     }
//                                 />
//                                 <Bar dataKey="cantidad" fill="#3b82f6" />
//                             </BarChart>
//                         </ResponsiveContainer>
//                     </div>
//                     <div className="chart-card">
//                         <h3>PQRS por Servicio Prestado</h3>
//                         {porServicio.length > 0 ? (
//                             <ResponsiveContainer width="100%" height={400}>
//                                 <PieChart margin={{ top: 20, right: 40, bottom: -30, left: 180 }}>
//                                     <Pie
//                                         data={porServicio}
//                                         dataKey="cantidad"
//                                         nameKey="servicio_prestado"
//                                         cx="50%"
//                                         cy="60%"
//                                         outerRadius={100}
//                                         label={({ value, percent }) =>
//                                             ` ${value} (${(percent * 100).toFixed(1)}%)`
//                                         }
//                                     >
//                                         {porServicio.map((entry, index) => (
//                                             <Cell
//                                                 key={`cell-${index}`}
//                                                 fill={[
//                                                     "#8884d8",
//                                                     "#82ca9d",
//                                                     "#e6b822ff",
//                                                     "#ff8042",
//                                                     "#0564b6ff",
//                                                     "#05775eff",
//                                                 ][index % 6]}
//                                             />
//                                         ))}
//                                     </Pie>
//                                     <Tooltip
//                                         formatter={(value, name, props) => [
//                                             `${value} (${(props.payload.porcentaje || (props.percent * 100)).toFixed(1)}%)`,
//                                             props.payload.servicio_prestado,
//                                         ]}
//                                     />
//                                     <Legend
//                                         layout="vertical"
//                                         align="right"
//                                         verticalAlign="bottom"
//                                         wrapperStyle={{ top: 10, fontSize: 15 }}
//                                     />
//                                 </PieChart>
//                             </ResponsiveContainer>

//                         ) : (
//                             <p>No hay datos con los filtros seleccionados</p>
//                         )}
//                     </div>
//                     {/* <div className="chart-card">
//                         <h3>PQRS por año</h3>
//                         <ResponsiveContainer width="100%" height={270}>
//                             <LineChart data={porAnio}>
//                                 <CartesianGrid strokeDasharray="3 3" />
//                                 <XAxis dataKey="anio" />
//                                 <YAxis />
//                                 <Tooltip />
//                                 <Line type="monotone" dataKey="cantidad" stroke="#10b981" />
//                             </LineChart>
//                         </ResponsiveContainer>
//                     </div> */}
//                 </div>

//                 <div className="charts-container3">
//                     <div className="chart-card">
//                         <h3>PQRS por sede y tipo de solicitud</h3>
//                         {porSedeTipo.length > 0 ? (
//                             <ResponsiveContainer width="100%" height={400}>
//                                 <LineChart
//                                     data={porSedeTipo}
//                                     margin={{ top: 20, right: 30, left: 5, bottom: 20 }}
//                                 >
//                                     <CartesianGrid strokeDasharray="3 3" />
//                                     <XAxis
//                                         dataKey="sede"
//                                         angle={-45}
//                                         textAnchor="end"
//                                         interval={0}
//                                         height={80}
//                                         fontSize={10}
//                                         tickFormatter={acortarNombreSede}
//                                     />
//                                     <YAxis />
//                                     <Tooltip />
//                                     <Legend />

//                                     {/* Ajusta estos nombres según tu backend */}
//                                     <Line type="monotone" dataKey="Queja" stroke="#e9ec1e" strokeWidth={2} />
//                                     <Line type="monotone" dataKey="Reclamo" stroke="#ef4444" strokeWidth={2} />
//                                     <Line type="monotone" dataKey="Peticion" stroke="#2325a7ff" strokeWidth={2} />
//                                     <Line type="monotone" dataKey="Solicitud" stroke="#10b981" strokeWidth={2} />
//                                     <Line type="monotone" dataKey="Tutela" stroke="#f59e0b" strokeWidth={2} />
//                                     {/* <Line type="monotone" dataKey="Derecho de petición" stroke="#b40c90ff" strokeWidth={2} /> */}
//                                     <Line type="monotone" dataKey="Felicitacion" stroke="#3b82f6" strokeWidth={2} />
//                                 </LineChart>
//                             </ResponsiveContainer>
//                         ) : (
//                             <p>No hay datos con los filtros seleccionados</p>
//                         )}
//                     </div>


//                     <div className="chart-card">
//                         <h3>PQRS por Clasificación</h3>
//                         <ResponsiveContainer width="100%" height={400}>
//                             <BarChart
//                                 data={clasificacionPorTipo}
//                                 margin={{ top: 20, right: 10, left: -20, bottom: 10 }}
//                             >
//                                 <CartesianGrid strokeDasharray="3 3" />
//                                 <XAxis
//                                     dataKey="clasificacion"
//                                     angle={-30}
//                                     textAnchor="end"
//                                     interval={0}
//                                     height={80}
//                                     tick={{ fontSize: 10 }}
//                                     tickFormatter={(value) => clasificacionesAbreviadas[value] || value}
//                                 />
//                                 <YAxis tick={{ fontSize: 10 }} />
//                                 <Tooltip />
//                                 <Legend />

//                                 {/* 🎨 Aquí defines directamente el color para cada tipo */}
//                                 <Bar dataKey="Queja" stackId="a" fill="#e9ec1e" />
//                                 <Bar dataKey="Reclamo" stackId="a" fill="#ef4444" />
//                                 <Bar dataKey="Peticion" stackId="a" fill="#2325a7ff" />
//                                 <Bar dataKey="Solicitud" stackId="a" fill="#10b981" />
//                                 <Bar dataKey="Tutela" stackId="a" fill="#f59e0b" />
//                                 {/* <Bar dataKey="Derecho de petición" stackId="a" fill="#b40c90ff" /> */}
//                                 <Bar dataKey="Felicitacion" stackId="a" fill="#3b82f6" />
//                             </BarChart>
//                         </ResponsiveContainer>
//                     </div>
//                 </div>
//                 <div className="charts-container4">
//                     <div className="chart-card">
//                         <h3>{totalPacientes} Pacientes atendidos en Septiembre</h3>
//                         <h2>Total FPQRS: 336</h2>

//                         <ResponsiveContainer width="100%" height={260}>
//                             <PieChart>
//                                 <Pie
//                                     data={pqrsConPorcentaje}
//                                     dataKey="cantidad"
//                                     nameKey="tipo"
//                                     outerRadius={100}
//                                     label={({ payload }) => `${payload.porcentaje}%`}
//                                 >
//                                     {pqrsConPorcentaje.map((entry, index) => (
//                                         <Cell
//                                             key={`cell-${index}`}
//                                             fill={[
//                                                 "#3b82f6",
//                                                 "#2325a7ff",
//                                                 "#e9ec1e",
//                                                 "#ef4444",
//                                                 "#f59e0b",
//                                                 "#10b981",
//                                             ][index % 6]}
//                                         />
//                                     ))}
//                                 </Pie>
//                                 <Tooltip
//                                     formatter={(value, name, props) =>
//                                         `${value} (${props.payload.porcentaje}%)`
//                                     }
//                                 />
//                             </PieChart>
//                         </ResponsiveContainer>

//                         <div className="custom-legend">
//                             {pqrsConPorcentaje.map((entry, index) => (
//                                 <div key={index} className="legend-item">
//                                     <span
//                                         className="legend-color"
//                                         style={{
//                                             backgroundColor: [
//                                                 "#3b82f6",
//                                                 "#2325a7ff",
//                                                 "#e9ec1e",
//                                                 "#ef4444",
//                                                 "#f59e0b",
//                                                 "#10b981",
//                                             ][index % 6],
//                                         }}
//                                     ></span>
//                                     <span className="legend-text">
//                                         {entry.tipo}: {entry.cantidad} ({entry.porcentaje}%)
//                                     </span>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <Version />
//         </>
//     );
// }
