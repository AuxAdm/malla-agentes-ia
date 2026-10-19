# 07. Hoja de ruta

La hoja de ruta prioriza avances pequeños que puedan ejecutarse y entenderse. Cada etapa separa las capacidades propuestas de las ya implementadas.

## Etapa 1 — Especificación mínima

- [x] Publicar visión y principios.
- [x] Describir arquitectura inicial.
- [x] Definir responsabilidades de nodos y agentes.
- [x] Definir principios de memoria, recuperación y seguridad.
- [ ] Fijar el formato versionado del primer mensaje.
- [ ] Documentar configuración local de ejemplo.

## Etapa 2 — Primer prototipo

- Crear una implementación pequeña de nodo.
- Generar o cargar una identidad local.
- Permitir que dos nodos intercambien un mensaje.
- Validar esquema, versión e identidad.
- Rechazar mensajes inválidos o no autorizados.
- Registrar resultados sin exponer secretos.

## Etapa 3 — Tareas recuperables

- Añadir identificadores y estados de tarea.
- Guardar el último estado confirmado.
- Definir reintentos idempotentes.
- Añadir cancelación y límites operativos.

## Etapa 4 — Interoperabilidad

- Definir negociación de capacidades.
- Separar la interfaz de modelo del proveedor concreto.
- Permitir un modelo local o proveedor externo mediante adaptadores.
- Documentar compatibilidad de versiones.

## Etapa 5 — Memoria y recuperación entre nodos

- Implementar almacenamiento local con integridad verificable.
- Definir permisos y retención antes de replicar.
- Incorporar recuperación desde una copia autorizada.
- Resolver conflictos mediante reglas explícitas.

## Etapa 6 — Red distribuida

- Evaluar descubrimiento de pares.
- Introducir transporte entre pares donde aporte valor.
- Reducir dependencias centrales y documentar las restantes.
- Establecer mecanismos de actualización y revocación.

## Etapa 7 — Madurez

- Documentar despliegue reproducible.
- Añadir pruebas automatizadas centradas en los límites de confianza.
- Publicar modelo de amenazas y proceso de divulgación de vulnerabilidades.
- Elegir y declarar una licencia antes de distribuir una versión reutilizable.

## Regla de avance

No se marcará una capacidad como terminada por estar documentada. Se marcará cuando exista implementación y evidencia adecuada. El desarrollo priorizará construir el siguiente bloque funcional y dejará una revisión amplia para hitos concretos.
