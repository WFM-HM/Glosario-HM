import type { AMP, CatalogItem, Data, Diagnostico } from '../data/types'

export type AmpFilters = {
  search: string
}

export function sortCatalog(items: CatalogItem[]) {
  return [...items].sort((left, right) =>
    left.Nombre.localeCompare(right.Nombre, 'es', { sensitivity: 'base' })
  )
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
  const categoryLookup = createCatalogMap(data.CategoriasAMP)
  const serviceLookup = createCatalogMap(data.Servicios)
  const locationLookup = buildCatalogLookup(data.Sedes)
  const diagnosticoLookup = new Map(data.Diagnosticos.map((diag) => [diag.id, diag]))

  return {
    coverageNames: amp.Notas_cobertura.map((reference) => ({
      name: categoryLookup.get(reference.f_id) ?? reference.Nombre,
      note: reference.Nombre,
    })),
    sedes: resolveCatalogNames(locationLookup, amp.Sedes),
    diagnoses: amp.f_diagnosticos.map((diag_id) => diagnosticoLookup.get(diag_id))
    .filter((diagnosis): diagnosis is Diagnostico => diagnosis !== undefined)
    .map((diagnosis) => ({
      ...diagnosis,
      coverageGroups: diagnosis.Cobertura.map((coverage) => ({
        categoryName: categoryLookup.get(coverage.cat_f_id) ?? 'Sin categoría',
        rules: coverage.Reglas,
        coverages: coverage.Servicios.map((service) => ({
          serviceId: service.f_serv_id,
          name: serviceLookup.get(service.f_serv_id) ?? `Servicio ${service.f_serv_id}`,
          detail: service.Detalle,
        })),
      })),
    })),
  }
}