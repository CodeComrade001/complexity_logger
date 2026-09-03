import { IMongoRepository } from "../ports/IMongoRepository.js";


export interface Pagination {
  page: number;
  limit: number;
}

export class GetAllJobs {
  constructor(
    private readonly mongoRepo: IMongoRepository
  ) { }

  public async execute({ page, limit }: Pagination) {
    const safePage = Number(page) || 1;
    const safeLimit = Number(limit) || 10;

    const skip = (safePage - 1) * safeLimit;

    const [jobs, countResult] = await Promise.all([
      this.mongoRepo.getJobs(skip, safeLimit),
      this.mongoRepo.countJobs(),
    ]);

    const total = countResult.data;

    return {
      success: true,
      data: jobs,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(Number(total) / safeLimit),
        hasNextPage: safePage * safeLimit < total,
        hasPreviousPage: safePage > 1,
      },
    };
  }
}