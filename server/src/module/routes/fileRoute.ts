import { FileController } from "../adapters/controllers/FileController.js";
import { PostgresFileRepository } from "../adapters/repositories/PostgresFileRepository.js";
import { MongoFileRepository } from "../adapters/repositories/MongoFileRepository.js";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { JobModel } from "../../models/job.model.js";
import { HandleCompletedCompilerJob } from "../../infra/messaging/helpers/handleCompletedCompilerJob.js";
import { CompilerCompletionBatcher } from "../../infra/messaging/helpers/compilerCompletionBatch.js";
import { startCompilerConsumer } from "../../infra/messaging/consumer.js";
import { RealtimeNotifier } from "../../realtime/realtimeNotifier.js";
import { WebSocketController } from "../adapters/controllers/WebSocketController.js";
import { JobController } from "../adapters/controllers/JobController.js";


export default async function fileRoute(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
) {
  /*//////////////////////////////////////////////////////////////
                            MAIN DATABASE 
    //////////////////////////////////////////////////////////////*/
  const pgPool = (fastify as any).pgPool; // typed in composition root
  const workerClient = (fastify as any).workerClient; // typed in composition root

  /*//////////////////////////////////////////////////////////////
                           NOTIFICATION SERVICE
      //////////////////////////////////////////////////////////////*/
  const realtimeNotifier = new RealtimeNotifier();

  /*//////////////////////////////////////////////////////////////
                            DATABASE REPOS
    //////////////////////////////////////////////////////////////*/
  const postgresRepo = new PostgresFileRepository(pgPool);
  const mongoRepo = new MongoFileRepository(JobModel); // JobModel is a mongoose model, set in composition 

  /*//////////////////////////////////////////////////////////////
                            ALL CONTROLLER
    //////////////////////////////////////////////////////////////*/
  const webSocketController = new WebSocketController(realtimeNotifier);
  const fileController = new FileController(postgresRepo, mongoRepo, workerClient);
  const jobController = new JobController(mongoRepo);

  /*//////////////////////////////////////////////////////////////
                                UTILS
    //////////////////////////////////////////////////////////////*/
  const handleCompletedCompilerJob = new HandleCompletedCompilerJob(mongoRepo, realtimeNotifier);
  const compilerCompletionBatcher = new CompilerCompletionBatcher(
    handleCompletedCompilerJob
  );

  /*//////////////////////////////////////////////////////////////
                  MESSAGING SERVICE : RABBITMQ CONSUMER
      //////////////////////////////////////////////////////////////*/
  await startCompilerConsumer(compilerCompletionBatcher);

  /*//////////////////////////////////////////////////////////////
                         ALL COMPILER ROUTES
    //////////////////////////////////////////////////////////////*/
  fastify.post("/repos/csharp/analyze", fileController.getCsharpAnalyzer.bind(fileController));
  fastify.post("/repos/go/analyze", fileController.getGoFileAnalyzer.bind(fileController));
  fastify.post("/repos/java/analyze", fileController.getJavaFileAnalyzer.bind(fileController));
  fastify.post("/repos/python/analyze", fileController.getPythonFileAnalyzer.bind(fileController));
  fastify.post("/repos/rust/analyze", fileController.getRustFileAnalyzer.bind(fileController));
  fastify.post("/repos/js/analyze", fileController.get_js_ts_Analyzer.bind(fileController));

  /*//////////////////////////////////////////////////////////////
                             ALL JOBS ROUTES
      //////////////////////////////////////////////////////////////*/
  fastify.get("/repos/all-jobs", jobController.getAllJobs.bind(jobController));
  fastify.get("/repos/all-jobs/:id", jobController.getSingleJob.bind(jobController));

  /*//////////////////////////////////////////////////////////////
                         ALL WEBSOCKET ROUTES
    //////////////////////////////////////////////////////////////*/
  fastify.get(
    "/ws/jobs/:jobId",
    { websocket: true },
    webSocketController.connect.bind(webSocketController)
  );
}
