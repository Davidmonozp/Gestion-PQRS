import React from "react";
import PqrsForm from "./PqrsForm";

export default function TutelasForm() {
  const tipoSolicitudOptions = [
    { value: "Tutela", label: "Tutela" },
  ];

  return (
    <PqrsForm
      defaultTipoSolicitud="Tutela"
      tipoSolicitudOptions={tipoSolicitudOptions}
    />
  );
}

