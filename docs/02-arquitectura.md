# 02. Arquitectura general

## 1. Vista por capas

AgentMesh se organiza inicialmente en cinco capas conceptuales. Esta separación permite sustituir implementaciones sin redefinir todo el protocolo.

### Capa 1: identidad y confianza

Cada nodo tiene una identidad criptográfica y una política local de confianza. La identidad demuestra qué clave firma un mensaje; no demuestra por sí sola que el nodo sea honesto.

### Capa 2: transporte

Permite que los nodos intercambien mensajes. La primera implementación puede usar transporte cliente-servidor para simplificar el prototipo, manteniendo una interfaz que permita incorporar transporte entre pares posteriormente. La arquitectura no debe afirmar descentralización total mientras dependa de infraestructura central.

### Capa 3: protocolo de mensajes

Define versión, tipo de mensaje, identificador, emisor, fecha, contenido y datos de autenticación. Los mensajes desconocidos o incompatibles se rechazan de forma segura.

### Capa 4: tareas y agentes

Representa tareas, estados, capacidades declaradas y resultados. Una tarea puede reintentarse o reasignarse si la política lo permite. Los reintentos deben ser idempotentes cuando puedan producir efectos externos.

### Capa 5: memoria y recuperación

Almacena referencias, metadatos y registros autorizados para que los nodos puedan reconstruir el estado necesario. La replicación será explícita, con controles de integridad, permisos y eliminación.

## 2. Tipos de componentes

- **Nodo:** instancia de software operada por una persona u organización.
- **Agente:** proceso lógico que realiza tareas dentro de permisos definidos.
- **Registro de tareas:** conserva el estado y el historial necesario para reanudar trabajo.
- **Almacén de memoria:** mantiene datos permitidos, versiones y hashes de integridad.
- **Directorio de pares:** descubre nodos mediante mecanismos que podrán evolucionar; no debe convertirse en una dependencia obligatoria única.
- **Política local:** reglas del operador sobre capacidades, datos, límites y acciones permitidas.

## 3. Flujo básico propuesto

1. El nodo inicia y carga su configuración local.
2. Carga su identidad y políticas de acceso.
3. Descubre o recibe la dirección de otro nodo.
4. Establece un canal de comunicación.
5. Valida identidad, versión y permisos.
6. Intercambia un mensaje limitado y registra el resultado.
7. Si hay un fallo, aplica una política explícita de reintento o informa del error.

## 4. Seguridad entre capas

La validación debe ocurrir en cada frontera: transporte, identidad, autorización, formato y ejecución. Un mensaje correctamente firmado todavía puede solicitar una acción no permitida. La autenticación no sustituye a la autorización.

## 5. Decisiones iniciales

- Comenzar con una implementación pequeña y comprensible.
- Mantener el protocolo independiente del proveedor de modelos.
- No exigir un modelo de IA para la comunicación básica entre nodos.
- Evitar almacenar secretos en archivos versionados.
- Mantener los registros útiles para depuración sin registrar datos privados innecesarios.
- Documentar los puntos que sigan centralizados y reducirlos por etapas.

## 6. Evolución prevista

**Fase A:** especificación de mensajes e identidad de nodo.

**Fase B:** prototipo de dos nodos con intercambio autenticado.

**Fase C:** registro de tareas y reanudación controlada.

**Fase D:** descubrimiento de pares y almacenamiento replicado opcional.

**Fase E:** compatibilidad con diferentes modelos y políticas de gobernanza.

Cada fase debe indicar claramente qué está implementado, qué limitaciones conserva y cómo puede probarlo un operador.
