import { useState } from 'react'
import AMP from './pages/AMP'
import AMP_info from './pages/AMP_info'
import Chequeos from './pages/Chequeos'
import Home from './pages/Home'
import type { Page } from './data/types'
import Asegurabilidad from './pages/Asegurabilidad'
import Asegurabilidad_info from './pages/Asegurabilidad_info'
import Preempleo from './pages/Preempleo'
import Preempleo_info from './pages/Preempleo_info'
import { emptyData } from './shared_utils'
import { useData } from './context/DataContext'

function App() {
  const [page, setPage] = useState<Page>('inicio')
  const { decryptedData } = useData()
  const data = decryptedData ?? emptyData

  const navigate = (nextPage: Page) => {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navItems: Array<{ page: Page; label: string, render: boolean }> = [
    { page: 'inicio', label: 'Inicio', render: true },
    { page: 'chequeos', label: 'Chequeos médicos', render: data.Chequeos_medicos.length > 0 },
    { page: 'amp', label: 'AMP', render: data.AMPs.length > 0 },
    { page: 'asegur', label: 'Asegurabilidad' , render: data.Asegurabilidad.length > 0},
    { page: 'preempleos', label: 'Preempleo', render: data.Preempleos.length > 0}
  ];

  return (
    <div className="app-shell">
      <header className="site-header">
        <button
          className="brand"
          onClick={() => navigate('inicio')}
          aria-label="Ir al inicio"
        >
          <span className="brand-mark">GS</span>
          <span>
            Glosario de información de seguros<span className="brand-dot"></span>
          </span>
        </button>


        <nav aria-label="Navegación principal">
          {navItems.map(({ page: item, label, render }) => (
            render &&
            <button
              key={item}
              className={`nav-link ${page === item ? 'active' : ''}`}
              onClick={() => navigate(item)}
            >
              {label}
            </button>
          ))}
        </nav>

        <span className="header-note">Edicion 2026</span>
      </header>

      <main>
        {page === 'inicio' && <Home onNavigate={navigate} />}
        {page === 'chequeos' && <Chequeos />}
        {page === 'amp' && <AMP onNavigate={navigate} />}
        {page === 'amp_info' && <AMP_info onNavigate={navigate}/>}
        {page === 'asegur' && <Asegurabilidad onNavigate={navigate}/>}
        {page === 'asegur_info' && <Asegurabilidad_info onNavigate={navigate}/>}
        {page === 'preempleos' && <Preempleo onNavigate={navigate}/>}
        {page === 'preempleo_info' && <Preempleo_info onNavigate={navigate}/>}
      </main>

      <footer className="site-footer">
        <span>Glosario de información / WFM HM</span>
      </footer>
    </div>
  )
}

export default App
