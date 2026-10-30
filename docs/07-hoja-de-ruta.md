# 07. Hoja de ruta

La hoja de ruta prioriza avances pequeños que puedan ejecutarse y entenderse. Cada etapa separa las capacidades propuestas de las ya implementadas.

## Etapa 1 — Especificación mínima

- [x] Publicar visión y principios.
- [x] Describir arquitectura inicial.
- [x] Definir responsabilidades de nodos y agentes.
- [x] Definir principios de memoria, recuperación y seguridad.
- [ ] Fijar el formato versionado del primer mensaje.
- [x] Documentar configuración local de claves y confianza.

## Etapa 2 — Primer prototipo

- [x] Crear una implementación pequeña de nodo.
- [x] Verificar identidades Ed25519 cargadas mediante configuración local.
- [x] Añadir cliente de envío firmado y endpoint receptor autenticado.
- [x] Validar esquema, versión e identidad del emisor.
- [x] Rechazar firmas inválidas, nodos desconocidos, marcas de tiempo vencidas y nonces repetidos.
- [x] Responder con estado de recepción sin devolver claves ni credenciales.

**Pendiente para cerrar la etapa 2:** ejecutar compilación y prueba real entre dos procesos independientes; persistir la protección anti-repetición y definir rotación/revocación de claves.

## Etapa 3 — Tareas recuperables

- [x] Añadir identificadores y estado inicial persistente (`accepted`).
- [x] Guardar las tareas en un archivo local con reemplazo atómico.
- [x] Hacer idempotente el alta por `task_id`, emisor y huella del contenido.
- [x] Restringir la consulta de estado al nodo propietario.
- [x] Incorporar cliente TypeScript para registrar tareas y consultar su estado en nodos remotos.
- [ ] Persistir transiciones adicionales de estado y resultado.
- [ ] Añadir trabajador de ejecución con permisos explícitos, cancelación y límites operativos.
- [ ] Probar recuperación tras reinicio y concurrencia real antes de declarar esta etapa cerrada.

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
