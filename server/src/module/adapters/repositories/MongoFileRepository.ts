import type { Model } from "mongoose";
import { JobDocument } from "../../../models/job.model.js";
import { IMongoRepository } from "../../ports/IMongoRepository.js";

export class MongoFileRepository implements IMongoRepository {

  private readonly jobModel: Model<JobDocument>;

  constructor(
    jobModel: Model<JobDocument>
  ) {
    this.jobModel = jobModel;
  }

  async getJobs(skip: number, limit: number): Promise<{ success: boolean; message: string; data: any; }> {
    const getJobsResult: any[] = [];

    if (skip < 0 || limit <= 0) {
      return {
        success: false,
        message: "Invalid Values Sent for SKIP and LIMIT parameter",
        data: getJobsResult
      };
    }

    try {
      const jobs = await this.jobModel
        .find({})
        .skip(skip)
        .limit(limit);

      return {
        success: true,
        message: "Jobs fetch successful",
        data: jobs
      };

    } catch (error: unknown) {
      console.log("Turbo Log  ~ MongoFileRepository ~ getJobs ~ error:", error);
      return {
        success: false,
        message: "Jobs fetch failed",
        data: getJobsResult
      }
    }

  }

  async countJobs(): Promise<{
    success: boolean;
    message: string;
    data: number;
  }> {
    try {
      const count = await this.jobModel.countDocuments({
        "payload.success": true
      });

      return {
        success: true,
        message: "Count fetch successful",
        data: count
      };
    } catch (error: unknown) {
      console.log(
        "Turbo Log ~ MongoFileRepository ~ countJobs ~ error:",
        error
      );

      return {
        success: false,
        message: "Failed to get count",
        data: 0
      };
    }
  }


  async findByJobId(jobId: string[]): Promise<{ success: boolean; message: string; data: any; }> {
    const result = []
    try {
      for (const id of jobId) {
        if (id === "") { }

        const fetchedJob = this.jobModel.findById(id).lean().exec();
        if (fetchedJob) {
          result.push(fetchedJob);
        }
      }

      if (result.length === 0) {
        return {
          success: false,
          message: "No jobs found",
          data: null
        };
      }

      return {
        success: true,
        message: "Jobs fetched successfully",
        data: result
      };
    } catch (error) {
      console.log("Turbo Log  ~ MongoFileRepository ~ findByJobId ~ error:", error);
      return {
        success: false,
        message: "Jobs fetched failed",
        data: result
      }
    }
  }

  async updateStoredPayload(
    jobId: string,
    payload: unknown): Promise<{
      success: boolean;
      message: string;
    }> {
    try {
      if (!jobId || jobId.trim().length === 0) {
        return {
          success: false,
          message: "Job ID is required",
        };
      }

      await this.jobModel.findByIdAndUpdate(jobId, { payload });

      return {
        success: true,
        message: "Payload updated successfully",
      };
    } catch (error: unknown) {
      console.error(
        "MongoFileRepository.updateStoredPayload:",
        error
      );

      return {
        success: false,
        message: "Failed to update payload",
      };
    }
  }

  async storeCreatedJob(
    jobId: string,
    payload: unknown
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    console.log("Turbo Log  ~ MongoFileRepository ~ storeCreatedJob ~ jobId: for job storage", jobId);
    try {
      if (!jobId || jobId.trim().length === 0) {
        return {
          success: false,
          message: "Job ID is required",
        };
      }

      const creating_job = await this.jobModel.create({
        _id: jobId,
        payload,
      });
      console.log("Turbo Log  ~ MongoFileRepository ~ storeCreatedJob ~ creating_job:", creating_job);

      return {
        success: true,
        message: "Job stored successfully",
      };
    } catch (error: unknown) {
      console.error(
        "MongoFileRepository.storeCreatedJob:",
        error
      );

      return {
        success: false,
        message: "Failed to store job",
      };
    }
  }

  async fetchCreatedJob(
    jobId: string
  ): Promise<{
    success: boolean;
    message: string;
    data: unknown | null;
  }> {
    try {
      if (!jobId || jobId.trim().length === 0) {
        return {
          success: false,
          message: "Job ID is required",
          data: null,
        };
      }

      const job = await this.jobModel
        .findById(jobId)
        .lean()
        .exec();

      if (!job) {
        return {
          success: false,
          message: "Job not found",
          data: null,
        };
      }

      return {
        success: true,
        message: "Job fetched successfully",
        data: job.payload,
      };
    } catch (error: unknown) {
      console.error(
        "MongoFileRepository.fetchCreatedJob:",
        error
      );

      return {
        success: false,
        message: "Failed to fetch job",
        data: null,
      };
    }
  }
}
