import React, { useEffect, useState } from "react";
import api from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import "./styles/PqrsList.css";
import PqrsFilters from "./components/PqrsFilters";
import { tienePermiso } from "../utils/permisoHelper";
import CountdownTimer from "./components/CountDownTimer";
import PqrsSidebar from "../components/Sidebar/PqrsSidebar";
import { getRole, getSedes } from "../auth/authService";
import { Version } from "../components/Footer/Version";
import Swal from "sweetalert2";
import rangoDePaginacion from "../utils/RangoDePaginacion";
import {
  handleAsignacionMasiva,
  handleDesasignacionMasiva,
} from "../utils/asignacionMasiva";
import AsociarDuplicadasModal from "./components/AsociarDuplicadasModal";
import { PanelDespegable } from "./components/PanelDespegable";
import { GlosarioIconos } from "./components/GlosarioIconos";


function PqrsList() {
  const [pqrs, setPqrs] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    current_page: 1,
    per_page: 20,
    last_page: 1,
  });

  const [selectedPqrs, setSelectedPqrs] = useState(new Set());
  const [usuarioAsignadoMasivo, setUsuarioAsignadoMasivo] = useState([]);
  const [showUserSelect, setShowUserSelect] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [usuarios, setUsuarios] = useState([]);

  // 🌟 ESTADOS PARA ASOCIACIÓN/DESASOCIACIÓN 🌟
  const [showAsociarModal, setShowAsociarModal] = useState(false);
  const [pqrMaestraInicial, setPqrMaestraInicial] = useState(null);
  const [pqrsDelGrupo, setPqrsDelGrupo] = useState([]);


  // 🌟 FUNCIÓN PARA ABRIR EL MODAL 🌟
  const handleOpenAsociarModal = async (pqr) => {
    if (!pqr.documento_numero) {
      Swal.fire('Error', 'La PQR no tiene número de documento para agrupar.', 'error');
      return;
    }

    let grupo = [];
    let pqrInicialParaModal = pqr;
    let maestraIdParaBusqueda = null;

    try {
      setLoading(true);

      // 🌟 LÓGICA SIMPLIFICADA 🌟
      if (pqr.es_asociada) {
        // Caso 1: YA es Maestra o Duplicada Asociada.
        // La maestra del grupo es su propia ID si no tiene id_pqrs_maestra, o el id_pqrs_maestra si lo tiene.
        maestraIdParaBusqueda = pqr.id_pqrs_maestra || pqr.id;

        // **Endpoint necesario**: Obtiene la Maestra + todas las Duplicadas asociadas.
        const response = await api.get(`/pqrs/grupo-completo-por-maestra/${maestraIdParaBusqueda}`);

        grupo = response.data.grupo;

        // Aseguramos que la PQR Inicial del modal sea la Maestra real (para el radio button)
        pqrInicialParaModal = grupo.find(p => p.id === maestraIdParaBusqueda) || pqr;

      } else {
        // Caso 2: PQR Radicada/Activa (potencialmente duplicada). Buscamos por documento.

        maestraIdParaBusqueda = pqr.id;
        pqrInicialParaModal = pqr;

        // Buscamos todas las PQRS por documento
        const response = await api.get('/pqrs', {
          params: {
            documento_numero: pqr.documento_numero,
            per_page: -1 // Obtener todas
          }
        });

        grupo = response.data.pqrs;
      }

      setPqrMaestraInicial(pqrInicialParaModal);
      setPqrsDelGrupo(grupo);
      setShowAsociarModal(true);

    } catch (error) {
      console.error('Error al cargar PQRS del grupo:', error.response || error);
      Swal.fire('Error', 'No se pudieron cargar las PQRS del grupo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función de callback al terminar la asociación/desasociación
  const handleAsociacionCompleta = () => {
    setShowAsociarModal(false);
    setPqrMaestraInicial(null);
    setPqrsDelGrupo([]);
    fetchPqrs(pagination.current_page); // Recarga la lista para reflejar los cambios
  };

  // ... (El resto de useEffects y funciones sin cambios)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/users");
        setUsuarios(response.data);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      }
    };
    fetchUsers();
  }, []);

  const [filters, setFilters] = useState({
    pqr_codigo: "",
    documento_numero: "",
    servicio_prestado: [],
    tipo_solicitud: [],
    sede: [],
    eps: [],
    fecha_inicio: "",
    fecha_fin: "",
    respuesta_enviada: [],
    clasificaciones: [],
    asignados: [],
    atributo_calidad: [],
  });

  // useEffect para filtros de paginación
  useEffect(() => {
    api
      .get("/pqrs", {
        params: {
          page: pagination.current_page,
          per_page: pagination.per_page,
          ...filters,
        },
      })
      .then((res) => {
        setPqrs(res.data.pqrs);
        setPagination({
          total: res.data.total,
          current_page: res.data.current_page,
          per_page: res.data.per_page,
          last_page: res.data.last_page,
        });
      });
  }, [pagination.current_page, pagination.per_page, filters]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  // const [lastPage, setLastPage] = useState(1); // Esta es redundante, ya está en pagination

  const [activeStatusFilter, setActiveStatusFilter] = useState("");

  const usuario = {
    role: getRole(),
    sedes: getSedes(),
  };

  const navigate = useNavigate();

  // useEffect para filtros de estado
  useEffect(() => {
    fetchPqrs();
  }, [pagination.current_page, filters, activeStatusFilter]);

  // ... (Tu función fetchPqrs completa) ...
  const fetchPqrs = async (page = pagination.current_page) => {
    // ... (todo el cuerpo de tu función fetchPqrs) ...
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append("page", page);

      if (usuario.role === "Digitador") {
        queryParams.append("per_page", 20);
      }

      let apiUrl = "/pqrs";

      const hasGeneralFilters = Object.keys(filters).some((key) => {
        const value = filters[key];
        if (Array.isArray(value)) return value.length > 0;
        return value !== "";
      });

      if (activeStatusFilter !== "" && !hasGeneralFilters) {
        apiUrl = "/pqrs/estado";
        queryParams.append("estado_respuesta", activeStatusFilter);
      } else {
        if (activeStatusFilter) {
          queryParams.append("estado_respuesta", activeStatusFilter);
        }

        if (filters.pqr_codigo)
          queryParams.append("pqr_codigo", filters.pqr_codigo);
        if (filters.documento_numero)
          queryParams.append("documento_numero", filters.documento_numero);
        if (filters.servicio_prestado?.length) {
          filters.servicio_prestado.forEach((s) =>
            queryParams.append("servicio_prestado[]", s)
          );
        }
        if (filters.tipo_solicitud?.length) {
          filters.tipo_solicitud.forEach((t) =>
            queryParams.append("tipo_solicitud[]", t)
          );
        }
        if (filters.atributo_calidad?.length) {
          filters.atributo_calidad.forEach((a) =>
            queryParams.append("atributo_calidad[]", a)
          );
        }
        if (filters.clasificaciones?.length) {
          filters.clasificaciones.forEach((c) =>
            queryParams.append("clasificaciones[]", c)
          );
        }
        if (filters.sede?.length) {
          filters.sede.forEach((s) => queryParams.append("sede[]", s));
        }
        if (filters.eps?.length) {
          filters.eps.forEach((e) => queryParams.append("eps[]", e));
        }
        if (filters.fecha_inicio) {
          queryParams.append("fecha_inicio", filters.fecha_inicio);
        }
        if (filters.fecha_fin) {
          queryParams.append("fecha_fin", filters.fecha_fin);
        }
        if (filters.respuesta_enviada?.length) {
          filters.respuesta_enviada.forEach((estado) =>
            queryParams.append("respuesta_enviada[]", estado)
          );
        }
        if (filters.asignados?.length) {
          filters.asignados.forEach((u) =>
            queryParams.append("asignados[]", u)
          );
        }
      }

      const res = await api.get(`${apiUrl}?${queryParams.toString()}`);

      const processedPqrs = res.data.pqrs.map((pqr) => {
        let processedArchivo = [];
        if (typeof pqr.archivo === "string") {
          try {
            const parsed = JSON.parse(pqr.archivo);
            if (Array.isArray(parsed)) {
              processedArchivo = parsed.filter(
                (item) =>
                  typeof item === "object" && item !== null && "path" in item
              );
            } else if (
              parsed &&
              typeof parsed === "object" &&
              "path" in parsed
            ) {
              processedArchivo = [parsed];
            } else {
              processedArchivo = [
                {
                  path: pqr.archivo,
                  original_name: pqr.archivo.split("/").pop(),
                },
              ];
            }
          } catch {
            processedArchivo = [
              {
                path: pqr.archivo,
                original_name: pqr.archivo.split("/").pop(),
              },
            ];
          }
        } else if (Array.isArray(pqr.archivo)) {
          processedArchivo = pqr.archivo.filter(
            (item) =>
              typeof item === "object" && item !== null && "path" in item
          );
        } else if (
          pqr.archivo &&
          typeof pqr.archivo === "object" &&
          "path" in pqr.archivo
        ) {
          processedArchivo = [pqr.archivo];
        }

        return { ...pqr, archivo: processedArchivo };
      });

      setPqrs(processedPqrs);
      setPagination({
        total: res.data.total,
        current_page: res.data.current_page,
        per_page: res.data.per_page,
        last_page: res.data.last_page,
      });
    } catch (err) {
      console.error("Error al obtener las PQRS:", err);
      setError("No se pudo cargar la información");
    } finally {
      setLoading(false);
    }
  };


  const handleStatusFilterClick = (status) => {
    setActiveStatusFilter(status);
    setCurrentPage(1);
  };

  const handleBuscar = () => {
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.last_page) {
      setPagination((prev) => ({ ...prev, current_page: page }));
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  const handleSelectPqr = (pqrCodigo) => {
    setSelectedPqrs((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(pqrCodigo)) {
        newSelected.delete(pqrCodigo);
      } else {
        newSelected.add(pqrCodigo);
      }
      return newSelected;
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pqrsWithQuality = pqrs.filter(
        (pqr) =>
          pqr.atributo_calidad !== null &&
          pqr.atributo_calidad !== undefined &&
          pqr.estado_respuesta !== "Cerrado"
      );
      const allPqrCodes = new Set(pqrsWithQuality.map((pqr) => pqr.pqr_codigo));
      setSelectedPqrs(allPqrCodes);
    } else {
      setSelectedPqrs(new Set());
    }
  };

  return (
    <>
      <div className="app-layout-container">
        {!tienePermiso(["Digitador", "Gestor", "Gestor Administrativo"]) && (
          <PqrsSidebar pqrsData={pqrs} />
        )}
        <div className="container-pqrs">
          <div className="cabecera">
            <h2>
              <span className="color-verde">TuOpiniónCuenta |</span>Gestión y
              Seguimiento de F-PQRS
            </h2>
          </div>

          {/* <BotonesFilters
            activeStatusFilter={activeStatusFilter}
            onStatusFilterClick={handleStatusFilterClick}
          /> */}

          <div className="header-top">
            <PqrsFilters
              filters={filters}
              setFilters={(newFilters) => {
                setFilters(newFilters);
                setPagination((prev) => ({ ...prev, current_page: 1 })); // reinicia a página 1 al aplicar filtros
              }}
              onBuscar={() =>
                setPagination((prev) => ({ ...prev, current_page: 1 }))
              }
            />
          </div>
          {tienePermiso(["Administrador"]) && (
            <div className="per-page-selector">
              <label>Mostrar:</label>
              <select
                className="mostrar"
                value={pagination.per_page}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setPagination((prev) => ({
                    ...prev,
                    per_page: value,
                    current_page: 1, // Reinicia a la primera página si cambia la cantidad
                  }));
                }}
              >
                <option value={20}>20</option>
                <option value={40}>40</option>
                <option value={60}>60</option>
                <option value={10000}>Todas</option>{" "}
                {/* valor grande para representar "Todas" */}
              </select>
            </div>
          )}
             <GlosarioIconos />
          <div className="table-wrapper">
            {selectedPqrs.size > 0 && (
              <div className="bulk-assign-controls">
                <label>Asignar a:</label>
                {/* Contenedor principal del multiselect */}
                <div className="custom-multiselect">
                  <div
                    className="custom-select-box"
                    onClick={() => setShowUserSelect(!showUserSelect)}
                  >
                    {/* Muestra los nombres de los usuarios seleccionados o un mensaje por defecto */}
                    {usuarioAsignadoMasivo.length > 0
                      ? usuarioAsignadoMasivo
                        .map((id) => {
                          const usuario = usuarios.find((u) => u.id === id);
                          return usuario
                            ? `${usuario.name} ${usuario.primer_apellido || ""
                            }`
                            : null;
                        })
                        .filter(Boolean) // Filtra IDs que no se encuentran
                        .join(", ")
                      : "Seleccione uno o más usuarios..."}
                  </div>

                  {showUserSelect && (
                    <div className="checkbox-options">
                      {/* Input de búsqueda */}
                      <input
                        type="text"
                        placeholder="Buscar usuario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                      />

                      {/* Lista de usuarios con checkboxes */}
                      {usuarios
                        .filter(
                          (u) =>
                            u.name
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            (u.primer_apellido &&
                              u.primer_apellido
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()))
                        )
                        .map((u) => (
                          <label key={u.id} className="checkbox-item">
                            <input
                              type="checkbox"
                              value={u.id}
                              checked={usuarioAsignadoMasivo.includes(u.id)}
                              onChange={(e) => {
                                const id = parseInt(e.target.value);
                                if (e.target.checked) {
                                  // Agrega el ID al array si se selecciona
                                  setUsuarioAsignadoMasivo([
                                    ...usuarioAsignadoMasivo,
                                    id,
                                  ]);
                                } else {
                                  // Elimina el ID del array si se deselecciona
                                  setUsuarioAsignadoMasivo(
                                    usuarioAsignadoMasivo.filter(
                                      (userId) => userId !== id
                                    )
                                  );
                                }
                              }}
                            />
                            {u.name} {u.segundo_nombre} {u.primer_apellido}{" "}
                            {u.segundo_apellido}
                          </label>
                        ))}
                    </div>
                  )}
                </div>
                <button
                  className="btn-asignar"
                  onClick={() =>
                    handleAsignacionMasiva({
                      selectedPqrs,
                      usuarioAsignadoMasivo,
                      api,
                      fetchPqrs,
                      setSelectedPqrs,
                      setUsuarioAsignadoMasivo,
                      setShowUserSelect,
                    })
                  }
                >
                  Asignar
                </button>
                <button
                  className="btn-desasignar"
                  onClick={() =>
                    handleDesasignacionMasiva({
                      selectedPqrs,
                      usuarioAsignadoMasivo,
                      fetchPqrs,
                      setSelectedPqrs,
                      setUsuarioAsignadoMasivo,
                      setShowUserSelect,
                    })
                  }
                >
                  Desasignar
                </button>
              </div>
            )}

            <table className="container-table">
              <thead>
                <tr>
                  <th>
                    {tienePermiso(["Administrador"]) && (
                      <input type="checkbox" onChange={handleSelectAll} />
                    )}
                    Acciones
                  </th>
                  {/* <th>Asignación masiva</th> */}
                  {/* <th>
                    Asignación masiva
                    <input type="checkbox" onChange={handleSelectAll} />
                  </th> */}
                  <th>Índice</th>
                  <th># Radicado</th>
                  <th>Fecha de solicitud</th>
                  {/* <th>Fecha de registro</th> */}
                  <th>Sede</th>
                  <th>Tipo Solicitud</th>
                  <th>Prioridad</th>
                  <th>Estado de la PQR</th>
                  <th>Tipo Doc.</th>
                  <th>Número Doc.</th>
                  <th>Nombres y Apellidos</th>
                  {/* <th>Apellido</th> */}
                  <th>EPS</th>
                  <th>Servicio prestado</th>
                  <th>Descripcion</th>
                  <th>Atributo de calidad</th>
                  <th>Asignado a</th>
                  <th>Fecha de cierre</th>
                  {/* <th>Clasificaciones</th> */}
                  <th>Tiempo de respuesta PASSUS</th>
                  {/* <th>Archivos</th> */}
                  <th>Respuesta enviada a usuario</th>
                </tr>
              </thead>
              <tbody>
                {pqrs
                  // 🔹 Primero filtramos según el rol
                  .filter((pqr) => {
                    const sedesUsuario = usuario.sedes || [];

                    if (
                      usuario.role === "Gestor" ||
                      usuario.role === "Gestor Administrativo"
                    ) {
                      return sedesUsuario.includes(pqr.sede);
                    }

                    if (usuario.role === "Digitador") {
                      return pqr.tipo_solicitud === "Solicitud";
                    }

                    return true; // otros roles ven todas
                  })
                  // 🔹 Luego calculamos el índice global descendente
                  .map((pqr, index) => {
                    const total = pagination?.total || pqrs.length;
                    const currentPage = pagination?.current_page || 1;
                    const perPage = pagination?.per_page || pqrs.length;

                    const globalIndex =
                      total - ((currentPage - 1) * perPage + index);

                    return (
                      <tr key={pqr.pqr_codigo}>
                        <td>
                          {tienePermiso([
                            "Administrador",
                            "Consultor",
                            "Supervisor/Atencion al usuario",
                            "Gestor",
                            "Gestor Administrativo",
                            "Digitador",
                          ]) && (
                              <button
                                onClick={() =>
                                  navigate(`/pqrs/${pqr.pqr_codigo}`)
                                }
                              >
                                <i className="fa fa-eye icono-ver"></i>
                              </button>
                            )}
                          {tienePermiso(["Administrador"]) && (
                            <input
                              type="checkbox"
                              checked={selectedPqrs.has(pqr.pqr_codigo)}
                              onChange={() => handleSelectPqr(pqr.pqr_codigo)}
                              disabled={
                                pqr.estado_respuesta === "Cerrado" ||
                                pqr.atributo_calidad == null
                              }
                            />
                          )}
                        </td>
                        {/* <td>
                          <input
                            type="checkbox"
                            checked={selectedPqrs.has(pqr.pqr_codigo)}
                            onChange={() => handleSelectPqr(pqr.pqr_codigo)}
                          />
                        </td> */}
                        <td>{globalIndex}</td>
                        <td>
                          {pqr.pqr_codigo}
                        </td>
                        <td>{pqr.fecha_inicio_real || pqr.created_at}</td>
                        {/* <td>{new Date(pqr.created_at).toLocaleString()}</td> */}
                        <td>{pqr.sede}</td>
                        <td>{pqr.tipo_solicitud}</td>
                        <td>{pqr.prioridad || "No asignada"}</td>
                        <td>{pqr.estado_respuesta}</td>
                        <td>{pqr.documento_tipo}</td>
                        <td>
                          {pqr.documento_numero}

                          {/* Mostrar botón si es duplicada pero no asociada */}
                          {pqr.es_duplicada == 1 && pqr.es_asociada == 0 && (
                            <button
                              onClick={() => handleOpenAsociarModal(pqr)}
                              title={`Atención: Duplicados para ${pqr.documento_numero}. Click para asociar.`}
                              className="btn-link-icon"
                              style={{ border: 'none', background: 'none', padding: '0', marginLeft: '5px' }}
                            >
                              <i className="fa-solid fa-clone icono-duplicada"></i>
                            </button>
                          )}

                          {/* Mostrar botón verde si ya está asociada */}
                          {pqr.es_asociada == 1 && (
                            <button
                              onClick={() => handleOpenAsociarModal(pqr)}
                              title={`PQR Asociada/Maestra. Click para gestionar/desasociar.`}
                              className="btn-link-icon"
                              style={{ border: 'none', background: 'none', padding: '0', marginLeft: '5px' }}
                            >
                              <i className="fa-solid fa-link" style={{ color: 'green', fontSize: '12px' }}></i>
                            </button>
                          )}
                        </td>

                        <td>
                          {pqr.nombre} {pqr.segundo_nombre} {pqr.apellido}{" "}
                          {pqr.segundo_apellido}
                        </td>
                        <td>{pqr.eps}</td>
                        <td>{pqr.servicio_prestado}</td>
                        <td className="descripcion" title={pqr.descripcion}>
                          {pqr.descripcion}
                        </td>
                        <td>{pqr.atributo_calidad}</td>
                        <td className="pqr-status-cell">
                          <ul className="pqr-status-list">
                            {pqr.asignados?.map((usuario) => {
                              const respondio = (pqr.respuestas ?? []).some(
                                (r) =>
                                  r.user_id === usuario.id &&
                                  r.es_respuesta_usuario === 0
                              );

                              return (
                                <li
                                  key={usuario.id}
                                  className="pqr-status-item"
                                >
                                  <i
                                    className={`fa-solid ${respondio
                                      ? "fa-check pqr-icon success"
                                      : "fa-clock pqr-icon pending"
                                      }`}
                                    title={
                                      respondio
                                        ? "Respuesta enviada"
                                        : "Pendiente de respuesta"
                                    }
                                  ></i>
                                  <span className="pqr-user-name">
                                    {usuario.name} {usuario.segundo_nombre}{" "}
                                    {usuario.primer_apellido}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </td>
                        <td>{pqr.respondido_en}</td>
                        {/* <td>
                          {pqr.clasificaciones &&
                          pqr.clasificaciones.length > 0 ? (
                            pqr.clasificaciones.map((clasificacion) => (
                              <span
                                key={clasificacion.id}
                                className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded mr-1"
                              >
                                {clasificacion.nombre}
                              </span>
                            ))
                          ) : (
                            <em>Sin clasificaciones</em>
                          )}
                        </td> */}
                        <td>
                          {pqr.estado_respuesta === "Cerrado" ? (
                            <span
                              style={{ color: "#474646", fontStyle: "italic" }}
                            >
                              Finalizado
                            </span>
                          ) : pqr.deadline_interno ? (
                            <CountdownTimer targetDate={pqr.deadline_interno} />
                          ) : (
                            <span
                              style={{ color: "#474646", fontStyle: "italic" }}
                            >
                              No iniciado
                            </span>
                          )}
                        </td>
                        <td>
                          {pqr.respuesta_enviada === 1
                            ? "Enviada ✅"
                            : "No enviada ❌"}
                        </td>
                      </tr>
                    );
                  })}
                {/* 🌟 INTEGRACIÓN DEL MODAL 🌟 */}
                {showAsociarModal && (
                  <AsociarDuplicadasModal
                    show={showAsociarModal}
                    onClose={() => setShowAsociarModal(false)}
                    pqrsGrupo={pqrsDelGrupo}
                    pqrInicial={pqrMaestraInicial}
                    onSuccess={handleAsociacionCompleta}
                  />
                )}
              </tbody>
            </table>
          </div>

          <nav className="paginacion">
            <ul className="elementosPaginacion">
              {/* Botón anterior */}
              <li className="numero">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination.current_page > 1)
                      handlePageChange(pagination.current_page - 1);
                  }}
                  className={pagination.current_page === 1 ? "disabled" : ""}
                  aria-disabled={pagination.current_page === 1}
                >
                  <i className="fa fa-chevron-left"></i>
                </a>
              </li>

              {/* Rango de paginación inteligente */}
              {rangoDePaginacion(
                pagination.current_page,
                pagination.last_page
              ).map((page, index) => (
                <li
                  key={index}
                  className={`numero ${page === pagination.current_page ? "active" : ""
                    } ${page === "..." ? "disabled" : ""}`}
                >
                  {page === "..." ? (
                    <span className="ellipsis">...</span>
                  ) : (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                    >
                      {page}
                    </a>
                  )}
                </li>
              ))}

              {/* Botón siguiente */}
              <li className="numero">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination.current_page < pagination.last_page)
                      handlePageChange(pagination.current_page + 1);
                  }}
                  className={
                    pagination.current_page === pagination.last_page
                      ? "disabled"
                      : ""
                  }
                  aria-disabled={
                    pagination.current_page === pagination.last_page
                  }
                >
                  <i className="fa fa-chevron-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <Version />
    </>
  );
}

export default PqrsList;




























































// import React, { useEffect, useState } from "react";
// import api from "../api/api";
// import { Link, useNavigate } from "react-router-dom";
// import "./styles/PqrsList.css";
// import PqrsFilters from "./components/PqrsFilters";
// import { tienePermiso } from "../utils/permisoHelper";
// import CountdownTimer from "./components/CountDownTimer";
// import PqrsSidebar from "../components/Sidebar/PqrsSidebar";
// import { getRole, getSedes } from "../auth/authService";
// import { Version } from "../components/Footer/Version";
// import Swal from "sweetalert2";
// import rangoDePaginacion from "../utils/RangoDePaginacion";
// import {
//   handleAsignacionMasiva,
//   handleDesasignacionMasiva,
// } from "../utils/asignacionMasiva";


// function PqrsList() {
//   const [pqrs, setPqrs] = useState([]);
//   const [pagination, setPagination] = useState({
//     total: 0,
//     current_page: 1,
//     per_page: 20,
//     last_page: 1,
//   });

//   const [selectedPqrs, setSelectedPqrs] = useState(new Set());
//   const [usuarioAsignadoMasivo, setUsuarioAsignadoMasivo] = useState([]);
//   const [showUserSelect, setShowUserSelect] = useState(false); // Para el selector de usuario
//   const [searchTerm, setSearchTerm] = useState(""); // Para el input de búsqueda
//   const [usuarios, setUsuarios] = useState([]);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const response = await api.get("/users"); // Asume que tienes un endpoint para esto
//         setUsuarios(response.data);
//       } catch (error) {
//         console.error("Error al cargar usuarios:", error);
//       }
//     };
//     fetchUsers();
//   }, []); // Se ejecuta solo una vez al cargar el componente.

//   const [filters, setFilters] = useState({
//     pqr_codigo: "",
//     documento_numero: "",
//     servicio_prestado: [],
//     tipo_solicitud: [],
//     sede: [],
//     eps: [],
//     fecha_inicio: "",
//     fecha_fin: "",
//     respuesta_enviada: [],
//     clasificaciones: [],
//     asignados: [],
//     atributo_calidad: [],
//   });

//   useEffect(() => {
//     api
//       .get("/pqrs", {
//         params: {
//           page: pagination.current_page,
//           per_page: pagination.per_page,
//           ...filters,
//         },
//       })
//       .then((res) => {
//         setPqrs(res.data.pqrs);
//         setPagination({
//           total: res.data.total,
//           current_page: res.data.current_page,
//           per_page: res.data.per_page,
//           last_page: res.data.last_page,
//         });
//       });
//   }, [pagination.current_page, pagination.per_page, filters]);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [lastPage, setLastPage] = useState(1);

//   // Estado para el filtro de estado de los botones
//   const [activeStatusFilter, setActiveStatusFilter] = useState(""); // "" significa "Todos"

//   const usuario = {
//     role: getRole(),
//     sedes: getSedes(), // Esto debe devolver un array de nombres
//   };

//   const navigate = useNavigate();

//   // useEffect ahora depende de `filters`, `activeStatusFilter` y `currentPage`
//   useEffect(() => {
//     fetchPqrs();
//   }, [pagination.current_page, filters, activeStatusFilter]);

//   const fetchPqrs = async (page = pagination.current_page) => {
//     try {
//       setLoading(true);
//       const queryParams = new URLSearchParams();
//       queryParams.append("page", page);

//       if (usuario.role === "Digitador") {
//         queryParams.append("per_page", 20);
//       }

//       let apiUrl = "/pqrs";

//       const hasGeneralFilters = Object.keys(filters).some((key) => {
//         const value = filters[key];
//         if (Array.isArray(value)) return value.length > 0;
//         return value !== "";
//       });

//       if (activeStatusFilter !== "" && !hasGeneralFilters) {
//         apiUrl = "/pqrs/estado";
//         queryParams.append("estado_respuesta", activeStatusFilter);
//       } else {
//         if (activeStatusFilter) {
//           queryParams.append("estado_respuesta", activeStatusFilter);
//         }

//         if (filters.pqr_codigo)
//           queryParams.append("pqr_codigo", filters.pqr_codigo);
//         if (filters.documento_numero)
//           queryParams.append("documento_numero", filters.documento_numero);
//         if (filters.servicio_prestado?.length) {
//           filters.servicio_prestado.forEach((s) =>
//             queryParams.append("servicio_prestado[]", s)
//           );
//         }
//         if (filters.tipo_solicitud?.length) {
//           filters.tipo_solicitud.forEach((t) =>
//             queryParams.append("tipo_solicitud[]", t)
//           );
//         }
//         if (filters.atributo_calidad?.length) {
//           filters.atributo_calidad.forEach((a) =>
//             queryParams.append("atributo_calidad[]", a)
//           );
//         }
//         if (filters.clasificaciones?.length) {
//           filters.clasificaciones.forEach((c) =>
//             queryParams.append("clasificaciones[]", c)
//           );
//         }
//         if (filters.sede?.length) {
//           filters.sede.forEach((s) => queryParams.append("sede[]", s));
//         }
//         if (filters.eps?.length) {
//           filters.eps.forEach((e) => queryParams.append("eps[]", e));
//         }
//         if (filters.fecha_inicio) {
//           queryParams.append("fecha_inicio", filters.fecha_inicio);
//         }
//         if (filters.fecha_fin) {
//           queryParams.append("fecha_fin", filters.fecha_fin);
//         }
//         if (filters.respuesta_enviada?.length) {
//           filters.respuesta_enviada.forEach((estado) =>
//             queryParams.append("respuesta_enviada[]", estado)
//           );
//         }
//         if (filters.asignados?.length) {
//           filters.asignados.forEach((u) =>
//             queryParams.append("asignados[]", u)
//           );
//         }
//       }

//       const res = await api.get(`${apiUrl}?${queryParams.toString()}`);

//       const processedPqrs = res.data.pqrs.map((pqr) => {
//         let processedArchivo = [];
//         if (typeof pqr.archivo === "string") {
//           try {
//             const parsed = JSON.parse(pqr.archivo);
//             if (Array.isArray(parsed)) {
//               processedArchivo = parsed.filter(
//                 (item) =>
//                   typeof item === "object" && item !== null && "path" in item
//               );
//             } else if (
//               parsed &&
//               typeof parsed === "object" &&
//               "path" in parsed
//             ) {
//               processedArchivo = [parsed];
//             } else {
//               processedArchivo = [
//                 {
//                   path: pqr.archivo,
//                   original_name: pqr.archivo.split("/").pop(),
//                 },
//               ];
//             }
//           } catch {
//             processedArchivo = [
//               {
//                 path: pqr.archivo,
//                 original_name: pqr.archivo.split("/").pop(),
//               },
//             ];
//           }
//         } else if (Array.isArray(pqr.archivo)) {
//           processedArchivo = pqr.archivo.filter(
//             (item) =>
//               typeof item === "object" && item !== null && "path" in item
//           );
//         } else if (
//           pqr.archivo &&
//           typeof pqr.archivo === "object" &&
//           "path" in pqr.archivo
//         ) {
//           processedArchivo = [pqr.archivo];
//         }

//         return { ...pqr, archivo: processedArchivo };
//       });

//       setPqrs(processedPqrs);
//       setPagination({
//         total: res.data.total,
//         current_page: res.data.current_page,
//         per_page: res.data.per_page,
//         last_page: res.data.last_page, // 👈 aquí está la clave
//       });
//     } catch (err) {
//       console.error("Error al obtener las PQRS:", err);
//       setError("No se pudo cargar la información");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStatusFilterClick = (status) => {
//     setActiveStatusFilter(status); // Actualiza el estado del filtro de estado
//     setCurrentPage(1); // Siempre vuelve a la primera página con el nuevo filtro aplicado
//   };

//   const handleBuscar = () => {
//     setCurrentPage(1); // Al hacer click en buscar, siempre vuelve a la primera página
//   };

//   const handlePageChange = (page) => {
//     if (page >= 1 && page <= pagination.last_page) {
//       setPagination((prev) => ({ ...prev, current_page: page }));
//     }
//   };

//   if (loading) return <p>Cargando...</p>;
//   if (error) return <p>{error}</p>;

//   // Agrega esta función para la selección de una PQR
//   const handleSelectPqr = (pqrCodigo) => {
//     setSelectedPqrs((prev) => {
//       const newSelected = new Set(prev);
//       if (newSelected.has(pqrCodigo)) {
//         newSelected.delete(pqrCodigo);
//       } else {
//         newSelected.add(pqrCodigo);
//       }
//       return newSelected;
//     });
//   };

//   // Agrega esta función para seleccionar o deseleccionar todo
//   const handleSelectAll = (e) => {
//     if (e.target.checked) {
//       // Filtra las PQRS que sí tienen atributo_calidad asignado
//       const pqrsWithQuality = pqrs.filter(
//         (pqr) =>
//           pqr.atributo_calidad !== null &&
//           pqr.atributo_calidad !== undefined &&
//           pqr.estado_respuesta !== "Cerrado"
//       );

//       // Mapea los códigos de esas PQRS a un nuevo Set
//       const allPqrCodes = new Set(pqrsWithQuality.map((pqr) => pqr.pqr_codigo));

//       setSelectedPqrs(allPqrCodes);
//     } else {
//       // Si la casilla "seleccionar todo" se desmarca, limpia la selección
//       setSelectedPqrs(new Set());
//     }
//   };

//   return (
//     <>
//       <div className="app-layout-container">
//         {!tienePermiso(["Digitador", "Gestor", "Gestor Administrativo"]) && (
//           <PqrsSidebar pqrsData={pqrs} />
//         )}
//         <div className="container-pqrs">
//           <div className="cabecera">
//             <h2>
//               <span className="color-verde">TuOpiniónCuenta |</span>Gestión y
//               Seguimiento de F-PQRS
//             </h2>
//           </div>

//           {/* <BotonesFilters
//             activeStatusFilter={activeStatusFilter}
//             onStatusFilterClick={handleStatusFilterClick}
//           /> */}

//           <div className="header-top">
//             <PqrsFilters
//               filters={filters}
//               setFilters={(newFilters) => {
//                 setFilters(newFilters);
//                 setPagination((prev) => ({ ...prev, current_page: 1 })); // reinicia a página 1 al aplicar filtros
//               }}
//               onBuscar={() =>
//                 setPagination((prev) => ({ ...prev, current_page: 1 }))
//               }
//             />
//           </div>
//           {tienePermiso(["Administrador"]) && (
//             <div className="per-page-selector">
//               <label>Mostrar:</label>
//               <select
//                 className="mostrar"
//                 value={pagination.per_page}
//                 onChange={(e) => {
//                   const value = parseInt(e.target.value);
//                   setPagination((prev) => ({
//                     ...prev,
//                     per_page: value,
//                     current_page: 1, // Reinicia a la primera página si cambia la cantidad
//                   }));
//                 }}
//               >
//                 <option value={20}>20</option>
//                 <option value={40}>40</option>
//                 <option value={60}>60</option>
//                 <option value={10000}>Todas</option>{" "}
//                 {/* valor grande para representar "Todas" */}
//               </select>
//             </div>
//           )}

//           <div className="table-wrapper">
//             {selectedPqrs.size > 0 && (
//               <div className="bulk-assign-controls">
//                 <label>Asignar a:</label>
//                 {/* Contenedor principal del multiselect */}
//                 <div className="custom-multiselect">
//                   <div
//                     className="custom-select-box"
//                     onClick={() => setShowUserSelect(!showUserSelect)}
//                   >
//                     {/* Muestra los nombres de los usuarios seleccionados o un mensaje por defecto */}
//                     {usuarioAsignadoMasivo.length > 0
//                       ? usuarioAsignadoMasivo
//                         .map((id) => {
//                           const usuario = usuarios.find((u) => u.id === id);
//                           return usuario
//                             ? `${usuario.name} ${usuario.primer_apellido || ""
//                             }`
//                             : null;
//                         })
//                         .filter(Boolean) // Filtra IDs que no se encuentran
//                         .join(", ")
//                       : "Seleccione uno o más usuarios..."}
//                   </div>

//                   {showUserSelect && (
//                     <div className="checkbox-options">
//                       {/* Input de búsqueda */}
//                       <input
//                         type="text"
//                         placeholder="Buscar usuario..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="search-input"
//                       />

//                       {/* Lista de usuarios con checkboxes */}
//                       {usuarios
//                         .filter(
//                           (u) =>
//                             u.name
//                               .toLowerCase()
//                               .includes(searchTerm.toLowerCase()) ||
//                             (u.primer_apellido &&
//                               u.primer_apellido
//                                 .toLowerCase()
//                                 .includes(searchTerm.toLowerCase()))
//                         )
//                         .map((u) => (
//                           <label key={u.id} className="checkbox-item">
//                             <input
//                               type="checkbox"
//                               value={u.id}
//                               checked={usuarioAsignadoMasivo.includes(u.id)}
//                               onChange={(e) => {
//                                 const id = parseInt(e.target.value);
//                                 if (e.target.checked) {
//                                   // Agrega el ID al array si se selecciona
//                                   setUsuarioAsignadoMasivo([
//                                     ...usuarioAsignadoMasivo,
//                                     id,
//                                   ]);
//                                 } else {
//                                   // Elimina el ID del array si se deselecciona
//                                   setUsuarioAsignadoMasivo(
//                                     usuarioAsignadoMasivo.filter(
//                                       (userId) => userId !== id
//                                     )
//                                   );
//                                 }
//                               }}
//                             />
//                             {u.name} {u.segundo_nombre} {u.primer_apellido}{" "}
//                             {u.segundo_apellido}
//                           </label>
//                         ))}
//                     </div>
//                   )}
//                 </div>
//                 <button
//                   className="btn-asignar"
//                   onClick={() =>
//                     handleAsignacionMasiva({
//                       selectedPqrs,
//                       usuarioAsignadoMasivo,
//                       api,
//                       fetchPqrs,
//                       setSelectedPqrs,
//                       setUsuarioAsignadoMasivo,
//                       setShowUserSelect,
//                     })
//                   }
//                 >
//                   Asignar
//                 </button>
//                 <button
//                   className="btn-desasignar"
//                   onClick={() =>
//                     handleDesasignacionMasiva({
//                       selectedPqrs,
//                       usuarioAsignadoMasivo,
//                       fetchPqrs,
//                       setSelectedPqrs,
//                       setUsuarioAsignadoMasivo,
//                       setShowUserSelect,
//                     })
//                   }
//                 >
//                   Desasignar
//                 </button>
//               </div>
//             )}

//             <table className="container-table">
//               <thead>
//                 <tr>
//                   <th>
//                     {tienePermiso(["Administrador"]) && (
//                       <input type="checkbox" onChange={handleSelectAll} />
//                     )}
//                     Acciones
//                   </th>
//                   {/* <th>Asignación masiva</th> */}
//                   {/* <th>
//                     Asignación masiva
//                     <input type="checkbox" onChange={handleSelectAll} />
//                   </th> */}
//                   <th>Índice</th>
//                   <th># Radicado</th>
//                   <th>Fecha de solicitud</th>
//                   {/* <th>Fecha de registro</th> */}
//                   <th>Sede</th>
//                   <th>Tipo Solicitud</th>
//                   <th>Prioridad</th>
//                   <th>Estado de la PQR</th>
//                   <th>Tipo Doc.</th>
//                   <th>Número Doc.</th>
//                   <th>Nombres y Apellidos</th>
//                   {/* <th>Apellido</th> */}
//                   <th>EPS</th>
//                   <th>Servicio prestado</th>
//                   <th>Descripcion</th>
//                   <th>Atributo de calidad</th>
//                   <th>Asignado a</th>
//                   <th>Fecha de cierre</th>
//                   {/* <th>Clasificaciones</th> */}
//                   <th>Tiempo de respuesta PASSUS</th>
//                   {/* <th>Archivos</th> */}
//                   <th>Respuesta enviada a usuario</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {pqrs
//                   // 🔹 Primero filtramos según el rol
//                   .filter((pqr) => {
//                     const sedesUsuario = usuario.sedes || [];

//                     if (
//                       usuario.role === "Gestor" ||
//                       usuario.role === "Gestor Administrativo"
//                     ) {
//                       return sedesUsuario.includes(pqr.sede);
//                     }

//                     if (usuario.role === "Digitador") {
//                       return pqr.tipo_solicitud === "Solicitud";
//                     }

//                     return true; // otros roles ven todas
//                   })
//                   // 🔹 Luego calculamos el índice global descendente
//                   .map((pqr, index) => {
//                     const total = pagination?.total || pqrs.length;
//                     const currentPage = pagination?.current_page || 1;
//                     const perPage = pagination?.per_page || pqrs.length;

//                     const globalIndex =
//                       total - ((currentPage - 1) * perPage + index);

//                     return (
//                       <tr key={pqr.pqr_codigo}>
//                         <td>
//                           {tienePermiso([
//                             "Administrador",
//                             "Consultor",
//                             "Supervisor/Atencion al usuario",
//                             "Gestor",
//                             "Gestor Administrativo",
//                             "Digitador",
//                           ]) && (
//                               <button
//                                 onClick={() =>
//                                   navigate(`/pqrs/${pqr.pqr_codigo}`)
//                                 }
//                               >
//                                 <i className="fa fa-eye icono-ver"></i>
//                               </button>
//                             )}
//                           {tienePermiso(["Administrador"]) && (
//                             <input
//                               type="checkbox"
//                               checked={selectedPqrs.has(pqr.pqr_codigo)}
//                               onChange={() => handleSelectPqr(pqr.pqr_codigo)}
//                               disabled={
//                                 pqr.estado_respuesta === "Cerrado" ||
//                                 pqr.atributo_calidad == null
//                               }
//                             />
//                           )}
//                         </td>
//                         {/* <td>
//                           <input
//                             type="checkbox"
//                             checked={selectedPqrs.has(pqr.pqr_codigo)}
//                             onChange={() => handleSelectPqr(pqr.pqr_codigo)}
//                           />
//                         </td> */}
//                         <td>{globalIndex}</td>
//                         <td>
//                           {pqr.pqr_codigo}
//                         </td>
//                         <td>{pqr.fecha_inicio_real || pqr.created_at}</td>
//                         {/* <td>{new Date(pqr.created_at).toLocaleString()}</td> */}
//                         <td>{pqr.sede}</td>
//                         <td>{pqr.tipo_solicitud}</td>
//                         <td>{pqr.prioridad || "No asignada"}</td>
//                         <td>{pqr.estado_respuesta}</td>
//                         <td>{pqr.documento_tipo}</td>
//                         <td>{pqr.documento_numero}
//                           {/* 🌟 AQUÍ SE AGREGA EL BANDERÍN DE DUPLICIDAD 🌟 */}
//                           {pqr.es_duplicada && (
//                             <i
//                               className="fa-solid fa-clone icono-duplicada" // ¡Cambiado a fa-clone!
//                               title={`Atención: Esta PQR tiene duplicados asociados al documento ${pqr.documento_numero}.`}
//                             ></i>
//                           )}
//                         </td>
//                         <td>
//                           {pqr.nombre} {pqr.segundo_nombre} {pqr.apellido}{" "}
//                           {pqr.segundo_apellido}
//                         </td>
//                         <td>{pqr.eps}</td>
//                         <td>{pqr.servicio_prestado}</td>
//                         <td className="descripcion" title={pqr.descripcion}>
//                           {pqr.descripcion}
//                         </td>
//                         <td>{pqr.atributo_calidad}</td>
//                         <td className="pqr-status-cell">
//                           <ul className="pqr-status-list">
//                             {pqr.asignados?.map((usuario) => {
//                               const respondio = (pqr.respuestas ?? []).some(
//                                 (r) =>
//                                   r.user_id === usuario.id &&
//                                   r.es_respuesta_usuario === 0
//                               );

//                               return (
//                                 <li
//                                   key={usuario.id}
//                                   className="pqr-status-item"
//                                 >
//                                   <i
//                                     className={`fa-solid ${respondio
//                                       ? "fa-check pqr-icon success"
//                                       : "fa-clock pqr-icon pending"
//                                       }`}
//                                     title={
//                                       respondio
//                                         ? "Respuesta enviada"
//                                         : "Pendiente de respuesta"
//                                     }
//                                   ></i>
//                                   <span className="pqr-user-name">
//                                     {usuario.name} {usuario.segundo_nombre}{" "}
//                                     {usuario.primer_apellido}
//                                   </span>
//                                 </li>
//                               );
//                             })}
//                           </ul>
//                         </td>
//                         <td>{pqr.respondido_en}</td>
//                         {/* <td>
//                           {pqr.clasificaciones &&
//                           pqr.clasificaciones.length > 0 ? (
//                             pqr.clasificaciones.map((clasificacion) => (
//                               <span
//                                 key={clasificacion.id}
//                                 className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded mr-1"
//                               >
//                                 {clasificacion.nombre}
//                               </span>
//                             ))
//                           ) : (
//                             <em>Sin clasificaciones</em>
//                           )}
//                         </td> */}
//                         <td>
//                           {pqr.estado_respuesta === "Cerrado" ? (
//                             <span
//                               style={{ color: "#474646", fontStyle: "italic" }}
//                             >
//                               Finalizado
//                             </span>
//                           ) : pqr.deadline_interno ? (
//                             <CountdownTimer targetDate={pqr.deadline_interno} />
//                           ) : (
//                             <span
//                               style={{ color: "#474646", fontStyle: "italic" }}
//                             >
//                               No iniciado
//                             </span>
//                           )}
//                         </td>
//                         <td>
//                           {pqr.respuesta_enviada === 1
//                             ? "Enviada ✅"
//                             : "No enviada ❌"}
//                         </td>
//                       </tr>
//                     );
//                   })}
//               </tbody>
//             </table>
//           </div>

//           <nav className="paginacion">
//             <ul className="elementosPaginacion">
//               {/* Botón anterior */}
//               <li className="numero">
//                 <a
//                   href="#"
//                   onClick={(e) => {
//                     e.preventDefault();
//                     if (pagination.current_page > 1)
//                       handlePageChange(pagination.current_page - 1);
//                   }}
//                   className={pagination.current_page === 1 ? "disabled" : ""}
//                   aria-disabled={pagination.current_page === 1}
//                 >
//                   <i className="fa fa-chevron-left"></i>
//                 </a>
//               </li>

//               {/* Rango de paginación inteligente */}
//               {rangoDePaginacion(
//                 pagination.current_page,
//                 pagination.last_page
//               ).map((page, index) => (
//                 <li
//                   key={index}
//                   className={`numero ${page === pagination.current_page ? "active" : ""
//                     } ${page === "..." ? "disabled" : ""}`}
//                 >
//                   {page === "..." ? (
//                     <span className="ellipsis">...</span>
//                   ) : (
//                     <a
//                       href="#"
//                       onClick={(e) => {
//                         e.preventDefault();
//                         handlePageChange(page);
//                       }}
//                     >
//                       {page}
//                     </a>
//                   )}
//                 </li>
//               ))}

//               {/* Botón siguiente */}
//               <li className="numero">
//                 <a
//                   href="#"
//                   onClick={(e) => {
//                     e.preventDefault();
//                     if (pagination.current_page < pagination.last_page)
//                       handlePageChange(pagination.current_page + 1);
//                   }}
//                   className={
//                     pagination.current_page === pagination.last_page
//                       ? "disabled"
//                       : ""
//                   }
//                   aria-disabled={
//                     pagination.current_page === pagination.last_page
//                   }
//                 >
//                   <i className="fa fa-chevron-right"></i>
//                 </a>
//               </li>
//             </ul>
//           </nav>
//         </div>
//       </div>
//       <Version />
//     </>
//   );
// }

// export default PqrsList;

