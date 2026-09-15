---
name: Sincronización segura de reseñas
description: Decisión de migración para deduplicar reseñas externas sin poner en riesgo testimonios existentes.
---

No exigir una restricción única de base de datos para identificar reseñas externas si la herramienta de migración propone truncar la tabla existente. Deduplicar mediante búsqueda previa y luego actualizar o insertar.

**Why:** Al agregar la restricción, Drizzle solicitó truncar los testimonios existentes. Preservar contenido administrado tiene prioridad sobre imponer unicidad durante esa migración.

**How to apply:** En cambios futuros del módulo de reseñas, conservar la actualización o inserción no destructiva. Solo agregar una restricción única después de auditar duplicados y mediante una migración explícita que no elimine registros.