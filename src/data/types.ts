export type Page = 'inicio' | 'chequeos' | 'amp' | 'amp_info' | 'asegur' | 'asegur_info' | 'preempleos' | 'preempleo_info'

export type CatalogItem = {
  id: number
  Nombre: string
}

export type CatalogReference = {
  f_id: number
  Nombre: string
}

export type PricedCatalogReference = {
  f_id: number
  Precio: number
  Moneda: string
}

export type CustomFieldGeneric = {
  Nombre: string
  Contenido: string
}

export type DocsRepository = {
  Nombre: string,
  URL: string
}

export type NotaxRol = {
  Contenido: string,
  Roles: number[]
}

export type ExternalLink = {
  id: number,
  Nombre: string,
  URL: string,
  Visibilidad: number[]
}

export type ServicioItem = {
  id: number
  Nombre: string
  SKU: string
  Insumo: boolean
  Docs: DocsRepository[]
}

export type PaqueteAsegurabilidad = {
  Nombre: string
  Precio: number
  Moneda: string
  Servicios: number[]
  Notas_importantes: string
  SKU: string
}

export type Asegurabilidad = {
  id: number
  Nombre: string,
  Notas: string,
  Servicios: PricedCatalogReference[]
  Paquetes: PaqueteAsegurabilidad[]
}

export type ChequeoMedico = {
  id: number
  Nombre: string
  Grupo?: string
  Precio: number
  Moneda: string
  Servicios: number[]
  Poblacion: number
  EdadMin: number | null
  EdadMax: number | null
  Visible: boolean
  Vencimiento: string
  Notas: NotaxRol[]
  Sedes: number[]
  SKU: string
}

export type AgendaSedeReference = {
  f_id: number
  Agendar: string
  Tiempo: string
}

export type Preempleo = {
  id: number
  Nombre: string
  Agenda: string
  Agendamiento: AgendaSedeReference[]
  Encargado: string
  MedioIngreso: string
  Paquetes: number[]
  Comentario: string
  Extras: CustomFieldGeneric[]
}

export type CategoriaAMP = {
  id: number
  Nombre: string
  Visibilidad: number[]
}

export type CoberturaAMP = {
  cat_f_id: number
  Reglas: string[]
  Servicios: ServicioAMP[]
}

export type ServicioAMP = {
  f_serv_id: number
  Detalle?: string
}
export type Diagnostico = {
  id: number
  Codigo: string
  Nombre: string
  Sintomas: string[]
  Nota: string
  Cobertura: CoberturaAMP[]
}

export type AMP = {
  id: number
  Nombre: string
  Notas: string[]
  Exclusiones: string[]
  Sedes: number[]
  Notas_cobertura: CatalogReference[]
  f_diagnosticos: number[]
}

export type Administracion = {
  Chequeos: number[]
  AMP: number[]
  Asegurabilidad: number[]
  Preempleos: number[]
  SintomasAMP: number[]
}

export type Data = {
  Poblacion: CatalogItem[]
  Servicios: ServicioItem[]
  Roles: CatalogItem[]
  Accesos: Administracion
  Enlaces: ExternalLink[]
  CategoriasAMP: CategoriaAMP[]
  Sedes: CatalogItem[]
  Chequeos_medicos: ChequeoMedico[]
  AMPs: AMP[]
  Diagnosticos: Diagnostico[]
  Asegurabilidad: Asegurabilidad[]
  Preempleos: Preempleo[]
}