import { useState } from 'react'
import Modal from './modal'
import SwitchComponent from './switch'
import type { Data, ServicioItem } from '../data/types'
import { getAmpRelations } from '../amps/catalog'

type Diagnosis = ReturnType<typeof getAmpRelations>['diagnoses'][number]

type DiagnosisModalProps = {
  diagnosis: Diagnosis | null
  data: Data
  isOpen: boolean
  onClose: () => void
}

function DiagnosisModal({ diagnosis, data, isOpen, onClose }: DiagnosisModalProps) {
  const [visibleSKU, setVisibleSKU] = useState(false)
  const [selectedService, setSelectedService] = useState<ServicioItem>()

  const serviceClicked = (serviceId: number) => {
    const service = data.Servicios.find((item) => item.id === serviceId)

    if (!service || service.Docs.length === 0) return

    if (service.Docs.length === 1) {
      window.open(service.Docs[0].URL, '_blank', 'noopener,noreferrer')
      return
    }

    setSelectedService(service)
  }

  return (
    <>
      <Modal
        isOpen={isOpen && Boolean(diagnosis)}
        onClose={onClose}
        eyebrow="Diagnóstico AMP"
        title={diagnosis?.Nombre ?? ''}
      >
        {diagnosis && (
          <div className="checkup-modal">
            {diagnosis.Nota != "" &&
              <div className="checkup-modal__section" style={{ paddingTop: "0px" }}>
                <h3>Nota</h3>
                <p>{diagnosis.Nota}</p>
              </div>
            }
            <div className="checkup-modal__section">
              <h3>Síntomas</h3>
              {diagnosis.Sintomas.length > 0 ? (
                <ul className="amp-detail-list">
                  {diagnosis.Sintomas.map((symptom, index) => (
                    <li key={`${symptom}-${index}`}>{symptom}</li>
                  ))}
                </ul>
              ) : (
                <p className="checkup-modal__empty">No hay síntomas registrados.</p>
              )}
            </div>

            {diagnosis.coverageGroups.length > 0 && (
              <div className="checkup-modal__section">
                <h3>Incluye (Click en un servicio con "↗" para ver documentos disponibles)</h3>
                <SwitchComponent
                  textOn="Ocultar SKUs (Click en un SKU para copiarlo)"
                  textOff="Ver SKUs"
                  value={visibleSKU}
                  onChange={() => setVisibleSKU(!visibleSKU)}
                />

                <div className="diagnosis-modal__categories">
                  {diagnosis.coverageGroups.map((group, groupIndex) => (
                    <section key={`${group.categoryName}-${groupIndex}`} className="diagnosis-modal__category">
                      <h4>{group.categoryName}</h4>
                      {group.rules.length > 0 && (
                        <div className="diagnosis-modal__rules">
                          <span className="diagnosis-modal__rules-label">Condiciones de cobertura</span>
                          <ul>
                            {group.rules.map((rule, index) => (
                              <li key={`${rule}-${index}`}>{rule}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {group.coverages.length > 0 && (
                        <ul className="checkup-tags">
                          {group.coverages.map((coverage, index) => {
                            const service = data.Servicios.find((item) => item.id === coverage.serviceId)
                            const hasDocs = Boolean(service?.Docs.length)

                            return (
                              <li key={`${coverage.serviceId}-${index}`}>
                                <button
                                  type="button"
                                  className={hasDocs ? 'service-tag service-tag--available' : 'service-tag service-tag--unavailable'}
                                  onClick={() => serviceClicked(coverage.serviceId)}
                                  title={hasDocs ? 'Ver documentos disponibles' : 'No hay documentos disponibles'}
                                >
                                  {coverage.name}
                                  {coverage.detail && <span className="service-tag__detail"> — {coverage.detail}</span>}
                                  <span className="service-tag__icon" aria-hidden="true">{hasDocs ? '↗' : ''}</span>
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
                      )}
                    </section>
                  ))}
                </div>
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

export default DiagnosisModal
