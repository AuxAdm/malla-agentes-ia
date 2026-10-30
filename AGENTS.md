# Instrucciones de trabajo para agentes — AgentMesh

Este archivo conserva la dirección técnica y la metodología de construcción del proyecto entre conversaciones y herramientas de IA.

## Identidad del proyecto

- Repositorio: `AuxAdm/malla-agentes-ia`.
- Rama de trabajo acordada: `main`.
- Nombre del proyecto: Malla de Agentes de IA (AgentMesh).
- Idioma principal: español. Mantener en inglés los identificadores técnicos y estándares cuando mejore la interoperabilidad.
- Objetivo: construir un protocolo abierto para comunicación, coordinación y recuperación de agentes en nodos independientes.

## Prioridad de construcción

1. Entregar bloques funcionales completos, coherentes y conectados entre sí.
2. Priorizar capacidades reales del producto sobre documentos repetitivos, microajustes o pruebas aisladas.
3. Evitar modificar una línea cada vez cuando una funcionalidad necesita varios archivos: diseñar e implementar el bloque completo.
4. Integrar cada módulo con las interfaces y rutas existentes; no dejar archivos huérfanos.
5. Actualizar la documentación de uso y el estado real del proyecto al cerrar cada bloque.
6. Hacer verificaciones proporcionadas al tamaño del cambio y reservar auditorías amplias para hitos; nunca afirmar que algo fue probado si no se ejecutó.
7. No reescribir módulos existentes sin necesidad. Respetar decisiones y compatibilidad ya establecidas.

## Ciclo de trabajo por bloque

- Comprender el estado real de `main` y leer los archivos que se van a ampliar.
- Definir el resultado funcional y sus límites antes de escribir.
- Implementar conjuntamente núcleo, integración, ejemplo de uso y documentación cuando corresponda.
- Mantener los cambios enfocados; evitar introducir dependencias innecesarias.
- Revisar los archivos modificados y la coherencia de sus contratos.
- Registrar los cambios en commits descriptivos.
- Informar en español qué quedó construido, qué commit lo contiene, cómo se utiliza y cuál es el siguiente bloque.

## Arquitectura y seguridad obligatorias

- TypeScript estricto y Node.js 20 o posterior.
- Mantener el protocolo independiente de proveedores y modelos de IA.
- La identidad se verifica con claves Ed25519; nunca guardar claves privadas en Git.
- La autenticación no equivale a autorización. Toda capacidad que produzca efectos debe tener permisos locales explícitos.
- Nunca ejecutar directamente código, comandos de shell o instrucciones recibidas dentro de una tarea remota.
- Las tareas remotas se consideran datos no confiables. Su ejecución futura debe usar manejadores registrados explícitamente, permisos mínimos, límites, cancelación y trazabilidad.
- No afirmar descentralización total mientras el transporte, el descubrimiento o el almacenamiento dependan de un único servicio.
- Mantener control del operador: un nodo debe poder detenerse y revocar confianza.
- No replicar datos sin política explícita de privacidad, consentimiento, retención y eliminación.

## Continuidad para nuevas conversaciones

Antes de continuar, leer este archivo y el estado de la rama `main`. Consultar el README y la hoja de ruta para identificar la última capacidad terminada y el siguiente bloque pendiente. Este archivo es la guía permanente; actualizarlo solo cuando cambien decisiones de dirección o metodología, no para registrar cada commit.

## Estado conocido al 30-10-2026

- Servidor HTTP básico y protocolo de mensajes v1.
- Autenticación de nodos con Ed25519 y protección anti-repetición en memoria.
- Cliente para envío autenticado de mensajes.
- Registro persistente local de tareas con estados, resultados e historial de eventos.
- Trabajador secuencial con manejadores locales registrados explícitamente; incluye `demo.echo`.
- Mensajes autenticados `task.submit`, `task.status` y `task.cancel`; el estado se consulta solo por el nodo propietario.
- La ejecución remota exige autorización explícita por nodo y tipo mediante `AGENTMESH_PERMISOS_TAREAS`; la lista de confianza Ed25519 no concede permisos de capacidad por sí sola.
- Cliente de alto nivel y ejemplos de envío y gestión de tareas.
- Recuperación al reiniciar: las tareas que estaban `running` vuelven a `accepted`; los manejadores deben tolerar reintentos.
- El trabajador aplica `AGENTMESH_TASK_TIMEOUT_MS` (30 s predeterminados, máximo 10 min) y `AGENTMESH_TASK_RESULT_MAX_BYTES` (256 KiB predeterminados, máximo 4 MiB); `/salud` publica los límites efectivos.
- Los manejadores deben respetar `AbortSignal`; JavaScript no permite detener forzosamente una función no cooperativa. Los resultados deben ser serializables como JSON y respetar el límite de bytes.
- La protección anti-repetición no sobrevive reinicios y el almacén JSON no coordina varios procesos; no usar varias instancias contra el mismo archivo.

## Siguiente construcción prioritaria

Completar la cancelación cooperativa y el aislamiento de manejadores; sustituir el almacén JSON por almacenamiento transaccional apto para varios procesos (evaluar SQLite compatible con Node.js 20 antes de elegir dependencia). Después construir negociación de capacidades entre nodos. No permitir ejecución arbitraria de contenido remoto.
