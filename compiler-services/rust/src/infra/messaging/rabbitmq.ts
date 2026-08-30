import amqp, {
  type Channel,
  type ChannelModel,
} from "amqplib";

const RABBITMQ_URL =
  process.env.RABBITMQ_URL ??
  "amqp://complexity:complexity_dev_password@localhost:5672";

const EXCHANGE = "compiler.exchange";
const QUEUE = "compiler.rust";

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export async function getRabbitMQChannel(): Promise<Channel> {
  if (channel) {
    return channel;
  }

  connection = await amqp.connect(RABBITMQ_URL);

  channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, "topic", {
    durable: true,
  });

  await channel.assertQueue(QUEUE, {
    durable: true,
  });

  await channel.bindQueue(
    QUEUE,
    EXCHANGE,
    "compiler.rust"
  );

  return channel;
}