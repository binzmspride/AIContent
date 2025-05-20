import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import { dbConfig } from './config';

// Check if we have database configuration
if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error(
    "Database connection information must be set in .env file. Please check your environment variables.",
  );
}

// Configure connection pool using our config file
export const pool = new Pool(dbConfig);

// Add error handling for the connection pool
pool.on('error', (err) => {
  console.error('Unexpected error on PostgreSQL client:', err);
  // Don't crash the server, just log the error
});

// Test the database connection with a timeout
let isDbConnected = false;

const connectWithRetry = async (maxRetries = 5, retryDelay = 5000) => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const client = await pool.connect();
      console.log('Successfully connected to PostgreSQL database');
      client.release();
      isDbConnected = true;
      return;
    } catch (err) {
      retries++;
      console.error(`Failed to connect to database (attempt ${retries}/${maxRetries}):`, err);
      
      if (retries >= maxRetries) {
        console.warn('Maximum connection retries reached. Continuing with a potentially unreliable database connection.');
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

// Initiate connection process but don't wait for it
connectWithRetry();

// Export database client with schema
export const db = drizzle(pool, { schema });

// Utility function to check connection status
export const isDatabaseConnected = () => isDbConnected;