import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test the database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL database:', err);
    return;
  }
  console.log('Successfully connected to PostgreSQL database');
  release();
});

export const db = drizzle(pool, { schema });