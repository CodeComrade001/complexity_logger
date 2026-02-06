import { createApp } from "../core/di/container.js";
export async function bootstrap() {
  const app = await createApp();
  return app;
}
