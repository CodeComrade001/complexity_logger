import { CompilerPayload } from "../../compiler/compiler.interface.js";
import { analyzeCompiler } from "../../usecase/compiler.analyze.js";
import {
  getRabbitMQChannel,
} from "./rabbitmq.js";

export async function startCompilerConsumer() {
  const channel = await getRabbitMQChannel();

  await channel.consume(
    "compiler.csharp",
    async (message) => {
      if (!message) {
        return;
      }

      try {
        const payload =
          JSON.parse(
            message.content.toString()
          ) as CompilerPayload;

        const result = await analyzeCompiler(payload);
        console.log("Turbo Log  ~ startCompilerConsumer ~ result:", result);

        console.log(
          "Compiler analysis completed:",
          result
        );

        channel.ack(message);
      } catch (error) {
        console.error(
          "Failed to process compiler job:",
          error
        );

        channel.nack(message, false, false);
      }
    }
  );

  console.log("CSHARP compiler consumer started");
}