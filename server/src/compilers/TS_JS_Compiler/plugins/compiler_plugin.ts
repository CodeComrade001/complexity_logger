import fp from "fastify-plugin";
import { CreateCompiler } from "../ts_js_bootstrap.js";

export default fp(async function (fastify) {

  fastify.decorate("compiler", new CreateCompiler().init());
});
