import fp from "fastify-plugin";
import { createCompiler } from "../bootstrap.js";

export default fp(async function (fastify) {
  fastify.decorate("compiler", createCompiler());
});
