import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { validarMensaje } from "./protocolo/mensaje.js";
import { verificarAutenticacionNodo } from "./seguridad/autenticacion-nodo.js";
import { almacenTareas } from "./tareas/almacen-tareas.js";
import { registroManejadoresTarea, trabajadorTareas } from "./tareas/trabajador-tareas.js";

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

async function leerJson(solicitud: IncomingMessage): Promise<{ cuerpo: Buffer; valor: unknown }> {
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
    const cuerpo = Buffer.concat(partes);
    return { cuerpo, valor: JSON.parse(cuerpo.toString("utf8")) as unknown };
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
      autenticacion_criptografica: "Ed25519 requerido en POST /mensajes"
    });
    return;
  }

  if (solicitud.method === "POST" && ruta.pathname === "/mensajes") {
    if (!solicitud.headers["content-type"]?.toLowerCase().includes("application/json")) {
      responder(respuesta, 415, { error: "Se requiere Content-Type application/json." });
      return;
    }

    try {
      const { cuerpo, valor: entrada } = await leerJson(solicitud);
      const emisor = solicitud.headers["x-agentmesh-node"];
      const marcaTiempo = solicitud.headers["x-agentmesh-timestamp"];
      const nonce = solicitud.headers["x-agentmesh-nonce"];
      const firma = solicitud.headers["x-agentmesh-signature"];

      if (
        typeof emisor !== "string" ||
        typeof marcaTiempo !== "string" ||
        typeof nonce !== "string" ||
        typeof firma !== "string"
      ) {
        responder(respuesta, 401, { error: "Faltan las cabeceras de autenticación AgentMesh." });
        return;
      }

      const autenticacion = verificarAutenticacionNodo({
        metodo: solicitud.method ?? "POST",
        ruta: ruta.pathname,
        emisor,
        marcaTiempo,
        nonce,
        firma,
        cuerpo
      });

      if (!autenticacion.autenticado) {
        responder(respuesta, autenticacion.estado, { error: autenticacion.error });
        return;
      }

      const resultado = validarMensaje(entrada);

      if (resultado.valido && resultado.mensaje.sender_id !== emisor) {
        responder(respuesta, 401, { error: "sender_id no coincide con la identidad autenticada." });
        return;
      }

      if (!resultado.valido) {
        responder(respuesta, 400, { error: resultado.error });
        return;
      }

      const mensaje = resultado.mensaje;

      if (mensaje.type === "task.submit") {
        const taskId = mensaje.payload.task_id;
        const contenidoTarea = mensaje.payload.task;
        if (typeof taskId !== "string" || taskId.length < 1 || taskId.length > 128 ||
            typeof contenidoTarea !== "object" || contenidoTarea === null || Array.isArray(contenidoTarea)) {
          responder(respuesta, 400, {
            error: "task.submit requiere payload.task_id (texto de 1 a 128 caracteres) y payload.task (objeto JSON)."
          });
          return;
        }

        const alta = await almacenTareas.registrar(taskId, emisor, contenidoTarea as Record<string, unknown>, mensaje.created_at);
        if (!alta.creada) {
          responder(respuesta, 409, { error: alta.error, task_id: taskId });
          return;
        }

        responder(respuesta, alta.repetida ? 200 : 202, {
          recibido: true,
          task_id: alta.tarea.task_id,
          state: alta.tarea.state,
          repetida: alta.repetida,
          created_at: alta.tarea.created_at,
          nota: "Tarea guardada de forma persistente; aún no se ejecuta automáticamente."
        });
        return;
      }

      if (mensaje.type === "task.cancel") {
        const taskId = mensaje.payload.task_id;
        if (typeof taskId !== "string" || taskId.length < 1 || taskId.length > 128) {
          responder(respuesta, 400, { error: "task.cancel requiere payload.task_id válido." });
          return;
        }
        const cancelada = await trabajadorTareas.cancelar(taskId, emisor);
        if (!cancelada) {
          responder(respuesta, 409, { error: "La tarea no existe o ya alcanzó un estado terminal.", task_id: taskId });
          return;
        }
        responder(respuesta, 200, { task_id: taskId, state: "cancelled" });
        return;
      }

      if (mensaje.type === "task.status") {
        const taskId = mensaje.payload.task_id;
        if (typeof taskId !== "string" || taskId.length < 1 || taskId.length > 128) {
          responder(respuesta, 400, { error: "task.status requiere payload.task_id válido." });
          return;
        }
        const tarea = await almacenTareas.consultar(taskId, emisor);
        if (!tarea) {
          responder(respuesta, 404, { error: "No existe una tarea con ese identificador para este nodo." });
          return;
        }
        responder(respuesta, 200, {
          task_id: tarea.task_id,
          state: tarea.state,
          created_at: tarea.created_at,
          updated_at: tarea.updated_at,
          result: tarea.result,
          error: tarea.error
        });
        return;
      }

      responder(respuesta, 202, {
        recibido: true,
        message_id: mensaje.message_id,
        tipo: mensaje.type,
        nodo: "agentmesh-local",
        nota: "Mensaje autenticado y validado; este tipo aún no dispara una acción remota."
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

registroManejadoresTarea.registrar("demo.echo", async (entrada, contexto) => {
  if (contexto.signal.aborted) throw new Error("La tarea fue cancelada.");
  return {
    recibido: true,
    salida: entrada.entrada ?? null,
    task_id: contexto.taskId,
    mensaje: "Resultado generado por una capacidad local demo.echo."
  };
});

servidor.listen(PUERTO, HOST, () => {
  console.log(`AgentMesh escuchando en http://${HOST}:${PUERTO}`);
  console.log("POST /mensajes exige firma Ed25519 de un nodo configurado como confiable.");
  console.log(`Identificador de inicio: ${randomUUID()}`);
});
