import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { enviarMensajeAutenticado } from "../src/protocolo/cliente-nodo.js";

const destino = process.env.AGENTMESH_DESTINO;
const nodoId = process.env.AGENTMESH_NODO_ID;
const archivoClave = process.env.AGENTMESH_CLAVE_PRIVADA_ARCHIVO;

if (!destino || !nodoId || !archivoClave) {
  console.error("Configura AGENTMESH_DESTINO, AGENTMESH_NODO_ID y AGENTMESH_CLAVE_PRIVADA_ARCHIVO.");
  process.exitCode = 1;
} else {
  try {
    const clavePrivadaPem = await readFile(archivoClave, "utf8");
    const resultado = await enviarMensajeAutenticado({
      destino,
      nodoId,
      clavePrivadaPem,
      mensaje: {
        version: 1,
        message_id: randomUUID(),
        type: "hello",
        sender_id: nodoId,
        created_at: new Date().toISOString(),
        payload: { mensaje: "Hola desde un nodo AgentMesh autenticado." }
      }
    });

    console.log(JSON.stringify(resultado, null, 2));
    if (!resultado.aceptado) process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : "No fue posible enviar el mensaje.");
    process.exitCode = 1;
  }
}
