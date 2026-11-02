# Esquema de datos

```mermaid
classDiagram
    direction LR

    class CatalogItem {
        <<type>>
        +number id
        +string Nombre
    }

    class CatalogReference {
        <<type>>
        +number f_id
        +string Nombre
    }

    class PricedCatalogReference {
        <<type>>
        +number f_id
        +number Precio
        +string Moneda
    }

    class CustomFieldGeneric {
        <<type>>
        +string Nombre
        +string Contenido
    }

    class DocsRepository {
        <<type>>
        +string Nombre
        +string URL
    }

    class ExternalLink {
        <<type>>
        +number id
        +string Nombre
        +string URL
        +number[] Visibilidad
    }

    class ServicioItem {
        +number id
        +string Nombre
        +string SKU
        +boolean Insumo
        +DocsRepository[] Docs
    }

    class PaqueteAsegurabilidad {
        +string Nombre
        +number Precio
        +string Moneda
        +number[] Servicios
        +string Notas_importantes
        +string SKU
    }

    class Asegurabilidad {
        +number id
        +string Nombre
        +string Notas
        +PricedCatalogReference[] Servicios
        +PaqueteAsegurabilidad[] Paquetes
    }

    class ChequeoMedico {
        +number id
        +string Nombre
        +string Grupo
        +number Precio
        +string Moneda
        +number[] Servicios
        +number Poblacion
        +number EdadMin
        +number EdadMax
        +boolean Visible
        +string Vencimiento
        +string Notas_importantes
        +number[] Sedes
        +string SKU
    }

    class AgendaSedeReference {
        <<type>>
        +number f_id
        +string Agendar
        +string Tiempo
    }

    class Preempleo {
        +number id
        +string Nombre
        +string Agenda
        +AgendaSedeReference[] Agendamiento
        +string Encargado
        +string MedioIngreso
        +number[] Paquetes
        +string Comentario
        +CustomFieldGeneric[] Extras
    }

    class CategoriaAMP {
        +number id
        +string Nombre
        +number[] Visibilidad
    }

    class CoberturaAMP {
        <<type>>
        +number cat_f_id
        +number serv_f_id
        +string Detalle
    }

    class Diagnostico {
        +number id
        +string[] Sintomas
        +string Nombre
        +CoberturaAMP[] Cobertura
    }

    class AMP {
        +number id
        +number[] id_roles_vSintomas
        +string Nombre
        +string[] Notas
        +string[] Exclusiones
        +number[] Sedes
        +CatalogReference[] Notas_cobertura
        +Diagnostico[] Diagnosticos
    }

    class Administracion {
        +number[] Chequeos
        +number[] AMP
        +number[] Asegurabilidad
        +number[] Preempleos
    }

    class Data {
        +CatalogItem[] Poblacion
        +ServicioItem[] Servicios
        +CatalogItem[] Roles
        +Administracion Accesos
        +ExternalLink[] Enlaces
        +CategoriaAMP[] CategoriasAMP
        +CatalogItem[] Sedes
        +ChequeoMedico[] Chequeos_medicos
        +AMP[] AMPs
        +Asegurabilidad[] Asegurabilidad
        +Preempleo[] Preempleos
    }

    Data "1" o-- "*" CatalogItem : Poblacion
    Data "1" o-- "*" ServicioItem : Servicios
    Data "1" o-- "*" CatalogItem : Roles
    Data "1" o-- "1" Administracion : Accesos
    Data "1" o-- "*" ExternalLink : Enlaces
    Data "1" o-- "*" CategoriaAMP : CategoriasAMP
    Data "1" o-- "*" CatalogItem : Sedes
    Data "1" o-- "*" ChequeoMedico : Chequeos_medicos
    Data "1" o-- "*" AMP : AMPs
    Data "1" o-- "*" Asegurabilidad : Asegurabilidad
    Data "1" o-- "*" Preempleo : Preempleos

    Asegurabilidad "1" o-- "*" PricedCatalogReference : Servicios
    Asegurabilidad "1" o-- "*" PaqueteAsegurabilidad : Paquetes
    PricedCatalogReference "*" --> "1" ServicioItem : f_id
    PaqueteAsegurabilidad "*" --> "*" ServicioItem : Servicios

    ChequeoMedico "*" --> "*" ServicioItem : Servicios
    ChequeoMedico "*" --> "1" CatalogItem : Poblacion
    ChequeoMedico "*" --> "*" CatalogItem : Sedes

    Preempleo "1" o-- "*" AgendaSedeReference : Agendamiento
    Preempleo "*" --> "*" ChequeoMedico : Paquetes
    Preempleo "1" o-- "*" CustomFieldGeneric : Extras
    AgendaSedeReference "*" --> "1" CatalogItem : f_id

    AMP "1" o-- "*" Diagnostico : Diagnosticos
    AMP "1" o-- "*" CatalogReference : Notas_cobertura
    Diagnostico "1" o-- "*" CoberturaAMP : Cobertura
    CoberturaAMP "*" --> "1" CategoriaAMP : cat_f_id
    CoberturaAMP "*" --> "1" ServicioItem : serv_f_id
    CatalogReference "*" --> "1" CategoriaAMP : f_id
    AMP "*" --> "*" CatalogItem : Sedes
    ServicioItem "1" o-- "*" DocsRepository : Docs

    CategoriaAMP "*" --> "*" CatalogItem : Visibilidad
    AMP "*" --> "*" CatalogItem : id_roles_vSintomas
    ExternalLink "*" --> "*" CatalogItem : Visibilidad
    Administracion "*" --> "*" CatalogItem : accesos por rol
```

Los campos `f_id`, `Servicios`, `Poblacion`, `Sedes`, `Paquetes`, `Visibilidad`,
`id_roles_vSintomas`, `cat_f_id` y `serv_f_id` contienen identificadores que
referencian otros registros. `Grupo`, `EdadMin`, `EdadMax` y `Detalle` son
opcionales o pueden estar ausentes según el registro. En el diagrama,
`Notas_importantes` representa la propiedad JSON `'Notas importantes'`.
