import { IMongoRepository } from "../ports/IMongoRepository.js";

export class GetJobById {
  constructor(
    private readonly mongoRepo: IMongoRepository
  ) { }

  public async execute(jobId: string) {
    try {
      const payload = Array.isArray(jobId) ? jobId : [jobId];

      const job = await this.mongoRepo.findByJobId(payload);

      if (!job) {
        return {
          success: false,
          data: null,
          message: "Job not found",
        };
      }

      return {
        success: true,
        data: job,
      };
    } catch (error) {
      console.error("GetJobById error:", error);

      return {
        success: false,
        data: null,
        message: "Failed to fetch job",
      };
    }
  }
}