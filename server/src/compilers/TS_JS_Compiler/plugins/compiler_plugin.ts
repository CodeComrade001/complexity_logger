import fp from "fastify-plugin";
import { JS_TS_CreateCompiler } from "../ts_js_bootstrap.js";

export default fp(async function (fastify) {

  fastify.decorate("compiler", new JS_TS_CreateCompiler().init());
});
