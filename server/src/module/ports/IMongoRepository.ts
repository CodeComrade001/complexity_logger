
export interface IMongoRepository {
  storeCreatedJob(jobId: string, payload: unknown): Promise<{ success: boolean; message: string; }>;
  fetchCreatedJob(jobId: string): Promise<{ success: boolean; message: string; data: unknown | null; }>;
  findByJobId(jobId: string[]): Promise<{ success: boolean; message: string; data: any; }>;
  getJobs(skip: number, limit: number): Promise<{ success: boolean; message: string; data: any; }>;
  countJobs(): Promise<{ success: boolean; message: string; data: number; }>;
  getCompletedJobs(skip: number, limit: number): Promise<{ success: boolean; message: string; data: any; }>
}
