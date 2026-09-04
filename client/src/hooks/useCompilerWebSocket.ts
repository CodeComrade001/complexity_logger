import { useEffect, useRef } from "react";

export const useCompilerSocket = (
  jobIds: string[],
  onCompleted: (jobId: string) => void
) => {
  const socketsRef = useRef<Map<string, WebSocket>>(new Map());

  useEffect(() => {
    if (jobIds.length === 0) {
      return;
    }

    const sockets = socketsRef.current;

    jobIds.forEach((jobId) => {
      if (sockets.has(jobId)) {
        return;
      }

      const socket = new WebSocket(
        `ws://localhost:4000/ws?jobId=${encodeURIComponent(jobId)}`
      );

      sockets.set(jobId, socket);

      socket.onopen = () => {
        console.log(
          `Compiler WebSocket connected for job ${jobId}`
        );
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (
            payload.event !== "compiler.completed" ||
            payload.jobId !== jobId
          ) {
            return;
          }

          onCompleted(jobId);

          socket.close();
          sockets.delete(jobId);
        } catch (error) {
          console.error(
            "Failed to process WebSocket message:",
            error
          );
        }
      };

      socket.onerror = (error) => {
        console.error(
          `Compiler WebSocket error for job ${jobId}:`,
          error
        );
      };

      socket.onclose = () => {
        console.log(
          `Compiler WebSocket disconnected for job ${jobId}`
        );

        sockets.delete(jobId);
      };
    });

    return () => {
      sockets.forEach((socket) => {
        socket.close();
      });

      sockets.clear();
    };
  }, [jobIds, onCompleted]);

  return socketsRef;
};