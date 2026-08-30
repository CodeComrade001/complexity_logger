
export interface IMongoRepository {
  storeCreatedJob(jobId: string, payload: unknown): Promise<{ success: boolean; message: string; }>;
  fetchCreatedJob(jobId: string): Promise<{ success: boolean; message: string; data: unknown | null; }>;
  getCompilerResult(): Promise<{ status: boolean; message: string; data: any; }>;
}
