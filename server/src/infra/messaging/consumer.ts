import { CompilerCompletionBatcher } from "./helpers/compilerCompletionBatch.js";
import { getRabbitMQChannel } from "./rabbit.js";


export async function startCompilerConsumer(
  compilerCompletionBatcher: CompilerCompletionBatcher
) {
  const channel = await getRabbitMQChannel();

  await channel.prefetch(50);

  await channel.consume(
    "compiler.completed",
    async (message) => {
      if (!message) return;

      try {
        const payload = JSON.parse(
          message.content.toString()
        ) as {
          jobId: string;
        };

        await compilerCompletionBatcher.add(
          payload.jobId,
          message,
          channel
        );
      } catch (error) {
        console.error(
          "Failed to receive compiler confirmation:",
          error
        );

        channel.nack(message, false, false);
      }
    }
  );

  console.log(
    "MAIN SERVER job confirmation consumer started"
  );
}