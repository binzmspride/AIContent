import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

async function main() {
  console.log('Connecting to database and pushing schema...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // First create api_keys table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        key TEXT NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        scopes TEXT[] NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        last_used TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('API Keys table created successfully');
  } catch (error) {
    console.error('Error creating api_keys table:', error);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);