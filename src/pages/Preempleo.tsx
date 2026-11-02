import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import type { Preempleo, Page } from '../data/types'
import { filterPreempleos } from '../preempleos/catalog'
import { emptyData } from '../shared_utils'

type HomeProps = {
    onNavigate: (page: Page) => void
}

function Preempleo({ onNavigate }: HomeProps) {
    const [preempleoSearch, setPreempleoSearch] = useState('')
    const { decryptedData } = useData()
    const data = decryptedData ?? emptyData

    const preempleos = data.Preempleos
    const filteredPreempleos = useMemo(
        () => filterPreempleos(preempleos, { search: preempleoSearch }).sort((left, right) =>
            left.Nombre.localeCompare(right.Nombre, 'es', { sensitivity: 'base' })),
        [preempleos, preempleoSearch]
    )

    const navigateToPreempleos = (preempleo: Preempleo) => {
        sessionStorage.setItem('preempleo_item', JSON.stringify(preempleo))
        onNavigate('preempleo_info')
    }

    const clearFilters = () => {
        setPreempleoSearch('')
    }

    const hasActiveFilters = Boolean(preempleoSearch)

    return (
        <section className="page-width glossary-page">
            <header className="glossary-hero">
                <div>
                    <p className="eyebrow">Catálogo de salud</p>
                    <h1>Preempleo</h1>
                </div>
            </header>

            <div className="glossary-workspace">
                <aside className="glossary-sidebar">
                    <div className="glossary-sidebar__heading">
                        <span>Explorar</span>
                        <span className="glossary-sidebar__rule" />
                    </div>

                    <div className="preempleo-search">
                        <label className="search-label" htmlFor="preempleo-search">Buscar Preempleo</label>
                        <div className="search-box">
                            <span aria-hidden="true">⌕</span>
                            <input
                                id="preempleo-search"
                                type="search"
                                value={preempleoSearch}
                                onChange={(event) => setPreempleoSearch(event.target.value)}
                                placeholder="Nombre"
                            />
                        </div>
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
                                {filteredPreempleos.length}{' '}
                                {filteredPreempleos.length === 1 ? 'preempleo encontrado' : 'preempleos encontrados'}
                            </p>
                        </div>
                    </div>

                    {filteredPreempleos.length === 0 ? (
                        <div className="empty-state">
                            <h2>No hay resultados</h2>
                            <p>Intenta modificar los filtros o realizar otra búsqueda.</p>
                        </div>
                    ) : (
                        <div className="checkups-grid">
                            {filteredPreempleos.map((preempleo, index) => {

                                return (
                                    <article
                                        className="checkup-card preempleo-card"
                                        key={`${preempleo.id}-${index}`}
                                        onClick={() => navigateToPreempleos(preempleo)}
                                    >
                                        <div className="checkup-card__main">
                                            <div>
                                                <p className="checkup-card__sku">Preempleo</p>
                                                <h2>{preempleo.Nombre}</h2>
                                            </div>
                                        </div>
                                        <div className="checkup-card__meta">
                                            <span>
                                                {preempleo.Paquetes.length} {preempleo.Paquetes.length === 1 ? 'paquete' : 'paquetes'}
                                            </span>
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

export default Preempleo