import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { validarMensaje } from "./protocolo/mensaje.js";

const HOST = process.env.AGENTMESH_HOST ?? "127.0.0.1";
const PUERTO = Number.parseInt(process.env.AGENTMESH_PORT ?? "8787", 10);
const TAMANO_MAXIMO = 64 * 1024;

function responder(respuesta: ServerResponse, estado: number, cuerpo: unknown): void {
  respuesta.writeHead(estado, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  respuesta.end(JSON.stringify(cuerpo));
}

async function leerJson(solicitud: IncomingMessage): Promise<unknown> {
  const partes: Buffer[] = [];
  let total = 0;

  for await (const parte of solicitud) {
    const fragmento = Buffer.isBuffer(parte) ? parte : Buffer.from(parte);
    total += fragmento.length;

    if (total > TAMANO_MAXIMO) {
      throw new Error("TAMANO_EXCEDIDO");
    }

    partes.push(fragmento);
  }

  try {
    return JSON.parse(Buffer.concat(partes).toString("utf8")) as unknown;
  } catch {
    throw new Error("JSON_INVALIDO");
  }
}

const servidor = createServer(async (solicitud, respuesta) => {
  const ruta = new URL(solicitud.url ?? "/", `http://${solicitud.headers.host ?? "localhost"}`);

  if (solicitud.method === "GET" && ruta.pathname === "/salud") {
    responder(respuesta, 200, {
      servicio: "AgentMesh",
      estado: "disponible",
      version_protocolo: 1,
      autenticacion_criptografica: "pendiente de implementación"
    });
    return;
  }

  if (solicitud.method === "POST" && ruta.pathname === "/mensajes") {
    if (!solicitud.headers["content-type"]?.toLowerCase().includes("application/json")) {
      responder(respuesta, 415, { error: "Se requiere Content-Type application/json." });
      return;
    }

    try {
      const entrada = await leerJson(solicitud);
      const resultado = validarMensaje(entrada);

      if (!resultado.valido) {
        responder(respuesta, 400, { error: resultado.error });
        return;
      }

      responder(respuesta, 202, {
        recibido: true,
        message_id: resultado.mensaje.message_id,
        tipo: resultado.mensaje.type,
        nodo: "agentmesh-local",
        nota: "Mensaje validado; todavía no se ejecutan tareas remotas."
      });
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : "ERROR_DESCONOCIDO";

      if (mensaje === "TAMANO_EXCEDIDO") {
        responder(respuesta, 413, { error: "El mensaje supera el límite de 64 KiB." });
      } else if (mensaje === "JSON_INVALIDO") {
        responder(respuesta, 400, { error: "El cuerpo no contiene JSON válido." });
      } else {
        responder(respuesta, 500, { error: "No fue posible procesar la solicitud." });
      }
    }

    return;
  }

  if (solicitud.method === "GET" && ruta.pathname === "/") {
    responder(respuesta, 200, {
      nombre: "Malla de Agentes de IA",
      protocolo: "AgentMesh",
      version: "0.1.0",
      endpoints: ["GET /salud", "POST /mensajes"],
      estado: "prototipo inicial"
    });
    return;
  }

  responder(respuesta, 404, { error: "Ruta no encontrada." });
});

servidor.listen(PUERTO, HOST, () => {
  console.log(`AgentMesh escuchando en http://${HOST}:${PUERTO}`);
  console.log("Este prototipo local no autentica criptográficamente a los nodos.");
  console.log(`Identificador de inicio: ${randomUUID()}`);
});
