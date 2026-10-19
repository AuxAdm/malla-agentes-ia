# 04. Memoria distribuida

## 1. Objetivo

La memoria distribuida permite que nodos autorizados conserven y recuperen información útil sin depender de una única copia. La replicación es opcional y está sujeta a permisos, privacidad y políticas de retención.

## 2. Tipos de memoria

- **Memoria de tarea:** estado mínimo necesario para reanudar una tarea.
- **Memoria operativa:** configuración no secreta, capacidades y estado del nodo.
- **Memoria de conocimiento:** documentos o resultados que el propietario autorizó a compartir.
- **Índice de referencias:** metadatos y hashes que permiten localizar y verificar contenido.
- **Secretos:** claves privadas y credenciales; no forman parte de la memoria replicada normal.

## 3. Metadatos de cada objeto

La estructura futura deberá contemplar identificador único, versión del formato, propietario o ámbito de control, fechas de creación y actualización, clasificación de sensibilidad, política de acceso y retención, hash del contenido y referencias de procedencia cuando existan.

Los campos exactos se fijarán en una especificación versionada antes de considerarlos estables.

## 4. Integridad y procedencia

Los hashes permiten detectar cambios de contenido, pero no prueban que el contenido sea verdadero. Las firmas pueden vincular una publicación a una identidad criptográfica, pero tampoco garantizan la honestidad del emisor. Los consumidores deben distinguir integridad, autoría y veracidad.

## 5. Replicación

Antes de replicar un objeto, el nodo debe verificar que la política permite compartirlo, el destino está autorizado, la clasificación de datos lo permite, existe una regla de retención y el operador puede revocar futuras transferencias cuando corresponda.

La eliminación completa de todas las copias no puede garantizarse si otros participantes conservaron copias. Esta limitación debe explicarse antes de compartir datos.

## 6. Conflictos y versiones

Los cambios deben producir versiones identificables. No se sobrescribe silenciosamente información en conflicto. La política de resolución dependerá del tipo de dato y quedará documentada.

## 7. Privacidad por defecto

- No replicar conversaciones privadas automáticamente.
- No publicar datos personales en índices públicos.
- Minimizar metadatos y registros.
- Separar datos compartibles de secretos.
- Permitir configurar retención y exclusión de objetos.
- Evitar que una referencia pública revele contenido o identidad personal innecesariamente.

## 8. Evolución

La primera versión puede guardar datos localmente con hashes. La replicación entre nodos se incorporará después de definir autorización, revocación, conflictos y límites de almacenamiento.
