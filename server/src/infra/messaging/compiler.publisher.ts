
import type {
  CompilerAnalysisRequested,
} from "./events/compiler.events.js";
import { COMPILER_EXCHANGE, getRabbitMQChannel } from "./rabbit.js";

export async function publishCompilerAnalysis(
  message: CompilerAnalysisRequested
): Promise<void> {
  const channel = await getRabbitMQChannel();

  const routingKey = `compiler.${message.language}`;

  channel.publish(
    COMPILER_EXCHANGE,
    routingKey,
    Buffer.from(JSON.stringify(message)),
    {
      persistent: true,
      contentType: "application/json",
    }
  );
}