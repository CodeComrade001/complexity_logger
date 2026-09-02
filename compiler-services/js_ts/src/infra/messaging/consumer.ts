import { CompilerPayload } from "../../compiler/compiler.interface.js";
import { Js_Ts_CompilerService } from "../../compiler/compiler.service.js";
import { MongoFileRepository } from "../../repositories/MongoFileRepository.js";
import { analyzeCompiler } from "../../usecase/compiler.analyze.js";
import {
  getRabbitMQChannel,
} from "./rabbitmq.js";

export async function startCompilerConsumer(compilerService: Js_Ts_CompilerService,
  mongoRepo: MongoFileRepository,
) {
  const channel = await getRabbitMQChannel();

  await channel.consume(
    "compiler.js-ts",
    async (message) => {
      if (!message) {
        return;
      }

      try {
        const payload =
          JSON.parse(
            message.content.toString()
          ) as CompilerPayload;

        const result = await analyzeCompiler(payload, compilerService, mongoRepo);
        console.log("Turbo Log  ~ startCompilerConsumer ~ result:", result);

        await channel.sendToQueue(
          "compiler.completed",
          Buffer.from(
            JSON.stringify({
              jobId: result.jobIdKey,
            })
          )
        );

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

  console.log(
    "JS/TS compiler consumer started"
  );
}