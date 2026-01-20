import React, { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import api from "../api/api";
import Navbar from "../components/Navbar/Navbar";
import { Version } from "../components/Footer/Version";

export const DashInterno = () => {
    const [usuariosData, setUsuariosData] = useState([]);
    const [tiempoData, setTiempoData] = useState([]);


    // 🔹 Usuarios con 2+ PQRs
    useEffect(() => {
        api.get("/users-varias-pqrs")
            .then((res) => {
                const usuarios = res.data;

                // Transformamos para recharts
                const transformed = usuarios.map((u) => {
                    const entry = {
                        nombre: `${u.nombre} ${u.apellido}`,
                        documento: u.documento_numero,
                    };
                    u.tipos.forEach((t) => {
                        entry[t.tipo_solicitud] = t.cantidad;
                    });
                    return entry;
                });

                setUsuariosData(transformed);
            })
            .catch((err) => console.error(err));
    }, []);

    // 🔹 Tiempo por área
    useEffect(() => {
        api.get("/tiempo-por-area")
            .then((res) => {
                setTiempoData(res.data);
            })
            .catch((err) => console.error(err));
    }, []);

    // Colores para cada tipo de solicitud
    const colors = {
        Queja: "#e9ec1e",
        Reclamo: "#ef4444",
        Peticion: "#2325a7ff",
        Solicitud: "#10b981",
        Tutela: "#f59e0b",
        Felicitacion: "#3b82f6",
    };

    return (
        <>
            <Navbar />
            <div className="container-dash-interno">
                {/* 📊 Gráfica 1: Usuarios con 2+ PQRs */}
                <div className="grafica1">
                    <h3>Usuarios con 3 o más PQRS</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            // layout="vertical"
                            data={usuariosData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            {/* <XAxis type="number" />
                             */}
                            <XAxis
                                dataKey="nombre"
                                angle={-30}
                                textAnchor="end"
                                interval={0}
                                height={70}
                            />
                            {/* <YAxis dataKey="nombre" type="category" /> */}
                            <YAxis />

                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
                                        const row = payload.find(p => p.payload?.documento)?.payload;
                                        const documento = row?.documento;

                                        return (
                                            <div style={{ background: "#fff", padding: "10px", border: "1px solid #ccc" }}>
                                                <p><strong>{label}</strong></p>
                                                <p><strong>Documento: {documento}</strong></p>
                                                {payload.map((entry, index) => (
                                                    <p key={index} style={{ color: entry.color }}>
                                                        {entry.name}: {entry.value}
                                                    </p>
                                                ))}
                                                <p><strong>Total: {total}</strong></p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend />
                            {Object.keys(colors).map((tipo, idx) => (
                                <Bar
                                    key={idx}
                                    dataKey={tipo}
                                    stackId="a"
                                    fill={colors[tipo]}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="grafica1">
                    <h3>Usuarios con 3 o más PQRS</h3>

                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                            data={usuariosData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />

                            {/* Eje X → Usuarios */}
                            <XAxis
                                dataKey="nombre"
                                angle={-30}
                                textAnchor="end"
                                interval={0}
                                height={70}
                            />

                            {/* Eje Y → Cantidad */}
                            <YAxis />

                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const total = payload.reduce(
                                            (sum, entry) => sum + (entry.value || 0),
                                            0
                                        );

                                        const documento = payload[0]?.payload?.documento;

                                        return (
                                            <div
                                                style={{
                                                    background: "#fff",
                                                    padding: "10px",
                                                    border: "1px solid #ccc",
                                                }}
                                            >
                                                <p><strong>{label}</strong></p>
                                                <p><strong>Documento: {documento}</strong></p>

                                                {payload.map((entry, index) => (
                                                    <p key={index} style={{ color: entry.color }}>
                                                        {entry.name}: {entry.value}
                                                    </p>
                                                ))}

                                                <p><strong>Total: {total}</strong></p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />

                            <Legend />

                            {/* Líneas por tipo de solicitud */}
                            {Object.keys(colors).map((tipo, idx) => (
                                <Line
                                    key={idx}
                                    type="monotone"
                                    dataKey={tipo}
                                    stroke={colors[tipo]}
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>



                {/* 📊 Gráfica 2: Tiempo por área */}
                <div className="grafica2">
                    <h3>Tiempo de respuesta por área</h3>
                    <ResponsiveContainer width="100%" height={500}>
                        <BarChart
                            data={tiempoData}
                            layout="vertical"
                            margin={{ top: 20, right: 30, left: 170, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                type="number"
                                label={{
                                    value: "Horas",
                                    position: "insideBottomRight",
                                    offset: -5,
                                }}
                            />
                            <YAxis
                                dataKey="area"
                                type="category"
                                tick={({ x, y, payload }) => (
                                    <text
                                        x={x - 5}
                                        y={y + 4}
                                        textAnchor="end"
                                        style={{
                                            fontSize: 10,
                                            whiteSpace: "nowrap", // 👈 evita saltos de línea
                                        }}
                                    >
                                        {payload.value}
                                    </text>
                                )}
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div
                                                style={{
                                                    background: "#fff",
                                                    padding: "10px",
                                                    border: "1px solid #ccc",
                                                }}
                                            >
                                                <p>
                                                    <strong>{label}</strong>
                                                </p>
                                                <p style={{ color: "#3b82f6" }}>
                                                    Promedio de incumplimiento: {data.promedio_horas} hrs
                                                </p>
                                                <p style={{ color: "#313131ff" }}>
                                                    Porcentaje de incumplimiento: {data.porcentaje} %
                                                </p>
                                                <p style={{ color: "#f00a0aff" }}>
                                                    Máximo de respuesta de una PQRS: {data.max_horas} hrs
                                                </p>
                                                <p style={{ color: "#047c54ff" }}>
                                                    Mínimo de respuesta de una PQRS: {data.min_horas} hrs
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend />
                            <Bar dataKey="promedio_horas" fill="#3b82f6" name="Promedio (hrs)" />
                            <Bar dataKey="max_horas" fill="#ef4444" name="Máximo (hrs)" />
                            <Bar dataKey="min_horas" fill="#10b981" name="Mínimo (hrs)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <Version />
            </div>
        </>
    );
};


























// import React, { useEffect, useState } from "react";
// import {
//     BarChart,
//     Bar,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     Tooltip,
//     Legend,
//     ResponsiveContainer,
//     LineChart,
//     Line
// } from "recharts";
// import api from "../api/api";
// import Navbar from "../components/Navbar/Navbar";
// import { Version } from "../components/Footer/Version";

// export const DashInterno = () => {
//     const [usuariosData, setUsuariosData] = useState([]);
//     const [tiempoData, setTiempoData] = useState([]);

//     // 🔹 Usuarios con 2+ PQRs
//     useEffect(() => {
//         api.get("/users-varias-pqrs")
//             .then((res) => {
//                 const usuarios = res.data;

//                 // Transformamos para recharts
//                 const transformed = usuarios.map((u) => {
//                     const entry = { nombre: `${u.nombre} ${u.apellido}` };
//                     u.tipos.forEach((t) => {
//                         entry[t.tipo_solicitud] = t.cantidad;
//                     });
//                     return entry;
//                 });

//                 setUsuariosData(transformed);
//             })
//             .catch((err) => console.error(err));
//     }, []);

//     // 🔹 Tiempo por área
//     useEffect(() => {
//         api.get("/tiempo-por-area")
//             .then((res) => {
//                 setTiempoData(res.data);
//             })
//             .catch((err) => console.error(err));
//     }, []);

//     // Colores para cada tipo de solicitud
//     const colors = {
//         Peticion: "#ff0000ff",
//         Queja: "#82ca9d",
//         Felicitacion: "#ffc658",
//         Reclamo: "#ff8042",
//         Solicitud: "#0088FE",
//         Tutela: "#a83279",
//     };

//     return (
//         <>
//             <Navbar />
//             <div className="container-dash-interno">
//                 {/* 📊 Gráfica 1: Usuarios con 2+ PQRs */}
//                 <div className="grafica1">
//                     <h3>Usuarios con 3 o más PQRS</h3>
//                     <ResponsiveContainer width="100%" height={400}>
//                          <LineChart // 👈 CAMBIO: LineChart en lugar de BarChart
//             data={usuariosData}
//             margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
//         >
//                             <CartesianGrid strokeDasharray="3 3" />
//                             <XAxis type="number" />
//                             <YAxis dataKey="nombre" type="category" />
//                             <Tooltip
//                                 content={({ active, payload, label }) => {
//                                     if (active && payload && payload.length) {
//                                         const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
//                                         return (
//                                             <div style={{ background: "#fff", padding: "10px", border: "1px solid #ccc" }}>
//                                                 <p><strong>{label}</strong></p>
//                                                 {payload.map((entry, index) => (
//                                                     <p key={index} style={{ color: entry.color }}>
//                                                         {entry.name}: {entry.value}
//                                                     </p>
//                                                 ))}
//                                                 <p><strong>Total: {total}</strong></p>
//                                             </div>
//                                         );
//                                     }
//                                     return null;
//                                 }}
//                             />
//                               <Legend />
//             {Object.keys(colors).map((tipo, idx) => (
//                 <Line // 👈 CAMBIO: Line en lugar de Bar
//                     key={idx}
//                     dataKey={tipo}
//                     stroke={colors[tipo]} // 👈 CAMBIO: stroke en lugar de fill
//                     dot={{ r: 5 }} // 👈 Añadido para mostrar puntos
//                     // stackId="a" eliminado
//                 />
//             ))}
//         </LineChart>
//                     </ResponsiveContainer>
//                 </div>

//                 {/* 📊 Gráfica 2: Tiempo por área */}
//                 <div className="grafica2">
//                     <h3>Tiempo de respuesta por área</h3>
//                     <ResponsiveContainer width="100%" height={500}>
//                         <BarChart
//                             data={tiempoData}
//                             layout="vertical"
//                             margin={{ top: 20, right: 30, left: 170, bottom: 20 }}
//                         >
//                             <CartesianGrid strokeDasharray="3 3" />
//                             <XAxis
//                                 type="number"
//                                 label={{
//                                     value: "Horas",
//                                     position: "insideBottomRight",
//                                     offset: -5,
//                                 }}
//                             />
//                             <YAxis
//                                 dataKey="area"
//                                 type="category"
//                                 tick={({ x, y, payload }) => (
//                                     <text
//                                         x={x - 5}
//                                         y={y + 4}
//                                         textAnchor="end"
//                                         style={{
//                                             fontSize: 10,
//                                             whiteSpace: "nowrap", // 👈 evita saltos de línea
//                                         }}
//                                     >
//                                         {payload.value}
//                                     </text>
//                                 )}
//                             />
//                             <Tooltip
//                                 content={({ active, payload, label }) => {
//                                     if (active && payload && payload.length) {
//                                         const data = payload[0].payload;
//                                         return (
//                                             <div
//                                                 style={{
//                                                     background: "#fff",
//                                                     padding: "10px",
//                                                     border: "1px solid #ccc",
//                                                 }}
//                                             >
//                                                 <p>
//                                                     <strong>{label}</strong>
//                                                 </p>
//                                                 <p style={{ color: "#3b82f6" }}>
//                                                     Promedio de incumplimiento: {data.promedio_horas} hrs
//                                                 </p>
//                                                 <p style={{ color: "#313131ff" }}>
//                                                     Porcentaje de incumplimiento: {data.porcentaje} %
//                                                 </p>
//                                                 <p style={{ color: "#f00a0aff" }}>
//                                                     Máximo de respuesta de una PQRS: {data.max_horas} hrs
//                                                 </p>
//                                                 <p style={{ color: "#047c54ff" }}>
//                                                     Mínimo de respuesta de una PQRS: {data.min_horas} hrs
//                                                 </p>
//                                             </div>
//                                         );
//                                     }
//                                     return null;
//                                 }}
//                             />
//                             <Legend />
//                             <Bar dataKey="promedio_horas" fill="#3b82f6" name="Promedio (hrs)" />
//                             <Bar dataKey="max_horas" fill="#ef4444" name="Máximo (hrs)" />
//                             <Bar dataKey="min_horas" fill="#10b981" name="Mínimo (hrs)" />
//                         </BarChart>
//                     </ResponsiveContainer>
//                 </div>
//                 <Version />
//             </div>
//         </>
//     );
// };
