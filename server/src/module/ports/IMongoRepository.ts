
export interface IMongoRepository {
  // data-access methods - return plain JS objects / DTOs
  getCompilerResult(): Promise<{ status: boolean; message: string; data: any }>;
  getHealth(): Promise<{ status: string; message: string; timestamp: string }>;
  findById(fileId: string): Promise<{ fileId: string; data: any } | null>;
  getFileAnalyzer(): Promise<{ success: boolean; message: string } | null>;
  getSingleFileReport(): Promise<{ success: boolean; message: string } | null>;
  getFilePatchApply(): Promise<{ success: boolean; message: string } | null>;
  getUser(): Promise<{ success: boolean; message: string } | null>;
}
