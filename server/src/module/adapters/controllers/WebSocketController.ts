import type { WebSocket } from "ws";
import type { FastifyRequest } from "fastify";
import { IReaRealtimeNotifier } from "../../../realtime/realtimeNotifier.js";

export class WebSocketController {
  constructor(
    private readonly realtimeNotifier: IReaRealtimeNotifier
  ) { }

  public connect(
    socket: WebSocket,
    request: FastifyRequest
  ) {
    const { jobId } = request.query as {
      jobId?: string;
    };

    if (!jobId) {
      socket.close(1008, "jobId is required");
      return;
    }

    console.log(
      `WebSocket connection established for job ${jobId}`
    );

    this.realtimeNotifier.register(jobId, socket);
  }
}