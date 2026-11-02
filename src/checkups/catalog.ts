import type { CatalogItem, ChequeoMedico, Data } from '../data/types'

type ageRange = {
  min: number | null
  max: number | null
}
export type CheckupFilters = {
  search: string
  population: number | null
  name: string[]
  price: string
  edad: ageRange
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

export function getAgeRangeLabel(
  edadMin: number | null,
  edadMax: number | null
): string {
  if (edadMin == null && edadMax == null) {
    return 'Todas las edades';
  }

  if (edadMin == null) {
    return `Menor de ${edadMax} años`;
  }

  if (edadMax == null) {
    return `Igual o mayor de ${edadMin} años`;
  }

  if (edadMin === edadMax) {
    return `${edadMin} años`;
  }

  return `De ${edadMin} a menor de ${edadMax} años`;
}

export function getPriceOptions(checkups: ChequeoMedico[]): PriceOption[] {
  const uniquePrices = new Map<string, PriceOption>()

  checkups.forEach((checkup) => {
    if (typeof checkup.Precio !== 'number' || !checkup.Moneda) return

    const key = `${checkup.Moneda}|${checkup.Precio}`
    if (!uniquePrices.has(key)) {
      uniquePrices.set(key, {
        price: checkup.Precio,
        currency: checkup.Moneda,
      })
    }
  })

  return Array.from(uniquePrices.values()).sort((left, right) =>
    left.currency !== right.currency
      ? left.currency.localeCompare(right.currency, 'es', { sensitivity: 'base' })
      : left.price - right.price
  )
}

export function getCheckupGroup(checkup: ChequeoMedico) {
  return (checkup.Grupo ?? '').trim()
}

export function getUniqueNames(checkups: ChequeoMedico[]) {
  const groups = Array.from(
    new Set(checkups.map((checkup) => getCheckupGroup(checkup)).filter(Boolean))
  ).sort((left, right) =>
    left.localeCompare(right, 'es', { numeric: true, sensitivity: 'base' })
  )

  return ['Todos', ...groups]
}

function ageRangesOverlap(
  checkupMin: number | null,
  checkupMax: number | null,
  selectedMin: number | null,
  selectedMax: number | null
) {
  const startsBeforeSelectedEnd =
    selectedMax === null ||
    checkupMin === null ||
    checkupMin <= selectedMax

  const endsAfterSelectedStart =
    selectedMin === null ||
    checkupMax === null ||
    checkupMax > selectedMin

  return startsBeforeSelectedEnd && endsAfterSelectedStart
}

export function filterCheckups(
  checkups: ChequeoMedico[],
  filters: CheckupFilters,
) {
  const query = filters.search.trim().toLowerCase()

  return checkups.filter((checkup) => {
    const normalizedGroup = getCheckupGroup(checkup)

    if (query && ![checkup.Nombre, normalizedGroup, checkup.SKU].join(' ').toLowerCase().includes(query)) {
      return false
    }

    if (filters.population !== null && checkup.Poblacion !== filters.population) return false

    if (filters.name.length > 0) {
      const selectedGroups = filters.name

      if (
        !selectedGroups.includes('Todos') &&
        !selectedGroups.includes(normalizedGroup || 'Todos')
      ) {
        return false
      }
    }

    if (filters.price) {
      const [currency, price] = filters.price.split('|')
      if (checkup.Moneda !== currency || checkup.Precio !== Number(price)) return false
    }

    return ageRangesOverlap(
      checkup.EdadMin,
      checkup.EdadMax,
      filters.edad.min,
      filters.edad.max
    );
  })
}

export function getCheckupRelations(checkup: ChequeoMedico, data: Data) {
  // Cast into a CatalogItem 
  /*
  const dataServicios: CatalogItem[] = data.Servicios.map(
    (serv) => ({
      id: serv.id,
      Nombre: serv.Nombre
    })
  );*/

  const populationLookup = buildCatalogLookup(data.Poblacion)
  const serviceLookup = buildCatalogLookup(data.Servicios)
  const locationLookup = buildCatalogLookup(data.Sedes)

  return {
    populationName: resolveCatalogName(populationLookup, checkup.Poblacion),
    serviceNames: resolveCatalogNames(serviceLookup, checkup.Servicios),
    locationNames: resolveCatalogNames(locationLookup, checkup.Sedes),
  }
}