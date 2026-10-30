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
          tipo: "ejemplo",
          descripcion: "Tarea de demostración registrada por un nodo remoto",
          datos: { saludo: "Hola desde AgentMesh" }
        };

    const configuracion = { destino, nodoId, clavePrivadaPem };
    const alta = await enviarTareaRemota(configuracion, tarea, taskId);

    console.log("Resultado del registro:");
    console.log(JSON.stringify(alta, null, 2));

    if (!alta.aceptado) {
      process.exitCode = 1;
    } else {
      const consulta = await consultarEstadoTareaRemota(configuracion, alta.taskId);
      console.log("Estado remoto:");
      console.log(JSON.stringify(consulta, null, 2));
      if (!consulta.envio.aceptado) process.exitCode = 1;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : "No fue posible gestionar la tarea remota.");
    process.exitCode = 1;
  }
}
