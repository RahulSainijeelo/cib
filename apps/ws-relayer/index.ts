import type { ServerWebSocket } from "bun";
import type { MessagePayload } from "./types";

//TODO: Add auth
const SUBSCRIPTIONS: ServerWebSocket<unknown>[] = []

Bun.serve({
    fetch(req, server) {
      // upgrade the request to a WebSocket
      if (server.upgrade(req)) {
        return; // do not return a Response
      }
      return new Response("Upgrade failed", { status: 500 });
    },
    websocket: {
        message(ws, message) {
            const { event, data }: MessagePayload = JSON.parse(message.toString());
            console.log(event, data);
            if (event === "subscribe") {
                SUBSCRIPTIONS.push(ws);
            } else if (event === "admin") {
                const { message } = data;
                if (SUBSCRIPTIONS) {
                    SUBSCRIPTIONS.forEach(ws => ws.send(JSON.stringify(message)));
                }
            }
        },
        open(ws) {
            console.log("open");
        },
        close(ws) {
            console.log("close");
        },
        
    },
    port: 9093
  });