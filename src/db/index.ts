import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

// Client Neon PostgreSQL si DATABASE_URL est fournie
export const db = connectionString ? drizzle(neon(connectionString), { schema }) : null;
