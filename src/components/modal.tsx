import { ReactNode, useEffect } from 'react'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  eyebrow?: string
  children: ReactNode
  closeLabel?: string
}

function Modal({
  isOpen,
  onClose,
  title,
  eyebrow,
  children,
  closeLabel = 'Cerrar',
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const handleBackdropClick = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <div className="modal__header">
          <div>
            {eyebrow && (
              <p className="eyebrow">{eyebrow}</p>
            )}

            {title && (
              <h2 id="modal-title">
                {title}
              </h2>
            )}
          </div>

          <button
            type="button"
            className="modal__close"
            aria-label={closeLabel}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="modal__content">
          {children}
        </div>

        <div className="modal__footer">
          <button
            type="button"
            className="button"
            onClick={onClose}
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal
