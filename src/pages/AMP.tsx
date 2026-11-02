import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import type { AMP as AmpType, Page } from '../data/types'
import {
    deduplicateAmps,
    filterAmps,
    getAmpRelations
} from '../../../../shared/amps/catalog'
import { emptyData } from '../shared_utils'

type HomeProps = {
    onNavigate: (page: Page) => void
}

function AMP({ onNavigate }: HomeProps) {
    const [ampSearch, setAmpSearch] = useState('')
    const [diagnosisSearch, setDiagnosisSearch] = useState('')
    const { decryptedData } = useData()
    const data = decryptedData ?? emptyData

    const amps = useMemo(() => deduplicateAmps(data.AMPs), [data.AMPs])
    const filteredAmps = useMemo(
        () => filterAmps(amps, { search: ampSearch }).sort((left, right) =>
            left.Nombre.localeCompare(right.Nombre, 'es', { sensitivity: 'base' })),
        [amps, ampSearch]
    )
    const diagnosisResults = useMemo(() => {
        const query = diagnosisSearch.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '')

        if (!query) return []

        return amps
            .flatMap((amp) => getAmpRelations(amp, data).diagnoses
                .filter((diagnosis) => diagnosis.Nombre
                    .toLocaleLowerCase('es')
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .includes(query))
                .map((diagnosis) => ({
                    amp,
                    diagnosis,
                })))
            .sort((left, right) => left.diagnosis.Nombre.localeCompare(
                right.diagnosis.Nombre,
                'es',
                { sensitivity: 'base' }
            ))
    }, [amps, data, diagnosisSearch])

    const navigateToAmp = (amp: AmpType) => {
        sessionStorage.setItem('amp_item', JSON.stringify(amp))
        onNavigate('amp_info')
    }

    const clearFilters = () => {
        setAmpSearch('')
    }

    const hasActiveFilters = Boolean(ampSearch)

    return (
        <section className="page-width glossary-page">
            <header className="glossary-hero">
                <div>
                    <p className="eyebrow">Catálogo de salud</p>
                    <h1>AMP</h1>
                    <p className="section-intro">
                        Consulta protocolos y sus diagnósticos, coberturas y exclusiones.
                    </p>
                </div>
            </header>

            <div className="glossary-workspace">
                <aside className="glossary-sidebar">
                    <div className="glossary-sidebar__heading">
                        <span>Explorar</span>
                        <span className="glossary-sidebar__rule" />
                    </div>

                    <div className="amp-search">
                        <label className="search-label" htmlFor="amp-search">Buscar AMP</label>
                        <div className="search-box">
                            <span aria-hidden="true">⌕</span>
                            <input
                                id="amp-search"
                                type="search"
                                value={ampSearch}
                                onChange={(event) => setAmpSearch(event.target.value)}
                                placeholder="Nombre"
                            />
                        </div>
                    </div>

                    <div className="amp-search diagnosis-search">
                        <label className="search-label" htmlFor="diagnosis-search">Buscar diagnóstico</label>
                        <div className="search-box">
                            <span aria-hidden="true">⌕</span>
                            <input
                                id="diagnosis-search"
                                type="search"
                                value={diagnosisSearch}
                                onChange={(event) => setDiagnosisSearch(event.target.value)}
                                placeholder="Diagnóstico"
                                aria-controls="amp-diagnosis-results"
                                aria-expanded={Boolean(diagnosisSearch.trim())}
                            />
                        </div>

                        {diagnosisSearch.trim() && (
                            <div id="amp-diagnosis-results" className="amp-search-results" role="listbox" aria-label="Diagnósticos encontrados">
                                {diagnosisResults.length > 0 ? diagnosisResults.slice(0, 4).map(({ amp, diagnosis }) => (
                                    <button
                                        type="button"
                                        className="amp-search-result"
                                        key={`${amp.id}-${diagnosis.id}`}
                                        onClick={() => navigateToAmp(amp)}
                                    >
                                        <strong>{diagnosis.Nombre}</strong>
                                        <span>{amp.Nombre}</span>
                                    </button>
                                )) : (
                                    <p className="amp-search-results__empty">No hay diagnósticos con ese nombre.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {hasActiveFilters && (
                        <div className="checkup-filters">
                            <button type="button" className="filter-clear" onClick={clearFilters}>
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </aside>

                <section className="glossary-results">
                    <div className="results-header">
                        <div>
                            <span className="results-header__label">Resultados disponibles</span>
                            <p className="result-count">
                                {filteredAmps.length}{' '}
                                {filteredAmps.length === 1 ? 'AMP encontrada' : 'AMP encontradas'}
                            </p>
                        </div>
                    </div>

                    {filteredAmps.length === 0 ? (
                        <div className="empty-state">
                            <h2>No hay resultados</h2>
                            <p>Intenta modificar los filtros o realizar otra búsqueda.</p>
                        </div>
                    ) : (
                        <div className="checkups-grid">
                            {filteredAmps.map((amp, index) => {
                                const { diagnoses } = getAmpRelations(amp, data)

                                return (
                                    <article
                                        className="checkup-card amp-card"
                                        key={`${amp.id}-${index}`}
                                        onClick={() => navigateToAmp(amp)}
                                    >
                                        <div className="checkup-card__main">
                                            <div>
                                                <p className="checkup-card__sku">Protocolo de Atención Médica Primaria</p>
                                                <h2>{amp.Nombre}</h2>
                                            </div>
                                        </div>
                                        <div className="checkup-card__meta">
                                            {amp.Diagnosticos.length > 1 ? (
                                                <span>
                                                    {diagnoses.length} {diagnoses.length === 1 ? 'diagnóstico' : 'diagnósticos'}
                                                </span>
                                            ) : (<span>{amp.Diagnosticos.at(0)?.Nombre}</span>)}
                                        </div>
                                        <div className="checkup-card__action">
                                            Ver información <span aria-hidden="true">→</span>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    )}
                </section>
            </div>
        </section>
    )
}

export default AMP