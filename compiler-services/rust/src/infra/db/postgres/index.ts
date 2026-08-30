import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config()

export async function createPostgresPool(): Promise<Pool> {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL
  });
  // optionally test connection
  await pool.query("SELECT 1");
  return pool;
}
