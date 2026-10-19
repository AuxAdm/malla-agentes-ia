import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export type EstadoTarea = "accepted" | "running" | "succeeded" | "failed" | "cancelled";

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
}

interface ArchivoTareas {
  version: 1;
  tareas: TareaPersistida[];
}

export type ResultadoAltaTarea =
  | { creada: true; tarea: TareaPersistida; repetida: boolean }
  | { creada: false; conflicto: true; error: string };

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

async function leerArchivo(): Promise<ArchivoTareas> {
  try {
    const texto = await readFile(RUTA_ARCHIVO, "utf8");
    const valor: unknown = JSON.parse(texto);
    if (typeof valor !== "object" || valor === null || !("version" in valor) ||
        valor.version !== 1 || !("tareas" in valor) || !Array.isArray(valor.tareas)) {
      throw new Error("El archivo de tareas tiene un formato no compatible; se conserva sin sobrescribir.");
    }
    return valor as ArchivoTareas;
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
  async registrar(
    taskId: string,
    ownerNode: string,
    payload: Record<string, unknown>,
    ahora = new Date().toISOString()
  ): Promise<ResultadoAltaTarea> {
    return serializar(async () => {
      const archivo = await leerArchivo();
      const hash = huella(payload);
      const existente = archivo.tareas.find((tarea) => tarea.task_id === taskId);

      if (existente) {
        if (existente.owner_node === ownerNode && existente.payload_sha256 === hash) {
          return { creada: true, tarea: existente, repetida: true };
        }
        return {
          creada: false,
          conflicto: true,
          error: "task_id ya existe con otro emisor o contenido; utiliza un identificador nuevo."
        };
      }

      const tarea: TareaPersistida = {
        task_id: taskId,
        owner_node: ownerNode,
        payload,
        payload_sha256: hash,
        state: "accepted",
        created_at: ahora,
        updated_at: ahora
      };
      archivo.tareas.push(tarea);
      await guardarArchivo(archivo);
      return { creada: true, tarea, repetida: false };
    });
  }

  async consultar(taskId: string, ownerNode: string): Promise<TareaPersistida | null> {
    return serializar(async () => {
      const archivo = await leerArchivo();
      const tarea = archivo.tareas.find((item) => item.task_id === taskId && item.owner_node === ownerNode);
      return tarea ?? null;
    });
  }
}

export const almacenTareas = new AlmacenTareas();
