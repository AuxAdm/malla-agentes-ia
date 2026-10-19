# Registro de decisiones técnicas

Este documento conserva las decisiones que afectan a la arquitectura. Cada decisión puede revisarse, pero los cambios deben indicar el motivo y sus consecuencias.

## D-001 — Español como idioma principal

**Estado:** aceptada.

La documentación, los ejemplos y los comentarios propios del proyecto se escribirán en español. Se conservarán nombres técnicos en inglés cuando sean estándares, identificadores de código o términos ampliamente reconocidos.

## D-002 — Continuidad resiliente, no promesa de invulnerabilidad

**Estado:** aceptada.

AgentMesh busca mejorar la recuperación ante fallos y reducir dependencias centralizadas. No promete ser imposible de apagar ni pretende impedir el control legítimo de los operadores.

## D-003 — Separación entre especificación e implementación

**Estado:** aceptada.

Los documentos describen lo propuesto; solo se anunciará como disponible una función que tenga implementación verificable y cuyo estado esté documentado.

## D-004 — Permisos locales y mínimo privilegio

**Estado:** aceptada.

Cada nodo conserva el control de sus recursos. Los agentes no reciben permisos globales por defecto, y las acciones externas deben estar autorizadas de forma explícita.

## D-005 — Prototipo mínimo antes de una red compleja

**Estado:** aceptada.

La primera implementación se centrará en el intercambio autenticado entre dos nodos. El descubrimiento distribuido, la memoria replicada y la selección de modelos alternativos se añadirán después, por etapas.

## D-006 — Sin secretos en el repositorio

**Estado:** aceptada.

Claves privadas, tokens, contraseñas y credenciales no deben incluirse en archivos versionados. La configuración de ejemplo usará valores ficticios y documentará cómo aportar secretos localmente.
