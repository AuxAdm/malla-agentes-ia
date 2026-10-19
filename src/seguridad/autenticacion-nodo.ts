import { createHash, createPublicKey, verify } from "node:crypto";

const VENTANA_MS = 5 * 60 * 1000;
const MAXIMO_NONCES = 10_000;
const noncesVistos = new Map<string, number>();

export interface SolicitudFirmada {
  metodo: string;
  ruta: string;
  emisor: string;
  marcaTiempo: string;
  nonce: string;
  firma: string;
  cuerpo: Buffer;
  ahora?: number;
}

export type ResultadoAutenticacion =
  | { autenticado: true }
  | { autenticado: false; estado: 401 | 503; error: string };

function clavesConfiables(): Record<string, string> | null {
  const configuracion = process.env.AGENTMESH_NODOS_CONFIABLES;
  if (!configuracion) return null;

  try {
    const valor: unknown = JSON.parse(configuracion);
    if (typeof valor !== "object" || valor === null || Array.isArray(valor)) return null;
    const resultado: Record<string, string> = {};
    for (const [id, clave] of Object.entries(valor)) {
      if (typeof clave === "string" && clave.includes("BEGIN PUBLIC KEY")) resultado[id] = clave;
    }
    return resultado;
  } catch {
    return null;
  }
}

export function contenidoFirmado(solicitud: Pick<SolicitudFirmada, "metodo" | "ruta" | "emisor" | "marcaTiempo" | "nonce" | "cuerpo">): string {
  const huella = createHash("sha256").update(solicitud.cuerpo).digest("hex");
  return [
    "AGENTMESH/1",
    solicitud.metodo.toUpperCase(),
    solicitud.ruta,
    solicitud.emisor,
    solicitud.marcaTiempo,
    solicitud.nonce,
    huella
  ].join("\n");
}

export function verificarAutenticacionNodo(solicitud: SolicitudFirmada): ResultadoAutenticacion {
  const claves = clavesConfiables();
  if (!claves || Object.keys(claves).length === 0) {
    return {
      autenticado: false,
      estado: 503,
      error: "La autenticación de nodos no está configurada en este servidor."
    };
  }

  const clavePem = claves[solicitud.emisor];
  if (!clavePem) {
    return { autenticado: false, estado: 401, error: "El nodo emisor no está en la lista de confianza." };
  }

  const ahora = solicitud.ahora ?? Date.now();
  const tiempo = Number(solicitud.marcaTiempo);
  if (!Number.isSafeInteger(tiempo) || Math.abs(ahora - tiempo) > VENTANA_MS) {
    return { autenticado: false, estado: 401, error: "La marca de tiempo está vencida o no es válida." };
  }

  if (!/^[A-Za-z0-9_-]{16,128}$/.test(solicitud.nonce)) {
    return { autenticado: false, estado: 401, error: "El identificador anti-repetición no es válido." };
  }

  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(solicitud.firma)) {
    return { autenticado: false, estado: 401, error: "La firma no tiene un formato válido." };
  }

  const claveReplay = `${solicitud.emisor}:${solicitud.nonce}`;
  for (const [clave, expiracion] of noncesVistos) {
    if (expiracion < ahora) noncesVistos.delete(clave);
  }
  if (noncesVistos.has(claveReplay)) {
    return { autenticado: false, estado: 401, error: "La solicitud ya fue recibida; se bloqueó la repetición." };
  }

  try {
    const valida = verify(
      null,
      Buffer.from(contenidoFirmado(solicitud), "utf8"),
      createPublicKey(clavePem),
      Buffer.from(solicitud.firma, "base64")
    );
    if (!valida) {
      return { autenticado: false, estado: 401, error: "La firma del nodo no es válida." };
    }
  } catch {
    return { autenticado: false, estado: 401, error: "No fue posible verificar la identidad criptográfica del nodo." };
  }

  if (noncesVistos.size >= MAXIMO_NONCES) {
    const primero = noncesVistos.keys().next().value;
    if (primero !== undefined) noncesVistos.delete(primero);
  }
  noncesVistos.set(claveReplay, ahora + VENTANA_MS);
  return { autenticado: true };
}
