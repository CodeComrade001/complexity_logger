import type { Pool } from "pg";
import type { Mongoose } from "mongoose";
import { PostgresFileRepository } from "../src/module/adapters/repositories/PostgresFileRepository.js";
import { MongoFileRepository } from "../src/module/adapters/repositories/MongoFileRepository.js";

describe("PostgresFileRepository", () => {
  it("returns healthy status when the database responds", async () => {
    const query = jest.fn().mockResolvedValue({ rows: [] });
    const repository = new PostgresFileRepository({ query } as unknown as Pool);

    const health = await repository.getHealth();

    expect(query).toHaveBeenCalledWith("SELECT 1");
    expect(health).toMatchObject({
      status: "OK",
      dependency: "postgres",
      message: "Postgres reachable",
    });
    expect(typeof health.timestamp).toBe("string");
  });

  it("returns an error status when the database query fails", async () => {
    const query = jest.fn().mockRejectedValue(new Error("connection failed"));
    const repository = new PostgresFileRepository({ query } as unknown as Pool);

    const health = await repository.getHealth();

    expect(query).toHaveBeenCalledWith("SELECT 1");
    expect(health).toMatchObject({
      status: "ERROR",
      dependency: "postgres",
      message: "Postgres unreachable",
    });
    expect(typeof health.timestamp).toBe("string");
  });

  it("maps a found row in findById", async () => {
    const query = jest.fn().mockResolvedValue({
      rows: [{ id: "file-123", data: { language: "ts" } }],
    });
    const repository = new PostgresFileRepository({ query } as unknown as Pool);

    const result = await repository.findById("file-123");

    expect(query).toHaveBeenCalledWith(
      "SELECT id, data FROM files WHERE id = $1 LIMIT 1",
      ["file-123"]
    );
    expect(result).toEqual({
      fileId: "file-123",
      data: { language: "ts" },
    });
  });

  it("returns null when findById does not find a row", async () => {
    const query = jest.fn().mockResolvedValue({ rows: [] });
    const repository = new PostgresFileRepository({ query } as unknown as Pool);

    const result = await repository.findById("missing-file");

    expect(result).toBeNull();
  });
});

describe("MongoFileRepository", () => {
  it("returns healthy status when ping succeeds", async () => {
    const ping = jest.fn().mockResolvedValue(undefined);
    const admin = jest.fn(() => ({ ping }));
    const mongo = {
      connection: {
        db: {
          admin,
        },
      },
    } as unknown as Mongoose;

    const repository = new MongoFileRepository(mongo);

    const health = await repository.getHealth();

    expect(admin).toHaveBeenCalledTimes(1);
    expect(ping).toHaveBeenCalledTimes(1);
    expect(health).toMatchObject({
      status: "OK",
      dependency: "mongo",
      message: "Mongo reachable",
    });
    expect(typeof health.timestamp).toBe("string");
  });

  it("returns an error status when the mongo connection is missing", async () => {
    const mongo = {
      connection: {},
    } as unknown as Mongoose;

    const repository = new MongoFileRepository(mongo);

    const health = await repository.getHealth();

    expect(health).toMatchObject({
      status: "ERROR",
      dependency: "mongo",
      message: "Mongo unreachable",
    });
    expect(typeof health.timestamp).toBe("string");
  });
});
