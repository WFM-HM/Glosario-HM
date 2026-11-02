import type { Data } from './data/types'
export function parseDate(dateString: string) {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(dateString)) return null

  const [day, month, year] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : null
}

export function formatPrice(price: number, currency: string) {
  if (typeof price !== 'number') return ''

  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: currency || 'CRC',
  }).format(price)
}

export const emptyData: Data = {
  Poblacion: [],
  Servicios: [],
  Roles: [],
  Accesos: { Chequeos: [], AMP: [], Asegurabilidad: [], Preempleos: [] },
  Enlaces: [],
  CategoriasAMP: [],
  Sedes: [],
  Chequeos_medicos: [],
  AMPs: [],
  Asegurabilidad: [],
  Preempleos: []
}