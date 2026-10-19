import { createPrivateKey, randomBytes, sign } from "node:crypto";
import { contenidoFirmado } from "../seguridad/autenticacion-nodo.js";
import type { MensajeAgentMesh } from "./mensaje.js";

export interface OpcionesEnvioNodo {
  destino: string;
  mensaje: MensajeAgentMesh;
  nodoId: string;
  clavePrivadaPem: string;
  timeoutMs?: number;
}

export interface ResultadoEnvioNodo {
  estadoHttp: number;
  aceptado: boolean;
  respuesta: unknown;
}

/**
 * Envía un mensaje firmado a otro nodo AgentMesh.
 * La clave privada se recibe desde la configuración local y nunca se incluye en el mensaje.
 */
export async function enviarMensajeAutenticado(opciones: OpcionesEnvioNodo): Promise<ResultadoEnvioNodo> {
  const destino = new URL(opciones.destino);
  if (destino.protocol !== "https:" && destino.hostname !== "127.0.0.1" && destino.hostname !== "localhost" && destino.hostname !== "::1") {
    throw new Error("Los nodos remotos deben usar HTTPS; HTTP solo se admite para pruebas locales.");
  }

  const cuerpoTexto = JSON.stringify(opciones.mensaje);
  const cuerpo = Buffer.from(cuerpoTexto, "utf8");
  const marcaTiempo = String(Date.now());
  const nonce = randomBytes(24).toString("base64url");
  const firma = sign(
    null,
    Buffer.from(contenidoFirmado({
      metodo: "POST",
      ruta: destino.pathname,
      emisor: opciones.nodoId,
      marcaTiempo,
      nonce,
      cuerpo
    }), "utf8"),
    createPrivateKey(opciones.clavePrivadaPem)
  ).toString("base64");

  const controlador = new AbortController();
  const limite = setTimeout(() => controlador.abort(), opciones.timeoutMs ?? 10_000);

  try {
    const respuesta = await fetch(destino, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-agentmesh-node": opciones.nodoId,
        "x-agentmesh-timestamp": marcaTiempo,
        "x-agentmesh-nonce": nonce,
        "x-agentmesh-signature": firma
      },
      body: cuerpo,
      signal: controlador.signal
    });

    const texto = await respuesta.text();
    let datos: unknown = texto;
    try { datos = JSON.parse(texto) as unknown; } catch { /* conservar respuesta de texto */ }

    return {
      estadoHttp: respuesta.status,
      aceptado: respuesta.ok,
      respuesta: datos
    };
  } finally {
    clearTimeout(limite);
  }
}
