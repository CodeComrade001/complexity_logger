import { createApp } from "../core/di/container";
export async function bootstrap() {
  const app = await createApp();
  return app;
}
