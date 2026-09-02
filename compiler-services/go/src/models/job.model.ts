import { Schema, model, type InferSchemaType } from "mongoose";

const jobSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
    },

    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export type JobDocument = InferSchemaType<typeof jobSchema>;

export const JobModel = model<JobDocument>(
  "Job",
  jobSchema
);