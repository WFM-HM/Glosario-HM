import type { AMP, CatalogReference, ChequeoMedico, CoberturaAMP, Data, Diagnostico } from './types'
import { emptyData, parseDate } from "../shared_utils"

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
) {
  return {
    ...data,
    Chequeos_medicos: data.Accesos.Chequeos.includes(role) ? data.Chequeos_medicos : [],
    AMPs: data.Accesos.AMP.includes(role) ? data.AMPs : [],
    Asegurabilidad: data.Accesos.Asegurabilidad.includes(role) ? data.Asegurabilidad : [],
    Preempleos: data.Accesos.Preempleos.includes(role) ? data.Preempleos : [],
  }
}

function filterCheckupNotesByRole(
  chequeo: ChequeoMedico,
  roleId: number,
) {
  return {
    ...chequeo,
    Notas: chequeo.Notas.filter((nota) => nota.Roles.includes(roleId))
  }
}

function filterCheckupsByRole(
  checkups: ChequeoMedico[],
  roleId: number,
  today: Date,
) {
  const parsedDates = new Map<string, Date | null>()
  const visibleCheckups: ChequeoMedico[] = []

  for (const chequeo of checkups) {
    let expirationDate: Date | null = null

    if (chequeo.Vencimiento) {
      if (!parsedDates.has(chequeo.Vencimiento)) {
        parsedDates.set(chequeo.Vencimiento, parseDate(chequeo.Vencimiento))
      }

      expirationDate = parsedDates.get(chequeo.Vencimiento) ?? null
    }

    if (expirationDate !== null && expirationDate < today) continue

    visibleCheckups.push(filterCheckupNotesByRole(chequeo, roleId))
  }

  return visibleCheckups
}

function filterDiagnosticoDataByRole(
  diagnostico: Diagnostico,
  roleId: number,
  visibleCategoryIds: Set<number>,
  visibleSymptomsIds: number[]
) {
  const canSeeSymptoms = visibleSymptomsIds.includes(roleId)
  return {
    ...diagnostico,
    Sintomas: canSeeSymptoms ? [...diagnostico.Sintomas] : [],
    Cobertura: filterVisibleCoverages(diagnostico.Cobertura, visibleCategoryIds)
  }
}

function filterAmpByRole(
  amp: AMP,
  visibleCategoryIds: Set<number>,
) {
  return {
    ...amp,
    Notas_cobertura: filterVisibleReferences(amp.Notas_cobertura, visibleCategoryIds),
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
    Chequeos_medicos: filterCheckupsByRole(data.Chequeos_medicos, role.id, today),
    AMPs: data.AMPs.map((amp) =>
      filterAmpByRole(amp, visibleCategoryIds)
    ),
    Diagnosticos: data.Diagnosticos.map((diag) =>
      filterDiagnosticoDataByRole(diag, role.id, visibleCategoryIds, data.Accesos.SintomasAMP)
    ),
    Enlaces: data.Enlaces.filter(
      (link) => link.Visibilidad.includes(role.id)
    )
  }
}