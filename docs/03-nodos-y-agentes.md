# 03. Nodos y agentes

## 1. Nodo

Un nodo es una instancia de AgentMesh administrada por una persona u organización. Tiene configuración propia, identidad criptográfica, límites de recursos y políticas de acceso.

Un nodo debe poder:
- arrancar y detenerse bajo control de su operador;
- identificarse ante otros nodos;
- anunciar únicamente capacidades que realmente ofrece;
- validar mensajes y permisos antes de ejecutar acciones;
- registrar errores sin exponer secretos;
- recuperarse de una configuración inválida.

## 2. Agente

Un agente es un componente que propone o ejecuta pasos para completar una tarea. Puede usar un modelo local, un proveedor externo o reglas deterministas. La red no debe depender de que todos los agentes utilicen el mismo modelo.

El agente no obtiene automáticamente acceso al sistema operativo, archivos personales, red externa ni credenciales. Cada capacidad requiere autorización separada.

## 3. Separación de responsabilidades

- El nodo gestiona identidad, transporte, límites y políticas.
- El agente trabaja en una tarea dentro de las capacidades disponibles.
- El ejecutor aplica comprobaciones antes de realizar una acción.
- El registro de tareas conserva estado y resultados necesarios para reanudar trabajo.
- El operador decide qué agentes y capacidades habilitar.

## 4. Capacidades

Una capacidad es una declaración estructurada, no una garantía de confianza. Ejemplos: recibir_tarea, procesar_texto, guardar_memoria_autorizada y proponer_resultado.

Cada solicitud debe comprobarse contra las capacidades reales y los permisos locales. Los nombres definitivos y sus esquemas se normalizarán en futuras versiones.

## 5. Ciclo de vida de una tarea

Estados iniciales propuestos: pendiente, asignada, en_proceso, completada, fallida y cancelada.

Las transiciones inválidas se rechazan. La cancelación debe impedir nuevos pasos cuando sea posible, sin fingir que una acción externa ya ejecutada puede deshacerse.

## 6. Reintentos y duplicados

Cada tarea debe tener un identificador estable. El receptor registra los identificadores procesados para detectar duplicados. Las operaciones con efectos externos requieren idempotencia o confirmación explícita antes de repetirse.

## 7. Límites operativos

Los nodos deben poder establecer límites de tiempo, tamaño de mensajes, memoria, tareas concurrentes y presupuesto de llamadas a modelos. Si se alcanza un límite, el nodo debe rechazar o pausar el trabajo de forma visible.
