import { bootstrap } from "./AppBootstrap";

async function start() {
  const app = await bootstrap();
  const port = Number(process.env.PORT || 3000);
  await (app as any).listen({ port, host: "0.0.0.0" });
  console.log(`Server running at http://localhost:${port}`);
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
