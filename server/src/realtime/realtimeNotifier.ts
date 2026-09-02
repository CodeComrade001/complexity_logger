import type { WebSocket } from "ws";

export interface IReaRealtimeNotifier {
  register(jobId: string, socket: WebSocket): Promise<void>;
  send(jobIds: string[], event: string, data: unknown): Promise<void>
}

export class RealtimeNotifier implements IReaRealtimeNotifier {
  private clients = new Map<string, WebSocket>();

  async register(jobId: string, socket: WebSocket) {
    this.clients.set(jobId, socket);

    socket.on("close", () => {
      this.clients.delete(jobId);
    });
  }

  async send(jobIds: string[], event: string, data: unknown) {
    for (const jobId of jobIds) {
      const socket = this.clients.get(jobId);

      if (!socket) {
        continue;
      }

      socket.send(
        JSON.stringify({
          event,
          data,
        })
      );
    }
  }
}
