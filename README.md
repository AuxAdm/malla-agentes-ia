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

**Prototipo en evolución:** dos nodos pueden intercambiar mensajes autenticados con Ed25519. El receptor registra tareas, ejecuta capacidades locales expresamente registradas, conserva estados e historial y permite consultar o cancelar tareas. La ejecución está limitada a los manejadores que el operador instala y habilita.

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

El repositorio incluye un servidor TypeScript, validación de mensajes AgentMesh v1, autenticación Ed25519 y un trabajador local de tareas. **No implementa todavía memoria distribuida, ejecución multi-proceso ni selección automática de nodos alternativos.**

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
- `POST /mensajes`: exige cabeceras firmadas Ed25519, verifica identidad, vigencia y repetición, y valida el mensaje.
- `task.submit`: registra una tarea persistente con `payload.task_id` y `payload.task`.
- `task.status`: devuelve estado, resultado, error e historial; solo responde al nodo propietario.
- `task.cancel`: solicita cancelar una tarea del nodo emisor.
- El trabajador local procesa tareas `accepted` con un manejador registrado por el operador. El primer manejador incluido es `demo.echo`.

Para compilar y ejecutar la versión compilada:

```bash
npm run build
npm start
```

Se puede cambiar el host y el puerto mediante `AGENTMESH_HOST` y `AGENTMESH_PORT`. Para aceptar mensajes, configura `AGENTMESH_NODOS_CONFIABLES` como un objeto JSON que asocie cada identificador de nodo con su clave pública Ed25519 en formato PEM. Si no hay una lista válida, `POST /mensajes` responde `503`. Para conexiones remotas, usa HTTPS (por ejemplo, mediante un proxy TLS); el cliente solo permite HTTP en loopback para pruebas locales. La ventana de firma es de cinco minutos y el registro anti-repetición está en memoria, por lo que aún no persiste entre reinicios.

### Preparar claves para dos nodos

Genera un par independiente en cada equipo; no compartas ni subas la clave privada:

```bash
openssl genpkey -algorithm ED25519 -out nodo-a-privada.pem
openssl pkey -in nodo-a-privada.pem -pubout -out nodo-a-publica.pem
```

En el nodo receptor, configura `AGENTMESH_NODOS_CONFIABLES` con los identificadores y las claves públicas autorizadas. En el emisor, carga la clave privada desde un gestor de secretos o una variable local. Para mensajes generales usa `enviarMensajeAutenticado` de `src/protocolo/cliente-nodo.ts`; para tareas usa `enviarTareaRemota` y `consultarEstadoTareaRemota` de `src/protocolo/cliente-tareas.ts`. La firma cubre método, ruta, identificador del emisor, marca de tiempo, nonce y huella SHA-256 del cuerpo.

Ejemplo de configuración del emisor en Bash (sustituye la ruta y el identificador por los de tu nodo):

```bash
export AGENTMESH_DESTINO="https://direccion-del-nodo-receptor/mensajes"
export AGENTMESH_NODO_ID="nodo-a"
export AGENTMESH_CLAVE_PRIVADA_ARCHIVO="$HOME/.agentmesh/nodo-a-privada.pem"
npm run send:example
```

Para registrar una tarea y consultar inmediatamente su estado desde el nodo emisor:

```bash
export AGENTMESH_TASK_ID="tarea-demo-001"
export AGENTMESH_TASK_JSON='{"tipo":"demo.echo","entrada":"Hola desde AgentMesh"}'
npm run task:example
```

El identificador es opcional; si se omite, el cliente genera uno nuevo. Conserva el mismo identificador para reintentar un registro de forma idempotente. El ejemplo utiliza `demo.echo`, espera la finalización y muestra el resultado e historial.

En el receptor, define `AGENTMESH_NODOS_CONFIABLES` como JSON: cada clave es un identificador autorizado y cada valor es su clave pública PEM. Los saltos de línea pueden representarse como `\\n`. No incluyas la clave privada en esa lista ni en GitHub.

Además, el operador del receptor debe autorizar las capacidades por nodo mediante `AGENTMESH_PERMISOS_TAREAS`. Para permitir que `nodo-a` use únicamente la capacidad de demostración:

```bash
export AGENTMESH_PERMISOS_TAREAS='{"nodo-a":["demo.echo"]}'
```

Cada identificador debe coincidir exactamente con el emisor autenticado. Si no existe una autorización explícita, la solicitud de tarea se rechaza con `403`. No basta con estar en la lista de nodos confiables: confianza criptográfica y permiso de ejecución son controles separados.

La autenticación identifica al nodo, pero no concede permiso para ejecutar cualquier operación. El trabajador solo acepta tipos registrados localmente. `demo.echo` devuelve el campo `entrada` y sirve como demostración sin ejecutar comandos externos. Las tareas conservan transiciones e historial (`created`, `started`, `succeeded`, `failed`, `cancelled`, `recovered`). Si el nodo reinicia mientras una tarea estaba `running`, la vuelve a poner en cola; por ello, los manejadores futuros deberán diseñarse para tolerar reintentos y evitar efectos duplicados. Los datos se guardan por defecto en `./data/agentmesh-tasks.json`, configurable con `AGENTMESH_TASKS_FILE`. La escritura se serializa dentro del proceso y usa reemplazo atómico de archivo; no es un almacén multiinstancia y no debe compartirse entre varios procesos concurrentes. El ejemplo requiere HTTPS para destinos remotos y solo permite HTTP para loopback local.

### Ejemplo de envío de tarea

Usa un mensaje firmado cuyo tipo sea `task.submit` y cuyo `payload` contenga un identificador y un objeto de tarea:

```json
{
  "version": 1,
  "message_id": "mensaje-tarea-001",
  "type": "task.submit",
  "sender_id": "nodo-a",
  "created_at": "2026-10-19T12:00:00Z",
  "payload": {
    "task_id": "tarea-001",
    "task": { "tipo": "demo.echo", "entrada": "datos" }
  }
}
```

La respuesta indica `state: accepted`. Reenviar el mismo `task_id` desde el mismo nodo con el mismo contenido devuelve la tarea existente; reutilizarlo con otro contenido produce `409 Conflict`. El estado y el historial se conservan en el archivo configurado. Para ejecutar el ejemplo, la tarea debe declarar `"tipo": "demo.echo"`; cualquier tipo no registrado localmente termina en `failed` sin ejecutar código recibido.

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
