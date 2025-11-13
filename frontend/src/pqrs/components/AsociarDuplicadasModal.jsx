// src/components/AsociarDuplicadasModal.jsx
import React, { useState, useEffect } from 'react'; 
import ReactDOM from 'react-dom';
import Swal from 'sweetalert2';
import '../styles/AsociarDuplicadasModal.css';
import api from '../../api/api';

const AsociarDuplicadasModal = ({ show, onClose, pqrsGrupo, pqrInicial, onSuccess }) => {
    if (!show) return null;

    const isWithinFourteenDays = (pqr) => {
        // Asegurarse de que la Maestra (pqrInicial) tenga una fecha de creación
        if (!pqrInicial || !pqrInicial.created_at || !pqr.created_at) return false;
        
        // No te compares a ti mismo (la PQR inicial) para el filtro de duplicadas
        if (pqr.id === pqrInicial.id) return true;

        const dateMaestra = new Date(pqrInicial.created_at);
        const dateDuplicada = new Date(pqr.created_at);

        // Diferencia absoluta en milisegundos
        const diffTime = Math.abs(dateMaestra.getTime() - dateDuplicada.getTime());
        // Diferencia absoluta en días (se redondea hacia arriba para ser inclusivo)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        // La diferencia debe ser de 7 días o menos.
        return diffDays <= 7;
    };
    
    // --- ESTADOS LOCALES PARA MANIPULACIÓN EN EL MODAL ---
    const [grupoLocal, setGrupoLocal] = useState(pqrsGrupo);
    
    // 2. Sincronizar el estado local con las props si cambian (ej. al reabrir)
    useEffect(() => {
        setGrupoLocal(pqrsGrupo);
        setMaestra(pqrInicial);
        // Reiniciar estados de selección al abrir
        setDuplicadasIds(new Set(
            pqrsGrupo.filter(p => p.id !== pqrInicial.id).map(p => p.id)
        ));
        setIdsToDesassociate(new Set());
    }, [pqrsGrupo, pqrInicial, show]);
    
    // --- ESTADOS DE ASOCIACIÓN ---
    const [maestra, setMaestra] = useState(pqrInicial);
    const [duplicadasIds, setDuplicadasIds] = useState(new Set(
        pqrsGrupo
            .filter(p => p.id !== pqrInicial.id)
            .map(p => p.id)
    ));
    const [loading, setLoading] = useState(false);

    // --- ESTADOS DE DESASOCIACIÓN ---
    // 🚀 CAMBIO: Filtrar por 'es_asociada' y que NO sea la PQR Maestra
    const pqrsAsociadas = grupoLocal.filter(p => p.es_asociada && p.id !== maestra.id); 
    const [idsToDesassociate, setIdsToDesassociate] = useState(new Set());


    // ------------------------------------
    // --- LÓGICA DE ASOCIACIÓN (OK) ---
    // ------------------------------------

    const handleToggleDuplicada = (id) => {
        setDuplicadasIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSelectMaestra = (pqr) => {
        // 🚀 CAMBIO: Usar es_asociada en lugar de estado_respuesta === 'Asociada'
        if (pqr.es_asociada && pqr.id !== maestra.id) { 
             Swal.fire('Atención', 'Una PQR ya asociada a otra Maestra no puede ser seleccionada como Maestra de un nuevo grupo.', 'warning');
             return;
        }
        if (duplicadasIds.has(pqr.id)) {
            handleToggleDuplicada(pqr.id); 
        }
        setMaestra(pqr);
    };

    const handleAsociar = async () => {
        if (!maestra) {
            Swal.fire('Error', 'Debe seleccionar una PQR Maestra.', 'error');
            return;
        }
        if (duplicadasIds.size === 0) {
            Swal.fire('Error', 'Debe seleccionar al menos una PQR duplicada para asociar.', 'error');
            return;
        }

        const duplicadasArray = Array.from(duplicadasIds);

        const confirmResult = await Swal.fire({
            title: '¿Está seguro de asociar?',
            html: `Se asociarán **${duplicadasArray.length}** PQRS a la Maestra **#${maestra.pqr_codigo}**. Las duplicadas serán marcadas como "Asociada".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, asociar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmResult.isConfirmed) return;

        setLoading(true);
        try {
            await api.post('/pqrs/asociar-duplicadas', {
                id_maestra: maestra.id,
                ids_duplicadas: duplicadasArray,
            });

            Swal.fire('Éxito', 'PQRS asociadas correctamente.', 'success');
            onSuccess();
        } catch (error) {
            console.error('Error al asociar PQRS:', error);
            Swal.fire('Error', error.response?.data?.error || 'No se pudo completar la asociación.', 'error');
        } finally {
            setLoading(false);
        }
    };
    
    // ----------------------------------------------------
    // --- LÓGICA DE DESASOCIACIÓN (CORREGIDA) 🚀 ---
    // ----------------------------------------------------

    const handleToggleDesassociate = (id) => {
        setIdsToDesassociate(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };
    
    const handleDesasociar = async () => {
        if (idsToDesassociate.size === 0) return;
        
        const idsArray = Array.from(idsToDesassociate);

        const result = await Swal.fire({ 
            title: '¿Seguro que quieres desasociar?',
            html: `Se desvincularán **${idsArray.length}** PQRS y volverán a estado 'Radicado'.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, desasociar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                await api.post('/pqrs/desasociar-duplicadas', {
                    ids_desasociar: idsArray
                });

                Swal.fire('¡Desasociadas!', `Las ${idsArray.length} PQRS han sido desvinculadas.`, 'success');

                // Actualizar el estado local: remover la PQR desasociada de la vista del modal
                setGrupoLocal(prevGrupo => 
                     prevGrupo.filter(pqr => !idsArray.includes(pqr.id))
                );
                setIdsToDesassociate(new Set()); 

                onSuccess(); 

            } catch (error) {
                console.error('Error al desasociar:', error);
                Swal.fire('Error de API', error.response?.data?.error || 'Ocurrió un error al comunicarse con el servidor.', 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    // --- CONTENIDO DEL MODAL (JSX) ---
    const modalJSX = (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>🔗 Asociar/Desasociar PQRS Duplicadas (Doc: {pqrInicial.documento_numero})</h2>
                    <button onClick={onClose} className="close-button" disabled={loading}>&times;</button>
                </div>
                
                <div className="modal-body">
                    
                    {/* SECCIÓN DE ASOCIACIÓN */}
                    <div className="asociacion-section">
                        <h3>Seleccionar Maestra y Duplicadas</h3>
                        <p className="modal-description">Seleccione la PQR Maestra (principal) y marque las que serán asociadas (duplicadas).</p>
                        
                        <ul className="pqrs-list-group">
        {grupoLocal
            // 🚀 CAMBIO: Filtrar por 'es_asociada' en lugar de estado_respuesta
            .filter(pqr => !pqr.es_asociada || pqr.id === maestra?.id)
            
            // 2. FILTRO DE TIEMPO
            .filter(pqr => isWithinFourteenDays(pqr)) 
            
            .map((pqr) => (
                <li 
                    key={pqr.id} 
                    // 🚀 CAMBIO: Usar la clase de solo lectura si 'es_asociada' es true
                    className={`pqr-item ${maestra?.id === pqr.id ? 'is-maestra' : ''} ${pqr.es_asociada ? 'is-asociada-readonly' : ''}`}
                >
                    
                    {/* Radio para seleccionar Maestra */}
                    <input
                        type="radio"
                        name="maestra"
                        checked={maestra?.id === pqr.id}
                        onChange={() => handleSelectMaestra(pqr)}
                        id={`maestra-${pqr.id}`}
                        // 🚀 CAMBIO: Deshabilitar el radio si ya está asociada (y no es la maestra actual)
                        disabled={pqr.es_asociada && pqr.id !== maestra.id} 
                    />
                    <label htmlFor={`maestra-${pqr.id}`} className="label-maestra">
                        Maestra: #{pqr.pqr_codigo}
                    </label>
                    
                    {/* Checkbox para marcar como Duplicada */}
                    <input
                        type="checkbox"
                        checked={duplicadasIds.has(pqr.id)}
                        onChange={() => handleToggleDuplicada(pqr.id)}
                        // 🚀 CAMBIO: Deshabilitar si ya es la maestra O si ya está asociada
                        disabled={maestra?.id === pqr.id || pqr.es_asociada || loading}
                        id={`duplicada-${pqr.id}`}
                    />
                    <label htmlFor={`duplicada-${pqr.id}`} className="label-duplicada">
                        Asociar
                    </label>
                    
                    <span className="pqr-detalle">
                        **Doc: {pqr.documento_numero}** | #{pqr.pqr_codigo} ({pqr.tipo_solicitud} - **{pqr.es_asociada ? 'ASOCIADA' : pqr.estado_respuesta}**)
                        <span title={pqr.descripcion}> | {pqr.descripcion.substring(0, 50)}...</span>
                    </span>
                </li>
            ))}
        </ul>
                    </div>

                    {/* SECCIÓN DE DESASOCIACIÓN */}
                    {pqrsAsociadas.length > 0 && (
                        <div className="desasociacion-section">
                            <h3>🔄 Deshacer Asociación</h3>
                            <p>Seleccione las PQRS que ya están marcadas como Asociadas para **desvincularlas**.</p>
                            
                            <ul className="pqrs-list-group">
                                {pqrsAsociadas.map((pqr) => (
                                    <li key={pqr.id} className="pqr-item is-asociada">
                                        <input
                                            type="checkbox"
                                            checked={idsToDesassociate.has(pqr.id)}
                                            onChange={() => handleToggleDesassociate(pqr.id)}
                                            id={`desasociar-${pqr.id}`}
                                            disabled={loading}
                                        />
                                        <label htmlFor={`desasociar-${pqr.id}`} className="label-desasociar">
                                            Desasociar
                                        </label>
                                        
                                        <span className="pqr-detalle">
                                            **Doc: {pqr.documento_numero}** | #{pqr.pqr_codigo}
                                            <span title={pqr.descripcion}> | {pqr.descripcion.substring(0, 50)}...</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            
                            <button 
                                onClick={handleDesasociar}
                                disabled={loading || idsToDesassociate.size === 0} 
                                className="btn-desasociar"
                            >
                                Desasociar ({idsToDesassociate.size}) Seleccionadas
                            </button>
                            <div style={{clear: 'both'}}></div>
                        </div>
                    )}

                </div>
                
                <div className="modal-footer">
                    <button onClick={onClose} disabled={loading} className="btn-cancel">Cancelar</button>
                    <button onClick={handleAsociar} disabled={loading || duplicadasIds.size === 0} className="btn-asociar">
                        {loading ? 'Asociando...' : `Asociar PQRS marcadas a #${maestra?.pqr_codigo || 'N/A'}`}
                    </button>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(
        modalJSX,
        document.getElementById('modal-root')
    );
};

export default AsociarDuplicadasModal;