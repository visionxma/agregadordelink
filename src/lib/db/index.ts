import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não configurada");
}

// Serverless-friendly: cada invocação abre no máximo 1 conexão e libera rápido.
// Supabase pooler já faz o pooling real do lado do banco.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  idleTimeoutMillis: 20_000,
  connectionTimeoutMillis: 10_000,
});

export const db = drizzle(pool, { schema });
export { schema };
