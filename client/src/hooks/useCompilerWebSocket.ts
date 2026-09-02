import { useEffect, useRef } from "react";

export const useCompilerSocket = (
  onCompleted: (data: unknown) => void
) => {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:YOUR_PORT/ws");

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Compiler WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.event !== "compiler.completed") {
          return;
        }

        onCompleted(payload.data);
      } catch (error) {
        console.error(
          "Failed to process WebSocket message:",
          error
        );
      }
    };

    socket.onerror = (error) => {
      console.error("Compiler WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("Compiler WebSocket disconnected");
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [onCompleted]);

  return socketRef;
};