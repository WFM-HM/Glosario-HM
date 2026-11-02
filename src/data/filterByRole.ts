import type { AMP, CatalogReference, CoberturaAMP, Data } from './types'
import {emptyData, parseDate} from "../shared_utils"

function filterVisibleReferences(
  references: CatalogReference[],
  visibleCategoryIds: Set<number>
) {
  return references.filter((reference) => visibleCategoryIds.has(reference.f_id))
}

function filterVisibleCoverages(
  coverages: CoberturaAMP[],
  visibleCategoryIds: Set<number>
) {
  return coverages.filter((coverage) => visibleCategoryIds.has(coverage.cat_f_id))
}

function generalFilter(
  data: Data,
  role: number
){
  return {
    ...data,
    Chequeos_medicos: data.Accesos.Chequeos.includes(role) ? data.Chequeos_medicos : [],
    AMPs: data.Accesos.AMP.includes(role) ? data.AMPs : [],
    Asegurabilidad: data.Accesos.Asegurabilidad.includes(role) ? data.Asegurabilidad : [],
    Preempleos: data.Accesos.Preempleos.includes(role) ? data.Preempleos : [],
  }
}

function filterAmpByRole(
  amp: AMP,
  roleId: number,
  visibleCategoryIds: Set<number>
) {
  const canSeeSymptoms = amp.id_roles_vSintomas.includes(roleId)

  return {
    ...amp,
    Notas_cobertura: filterVisibleReferences(amp.Notas_cobertura, visibleCategoryIds),
    Diagnosticos: amp.Diagnosticos.map((diagnostico) => ({
      ...diagnostico,
      Sintomas: canSeeSymptoms ? [...diagnostico.Sintomas] : [],
      Cobertura: filterVisibleCoverages(diagnostico.Cobertura, visibleCategoryIds),
    })),
  }
}

export function filterDataByRole(data: Data, roleName: string): Data {
  if (roleName === "admin") return data
  const role = data.Roles.find((item) => item.Nombre === roleName)

  if (!role) return emptyData

  data = generalFilter(data, role.id)

  const visibleCategoryIds = new Set(
    data.CategoriasAMP
      .filter((category) => category.Visibilidad.includes(role.id))
      .map((category) => category.id)
  )
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return {
    ...data,
    Chequeos_medicos: data.Chequeos_medicos.filter((chequeo) => {
      const expirationDate = chequeo.Vencimiento
        ? parseDate(chequeo.Vencimiento)
        : null

      return expirationDate === null || expirationDate >= today
    }),
    AMPs: data.AMPs.map((amp) =>
      filterAmpByRole(amp, role.id, visibleCategoryIds)
    ),
    Enlaces: data.Enlaces.filter(
      (link) => link.Visibilidad.includes(role.id)
    )
  }
}