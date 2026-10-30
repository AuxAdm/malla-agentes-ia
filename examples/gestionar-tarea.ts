import { readFile } from "node:fs/promises";
import { consultarEstadoTareaRemota, enviarTareaRemota } from "../src/protocolo/cliente-tareas.js";

const destino = process.env.AGENTMESH_DESTINO;
const nodoId = process.env.AGENTMESH_NODO_ID;
const archivoClave = process.env.AGENTMESH_CLAVE_PRIVADA_ARCHIVO;
const taskId = process.env.AGENTMESH_TASK_ID;
const tareaJson = process.env.AGENTMESH_TASK_JSON;

if (!destino || !nodoId || !archivoClave) {
  console.error("Configura AGENTMESH_DESTINO, AGENTMESH_NODO_ID y AGENTMESH_CLAVE_PRIVADA_ARCHIVO.");
  process.exitCode = 1;
} else {
  try {
    const clavePrivadaPem = await readFile(archivoClave, "utf8");
    const tarea: Record<string, unknown> = tareaJson
      ? JSON.parse(tareaJson) as Record<string, unknown>
      : {
          tipo: "demo.echo",
          descripcion: "Tarea de demostración procesada por una capacidad local autorizada",
          entrada: { saludo: "Hola desde AgentMesh" }
        };

    const configuracion = { destino, nodoId, clavePrivadaPem };
    const alta = await enviarTareaRemota(configuracion, tarea, taskId);
    console.log("Resultado del registro:");
    console.log(JSON.stringify(alta, null, 2));

    if (!alta.aceptado) {
      process.exitCode = 1;
    } else {
      let consulta;
      for (let intento = 0; intento < 10; intento++) {
        await new Promise((resolver) => setTimeout(resolver, 500));
        consulta = await consultarEstadoTareaRemota(configuracion, alta.taskId);
        if (consulta.tarea?.state === "succeeded" || consulta.tarea?.state === "failed" ||
            consulta.tarea?.state === "cancelled") break;
      }
      console.log("Estado remoto e historial:");
      console.log(JSON.stringify(consulta, null, 2));
      if (!consulta?.envio.aceptado || consulta.tarea?.state !== "succeeded") {
        console.error("La tarea no terminó correctamente dentro del tiempo de espera.");
        process.exitCode = 1;
      }
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : "No fue posible gestionar la tarea remota.");
    process.exitCode = 1;
  }
}
