import type { WebSocket } from "ws";

export interface IReaRealtimeNotifier {
  register(jobId: string, socket: WebSocket): Promise<void>;
  send(jobIds: string[], event: string, data: unknown): Promise<void>
}

export class RealtimeNotifier implements IReaRealtimeNotifier {
  private clients = new Map<string, Set<WebSocket>>();

  async register(jobId: string, socket: WebSocket) {
    let clients = this.clients.get(jobId);

    if (!clients) {
      clients = new Set();
      this.clients.set(jobId, clients);
    }

    clients.add(socket);

    console.log(`WebSocket registered for job ${jobId}`);

    socket.on("close", () => {
      clients?.delete(socket);

      if (clients?.size === 0) {
        this.clients.delete(jobId);
      }

      console.log(`WebSocket disconnected from job ${jobId}`);
    });

    socket.on("error", (error) => {
      console.error(
        `WebSocket error for job ${jobId}:`,
        error
      );

      clients?.delete(socket);
    });
  }

  async send(
    jobId: string[],
    event: string,
    data: unknown
  ) {
    for (const id of jobId) {
      const clients = this.clients.get(id);

      if (!clients) {
        return;
      }

      const message = JSON.stringify({
        event,
        data,
      });

      for (const socket of clients) {
        if (socket.readyState === socket.OPEN) {
          socket.send(message);
        }
      }
    }
  }
}
