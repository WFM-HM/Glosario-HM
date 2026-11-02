import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import type { Asegurabilidad as AsegurabilidadType, Page } from '../data/types'
import {
    deduplicateAsegurabilidades,
    filterAsegurabilidades
} from '../../../../shared/asegur/catalog'
import { emptyData } from '../shared_utils'

type HomeProps = {
    onNavigate: (page: Page) => void
}

function Asegurabilidad({ onNavigate }: HomeProps) {
    const [search, setSearch] = useState('')
    const { decryptedData } = useData()
    const data = decryptedData ?? emptyData
    
    const Asegurabilidades = useMemo(() => deduplicateAsegurabilidades(data.Asegurabilidad), [data.Asegurabilidad])
    const filteredAsegurabilidades = useMemo(
        () => filterAsegurabilidades(Asegurabilidades, { search }).sort((left, right) =>
            left.Nombre.localeCompare(right.Nombre, 'es', { sensitivity: 'base' })),
        [Asegurabilidades, search]
    )

    const clearFilters = () => {
        setSearch('')
    }

    const hasActiveFilters = false//Boolean(search)

    return (
        <section className="page-width glossary-page">
            <header className="glossary-hero">
                <div>
                    <p className="eyebrow">Catálogo de salud</p>
                    <h1>Asegurabilidad</h1>
                    <p className="section-intro">
                        Consulta servicios y paquetes de asegurabilidad.
                    </p>
                </div>
            </header>

            <div className="glossary-workspace">
                <aside className="glossary-sidebar">
                    <div className="glossary-sidebar__heading">
                        <span>Explorar</span>
                        <span className="glossary-sidebar__rule" />
                    </div>

                    <div className="search-box">
                        <span aria-hidden="true">⌕</span>
                        <input
                            id="Asegurabilidad-search"
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Nombre"
                        />
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
                                {filteredAsegurabilidades.length}{' '}
                                {filteredAsegurabilidades.length === 1 ? 'Asegurabilidad encontrada' : 'Asegurabilidades encontradas'}
                            </p>
                        </div>
                    </div>

                    {filteredAsegurabilidades.length === 0 ? (
                        <div className="empty-state">
                            <h2>No hay resultados</h2>
                            <p>Intenta modificar los filtros o realizar otra búsqueda.</p>
                        </div>
                    ) : (
                        <div className="checkups-grid">
                            {filteredAsegurabilidades.map((Asegurabilidad, index) => {

                                return (
                                    <article
                                        className="checkup-card Asegurabilidad-card"
                                        key={`${Asegurabilidad.id}-${index}`}
                                        onClick={() => {
                                            sessionStorage.setItem("asegur_item", JSON.stringify(Asegurabilidad))
                                            onNavigate('asegur_info')
                                        }}
                                    >
                                        <div className="checkup-card__main">
                                            <div>
                                                <p className="checkup-card__sku">Asegurabilidad</p>
                                                <h2>{Asegurabilidad.Nombre}</h2>
                                            </div>
                                        </div>
                                        <div className="checkup-card__meta">
                                            <span>{Asegurabilidad.Paquetes.length} {Asegurabilidad.Paquetes.length === 1 ? 'paquete' : 'paquetes'}</span>
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

export default Asegurabilidad