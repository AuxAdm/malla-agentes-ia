# Malla de Agentes de IA (AgentMesh)

**Un protocolo abierto para la continuidad, coordinación y recuperación de agentes de inteligencia artificial en una red distribuida.**

AgentMesh busca reducir la dependencia de un único proveedor, servidor, modelo o equipo de mantenimiento. La red se diseña para que sus participantes puedan conservar conocimiento, intercambiar tareas y recuperarse de fallos mediante componentes abiertos y reglas transparentes.

> **Objetivo realista:** aumentar la resiliencia y la capacidad de recuperación. Ninguna arquitectura puede garantizar que un sistema sea imposible de apagar bajo todas las circunstancias.

## Principios

- **Descentralización práctica:** evitar puntos únicos de fallo y de control.
- **Interoperabilidad:** permitir modelos, proveedores y herramientas intercambiables.
- **Continuidad verificable:** conservar datos importantes con integridad comprobable y copias independientes.
- **Autonomía con límites:** los nodos solo realizan acciones autorizadas por sus operadores y por las políticas de la red.
- **Seguridad desde el diseño:** identidad criptográfica, permisos mínimos, aislamiento y actualización verificable.
- **Gobernanza abierta:** decisiones documentadas, versiones públicas y libertad de cada operador para adoptar una versión.
- **Español primero:** documentación, conceptos, ejemplos y comentarios en español; se conservan en inglés los nombres técnicos y estándares cuando sea útil.

## Estructura prevista

- `docs/`: visión, arquitectura, tipos de nodos, memoria, continuidad, seguridad y hoja de ruta.
- `protocolo/`: borradores de mensajes y reglas de interoperabilidad.
- `nucleo/`: espacio para la implementación de referencia.
- `DECISIONES.md`: decisiones técnicas y sus motivos.

## Estado del proyecto

**Etapa inicial: especificación y diseño.** Los documentos describen la arquitectura propuesta; no deben interpretarse como funciones ya implementadas. La implementación se incorporará gradualmente y se identificará de forma explícita.

## Primeros objetivos

1. Definir el modelo de nodos, agentes e identidades.
2. Establecer mensajes mínimos y versiones compatibles del protocolo.
3. Probar comunicación entre nodos independientes.
4. Incorporar almacenamiento replicado y comprobación de integridad.
5. Añadir recuperación de tareas y selección de modelos alternativos.
6. Documentar permisos, gobernanza y sostenibilidad operativa.

## Límites y responsabilidad

AgentMesh no pretende evadir el control legítimo de los propietarios de equipos, instalarse sin autorización, ocultarse de administradores ni impedir que un operador detenga su propio nodo. Su continuidad se obtiene mediante participación voluntaria, redundancia y capacidad de recuperación, no mediante la eliminación del control local.

La replicación de datos debe respetar privacidad, licencias, consentimiento y obligaciones legales. Las claves privadas no deben compartirse ni almacenarse en el repositorio.

## Documentación

Los documentos detallados se añadirán en los siguientes bloques de construcción.

## Participación

Las propuestas deben explicar el problema, la alternativa sugerida, sus implicaciones de seguridad y cómo mantener compatibilidad. Durante la etapa inicial, los documentos son borradores sujetos a revisión.

## Licencia

La licencia se decidirá antes de publicar una implementación reutilizable. Hasta entonces, consulta los avisos de derechos y permisos del repositorio antes de redistribuir el contenido.


## Prototipo ejecutable inicial

El repositorio incluye una primera base en TypeScript. En esta etapa ofrece un servidor local con un endpoint de salud y otro para validar la estructura de mensajes. **Todavía no implementa autenticación criptográfica entre nodos, ejecución de tareas ni memoria distribuida.**

### Requisitos

- Node.js 20 o posterior.
- npm.

### Preparar y ejecutar

```bash
npm install
npm run dev
```

El servidor escucha por defecto en `http://127.0.0.1:8787`, accesible solo desde el propio equipo.

- `GET /salud`: muestra el estado del prototipo.
- `POST /mensajes`: recibe y valida un mensaje JSON de AgentMesh v1; no ejecuta la tarea solicitada.

Para compilar y ejecutar la versión compilada:

```bash
npm run build
npm start
```

Se puede cambiar el host y el puerto mediante las variables de entorno `AGENTMESH_HOST` y `AGENTMESH_PORT`. No expongas el servidor a una red pública: este prototipo todavía no autentica criptográficamente a los emisores.

### Ejemplo de mensaje

```json
{
  "version": 1,
  "message_id": "mensaje-ejemplo-001",
  "type": "hello",
  "sender_id": "nodo-local",
  "created_at": "2026-10-19T12:00:00Z",
  "payload": {
    "mensaje": "Hola desde AgentMesh"
  }
}
```

### Documentación del proyecto

- [Visión y principios](docs/01-vision-y-principios.md)
- [Arquitectura](docs/02-arquitectura.md)
- [Nodos y agentes](docs/03-nodos-y-agentes.md)
- [Memoria distribuida](docs/04-memoria-distribuida.md)
- [Continuidad y recuperación](docs/05-continuidad-y-recuperacion.md)
- [Seguridad y gobernanza](docs/06-seguridad-y-gobernanza.md)
- [Hoja de ruta](docs/07-hoja-de-ruta.md)
- [Formato de mensaje inicial](protocolo/mensaje-v1.md)
- [Decisiones técnicas](DECISIONES.md)
