import type { CatalogItem, Asegurabilidad, PaqueteAsegurabilidad } from '../data/types'

export type AsegurabilidadFilters = {
  search: string
  services?: number[]
  price?: string
}

export type PriceOption = {
  price: number
  currency: string
}

export function createCatalogMap(items: CatalogItem[]) {
  return new Map(items.map((item) => [item.id, item.Nombre]))  
}

export function buildCatalogLookup<T extends CatalogItem>(items: T[]) {
  return createCatalogMap(items)
}

export function resolveCatalogName(lookup: Map<number, string>, id: number | undefined) {
  return typeof id === 'number' ? lookup.get(id) : undefined
}

export function resolveCatalogNames(lookup: Map<number, string>, ids: number[]) {
  return ids
    .map((id) => resolveCatalogName(lookup, id))
    .filter((name): name is string => Boolean(name))
}

export function sortCatalog(items: CatalogItem[]) {
  return [...items].sort((left, right) =>
    left.Nombre.localeCompare(right.Nombre, 'es', { sensitivity: 'base' })
  )
}

export function getPriceOptions(paquetes: PaqueteAsegurabilidad[]): PriceOption[] {
  const uniquePrices = new Map<string, PriceOption>()

  paquetes.forEach((paquete) => {
    if (typeof paquete.Precio !== 'number' || !paquete.Moneda) return

    const key = `${paquete.Moneda}|${paquete.Precio}`
    if (!uniquePrices.has(key)) {
      uniquePrices.set(key, {
        price: paquete.Precio,
        currency: paquete.Moneda,
      })
    }
  })
    return Array.from(uniquePrices.values()).sort((left, right) =>
    left.currency !== right.currency
      ? left.currency.localeCompare(right.currency, 'es', { sensitivity: 'base' })
      : left.price - right.price
  )
}

export function filterAsegurabilidades(asegurs: Asegurabilidad[], filters: AsegurabilidadFilters) {
  const query = filters.search.trim().toLowerCase()

  return asegurs.filter((asegur) => {
    const searchableText = [
      asegur.Nombre
    ].join(' ').toLowerCase()

    return !query || searchableText.includes(query)
  })
}

export function filterPaquetes(paquetes: PaqueteAsegurabilidad[], filters: AsegurabilidadFilters) {
  const query = filters.search.trim().toLowerCase()
  const selectedServices = filters.services ?? []
  const selectedPrice = filters.price ?? ''

  return paquetes.filter((paquete) => {
    const matchesSearch = !query || paquete.Nombre.toLowerCase().includes(query)
    const matchesServices = selectedServices.every((serviceId) =>
      paquete.Servicios.includes(serviceId)
    )
    const matchesPrice = !selectedPrice ||
      `${paquete.Moneda}|${paquete.Precio}` === selectedPrice

    return matchesSearch && matchesServices && matchesPrice
  })
}

export function deduplicatePaquetes(paquetes: PaqueteAsegurabilidad[]) {
  const seen = new Set<string>()

  return paquetes.filter((paquete) => {
    const key = JSON.stringify(paquete)

    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}