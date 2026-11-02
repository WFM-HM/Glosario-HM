import { useState } from 'react'
import Modal from './modal'
import SwitchComponent from './switch'
import type { ChequeoMedico, Data, ServicioItem } from '../data/types'
import { getAgeRangeLabel, getCheckupRelations } from '../checkups/catalog'
import { formatPrice } from '../shared_utils'

export type CheckupModalProps = {
  checkup: ChequeoMedico | null
  data: Data
  isOpen: boolean
  onClose: () => void
}

function CheckupModal({ checkup, data, isOpen, onClose }: CheckupModalProps) {
  const [visibleSKU, setVisibleSKU] = useState(false)
  const [selectedService, setSelectedService] = useState<ServicioItem>()

  const serviceClicked = (name: string) => {
    const service = data.Servicios.find((item) => item.Nombre === name)

    if (!service || service.Docs.length === 0) return

    if (service.Docs.length === 1) {
      window.open(service.Docs[0].URL, '_blank', 'noopener,noreferrer')
      return
    }

    setSelectedService(service)
  }

  const relations = checkup ? getCheckupRelations(checkup, data) : null

  return (
    <>
      <Modal
        isOpen={isOpen && Boolean(checkup)}
        onClose={onClose}
        eyebrow="Chequeo médico"
        title={checkup?.Nombre ?? ''}
      >
        {checkup && relations && (
          <div className="checkup-modal">
            <div className="checkup-modal__price">
              <span>Precio</span>
              <strong>{formatPrice(checkup.Precio, checkup.Moneda)}</strong>
            </div>

            <div className="checkup-modal__details">
              <div>
                <span>Población</span>
                <strong>{relations.populationName || 'No especificada'}</strong>
              </div>

              <div>
                <span>Rango de edad</span>
                <strong>{getAgeRangeLabel(checkup.EdadMin, checkup.EdadMax)}</strong>
              </div>

              <div>
                <span>SKU</span>
                <strong>{checkup.SKU || '—'}</strong>
              </div>
            </div>

            {relations.serviceNames.length > 0 && (
              <div className="checkup-modal__section">
                <h3>Incluye (Click en un servicio con "↗" para ver documentos diponibles)</h3>
                <SwitchComponent
                  textOn="Ocultar SKUs (Click en un SKU para copiarlo)"
                  textOff="Ver SKUs"
                  value={visibleSKU}
                  onChange={() => setVisibleSKU(!visibleSKU)}
                />

                <ul className="checkup-tags">
                  {relations.serviceNames
                    .slice()
                    .sort((left, right) => left.localeCompare(right, 'es', { sensitivity: 'base' }))
                    .map((name) => {
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
              </div>
            )}

            {relations.locationNames.length > 0 && (
              <div className="checkup-modal__section">
                <h3>Sedes aplicables</h3>

                <ul className="checkup-locations">
                  {relations.locationNames.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>
            )}

            {checkup['Notas importantes'] && (
              <div className="checkup-modal__section checkup-modal__notes">
                <h3>Notas importantes</h3>
                <p>{checkup['Notas importantes']}</p>
              </div>
            )}
          </div>
        )}
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
    </>
  )
}

export default CheckupModal