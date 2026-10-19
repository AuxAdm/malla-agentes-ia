# Especificación inicial: mensaje AgentMesh v1

**Estado:** borrador de diseño, no implementación estable.

## 1. Propósito

Definir un sobre mínimo común para intercambiar mensajes entre nodos. Esta versión inicial no fija todavía un algoritmo criptográfico ni un transporte obligatorio.

## 2. Campos conceptuales

- version: versión del protocolo; para este borrador, el valor es 1.
- message_id: identificador único del mensaje.
- type: tipo de mensaje.
- sender_id: identificador del nodo emisor.
- recipient_id: identificador del nodo destinatario cuando aplique.
- created_at: fecha de creación en formato UTC normalizado.
- payload: contenido definido por el tipo de mensaje.
- auth: datos de autenticación definidos por la implementación.

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

El receptor mantiene, dentro de una ventana configurada, identificadores de mensajes procesados para detectar repeticiones. La duración y persistencia de esa ventana se especificarán en la implementación.

## 6. Compatibilidad

Los cambios incompatibles requieren una nueva versión. Las extensiones deben documentar nombres, tipos, límites y comportamiento cuando un receptor no las conozca.

## 7. Próximo paso técnico

Convertir este diseño conceptual en un esquema formal validable automáticamente y en ejemplos válidos e inválidos. Hasta entonces, ningún campo de este documento debe tratarse como contrato definitivo.
