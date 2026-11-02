import { Preempleo, CatalogItem, ChequeoMedico, Data } from "../data/types";

export type PreempleoFilters = {
    search: string
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

export function sortCatalog(items: CatalogItem[]) {
    return [...items].sort((left, right) =>
        left.Nombre.localeCompare(right.Nombre, 'es', { sensitivity: 'base' })
    )
}

export function filterPreempleos(
    preempleos: Preempleo[],
    filters: PreempleoFilters
) {
    const query = filters.search.trim().toLowerCase()

    return preempleos.filter((pre) => {
        if (!query) return true

        return pre.Nombre.toLowerCase().includes(query)
    }
    )
}

export function getPreempleoRelations(preempleo: Preempleo, data: Data) {
    const locationLookup = buildCatalogLookup(data.Sedes)

    const chequeoLookup = new Map(
        data.Chequeos_medicos.map((chequeo) => [chequeo.id, chequeo])
    )

    return {
        sedes: preempleo.Agendamiento.map((agenda) => ({
            ...agenda,
            nombre: locationLookup.get(agenda.f_id)
        })),
        chequeos: preempleo.Paquetes
            .map((chequeo_id) => chequeoLookup.get(chequeo_id))
            .filter((chequeo): chequeo is ChequeoMedico => chequeo !== undefined)
            .sort((left, right) =>
                left.Nombre.localeCompare(right.Nombre, 'es', { sensitivity: 'base' }))
    }
}