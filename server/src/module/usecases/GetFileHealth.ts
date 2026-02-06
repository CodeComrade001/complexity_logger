import { IFileRepository } from "../ports/IFileRepository.js";

import { IMongoRepository } from "../ports/IMongoRepository.js";

export class GetFileHealth {
  constructor(
    private pgRepo: IFileRepository,
    private mongoRepo: IMongoRepository
  ) { }

  public async execute() {
    // ---- DB checks ----
    const pgHealth = await this.pgRepo.getHealth();
    const mongoHealth = await this.mongoRepo.getHealth();





    // ---- Overall status ----
    const allStatuses = [pgHealth.status, mongoHealth.status];
    const overallStatus = allStatuses.every(s => s === "OK") ? "🟢" : "🟡";

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),

      dependencies: {
        postgres: pgHealth,
        mongo: mongoHealth
      }
    };
  }
}
