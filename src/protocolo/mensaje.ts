export type TipoMensaje =
  | "hello"
  | "capabilities"
  | "task.submit"
  | "task.status"
  | "task.result"
  | "error";

export interface MensajeAgentMesh {
  version: 1;
  message_id: string;
  type: TipoMensaje;
  sender_id: string;
  recipient_id?: string;
  created_at: string;
  payload: Record<string, unknown>;
}

const TIPOS_VALIDOS = new Set<TipoMensaje>([
  "hello",
  "capabilities",
  "task.submit",
  "task.status",
  "task.result",
  "error"
]);

export type ResultadoValidacion =
  | { valido: true; mensaje: MensajeAgentMesh }
  | { valido: false; error: string };

export function validarMensaje(valor: unknown): ResultadoValidacion {
  if (typeof valor !== "object" || valor === null || Array.isArray(valor)) {
    return { valido: false, error: "El mensaje debe ser un objeto JSON." };
  }

  const entrada = valor as Record<string, unknown>;

  if (entrada.version !== 1) {
    return { valido: false, error: "Versión de protocolo no compatible." };
  }

  if (typeof entrada.message_id !== "string" || entrada.message_id.length < 1 || entrada.message_id.length > 128) {
    return { valido: false, error: "message_id debe ser texto de 1 a 128 caracteres." };
  }

  if (typeof entrada.type !== "string" || !TIPOS_VALIDOS.has(entrada.type as TipoMensaje)) {
    return { valido: false, error: "Tipo de mensaje no reconocido." };
  }

  if (typeof entrada.sender_id !== "string" || entrada.sender_id.length < 1 || entrada.sender_id.length > 128) {
    return { valido: false, error: "sender_id debe ser texto de 1 a 128 caracteres." };
  }

  if (entrada.recipient_id !== undefined &&
      (typeof entrada.recipient_id !== "string" || entrada.recipient_id.length > 128)) {
    return { valido: false, error: "recipient_id debe ser texto de hasta 128 caracteres." };
  }

  if (typeof entrada.created_at !== "string" || Number.isNaN(Date.parse(entrada.created_at))) {
    return { valido: false, error: "created_at debe ser una fecha reconocible." };
  }

  if (typeof entrada.payload !== "object" || entrada.payload === null || Array.isArray(entrada.payload)) {
    return { valido: false, error: "payload debe ser un objeto JSON." };
  }

  const mensaje: MensajeAgentMesh = {
    version: 1,
    message_id: entrada.message_id,
    type: entrada.type as TipoMensaje,
    sender_id: entrada.sender_id,
    ...(typeof entrada.recipient_id === "string" ? { recipient_id: entrada.recipient_id } : {}),
    created_at: entrada.created_at,
    payload: entrada.payload as Record<string, unknown>
  };

  return { valido: true, mensaje };
}
