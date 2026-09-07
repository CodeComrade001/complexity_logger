import { IMongoRepository } from "../../ports/IMongoRepository.js";
import { GetAllJobs } from "../../usecases/getAllJobs.js";
import { GetJobById } from "../../usecases/getJobById.js";

export class JobController {
  private readonly getAllJobsUsecase: GetAllJobs;
  private readonly getJobByIdUsecase: GetJobById;

  constructor(
    mongoRepo: IMongoRepository
  ) {
    this.getAllJobsUsecase = new GetAllJobs(mongoRepo);
    this.getJobByIdUsecase = new GetJobById(mongoRepo);
  }

  public async getAllJobs(request: any, reply: any) {
    console.log("getAllJObs method was called")
    try {
      const page = Math.max(
        Number(request.query?.page) || 1,
        1
      );

      const limit = Math.min(
        Math.max(
          Number(request.query?.limit) || 20,
          1
        ),
        100
      );

      const result = await this.getAllJobsUsecase.execute({
        page,
        limit,
      });
      console.log("Turbo Log  ~ JobController ~ getAllJobs ~ result:", result);

      return reply.code(200).send(result);

    } catch (error) {
      console.error("getAllJobs error:", error);

      return reply.code(500).send({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public async getSingleJob(request: any, reply: any) {
    try {
      const { id } = request.params;

      const result = await this.getJobByIdUsecase.execute(id);
      console.log("Turbo Log  ~ JobController ~ getSingleJob ~ result:", result);

      if (!result.success) {
        return reply.code(404).send(result);
      }

      return reply.code(200).send(result);
    } catch (error) {
      console.error("getSingleJob error:", error);

      return reply.code(500).send({
        success: false,
        message: "Internal server error",
      });
    }
  }
}