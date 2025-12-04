import { IFileRepository } from "../ports/IFileRepository";
import { IMongoRepository } from "../ports/IMongoRepository";

export class GetFileHealth {
  constructor(
    private pgRepo: IFileRepository,
    private mongoRepo: IMongoRepository
  ) { }

  public async execute() {
    // ---- DB checks ----
    const pgHealth = await this.pgRepo.getHealth();
    console.log("Turbo Log  ~ GetFileHealth ~ execute ~ pgHealth:", pgHealth);
    const mongoHealth = await this.mongoRepo.getHealth();
    console.log("Turbo Log  ~ GetFileHealth ~ execute ~ mongoHealth:", mongoHealth);





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
