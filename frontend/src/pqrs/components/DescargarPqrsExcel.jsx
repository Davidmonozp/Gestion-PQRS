import React, { useState } from "react";
import api from "../../api/api";

const DescargarPqrsExcel = () => {
    const [descargando, setDescargando] = useState(false);

    const handleDownload = async () => {
        try {
            setDescargando(true);

            const response = await api.get("/export-pqrs", {
                responseType: "blob", // necesario para archivos binarios
            });

            // Crear una URL temporal del archivo
            const url = window.URL.createObjectURL(new Blob([response.data]));

            // Crear enlace oculto y forzar descarga
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "pqrs.xlsx"); // nombre del archivo
            document.body.appendChild(link);
            link.click();

            // Limpiar URL y enlace
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error al descargar el Excel:", error);
            alert("Hubo un problema al descargar el informe.");
        } finally {
            setDescargando(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={descargando}
            className={`boton-reabrir flex items-center justify-center gap-2 transition-all duration-200 
            text-white border-none rounded-md px-3 py-2 text-sm font-semibold
                ${descargando
                    ? "bg-[#4aa7dd] cursor-wait opacity-100 disabled:opacity-100" // mantiene azul al cargar
                    : "bg-[#4aa7dd] hover:bg-[#3b96c9] cursor-pointer"
                }`}
            style={{
                backgroundColor: descargando ? "#4aa7dd" : undefined,
            }}
        >
            {descargando ? (
                <>
                    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                    <span>Generando Excel...</span>
                </>
            ) : (
                "📊 Descargar Excel de PQRS"
            )}
        </button>
    );
};

export default DescargarPqrsExcel;
