import { ReactNode, useRef } from 'react';
import type { Page } from '../data/types'
import { useData } from '../context/DataContext'
import { emptyData } from '../shared_utils'

type HomeProps = {
  onNavigate: (page: Page) => void
}


function Home({ onNavigate }: HomeProps) {

  const keysPressed = useRef({
    x: false,
    i: false,
  });
  const handleKeyPress = (e: React.KeyboardEvent<HTMLElement>) => {
    const key = e.key.toLowerCase();

    if (key !== 'x' && key !== 'i') return;

    const otherKey = key === 'x' ? 'i' : 'x';

    if (keysPressed.current[otherKey]) {
      alert("XIII");

      keysPressed.current.x = false;
      keysPressed.current.i = false;
    } else {
      keysPressed.current[key] = true;
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLElement>) => {
    const key = e.key.toLowerCase();

    if (key === 'x' || key === 'i') {
      keysPressed.current[key] = false;
    }
  };

  const { decryptedData } = useData()
  const data = decryptedData ?? emptyData
  const aseguradoras = new Set(
    decryptedData?.Chequeos_medicos.map(
      (chequeo) => chequeo.Nombre
    ) ?? []
  )
  const linkButtons: ReactNode[] = []

  decryptedData?.Enlaces.forEach((_link, index) => {
    linkButtons.push(
      <button
        key={`link-${index}`}
        className="primary-button links-button"
        type="button"
        onClick={() => window.open(_link.URL, '_blank', 'noopener,noreferrer')}
      >
        {_link.Nombre}<span aria-hidden="true">-&gt;</span>
      </button>
    )
  })

  return (
    <>
      <section className="hero page-width">
        <div className="hero-copy" tabIndex={0} onKeyDown={handleKeyPress} onKeyUp={handleKeyUp}>
          <h1>Glosario de información para <em>seguros y amp.</em></h1>
          <div className="button-category">
            <p className="button-category__label">Navegación</p>
            <div className="button-row">
              {data.Chequeos_medicos.length > 0 &&
                <button className="primary-button" onClick={() => onNavigate('chequeos')}>Ver chequeos médicos<span aria-hidden="true">-&gt;</span></button>
              }
              {data.AMPs.length > 0 &&
                <button className="primary-button" onClick={() => onNavigate('amp')}>Ver protocolos AMP<span aria-hidden="true">-&gt;</span></button>
              }
              {data.Asegurabilidad.length > 0 &&
                <button className="primary-button" onClick={() => onNavigate('asegur')}>Ver Asegurabilidades<span aria-hidden="true">-&gt;</span></button>
              }
              {data.Preempleos.length > 0 &&
                <button className="primary-button" onClick={() => onNavigate('preempleos')}>Ver Preempleos<span aria-hidden="true">-&gt;</span></button>
              }
            </div>
          </div>
          {linkButtons.length > 0 &&
            <div className="button-category">
              <p className="button-category__label">Enlaces</p>
              <div className="button-row">
                {linkButtons}
              </div>
            </div>
          }
        </div>
      </section>
      <section className="hero page-width" style={{ minHeight: 0, display: 'flex' }}>
        <div className="hero-index" aria-label="Resumen del glosario">
          <span className="index-label">Chequeos médicos totales</span>
          <strong>{decryptedData?.Chequeos_medicos.length}</strong>
          <div className="index-rule" />
          <span>Total de chequeos médicos en el sistema</span>
        </div>
        <div className="hero-index" aria-label="Resumen del glosario">
          <span className="index-label">Total de tipos de chequeos médicos</span>
          <strong>{aseguradoras?.size}</strong>
          <div className="index-rule" />
          <span>Total de chequeos médicos con nombres/aseguradoras diferentes</span>
        </div>
        <div className="hero-index" aria-label="Resumen del glosario">
          <span className="index-label">Total de protocolos AMP</span>
          <strong>{decryptedData?.AMPs.length}</strong>
          <div className="index-rule" />
          <span>Total de protocolos de AMP disponibles</span>
        </div>
        <div className="hero-index" aria-label="Resumen del glosario">
          <span className="index-label">Total de Asegurabilidades</span>
          <strong>{decryptedData?.Asegurabilidad.length}</strong>
          <div className="index-rule" />
          <span>Total de asegurabilidades disponibles</span>
        </div>
        <div className="hero-index" aria-label="Resumen del glosario">
          <span className="index-label">Total de Preempleos</span>
          <strong>{decryptedData?.Preempleos.length}</strong>
          <div className="index-rule" />
          <span>Total de preempleos diferentes disponibles</span>
        </div>
      </section>
      <section className="featured-band">
        <div className="page-width featured-content">
          <div>
            <p className="eyebrow">Para empezar</p>
            <h2>Elije alguno de los contenidos de la barra superior</h2>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
