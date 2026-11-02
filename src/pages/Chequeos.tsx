import { useMemo, useState, type CSSProperties } from 'react'
import { List, useDynamicRowHeight } from 'react-window'
import { useData } from '../context/DataContext'
import CheckupModal from '../components/CheckupModal'
import type { ChequeoMedico, Data } from '../data/types'
import {
  getAgeRangeLabel,
  filterCheckups,
  getUniqueNames,
  getCheckupRelations,
  getPriceOptions
} from '../../../../shared/checkups/catalog'
import { formatPrice, emptyData } from '../shared_utils'

type CheckupRowProps = {
  checkups: ChequeoMedico[]
  data: Data
  onSelect: (checkup: ChequeoMedico) => void
}

function CheckupRow({
  checkups,
  data,
  onSelect,
  index,
  style,
  ariaAttributes,
}: CheckupRowProps & {
  index: number
  style: CSSProperties
  ariaAttributes: {
    'aria-posinset': number
    'aria-setsize': number
    role: 'listitem'
  }
}) {
  const checkup = checkups[index]
  const { populationName } = getCheckupRelations(checkup, data)

  return (
    <article
      {...ariaAttributes}
      className="checkup-card"
      style={style}
      onClick={() => onSelect(checkup)}
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
}

function Glossary() {
  const [search, setSearch] = useState('')
  const [selectedPopulation, setSelectedPopulation] = useState<number | null>(null)
  const [selectedUniqueNames, setselectedUniqueNames] = useState<string[]>([])
  const [selectedPrice, setSelectedPrice] = useState('')
  const [selectedAgeMin, setSelectedAgeMin] = useState<number | null>(null)
  const [selectedAgeMax, setSelectedAgeMax] = useState<number | null>(null)
  const [selectedCheckup, setSelectedCheckup] = useState<ChequeoMedico | null>(null)
  const { decryptedData } = useData()
  const data = decryptedData ?? emptyData

  /*
   * Services sorted alphabetically.
   */
  const sortedUniqueNames = useMemo(() => getUniqueNames(data.Chequeos_medicos), [data.Chequeos_medicos])

  /*
   * Existing price + currency combinations.
   * There is NO currency conversion.
   */
  const priceOptions = useMemo(
    () => getPriceOptions(data.Chequeos_medicos),
    [data.Chequeos_medicos]
  )

  const ageSliderMin = 0
  const ageSliderMax = 100

  const visibleCheckups = data.Chequeos_medicos.filter(checkup => checkup.Visible === true)

  /*
   * Filter checkups.
   */
  const filteredCheckups = useMemo(() => {
    const result = filterCheckups(visibleCheckups, {
      search,
      population: selectedPopulation,
      name: selectedUniqueNames,
      price: selectedPrice,
      edad: {
        min: selectedAgeMin,
        max: selectedAgeMax,
      },
    })

    result.sort((a, b) =>
      a.Nombre < b.Nombre ? -1 :
        a.Nombre > b.Nombre ? 1 : 0
    )

    return result
  }, [
    search,
    selectedPopulation,
    selectedUniqueNames,
    selectedPrice,
    selectedAgeMin,
    selectedAgeMax,
    visibleCheckups,
  ])

  /*
   * Toggle an unique name/group.
   */
  const toggleUniqueName = (name: string) => {
    setselectedUniqueNames((current) =>
      current.includes(name)
        ? current.filter((id) => id !== name)
        : [...current, name]
    )
  }

  /*
   * Clear all filters.
   */
  const clearFilters = () => {
    setSearch('')
    setSelectedPopulation(null)
    setselectedUniqueNames([])
    setSelectedPrice('')
    setSelectedAgeMin(null)
    setSelectedAgeMax(null)
  }

  const hasActiveFilters =
    Boolean(search) ||
    selectedPopulation !== null ||
    selectedUniqueNames.length > 0 ||
    Boolean(selectedPrice) ||
    selectedAgeMin !== null ||
    selectedAgeMax !== null

  const ageMin = selectedAgeMin ?? ageSliderMin
  const ageMax = selectedAgeMax ?? ageSliderMax

  const rowHeight = useDynamicRowHeight({
    defaultRowHeight: 140,
    key: filteredCheckups.map(checkup => checkup.SKU || checkup.Nombre).join('|'),
  })

  const updateAgeMin = (value: number) => {
    setSelectedAgeMin(Math.min(value, ageMax))
  }

  const updateAgeMax = (value: number) => {
    setSelectedAgeMax(Math.max(value, ageMin))
  }

  return (
    <section className="page-width glossary-page">
      <header className="glossary-hero">
        <div>
          <p className="eyebrow">Catálogo de salud</p>

          <h1>Chequeos médicos</h1>

          <p className="section-intro">
            Encuentra opciones por población, edad, servicios y precio.
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
              id="checkup-search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Nombre o SKU"
            />
          </div>

          {/* Grupo o nombres únicos */}
          <div className="filter-control filter-control--services">
            <label htmlFor="services-filter">
              Empresa/Grupo de chequeo
            </label>

            <div className="services-dropdown">
              <details>
                <summary>
                  {selectedUniqueNames.length === 0
                    ? 'Todos'
                    : `${selectedUniqueNames.length} seleccionados`}
                </summary>

                <div className="services-dropdown__menu">
                  {sortedUniqueNames.map((group) => (
                    <label
                      key={group}
                      className="checkbox-option"
                      style={{ display: "flex" }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUniqueNames.includes(
                          group
                        )}
                        onChange={() =>
                          toggleUniqueName(group)
                        }
                      />

                      <span>{group}</span>
                    </label>
                  ))}
                </div>
              </details>
            </div>
          </div>

          <div className="checkup-filters">
            {/* Población */}
            <div className="filter-control">
              <label htmlFor="population-filter">
                Población
              </label>

              <select
                id="population-filter"
                value={selectedPopulation ?? ''}
                onChange={(event) => {
                  const value = event.target.value

                  setSelectedPopulation(
                    value === '' ? null : Number(value)
                  )
                }}
              >
                <option value="">Todas</option>

                {data.Poblacion.map((population) => (
                  <option
                    key={population.id}
                    value={population.id}
                  >
                    {population.Nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Edad 
            <div className="filter-control age-filter">
              <div className="age-filter__header">
                <label htmlFor="age-min-filter">
                  Rango de edad
                </label>

                <span aria-live="polite">
                  {ageMin} - {ageMax} años
                </span>
              </div>

              <div className="age-filter__slider">
                <div
                  className="age-filter__track"
                  style={{
                    left: `${ageMin}%`,
                    right: `${100 - ageMax}%`,
                  }}
                />

                <input
                  id="age-min-filter"
                  type="range"
                  min={ageSliderMin}
                  max={ageSliderMax}
                  value={ageMin}
                  onChange={(event) => updateAgeMin(Number(event.target.value))}
                  aria-label="Edad mínima"
                />

                <input
                  id="age-max-filter"
                  type="range"
                  min={ageSliderMin}
                  max={ageSliderMax}
                  value={ageMax}
                  onChange={(event) => updateAgeMax(Number(event.target.value))}
                  aria-label="Edad máxima"
                />
              </div>
            </div>
            */}
            
            {/* Precio */}
            <div className="filter-control">
              <label htmlFor="price-filter">
                Precio
              </label>

              <select
                id="price-filter"
                value={selectedPrice}
                onChange={(event) =>
                  setSelectedPrice(event.target.value)
                }
              >
                <option value="">
                  Todos
                </option>

                {priceOptions.map((option) => {
                  const value =
                    `${option.currency}|${option.price}`

                  return (
                    <option
                      key={value}
                      value={value}
                    >
                      {formatPrice(
                        option.price,
                        option.currency
                      )}
                    </option>
                  )
                })}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="filter-clear"
                onClick={clearFilters}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </aside>

        <section className="glossary-results">
          <div className="results-header">
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

          {filteredCheckups.length === 0 ? (
            <div className="empty-state">
              <h2>No hay resultados</h2>

              <p>
                Intenta modificar los filtros o realizar
                otra búsqueda.
              </p>
            </div>
          ) : (
            <List
              className="checkups-list"
              defaultHeight={600}
              overscanCount={4}
              rowComponent={CheckupRow}
              rowCount={filteredCheckups.length}
              rowHeight={rowHeight}
              rowKey={(index) =>
                filteredCheckups[index].SKU || `checkup-${index}`
              }
              rowProps={{
                checkups: filteredCheckups,
                data,
                onSelect: setSelectedCheckup,
              }}
            />
          )}
        </section>
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

export default Glossary
