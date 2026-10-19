# 06. Seguridad y gobernanza

## 1. Modelo de amenazas inicial

AgentMesh debe contemplar nodos comprometidos, mensajes falsificados, repetición de mensajes, abuso de capacidades, fuga accidental de datos, dependencias indisponibles y errores de configuración.

No se asume que un nodo sea confiable únicamente porque participa en la red.

## 2. Identidad y autenticación

Cada nodo utilizará una identidad criptográfica. Los mensajes autenticados deben vincularse al emisor y al contenido exacto firmado. La gestión, rotación y revocación de claves se especificará antes de una versión estable.

Las claves privadas deben permanecer bajo control del operador y nunca incluirse en el repositorio.

## 3. Autorización

La autenticación responde quién envió un mensaje; la autorización determina qué puede hacer. Cada acción se valida contra permisos explícitos, ámbito, caducidad y política local.

Se aplica el principio de mínimo privilegio. No se permiten permisos globales implícitos.

## 4. Protección de mensajes

Las futuras especificaciones deberán definir versión y tipo, identificador único, emisor y destinatario o ámbito, límites de tamaño, protección frente a repetición, autenticación e integridad, y comportamiento ante campos desconocidos o versiones incompatibles.

## 5. Aislamiento de agentes

Los agentes no deben ejecutar instrucciones recibidas como comandos del sistema sin una capa de autorización separada. Las herramientas externas deben declarar permisos, límites y resultados observables. Las operaciones destructivas o de alto impacto requieren confirmación o política específica.

## 6. Registros

Los registros deben facilitar la investigación de fallos sin almacenar tokens, claves, contraseñas ni contenido privado innecesario. Deben tener límites de retención y acceso.

## 7. Gobernanza abierta

Las decisiones se registran en DECISIONES.md. Los cambios del protocolo deben incluir el problema que resuelven, compatibilidad, riesgos de seguridad y privacidad, alternativas consideradas y plan de migración.

Una implementación puede adoptar una versión publicada, pero debe indicar qué partes cumple y qué extensiones añade.

## 8. Gestión de vulnerabilidades

Las vulnerabilidades deben describir impacto, versiones afectadas, mitigación y estado de corrección. Los secretos expuestos se revocan; borrar el archivo del historial no sustituye la revocación.

## 9. Límites de confianza

El contenido de agentes, documentos y nodos remotos se trata como entrada no confiable. Las firmas no convierten una instrucción en segura y la reputación no sustituye las comprobaciones técnicas.

## 10. Estado

Estas reglas son principios de diseño. Los mecanismos criptográficos y formatos concretos se fijarán en las especificaciones de implementación.
