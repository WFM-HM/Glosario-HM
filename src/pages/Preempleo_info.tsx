import { useEffect, useMemo, useRef, useState } from 'react'
import { useData } from '../context/DataContext'
import type { Preempleo, Page, ChequeoMedico } from '../data/types'
import CheckupModal from '../components/CheckupModal'
import { getPreempleoRelations } from '../preempleos/catalog'
import { getAgeRangeLabel, getCheckupRelations } from '../checkups/catalog'

import { formatPrice, emptyData } from '../shared_utils'

type HomeProps = {
    onNavigate: (page: Page) => void
}

function Preempleo_info({ onNavigate }: HomeProps) {
    const [search, setSearch] = useState('')
    const [selectedPreempleo, setSelectedPreempleo] = useState<Preempleo | null>(null)
    const [selectedCheckup, setSelectedCheckup] = useState<ChequeoMedico | null>(null)
    const hasReadPreempleo = useRef(false)
    const { decryptedData } = useData()
    const data = decryptedData ?? emptyData

    const relations = useMemo(
        () => selectedPreempleo ? getPreempleoRelations(selectedPreempleo, data) : null,
        [selectedPreempleo, data]
    )

    const filteredCheckups = useMemo(() => {
        if (!relations) return []

        const query = search.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '')

        return relations.chequeos.filter((chequeo) => {
            const searchableText = [chequeo.Nombre, chequeo.Grupo, chequeo.SKU]
                .join(' ')
                .toLocaleLowerCase('es')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')

            return searchableText.includes(query)
        })
    }, [relations, search])

    const clearFilters = () => {
        setSearch('')
    }

    useEffect(() => {
        if (hasReadPreempleo.current) return
        hasReadPreempleo.current = true

        const preempleoTemp = sessionStorage.getItem('preempleo_item');

        if (preempleoTemp) {
            try {
                const object: Preempleo = JSON.parse(preempleoTemp)
                setSelectedPreempleo(object);
                sessionStorage.removeItem('amp_item');
            } catch {
                sessionStorage.removeItem('amp_item');
                onNavigate('preempleos');
            }
        } else {
            onNavigate('preempleos');
        }
    }, [onNavigate]);

    return (
        <section className="page-width glossary-page">
            <header className="amp-detail-hero">
                <button type="button" className="amp-detail-back" onClick={() => onNavigate('preempleos')}>
                    <span aria-hidden="true">←</span> Catálogo Preempleo
                </button>

                <div className="amp-detail-hero__main">
                    <p className="eyebrow">Información de Preempleo</p>
                    <h1>{selectedPreempleo?.Nombre ?? 'Preempleo'}</h1>
                </div>

                {selectedPreempleo && relations && (
                    <div className="amp-detail-hero__stats" aria-label="Resumen del protocolo">
                        <div>
                            <strong>{relations.chequeos.length}</strong>
                            <span>diagnósticos</span>
                        </div>
                    </div>
                )}
            </header>

            <div className="amp-detail-layout">
                {selectedPreempleo && relations && (
                    <>
                        <aside className="amp-detail-context">
                            <div className="amp-detail-context__heading">
                                <span>Información del preempleo</span>
                            </div>

                            <div className="amp-detail-overview">
                                <div className="checkup-modal__section">
                                    <h3 className="amp-detail-section-title">Agenda</h3>
                                    <ul className="amp-detail-list">
                                        <li>{selectedPreempleo.Agenda}</li>
                                    </ul>
                                </div>

                                {relations.sedes.length > 0 && (
                                    <div className="checkup-modal__section">
                                        <h3 className="amp-detail-section-title">Agendamiento por sedes</h3>

                                        <ul className="amp-detail-list">
                                            {relations.sedes.map((sede) => (
                                                <li className="checkup-detail" key={sede.f_id}>
                                                    <strong>{sede.nombre}</strong>
                                                    <span>
                                                        <span className="checkup-detail__label">Agenda: </span>
                                                        {sede.Agendar}
                                                    </span>
                                                    <span >
                                                        <span className="checkup-detail__label">Tiempo: </span>
                                                        {sede.Tiempo}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {selectedPreempleo.Encargado.length > 0 && (
                                    <div className="checkup-modal__section">
                                        <h3 className="amp-detail-section-title">Encargado de agendamiento</h3>
                                        <ul className="amp-detail-list">
                                            <li>{selectedPreempleo.Encargado}</li>
                                        </ul>
                                    </div>
                                )}

                                {selectedPreempleo.MedioIngreso.length > 0 && (
                                    <div className="checkup-modal__section checkup-modal__notes">
                                        <h3 className="amp-detail-section-title">Medio de ingreso de la solicitud</h3>
                                        <ul className="amp-detail-list">
                                            <li>{selectedPreempleo.MedioIngreso}</li>
                                        </ul>
                                    </div>
                                )}

                                {selectedPreempleo.Comentario.length > 0 && (
                                    <div className="checkup-modal__section checkup-modal__notes">
                                        <h3 className="amp-detail-section-title">Comentario a agregar en la información de la cita</h3>
                                        <ul className="amp-detail-list">
                                            <li>{selectedPreempleo.Comentario}</li>
                                        </ul>
                                    </div>
                                )}

                                {selectedPreempleo.Extras.map((extra) => (
                                    <div className="checkup-modal__section checkup-modal__notes">
                                        <h3 className="amp-detail-section-title">{extra.Nombre}</h3>
                                        <ul className="amp-detail-list">
                                            <li>{extra.Contenido}</li>
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </aside>

                        <section className="amp-diagnosis-panel glossary-results">
                            <div className="amp-detail-toolbar">
                                <div className="amp-diagnosis-panel__header">
                                    <div>
                                        <h2>Paquetes de chequeos</h2>
                                    </div>
                                </div>
                                <div className="search-box">
                                    <span aria-hidden="true">⌕</span>
                                    <input
                                        id="diagnosis-search"
                                        type="search"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Buscar paquete por nombre o SKU"
                                    />
                                </div>

                                {search && (
                                    <button type="button" className="filter-clear" onClick={clearFilters}>
                                        Limpiar
                                    </button>
                                )}
                            </div>

                            <div className="results-header" style={{ "paddingLeft": "8px" }}>
                                <div>
                                    <span className="results-header__label">Resultados disponibles</span>
                                    <p className="result-count">
                                        {filteredCheckups.length}{' '}
                                        {filteredCheckups.length === 1
                                            ? 'chequeo encontrado'
                                            : 'chequeos encontrados'}
                                    </p>
                                </div>
                            </div>

                            {filteredCheckups.length > 0 ? (
                                <div className="checkups-grid" style={{ "background": "var(--paper)" }}>
                                    {filteredCheckups.map((checkup, index) => {
                                        const { populationName } = getCheckupRelations(checkup, data)

                                        return (
                                            <article
                                                className="checkup-card"
                                                key={`${checkup.SKU || 'checkup'}-${index}`}
                                                onClick={() =>
                                                    setSelectedCheckup(checkup)
                                                }
                                            >
                                                <div className="checkup-card__main">
                                                    <div>
                                                        <p className="checkup-card__sku">
                                                            SKU: {checkup.SKU}
                                                        </p>

                                                        <h2>{checkup.Nombre}</h2>
                                                    </div>
                                                </div>

                                                <div className="checkup-card__price">
                                                    {formatPrice(
                                                        checkup.Precio,
                                                        checkup.Moneda
                                                    )}
                                                </div>

                                                <div className="checkup-card__meta">
                                                    <span>{populationName || 'Grupo no especificado'}</span>

                                                    <span>
                                                        {getAgeRangeLabel(checkup.EdadMin, checkup.EdadMax)}
                                                    </span>
                                                </div>

                                                <div className="checkup-card__action">
                                                    Ver información
                                                    <span aria-hidden="true">→</span>
                                                </div>
                                            </article>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <h2>No hay chequeos</h2>
                                    <p>Intenta modificar la búsqueda para encontrar otro chequeo.</p>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
            <CheckupModal
                isOpen={Boolean(selectedCheckup)}
                onClose={() => setSelectedCheckup(null)}
                checkup={selectedCheckup}
                data={data}
            />
        </section>
    )
}

export default Preempleo_info