import { useEffect, useMemo, useRef, useState } from 'react'
import { useData } from '../context/DataContext'
import SwitchComponent from '../components/switch'
import type { AMP, AMP as AmpType, Page } from '../data/types'
import {
    getAmpRelations
} from '../../../../shared/amps/catalog'
import { emptyData } from '../shared_utils'

type HomeProps = {
    onNavigate: (page: Page) => void
}

function AMP_info({ onNavigate }: HomeProps) {
    const [search, setSearch] = useState('')
    const [visibleSKU, setVisibleSKU] = useState(false)
    const [selectedAmp, setSelectedAmp] = useState<AmpType | null>(null)
    const hasReadAmp = useRef(false)
    const { decryptedData } = useData()
    const data = decryptedData ?? emptyData

    const relations = useMemo(
        () => selectedAmp ? getAmpRelations(selectedAmp, data) : null,
        [selectedAmp, data]
    )

    const filteredDiagnoses = useMemo(() => {
        if (!relations) return []

        const query = search.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '')

        return relations.diagnoses.filter((diagnosis) => {
            const searchableText = [diagnosis.Nombre, ...diagnosis.Sintomas]
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
        if (hasReadAmp.current) return
        hasReadAmp.current = true

        const ampTemp = sessionStorage.getItem('amp_item');

        if (ampTemp) {
            try {
                const object: AMP = JSON.parse(ampTemp)
                setSelectedAmp(object);
                sessionStorage.removeItem('amp_item');
            } catch {
                sessionStorage.removeItem('amp_item');
                onNavigate('amp');
            }
        } else {
            onNavigate('amp');
        }
    }, [onNavigate]);

    return (
        <section className="page-width glossary-page">
            <header className="amp-detail-hero">
                <button type="button" className="amp-detail-back" onClick={() => onNavigate('amp')}>
                    <span aria-hidden="true">←</span> Catálogo AMP
                </button>

                <div className="amp-detail-hero__main">
                    <p className="eyebrow">Protocolo de Atención Médica Primaria</p>
                    <h1>{selectedAmp?.Nombre ?? 'AMP'}</h1>
                </div>

                {selectedAmp && relations && (
                    <div className="amp-detail-hero__stats" aria-label="Resumen del protocolo">
                        <div>
                            <strong>{relations.diagnoses.length}</strong>
                            <span>diagnósticos</span>
                        </div>
                    </div>
                )}
            </header>

            <div className="amp-detail-layout">
                {selectedAmp && relations && (
                    <>
                        <aside className="amp-detail-context">
                            <div className="amp-detail-context__heading">
                                <span>Información del protocolo</span>
                            </div>

                            <div className="amp-detail-overview">
                                {relations.coverageNames.length > 0 && (
                                    <div className="checkup-modal__section">
                                        <h3 className="amp-detail-section-title">Notas de cobertura</h3>
                                        <ul className="checkup-locations">
                                            {relations.coverageNames.map((coverage, index) => (
                                                <li key={`${coverage.name}-${index}`}>
                                                    <strong>{coverage.name}</strong>
                                                    {coverage.note !== coverage.name && `: ${coverage.note}`}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {relations.sedes.length > 0 && (
                                    <div className="checkup-modal__section">
                                        <h3 className="amp-detail-section-title">Sedes aplicables</h3>

                                        <ul className="checkup-locations">
                                            {relations.sedes.map((name) => (
                                                <li key={name}>{name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {selectedAmp.Notas.length > 0 && (
                                    <div className="checkup-modal__section">
                                        <h3 className="amp-detail-section-title">Notas</h3>
                                        <ul className="amp-detail-list">
                                            {selectedAmp.Notas.map((note, index) => <li key={`${note}-${index}`}>{note}</li>)}
                                        </ul>
                                    </div>
                                )}

                                {selectedAmp.Exclusiones.length > 0 && (
                                    <div className="checkup-modal__section checkup-modal__notes">
                                        <h3 className="amp-detail-section-title">Exclusiones</h3>
                                        <ul className="amp-detail-list">
                                            {selectedAmp.Exclusiones.map((exclusion, index) => <li key={`${exclusion}-${index}`}>{exclusion}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </aside>

                        <section className="amp-diagnosis-panel">
                            <div className="amp-detail-toolbar">
                                <div className="amp-diagnosis-panel__header">
                                    <div>
                                        <h2>Diagnósticos</h2>
                                    </div>
                                </div>
                                <div className="amp-detail-toolbar__search">
                                    <div className="search-box">
                                        <span aria-hidden="true">⌕</span>
                                        <input
                                            id="diagnosis-search"
                                            type="search"
                                            value={search}
                                            onChange={(event) => setSearch(event.target.value)}
                                            placeholder="Buscar diagnóstico por nombre o síntomas"
                                        />
                                    </div>

                                    {search && (
                                        <button type="button" className="filter-clear" onClick={clearFilters}>
                                            Limpiar
                                        </button>
                                    )}
                                </div>

                                <SwitchComponent
                                    textOn="Ocultar SKUs (Click en un SKU para copiarlo)"
                                    textOff="Ver SKUs"
                                    value={visibleSKU}
                                    onChange={() => setVisibleSKU(!visibleSKU)}
                                />
                            </div>

                            {filteredDiagnoses.length > 0 ? (
                                <div className="amp-diagnoses">
                                    {filteredDiagnoses.map((diagnosis, index) => (
                                        <article key={diagnosis.id} className="amp-diagnosis">
                                            <div className="amp-diagnosis__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
                                            <div>
                                                <h4>{diagnosis.Nombre}</h4>
                                                {diagnosis.Sintomas.length > 0 && (
                                                    <>
                                                        Sintomas
                                                        <p>{diagnosis.Sintomas.join(' · ')}</p>
                                                    </>
                                                )}
                                                {diagnosis.Sintomas.length === 0 && (
                                                    <p>No hay sintomas registrados</p>
                                                )}
                                                {diagnosis.coverageGroups.length > 0 && (
                                                    <div className="amp-coverage-groups" aria-label="Coberturas">
                                                        <h5 style={{margin: "4px"}}>Coberturas</h5>
                                                        {diagnosis.coverageGroups.map((group) => (
                                                            <section key={group.categoryName} className="amp-coverage-group">
                                                                <h5>{group.categoryName}</h5>
                                                                <ul aria-label={`Servicios de ${group.categoryName}`}>
                                                                    {group.coverages.map((coverage, index) => {
                                                                        const service = data.Servicios.find(
                                                                            (item) => item.id === coverage.serviceId
                                                                        )

                                                                        return (
                                                                            <li key={`${coverage.serviceId}-${index}`}>
                                                                                <span>{coverage.name}</span>
                                                                                {coverage.detail && (
                                                                                    <span> — {coverage.detail}</span>
                                                                                )}
                                                                                {visibleSKU && service?.SKU && (
                                                                                    <button
                                                                                        type="button"
                                                                                        className="service-tag__sku"
                                                                                        onClick={() => navigator.clipboard.writeText(service.SKU)}
                                                                                        title="Copiar SKU"
                                                                                    >
                                                                                        SKU: {service.SKU}
                                                                                    </button>
                                                                                )}
                                                                            </li>
                                                                        )
                                                                    })}
                                                                </ul>
                                                            </section>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <h2>No hay diagnósticos</h2>
                                    <p>Intenta modificar la búsqueda para encontrar otro diagnóstico.</p>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </section>
    )
}

export default AMP_info