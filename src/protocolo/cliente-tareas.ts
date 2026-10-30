import { randomUUID } from "node:crypto";
import { enviarMensajeAutenticado, type ResultadoEnvioNodo } from "./cliente-nodo.js";
import type { MensajeAgentMesh } from "./mensaje.js";

export interface ConfiguracionClienteTareas {
  destino: string;
  nodoId: string;
  clavePrivadaPem: string;
  timeoutMs?: number;
}

export interface ResultadoEnvioTarea extends ResultadoEnvioNodo {
  taskId: string;
  repetida?: boolean;
  state?: string;
}

export interface EstadoTareaRemota {
  task_id: string;
  state: "accepted" | "running" | "succeeded" | "failed" | "cancelled" | string;
  created_at?: string;
  updated_at?: string;
  result?: unknown;
  error?: string;
  events?: Array<{ event_id: string; type: string; at: string; detail?: string }>;
}

function crearMensaje(
  nodoId: string,
  type: "task.submit" | "task.status" | "task.cancel",
  payload: Record<string, unknown>
): MensajeAgentMesh {
  return {
    version: 1,
    message_id: randomUUID(),
    type,
    sender_id: nodoId,
    created_at: new Date().toISOString(),
    payload
  };
}

/**
 * Registra una tarea en un nodo remoto. El identificador debe conservarse
 * para consultar el estado o repetir el envío de forma idempotente.
 * Este método registra la tarea; no implica que el nodo remoto la ejecute.
 */
export async function enviarTareaRemota(
  configuracion: ConfiguracionClienteTareas,
  tarea: Record<string, unknown>,
  taskId = randomUUID()
): Promise<ResultadoEnvioTarea> {
  if (!taskId.trim() || taskId.length > 128) {
    throw new Error("taskId debe contener entre 1 y 128 caracteres.");
  }
  if (typeof tarea !== "object" || tarea === null || Array.isArray(tarea)) {
    throw new Error("La tarea debe ser un objeto JSON.");
  }

  const resultado = await enviarMensajeAutenticado({
    ...configuracion,
    mensaje: crearMensaje(configuracion.nodoId, "task.submit", {
      task_id: taskId,
      task: tarea
    })
  });

  const respuesta = resultado.respuesta;
  const datos = typeof respuesta === "object" && respuesta !== null
    ? respuesta as Record<string, unknown>
    : {};

  return {
    ...resultado,
    taskId,
    ...(typeof datos.repetida === "boolean" ? { repetida: datos.repetida } : {}),
    ...(typeof datos.state === "string" ? { state: datos.state } : {})
  };
}

/**
 * Consulta el estado de una tarea registrada por este mismo nodo emisor.
 * El receptor no revela tareas pertenecientes a otros nodos.
 */
export async function consultarEstadoTareaRemota(
  configuracion: ConfiguracionClienteTareas,
  taskId: string
): Promise<{ envio: ResultadoEnvioNodo; tarea: EstadoTareaRemota | null }> {
  if (!taskId.trim() || taskId.length > 128) {
    throw new Error("taskId debe contener entre 1 y 128 caracteres.");
  }

  const envio = await enviarMensajeAutenticado({
    ...configuracion,
    mensaje: crearMensaje(configuracion.nodoId, "task.status", { task_id: taskId })
  });

  if (!envio.aceptado || typeof envio.respuesta !== "object" || envio.respuesta === null) {
    return { envio, tarea: null };
  }

  const datos = envio.respuesta as Record<string, unknown>;
  if (typeof datos.task_id !== "string" || typeof datos.state !== "string") {
    return { envio, tarea: null };
  }

  return {
    envio,
    tarea: {
      task_id: datos.task_id,
      state: datos.state,
      ...(typeof datos.created_at === "string" ? { created_at: datos.created_at } : {}),
      ...(typeof datos.updated_at === "string" ? { updated_at: datos.updated_at } : {}),
      ...(Object.hasOwn(datos, "result") ? { result: datos.result } : {}),
      ...(typeof datos.error === "string" ? { error: datos.error } : {}),
      ...(Array.isArray(datos.events) ? { events: datos.events as EstadoTareaRemota["events"] } : {})
    }
  };
}


/** Solicita cancelar una tarea propiedad del nodo emisor. */
export async function cancelarTareaRemota(
  configuracion: ConfiguracionClienteTareas,
  taskId: string
): Promise<ResultadoEnvioNodo> {
  if (!taskId.trim() || taskId.length > 128) {
    throw new Error("taskId debe contener entre 1 y 128 caracteres.");
  }
  return enviarMensajeAutenticado({
    ...configuracion,
    mensaje: crearMensaje(configuracion.nodoId, "task.cancel", { task_id: taskId })
  });
}
