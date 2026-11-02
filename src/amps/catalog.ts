import type { AMP, CatalogItem, Data } from '../data/types'

export type AmpFilters = {
  search: string
}

export function sortCatalog(items: CatalogItem[]) {
  return [...items].sort((left, right) =>
    left.Nombre.localeCompare(right.Nombre, 'es', { sensitivity: 'base' })
  )
}

export function deduplicateAmps(amps: AMP[]) {
  const seen = new Set<string>()

  return amps.filter((amp) => {
    const key = JSON.stringify(amp)

    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function createCatalogMap(items: CatalogItem[]) {
  return new Map(items.map((item) => [item.id, item.Nombre]))
}

export function buildCatalogLookup<T extends CatalogItem>(items: T[]) {
  return createCatalogMap(items)
}

export function resolveCatalogNames(lookup: Map<number, string>, ids: number[]) {
  return ids
    .map((id) => lookup.get(id))
    .filter((name): name is string => Boolean(name))
}

export function filterAmps(amps: AMP[], filters: AmpFilters) {
  const query = filters.search.trim().toLowerCase()

  return amps.filter((amp) => {
    const searchableText = [
      amp.Nombre
    ].join(' ').toLowerCase()

    return !query || searchableText.includes(query)
  })
}

export function getAmpRelations(amp: AMP, data: Data) {
  const roleLookup = createCatalogMap(data.Roles)
  const categoryLookup = createCatalogMap(data.CategoriasAMP)
  const serviceLookup = createCatalogMap(data.Servicios)
  const locationLookup = buildCatalogLookup(data.Sedes)

  return {
    roleNames: resolveCatalogNames(roleLookup, amp.id_roles_vSintomas),
    coverageNames: amp.Notas_cobertura.map((reference) => ({
      name: categoryLookup.get(reference.f_id) ?? reference.Nombre,
      note: reference.Nombre,
    })),
    sedes: resolveCatalogNames(locationLookup, amp.Sedes),
    diagnoses: amp.Diagnosticos.map((diagnosis) => ({
      ...diagnosis,
      coverageGroups: Array.from(
        diagnosis.Cobertura.reduce((groups, coverage) => {
          const categoryName = categoryLookup.get(coverage.cat_f_id) ?? 'Sin categoría'
          const group = groups.get(coverage.cat_f_id) ?? {
            categoryName,
            coverages: [],
          }

          group.coverages.push({
            serviceId: coverage.serv_f_id,
            name: serviceLookup.get(coverage.serv_f_id) ?? `Servicio ${coverage.serv_f_id}`,
            detail: coverage.Detalle,
          })
          groups.set(coverage.cat_f_id, group)
          return groups
        }, new Map<number, {
          categoryName: string
          coverages: Array<{ serviceId: number; name: string; detail?: string }>
        }>()).values()
      ),
    })),
  }
}