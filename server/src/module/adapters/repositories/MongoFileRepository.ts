import type { Model } from "mongoose";
import { IMongoRepository } from "../../ports/IMongoRepository.js";

interface JobDocument {
  _id: string;
  payload: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export class MongoFileRepository implements IMongoRepository {
  private readonly jobModel: Model<JobDocument>

  constructor(
    jobModel: Model<JobDocument>
  ) {
    this.jobModel = jobModel;
  }

  async storeCreatedJob(
    jobId: string,
    payload: unknown
  ): Promise<{
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

      await this.jobModel.create({
        _id: jobId,
        payload,
      });

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

  async getCompilerResult(): Promise<{
    status: boolean;
    message: string;
    data: any;
  }> {
    throw new Error("Method not implemented.");
  }
}