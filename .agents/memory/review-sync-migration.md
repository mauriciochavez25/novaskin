---
name: Sincronización segura de reseñas
description: Decisión de migración para deduplicar reseñas externas sin poner en riesgo testimonios existentes.
---

No exigir una restricción única de base de datos para identificar reseñas externas sin auditar antes los registros existentes. Deduplicar mediante búsqueda previa y luego actualizar o insertar.

**Why:** Una migración que fuerza unicidad sobre datos previamente duplicados puede eliminar testimonios administrados. Preservar ese contenido tiene prioridad.

**How to apply:** En cambios futuros del módulo de reseñas, conservar la actualización o inserción no destructiva. Solo agregar una restricción única después de auditar duplicados y mediante una migración explícita que no elimine registros.

Cuando se necesiten más de cinco reseñas de Google, usar la API autenticada de Google Business Profile para una ficha verificada y seguir sus tokens de paginación. Places no sustituye la autorización de la cuenta comercial ni devuelve la colección paginada.

**Why:** La selección del negocio mediante Places puede identificar una ficha pública, pero no otorga acceso completo a las reseñas de la cuenta administrada.

**How to apply:** Mantener OAuth de Business Profile separado de cualquier clave de Google Maps; no reemplazar la importación paginada por Places si se requiere traer todas las reseñas.

Al cambiar o desconectar la ficha, ocultar sin borrar las reseñas importadas. Una sincronización posterior no debe revertir una decisión manual de visibilidad.

**Why:** Dejar visible contenido de una ficha anterior mezclaría reseñas de negocios distintos; re-publicar reseñas ocultadas contradice la decisión del administrador.

**How to apply:** Conservar los registros y cualquier elección manual de visibilidad al actualizar desde Google; solo la ficha actualmente seleccionada debe poder publicar sus reseñas.