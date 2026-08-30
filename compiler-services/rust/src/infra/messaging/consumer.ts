import {
  getRabbitMQChannel,
} from "./rabbitmq.js";

export async function startCompilerConsumer() {
  const channel = await getRabbitMQChannel();

  await channel.consume(
    "compiler.rust",
    async (message) => {
      if (!message) {
        return;
      }

      try {
        const payload = JSON.parse(
          message.content.toString()
        );

        console.log(
          "Received compiler job:",
          payload
        );

        /*
         * Your compiler logic goes here.
         */

        channel.ack(message);
      } catch (error) {
        console.error(
          "Failed to process compiler job:",
          error
        );

        /*
         * Don't requeue blindly yet.
         * We'll implement proper retry/DLQ handling next.
         */
        channel.nack(message, false, false);
      }
    }
  );

  console.log(
    "RUST compiler consumer started"
  );
}