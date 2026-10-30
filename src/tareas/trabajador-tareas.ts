import { almacenTareas, type TareaPersistida } from "./almacen-tareas.js";

export type ManejadorTarea = (
  entrada: Record<string, unknown>,
  contexto: { taskId: string; ownerNode: string; signal: AbortSignal }
) => Promise<unknown>;

export class RegistroManejadoresTarea {
  private readonly manejadores = new Map<string, ManejadorTarea>();

  registrar(tipo: string, manejador: ManejadorTarea): void {
    if (!/^[a-z][a-z0-9._-]{1,63}$/.test(tipo)) {
      throw new Error("El tipo de manejador debe ser un identificador seguro.");
    }
    if (this.manejadores.has(tipo)) throw new Error(`Ya existe un manejador registrado para ${tipo}.`);
    this.manejadores.set(tipo, manejador);
  }

  obtener(tipo: string): ManejadorTarea | undefined {
    return this.manejadores.get(tipo);
  }

  tipos(): string[] {
    return [...this.manejadores.keys()].sort();
  }
}

export class TrabajadorTareas {
  private temporizador: ReturnType<typeof setInterval> | undefined;
  private procesando = false;
  private readonly abortos = new Map<string, AbortController>();

  constructor(
    private readonly registro: RegistroManejadoresTarea,
    private readonly intervaloMs = 750
  ) {}

  async iniciar(): Promise<number> {
    const recuperadas = await almacenTareas.recuperarEnCurso();
    if (!this.temporizador) {
      this.temporizador = setInterval(() => {
        void this.procesarSiguiente();
      }, this.intervaloMs);
      this.temporizador.unref?.();
    }
    void this.procesarSiguiente();
    return recuperadas;
  }

  detener(): void {
    if (this.temporizador) clearInterval(this.temporizador);
    this.temporizador = undefined;
    for (const controlador of this.abortos.values()) controlador.abort();
  }

  async cancelar(taskId: string, ownerNode: string): Promise<boolean> {
    const tarea = await almacenTareas.consultar(taskId, ownerNode);
    if (!tarea) return false;
    this.abortos.get(taskId)?.abort();
    const resultado = await almacenTareas.transicionar(taskId, ownerNode, "cancelled");
    return resultado.actualizada;
  }

  private async procesarSiguiente(): Promise<void> {
    if (this.procesando) return;
    this.procesando = true;
    try {
      const tarea = await almacenTareas.siguientePendiente();
      if (tarea) await this.ejecutar(tarea);
    } catch (error) {
      console.error("AgentMesh: error del trabajador de tareas", error);
    } finally {
      this.procesando = false;
    }
  }

  private async ejecutar(tarea: TareaPersistida): Promise<void> {
    const tipo = tarea.payload.tipo;
    if (typeof tipo !== "string") {
      await almacenTareas.transicionar(tarea.task_id, tarea.owner_node, "failed", {
        error: "La tarea no declara un tipo de capacidad en payload.tipo."
      });
      return;
    }

    const manejador = this.registro.obtener(tipo);
    if (!manejador) {
      await almacenTareas.transicionar(tarea.task_id, tarea.owner_node, "failed", {
        error: `El nodo no tiene una capacidad autorizada registrada para: ${tipo}.`
      });
      return;
    }

    const controlador = new AbortController();
    this.abortos.set(tarea.task_id, controlador);
    try {
      const resultado = await manejador(tarea.payload, {
        taskId: tarea.task_id,
        ownerNode: tarea.owner_node,
        signal: controlador.signal
      });
      if (!controlador.signal.aborted) {
        await almacenTareas.transicionar(tarea.task_id, tarea.owner_node, "succeeded", { result: resultado });
      }
    } catch (error) {
      if (!controlador.signal.aborted) {
        await almacenTareas.transicionar(tarea.task_id, tarea.owner_node, "failed", {
          error: error instanceof Error ? error.message : "Error desconocido durante la ejecución."
        });
      }
    } finally {
      this.abortos.delete(tarea.task_id);
    }
  }
}

export const registroManejadoresTarea = new RegistroManejadoresTarea();
export const trabajadorTareas = new TrabajadorTareas(registroManejadoresTarea);
