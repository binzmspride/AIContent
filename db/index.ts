import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure connection pool with more robust settings
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  maxUses: 7500, // Close a connection after it has been used 7500 times
});

// Add error handling for the connection pool
pool.on("error", (err) => {
  console.error("Unexpected error on PostgreSQL client:", err);
  // Don't crash the server, just log the error
});

// Test the database connection with a timeout
let isDbConnected = false;

const connectWithRetry = async (maxRetries = 5, retryDelay = 5000) => {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const client = await pool.connect();
      console.log("Successfully connected to PostgreSQL database");
      client.release();
      isDbConnected = true;
      return;
    } catch (err) {
      retries++;
      console.error(
        `Failed to connect to database (attempt ${retries}/${maxRetries}):`,
        err,
      );

      if (retries >= maxRetries) {
        console.warn(
          "Maximum connection retries reached. Continuing with a potentially unreliable database connection.",
        );
        break;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
};

// Initiate connection process but don't wait for it
connectWithRetry();

// Export database client with schema
export const db = drizzle(pool, { schema });

// Utility function to check connection status
export const isDatabaseConnected = () => isDbConnected;
