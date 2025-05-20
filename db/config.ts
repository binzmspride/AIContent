// Database configuration that uses environment variables
import { PoolConfig } from 'pg';

// Database configuration using environment variables
export const dbConfig: PoolConfig = {
  // Use DATABASE_URL if provided, otherwise use individual connection parameters
  connectionString: process.env.DATABASE_URL,
  // If individual parameters are provided, they will override the connection string
  host: process.env.PGHOST,
  port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  // SSL configuration based on environment
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  maxUses: 7500 // Close a connection after it has been used 7500 times
};