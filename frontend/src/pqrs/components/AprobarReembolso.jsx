import React, { useState, useEffect } from "react";
import "../styles/AprobarReembolso.css";
import api from "../../api/api";


const AprobarReembolso = ({ pqrId }) => {
    const [estado, setEstado] = useState("");
    const [comentario, setComentario] = useState("");
    const [aprobadoPor, setAprobadoPor] = useState(""); // 👈 nuevo estado
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [yaAprobado, setYaAprobado] = useState(false);

    // 🔹 Traer el reembolso (si existe) cuando cargue el componente
    useEffect(() => {
        const fetchReembolso = async () => {
            try {
                const response = await api.get(`/pqrs/${pqrId}/reembolso`);

                if (response.data) {
                    setEstado(response.data.estado);
                    setComentario(response.data.comentario || "");
                    setAprobadoPor(response.data.aprobado_por || ""); // ✅ guardar solo el nombre completo
                    setYaAprobado(true);
                }

            } catch (err) {
                console.log("No hay reembolso registrado aún");
            }
        };

        fetchReembolso();
    }, [pqrId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await api.post(`/pqrs/${pqrId}/reembolso`, {
                estado,
                comentario,
            });

            setEstado(response.data.reembolso.estado);
            setComentario(response.data.reembolso.comentario || "");
            setAprobadoPor(response.data.aprobado_por || ""); // ✅ guardar solo el nombre completo
            setYaAprobado(true);
        } catch (err) {
            setError(err.response?.data?.message || "Error al aprobar reembolso");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="p-4 bg-white rounded-2xl shadow-md w-full max-w-md"
        >
            <h2 className="text-xl font-bold mb-4">Aprobar Reembolso</h2>

            <div className="mb-3">
                <label className="block font-medium mb-1">Estado</label>
                <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="select-reembolso"
                    disabled={yaAprobado}
                    required
                >
                    <option value="" disabled>
                        -- Selecciona una opción --
                    </option>
                    <option value="Aprobado">Aprobado</option>
                    <option value="Desaprobado">Desaprobado</option>
                </select>
            </div>

            {/* <div className="mb-3">
                <label className="block font-medium mb-1">Comentario (opcional)</label>
                <textarea
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    className="comentario-reembolso"
                    rows="3"
                    disabled={yaAprobado}
                />
            </div> */}

            {!yaAprobado && (
                <button
                    type="submit"
                    disabled={loading}
                    className="boton-reembolso"
                >
                    {loading ? "Enviando..." : "Guardar"}
                </button>
            )}
            {yaAprobado && (
                <p className={`mt-3 font-medium ${estado === "Aprobado" ? "text-green-600" : "text-red-600"}`}>
                    {estado === "Aprobado" ? "✅" : "❌"} Reembolso {estado} por:{" "}
                    <span className="text-gray-700">
                        {aprobadoPor}
                    </span>
                    {comentario && ` – Comentario: ${comentario}`}
                </p>
            )}
            {message && <p className="mt-3 text-green-600">{message}</p>}
            {error && <p className="mt-3 text-red-600">{error}</p>}
        </form>
    );
};

export default AprobarReembolso;
