import { useMemo, useState, useEffect, useRef } from 'react'
import { useData } from '../context/DataContext'
import Modal from '../components/modal'
import type { Asegurabilidad, PaqueteAsegurabilidad, Page, ServicioItem } from '../data/types'
import SwitchComponent from '../components/switch'
import {
  filterPaquetes,
  deduplicatePaquetes,
  sortCatalog,
  getPriceOptions
} from '../../../../shared/asegur/catalog'
import { formatPrice, emptyData } from '../shared_utils'

type HomeProps = {
  onNavigate: (page: Page) => void
}

function Asegurabilidad_info({ onNavigate }: HomeProps) {

  const [search, setSearch] = useState('')
  const [viewServices, setViewServices] = useState(false)
  const hasReadAsegurabilidad = useRef(false)
  const [selectedServices, setSelectedServices] = useState<number[]>([])
  const [selectedPrice, setSelectedPrice] = useState('')
  const [selectedAsegurabilidad, setSelectedAsegurabilidad] = useState<Asegurabilidad>()
  const [selectedPaquete, setSelectedPaquete] = useState<PaqueteAsegurabilidad | null>(null)
  const [selectedService, setSelectedService] = useState<ServicioItem>()
  const [visibleSKU, setVisibleSKU] = useState(false)
  const { decryptedData } = useData()
  const data = decryptedData ?? emptyData

  useEffect(() => {
    if (hasReadAsegurabilidad.current) return
    hasReadAsegurabilidad.current = true

    const asegurTemp = sessionStorage.getItem('asegur_item');

    if (asegurTemp) {
      try {
        const object: Asegurabilidad = JSON.parse(asegurTemp)
        setSelectedAsegurabilidad(object);
        setViewServices((object.Paquetes.length === 0))
        sessionStorage.removeItem('asegur_item');
      } catch {
        sessionStorage.removeItem('asegur_item');
        onNavigate('asegur');
      }
    } else {
      onNavigate('asegur');
    }
  }, [onNavigate]);

  /*
   * Services sorted alphabetically.
   */
  const sortedServices = useMemo(() => sortCatalog(data.Servicios), [data.Servicios])

  const deduplicatedPaquetes = useMemo(
    () => deduplicatePaquetes(selectedAsegurabilidad?.Paquetes ?? []),
    [selectedAsegurabilidad?.Paquetes]
  )

  /*
   * Existing price + currency combinations.
   *
   * There is NO currency conversion.
   */
  const priceOptions = useMemo(
    () => getPriceOptions(deduplicatedPaquetes),
    [deduplicatedPaquetes]
  )

  const toggleView = (value: boolean) => {
    // If the value is a new one, change and clear filters
    if (value != viewServices) {
      setViewServices(value)
      clearFilters()
    }
  }

  /*
   * Filter paquetes.
   */
  const filteredPaquetes = useMemo(
    () => filterPaquetes(deduplicatedPaquetes, {
      search,
      services: selectedServices,
      price: selectedPrice
    }),
    [
      search,
      selectedServices,
      selectedPrice,
      deduplicatedPaquetes,
    ]
  )

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase()
    const serviceNames = new Map(
      data.Servicios.map((service) => [service.id, service.Nombre])
    )

    return (selectedAsegurabilidad?.Servicios ?? [])
      .map((service) => ({
        ...service,
        Nombre: serviceNames.get(service.f_id) ?? `Servicio ${service.f_id}`,
      }))
      .filter((service) =>
        !query || service.Nombre.toLowerCase().includes(query)
      )
  }, [data.Servicios, search, selectedAsegurabilidad?.Servicios])

  /*
   * Clear all filters.
   */
  const clearFilters = () => {
    setSearch('')
    setSelectedServices([])
    setSelectedPrice('')
  }

  const hasActiveFilters =
    Boolean(search) ||
    selectedServices.length > 0 ||
    Boolean(selectedPrice)

  const serviceClicked = (name: string) => {
    const service = data.Servicios.find((item) => item.Nombre === name)

    if (!service || service.Docs.length === 0) return

    if (service.Docs.length === 1) {
      window.open(service.Docs[0].URL, '_blank', 'noopener,noreferrer')
      return
    }

    setSelectedPaquete(null)
    setSelectedService(service)
  }

  return (
    <section className="page-width glossary-page">
      <header className="amp-detail-hero">
        <button type="button" className="amp-detail-back" onClick={() => onNavigate('asegur')}>
          <span aria-hidden="true">←</span> Catálogo Asegurabilidades
        </button>

        <div className="amp-detail-hero__main">
          <p className="eyebrow">Asegurabilidad</p>
          <h1>{selectedAsegurabilidad?.Nombre ?? 'AMP'}</h1>
        </div>

        {selectedAsegurabilidad && (
          <div className="amp-detail-hero__stats" aria-label="Resumen del protocolo">
            <div>
              <strong>{selectedAsegurabilidad.Paquetes.length}</strong>
              <span>paquetes activo</span>
            </div>
            <div>
              <strong>{selectedAsegurabilidad.Servicios.length}</strong>
              <span>servicios individuales</span>
            </div>
          </div>
        )}
      </header>

      {selectedAsegurabilidad?.Notas?.trim() && (
        <aside className="asegurabilidad-note" aria-label="Notas importantes">
          <span className="asegurabilidad-note__label">Nota importante</span>
          <p>{selectedAsegurabilidad.Notas}</p>
        </aside>
      )}

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
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder={viewServices ? 'Nombre del servicio' : 'Nombre del paquete'}
            />
          </div>

          <div className="Asegurabilidad-filters">
            { /* Tipo de datos */}

            <div className="view-toggle" role="group" aria-label="Tipo de catálogo">
              <button
                type="button"
                className="view-toggle__button"
                aria-pressed={!viewServices}
                onClick={() => toggleView(false)}
              >
                Paquetes
              </button>

              <button
                type="button"
                className="view-toggle__button"
                aria-pressed={viewServices}
                onClick={() => toggleView(true)}
              >
                Servicios
              </button>
            </div>
            {viewServices === true ? null : (
              // Ui for Paquetes
              <>
                {/* Incluye 
                <div className="filter-control filter-control--services">
                  <label htmlFor="services-filter">
                    Incluye
                  </label>

                  <div className="services-dropdown">
                    <details>
                      <summary>
                        {selectedServices.length === 0
                          ? 'Todos'
                          : `${selectedServices.length} seleccionados`}
                      </summary>

                      <div className="services-dropdown__menu">
                        {sortedServices.map((service) => (
                          <label
                            key={service.id}
                            className="checkbox-option"
                            style={{ display: "flex" }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedServices.includes(
                                service.id
                              )}
                              onChange={() =>
                                toggleService(service.id)
                              }
                            />

                            <span>{service.Nombre}</span>
                          </label>
                        ))}
                      </div>
                    </details>
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
              </>
            )
            }

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
                {viewServices ? filteredServices.length : filteredPaquetes.length}{' '}
                {viewServices
                  ? filteredServices.length === 1
                    ? 'servicio encontrado'
                    : 'servicios encontrados'
                  : filteredPaquetes.length === 1
                    ? 'paquete encontrado'
                    : 'paquetes encontrados'}
              </p>
            </div>
          </div>

          {(viewServices ? filteredServices.length : filteredPaquetes.length) === 0 ? (
            <div className="empty-state">
              <h2>No hay resultados</h2>

              <p>
                Intenta modificar los filtros o realizar
                otra búsqueda.
              </p>
            </div>
          ) : viewServices ? (
            <div className="checkups-grid">
              {filteredServices.map((service) => {
                const _service = data.Servicios.find((item) => item.id === service.f_id)
                const _hasDocs = Boolean(_service?.Docs.length)
                return (
                  <article
                    className="checkup-card"
                    key={service.f_id}
                    onClick={() => serviceClicked(service.Nombre)}
                  >
                    <div className="checkup-card__main">
                      <div>
                        <p className="checkup-card__sku">Servicio individual</p>
                        <h2>{_hasDocs ? service.Nombre.concat("↗") : service.Nombre}</h2>
                      </div>
                    </div>

                    <div className="checkup-card__price">
                      {formatPrice(service.Precio, service.Moneda)}
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="checkups-grid">
              {filteredPaquetes.map((paquete, index) => {
                return (
                  <article
                    className="checkup-card"
                    key={`${paquete.SKU || 'Asegurabilidad'}-${index}`}
                    onClick={() =>
                      setSelectedPaquete(paquete)
                    }
                  >
                    <div className="checkup-card__main">
                      <div>
                        <p className="checkup-card__sku">
                          SKU: {paquete.SKU}
                        </p>

                        <h2>{paquete.Nombre}</h2>
                      </div>
                    </div>

                    <div className="checkup-card__price">
                      {formatPrice(
                        paquete.Precio,
                        paquete.Moneda
                      )}
                    </div>

                    <div className="checkup-card__action">
                      Ver información
                      <span aria-hidden="true">→</span>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <Modal
        isOpen={Boolean(selectedPaquete)}
        onClose={() => setSelectedPaquete(null)}
        eyebrow="Paquete de asegurabilidad"
        title={selectedPaquete?.Nombre}
      >
        {selectedPaquete && (() => {
          const serviceLookup = new Map(
            data.Servicios.map((service) => [service.id, service.Nombre])
          )
          const serviceNames = selectedPaquete.Servicios
            .map((serviceId) => serviceLookup.get(serviceId))
            .filter((name): name is string => Boolean(name))

          return (
            <div className="checkup-modal">
              <div className="checkup-modal__price">
                <span>Precio</span>

                <strong>
                  {formatPrice(
                    selectedPaquete.Precio,
                    selectedPaquete.Moneda
                  )}
                </strong>
              </div>

              <div className="checkup-modal__details">
                <div>
                  <span>SKU</span>

                  <strong>
                    {selectedPaquete.SKU || '—'}
                  </strong>
                </div>
              </div>

              {serviceNames.length > 0 && (
                <div className="checkup-modal__section">
                  <h3>Incluye</h3>
                  <SwitchComponent
                    textOn='Ocultar SKUs (Click en un SKU para copiarlo)'
                    textOff='Ver SKUs'
                    value={visibleSKU}
                    onChange={() => setVisibleSKU(!visibleSKU)} />
                  <ul className="checkup-tags">
                    {serviceNames.sort(
                      (left, right) =>
                        left.localeCompare(right, 'es', { sensitivity: 'base' })
                    ).map((name) => {
                      const service = data.Servicios.find((item) => item.Nombre === name)
                      const hasDocs = Boolean(service?.Docs.length)

                      return (
                        <li key={name}>
                          <button
                            type="button"
                            className={hasDocs ? 'service-tag service-tag--available' : 'service-tag service-tag--unavailable'}
                            onClick={() => serviceClicked(name)}
                            title={hasDocs ? 'Ver documentos disponibles' : 'No hay documentos disponibles'}
                          >
                            {name}
                            <span
                              className="service-tag__icon"
                              aria-label={hasDocs ? 'Documentos disponibles' : 'Sin documentos disponibles'}
                            >
                              {hasDocs ? '↗' : ''}
                            </span>
                          </button>
                          {visibleSKU && service?.SKU && (
                            <button
                              type="button"
                              className="service-tag__sku"
                              onClick={() => {
                                navigator.clipboard.writeText(service.SKU)
                              }}
                              title="Copiar SKU"
                            >
                              SKU: {service.SKU}
                            </button>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {selectedPaquete?.Notas_importantes && (
                <div className="checkup-modal__section checkup-modal__notes">
                  <h3>Notas importantes</h3>

                  <p>
                    {selectedPaquete.Notas_importantes}
                  </p>
                </div>
              )}
            </div>
          )
        })()}
      </Modal>

      <Modal
        isOpen={Boolean(selectedService)}
        onClose={() => setSelectedService(undefined)}
        eyebrow="Documentos disponibles"
        title={selectedService?.Nombre}
      >
        {selectedService && (
          <div className="service-documents">
            <p>Selecciona un documento para abrirlo en una nueva pestaña.</p>

            <ul>
              {selectedService.Docs.map((document, index) => (
                <li key={`${document.URL}-${index}`}>
                  <a href={document.URL} target="_blank" rel="noreferrer">
                    <strong>{document.Nombre || `Documento ${index + 1}`}</strong>
                    <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </section>
  )
}

export default Asegurabilidad_info
