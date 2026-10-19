# Núcleo de referencia de AgentMesh

Este directorio alojará la primera implementación ejecutable del protocolo.

## Objetivo inicial

Construir un nodo mínimo que pueda cargar configuración local, mantener una identidad, validar el formato de mensajes y comunicarse con otro nodo autorizado.

## Reglas de implementación

- No incluir credenciales ni claves privadas en el repositorio.
- Mantener las dependencias pequeñas y documentadas.
- Separar transporte, identidad, validación y ejecución de tareas.
- Rechazar por defecto entradas desconocidas o inválidas.
- No ejecutar instrucciones remotas como comandos del sistema.
- Documentar cómo iniciar y detener el nodo.
- No declarar funciones como implementadas hasta que el código exista.

## Estado

El núcleo aún no contiene una implementación ejecutable. La siguiente fase consiste en seleccionar el entorno de ejecución y crear el primer intercambio de mensajes entre dos nodos.
