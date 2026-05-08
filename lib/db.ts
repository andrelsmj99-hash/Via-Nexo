import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./db/schema";

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Missing required environment variable: DATABASE_URL");
  return url;
}

const pool = new Pool({ connectionString: getDatabaseUrl() });
export const db = drizzle(pool, { schema });
