---
name: Alcance de secciones aisladas
description: Mantener implementaciones por sección separadas cuando una especificación pide trabajar únicamente en una parte del sitio.
---

Cuando una solicitud está limitada a una sección, no mezclar en esa misma implementación funcionalidades pendientes de secciones vecinas, aunque compartan datos o componentes.

**Why:** Mezclar trabajo relacionado puede alterar el orden visual, duplicar responsabilidades y violar la instrucción explícita de no tocar secciones terminadas.

**How to apply:** Antes de editar, convertir la especificación en una lista de entregables de esa sección y verificar que cada archivo modificado corresponda solo a ellos.