import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export type EstadoTarea = "accepted" | "running" | "succeeded" | "failed" | "cancelled";
export type TipoEventoTarea = "created" | "started" | "succeeded" | "failed" | "cancelled" | "recovered";

export interface EventoTarea {
  event_id: string;
  type: TipoEventoTarea;
  at: string;
  detail?: string;
}

export interface TareaPersistida {
  task_id: string;
  owner_node: string;
  payload: Record<string, unknown>;
  payload_sha256: string;
  state: EstadoTarea;
  created_at: string;
  updated_at: string;
  result?: unknown;
  error?: string;
  events: EventoTarea[];
}

interface ArchivoTareas {
  version: 1;
  tareas: TareaPersistida[];
}

export type ResultadoAltaTarea =
  | { creada: true; tarea: TareaPersistida; repetida: boolean }
  | { creada: false; conflicto: true; error: string };

export type ResultadoTransicion =
  | { actualizada: true; tarea: TareaPersistida }
  | { actualizada: false; motivo: "not_found" | "invalid_transition" };

const RUTA_ARCHIVO = resolve(process.env.AGENTMESH_TASKS_FILE ?? "./data/agentmesh-tasks.json");
let colaEscrituras: Promise<unknown> = Promise.resolve();

function serializar<T>(operacion: () => Promise<T>): Promise<T> {
  const siguiente = colaEscrituras.then(operacion, operacion);
  colaEscrituras = siguiente.then(() => undefined, () => undefined);
  return siguiente;
}

function huella(valor: unknown): string {
  return createHash("sha256").update(JSON.stringify(valor)).digest("hex");
}

function evento(type: TipoEventoTarea, at: string, detail?: string): EventoTarea {
  return {
    event_id: randomUUID(),
    type,
    at,
    ...(detail ? { detail } : {})
  };
}

async function leerArchivo(): Promise<ArchivoTareas> {
  try {
    const texto = await readFile(RUTA_ARCHIVO, "utf8");
    const valor: unknown = JSON.parse(texto);
    if (typeof valor !== "object" || valor === null || !("version" in valor) ||
        valor.version !== 1 || !("tareas" in valor) || !Array.isArray(valor.tareas)) {
      throw new Error("El archivo de tareas tiene un formato no compatible; se conserva sin sobrescribir.");
    }
    const tareas = valor.tareas as TareaPersistida[];
    for (const tarea of tareas) {
      if (!Array.isArray(tarea.events)) tarea.events = [];
    }
    return { version: 1, tareas };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return { version: 1, tareas: [] };
    }
    throw error;
  }
}

async function guardarArchivo(archivo: ArchivoTareas): Promise<void> {
  await mkdir(dirname(RUTA_ARCHIVO), { recursive: true });
  const temporal = `${RUTA_ARCHIVO}.${process.pid}.tmp`;
  await writeFile(temporal, JSON.stringify(archivo, null, 2) + "\n", { encoding: "utf8", mode: 0o600 });
  await rename(temporal, RUTA_ARCHIVO);
}

export class AlmacenTareas {
  async registrar(taskId: string, ownerNode: string, payload: Record<string, unknown>, ahora = new Date().toISOString()): Promise<ResultadoAltaTarea> {
    return serializar<ResultadoAltaTarea>(async () => {
      const archivo = await leerArchivo();
      const hash = huella(payload);
      const existente = archivo.tareas.find((tarea) => tarea.task_id === taskId);
      if (existente) {
        if (existente.owner_node === ownerNode && existente.payload_sha256 === hash) {
          return { creada: true, tarea: existente, repetida: true };
        }
        return { creada: false, conflicto: true, error: "task_id ya existe con otro emisor o contenido; utiliza un identificador nuevo." };
      }
      const tarea: TareaPersistida = {
        task_id: taskId, owner_node: ownerNode, payload, payload_sha256: hash,
        state: "accepted", created_at: ahora, updated_at: ahora,
        events: [evento("created", ahora)]
      };
      archivo.tareas.push(tarea);
      await guardarArchivo(archivo);
      return { creada: true, tarea, repetida: false };
    });
  }

  async consultar(taskId: string, ownerNode: string): Promise<TareaPersistida | null> {
    return serializar<TareaPersistida | null>(async () => {
      const archivo = await leerArchivo();
      return archivo.tareas.find((item) => item.task_id === taskId && item.owner_node === ownerNode) ?? null;
    });
  }

  async siguientePendiente(): Promise<TareaPersistida | null> {
    return serializar<TareaPersistida | null>(async () => {
      const archivo = await leerArchivo();
      const tarea = archivo.tareas.find((item) => item.state === "accepted");
      if (!tarea) return null;
      const ahora = new Date().toISOString();
      tarea.state = "running";
      tarea.updated_at = ahora;
      tarea.events.push(evento("started", ahora));
      await guardarArchivo(archivo);
      return tarea;
    });
  }

  async transicionar(
    taskId: string,
    ownerNode: string,
    nuevoEstado: EstadoTarea,
    opciones: { result?: unknown; error?: string; detail?: string } = {}
  ): Promise<ResultadoTransicion> {
    return serializar<ResultadoTransicion>(async () => {
      const archivo = await leerArchivo();
      const tarea = archivo.tareas.find((item) => item.task_id === taskId && item.owner_node === ownerNode);
      if (!tarea) return { actualizada: false, motivo: "not_found" };
      const permitidas: Record<EstadoTarea, EstadoTarea[]> = {
        accepted: ["running", "cancelled"],
        running: ["succeeded", "failed", "cancelled"],
        succeeded: [], failed: [], cancelled: []
      };
      if (!permitidas[tarea.state].includes(nuevoEstado)) {
        return { actualizada: false, motivo: "invalid_transition" };
      }
      const ahora = new Date().toISOString();
      tarea.state = nuevoEstado;
      tarea.updated_at = ahora;
      if (nuevoEstado === "succeeded") {
        tarea.result = opciones.result;
        tarea.events.push(evento("succeeded", ahora));
      } else if (nuevoEstado === "failed") {
        tarea.error = (opciones.error ?? "La tarea no pudo completarse.").slice(0, 2000);
        tarea.events.push(evento("failed", ahora, tarea.error));
      } else if (nuevoEstado === "cancelled") {
        tarea.events.push(evento("cancelled", ahora, opciones.detail ?? "Cancelada por el propietario."));
      } else {
        tarea.events.push(evento("started", ahora));
      }
      await guardarArchivo(archivo);
      return { actualizada: true, tarea };
    });
  }

  async recuperarEnCurso(): Promise<number> {
    return serializar<number>(async () => {
      const archivo = await leerArchivo();
      const ahora = new Date().toISOString();
      let recuperadas = 0;
      for (const tarea of archivo.tareas) {
        if (tarea.state === "running") {
          tarea.state = "accepted";
          tarea.updated_at = ahora;
          tarea.events.push(evento("recovered", ahora, "Reencolada tras reiniciar el nodo."));
          recuperadas++;
        }
      }
      if (recuperadas > 0) await guardarArchivo(archivo);
      return recuperadas;
    });
  }
}

export const almacenTareas = new AlmacenTareas();
