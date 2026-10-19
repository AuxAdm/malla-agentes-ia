# Especificación inicial: mensaje AgentMesh v1

**Estado:** borrador de diseño; el prototipo implementa autenticación HTTP Ed25519 para la recepción de mensajes.

## 1. Propósito

Definir un sobre mínimo común para intercambiar mensajes entre nodos. El prototipo firma la solicitud HTTP con Ed25519. La autenticación se transmite en cabeceras y firma el método, la ruta, el identificador del emisor, la marca de tiempo, un nonce y la huella SHA-256 del cuerpo JSON.

## 2. Campos conceptuales

- version: versión del protocolo; para este borrador, el valor es 1.
- message_id: identificador único del mensaje.
- type: tipo de mensaje.
- sender_id: identificador del nodo emisor.
- recipient_id: identificador del nodo destinatario cuando aplique.
- created_at: fecha de creación en formato UTC normalizado.
- payload: contenido definido por el tipo de mensaje.
- auth: en el prototipo, la autenticación se transporta en cabeceras HTTP `x-agentmesh-node`, `x-agentmesh-timestamp`, `x-agentmesh-nonce` y `x-agentmesh-signature`; no forma parte del cuerpo JSON.

## 3. Tipos iniciales propuestos

- hello: anunciar que un nodo está disponible.
- capabilities: describir capacidades declaradas.
- task.submit: solicitar una tarea.
- task.status: comunicar el estado de una tarea.
- task.result: comunicar un resultado.
- error: informar de un rechazo o fallo.

Estos nombres son provisionales hasta que se publique un esquema formal.

## 4. Validación

El receptor debe rechazar mensajes sin versión reconocida, sin identificador, de tamaño excesivo, con campos obligatorios ausentes o con autenticación inválida. Los tipos desconocidos no deben ejecutar acciones.

La autenticación no autoriza automáticamente el contenido: cada solicitud se evalúa contra la política local.

## 5. Duplicados

El prototipo rechaza nonces repetidos por emisor durante la ventana de cinco minutos. La caché actual vive en memoria y se pierde al reiniciar; la persistencia y coordinación anti-repetición entre varias instancias quedan pendientes.

## 6. Compatibilidad

Los cambios incompatibles requieren una nueva versión. Las extensiones deben documentar nombres, tipos, límites y comportamiento cuando un receptor no las conozca.

## 7. Próximo paso técnico

Convertir este diseño conceptual en un esquema formal validable automáticamente y en ejemplos válidos e inválidos. Hasta entonces, ningún campo de este documento debe tratarse como contrato definitivo.
