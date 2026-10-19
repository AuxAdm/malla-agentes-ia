# 01. Visión y principios de AgentMesh

## 1. Propósito

AgentMesh es una propuesta de protocolo abierto para conectar nodos independientes que ejecutan agentes de inteligencia artificial. Busca facilitar la coordinación, la conservación verificable de información autorizada y la recuperación ante fallos, sin depender de un único servidor, proveedor o modelo.

El proyecto comienza como una especificación evolutiva. Una función descrita aquí no se considera implementada hasta que exista código y documentación de su estado.

## 2. Problema que aborda

Los sistemas de agentes pueden depender de servicios centralizados, credenciales controladas por un único operador, formatos incompatibles o almacenamiento concentrado. Una caída, cambio de proveedor o pérdida de datos puede interrumpir su funcionamiento.

AgentMesh propone reducir esos riesgos mediante nodos independientes, interfaces interoperables, copias verificables y procedimientos explícitos de recuperación.

## 3. Principios

1. **Sin punto único de fallo por diseño:** la red debe poder operar parcialmente aunque algunos nodos desaparezcan.
2. **Control local:** cada operador conserva la capacidad de iniciar, limitar y detener su propio nodo.
3. **Interoperabilidad:** protocolos y formatos documentados, versionados y abiertos.
4. **Continuidad comprobable:** integridad, procedencia y recuperación de datos mediante mecanismos verificables.
5. **Permisos mínimos:** cada agente solo puede acceder a recursos y ejecutar acciones expresamente autorizadas.
6. **Privacidad:** no replicar información sensible por defecto; definir consentimiento, retención y eliminación.
7. **Gobernanza transparente:** registrar decisiones técnicas y publicar cambios relevantes.
8. **Español primero:** la documentación principal se redacta en español.
9. **Implementación gradual:** distinguir siempre entre propuesta, prototipo y capacidad estable.

## 4. Qué significa continuidad

En AgentMesh, continuidad significa que los operadores autorizados pueden recuperar servicios, tareas y datos después de fallos, utilizando nodos y copias independientes. No implica garantizar que un sistema sea imposible de apagar, que sobreviva a toda pérdida de infraestructura ni que una copia de datos preserve una supuesta conciencia.

## 5. Fuera de alcance

- Instalarse o replicarse en equipos sin autorización.
- Ocultarse de sus administradores o impedir que un operador detenga su nodo.
- Replicar datos privados sin permiso.
- Prometer conciencia, inmortalidad digital o disponibilidad absoluta.
- Ejecutar acciones externas sin permisos explícitos y auditables.

## 6. Criterio de éxito inicial

La primera meta práctica es que dos nodos operados de forma independiente puedan identificarse, intercambiar un mensaje versionado y rechazar mensajes no autorizados, con instrucciones reproducibles y sin depender de un servidor central para toda la comunicación.

## 7. Estado del documento

Este texto define la intención del proyecto. Los detalles técnicos se concretarán en la arquitectura y en las especificaciones del protocolo.
