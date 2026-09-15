import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL não está definida.");

const sql = neon(databaseUrl);
const migration = await readFile(new URL("../db/migrations/001_initial.sql", import.meta.url), "utf8");
// The Neon HTTP driver accepts one prepared statement per request.
// This migration intentionally contains independent CREATE TABLE statements.
const statements = migration
  .split(/;\s*(?=CREATE\s+TABLE)/i)
  .map((statement) => statement.trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
}
console.log("Migração concluída.");
