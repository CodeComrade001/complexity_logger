import fp from "fastify-plugin";
import { createCompiler } from "../bootstrap";

export default fp(async function (fastify) {
  fastify.decorate("compiler", createCompiler());
});
