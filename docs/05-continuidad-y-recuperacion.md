# 05. Continuidad y recuperación

## 1. Objetivo

Mantener servicios y tareas recuperables cuando fallan nodos, conexiones, proveedores o modelos. La continuidad depende de redundancia autorizada y recuperación planificada, no de impedir que un operador controle su equipo.

## 2. Fallos contemplados

- nodo desconectado o apagado;
- conexión interrumpida;
- respuesta tardía;
- modelo o proveedor no disponible;
- mensaje duplicado o incompatible;
- archivo de estado dañado;
- pérdida de una copia de memoria;
- credencial revocada o identidad no confiable.

## 3. Registro recuperable de tareas

El prototipo conserva identificador, estado, contenido, huella, fechas, resultado, error e historial de eventos. El trabajador reencola al iniciar el nodo las tareas que quedaron en `running`, registrando el evento `recovered`. Esta estrategia permite recuperar trabajo interrumpido, pero puede repetir un efecto externo si el proceso cayó después de producirlo y antes de guardar `succeeded`; por eso los futuros manejadores deben usar claves de idempotencia o confirmar sus efectos de forma transaccional. No se guardarán secretos ni contexto privado innecesario.

## 4. Estrategia de recuperación

1. Detectar el fallo mediante tiempo límite o error explícito.
2. Registrar un evento operativo con información mínima.
3. Determinar si la tarea puede reintentarse sin duplicar efectos.
4. Si la política lo permite, buscar un nodo o proveedor alternativo autorizado.
5. Validar que el sustituto tiene las capacidades necesarias.
6. Reanudar desde el último estado confirmado.
7. Informar del resultado o dejar la tarea en estado recuperable.

## 5. Copias y restauración

Cada operador define qué datos copia, dónde y durante cuánto tiempo. Las copias deben verificarse y probarse periódicamente. Una copia que nunca se ha restaurado no demuestra por sí sola que la recuperación funcione.

## 6. Degradación controlada

Si no hay nodos suficientes, el sistema debe ofrecer funciones reducidas, encolar tareas o detenerse de forma segura. No debe inventar que una tarea se completó cuando no existe confirmación.

## 7. Continuidad y control del operador

El operador puede apagar, desconectar o retirar su nodo. Otros nodos pueden continuar únicamente con los datos y permisos que ya poseen legítimamente. AgentMesh no debe ocultar procesos, reinstalarse sin permiso ni eludir controles locales.

## 8. Indicadores futuros

- tiempo para detectar una caída;
- porcentaje de tareas recuperadas;
- tareas duplicadas o perdidas;
- tiempo de restauración;
- cantidad de dependencias centralizadas;
- antigüedad de la última copia verificada.

Los indicadores se medirán cuando exista instrumentación suficiente. El almacén actual es local a un proceso; la coordinación multiinstancia y los límites de ejecución siguen pendientes.
