import fs from 'fs';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Kết nối tới PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Đọc schema từ shared/schema.ts
async function extractTableDefinitions() {
  try {
    const schemaFile = await fs.promises.readFile(path.join(__dirname, 'shared/schema.ts'), 'utf8');
    
    // Extract table definitions using regex
    const tableDefinitions = [];
    
    // Find all pgTable definitions
    const tableRegex = /export\s+const\s+(\w+)\s*=\s*pgTable\s*\(\s*['"](\w+)['"]\s*,\s*\{([^}]+)\}\s*\)/gs;
    
    let match;
    while ((match = tableRegex.exec(schemaFile)) !== null) {
      const tableName = match[2];
      const tableColumns = match[3];
      
      // Create SQL for this table
      const createTableSQL = generateCreateTableSQL(tableName, tableColumns);
      tableDefinitions.push(createTableSQL);
    }
    
    return tableDefinitions;
  } catch (error) {
    console.error('Error reading schema file:', error);
    return [];
  }
}

// Generate CREATE TABLE SQL from column definitions
function generateCreateTableSQL(tableName, columnsStr) {
  // Basic SQL template
  return `
CREATE TABLE IF NOT EXISTS "${tableName}" (
  id SERIAL PRIMARY KEY,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;
}

async function createTables() {
  try {
    // Basic tables that we know exist
    const basicTables = [
      'CREATE TABLE IF NOT EXISTS "users" (id SERIAL PRIMARY KEY, username TEXT NOT NULL UNIQUE, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL, full_name TEXT, role TEXT DEFAULT \'user\', status TEXT DEFAULT \'active\', email_verified BOOLEAN DEFAULT false, verification_token TEXT, reset_password_token TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);',
      
      'CREATE TABLE IF NOT EXISTS "articles" (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), title TEXT NOT NULL, content TEXT, keywords TEXT, status TEXT DEFAULT \'draft\', published_url TEXT, credits_used INTEGER DEFAULT 0, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);',
      
      'CREATE TABLE IF NOT EXISTS "plans" (id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT, price DECIMAL(10, 2) NOT NULL, type TEXT NOT NULL, credits INTEGER NOT NULL, duration_days INTEGER, features JSONB, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);',
      
      'CREATE TABLE IF NOT EXISTS "user_plans" (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), plan_id INTEGER NOT NULL REFERENCES plans(id), start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, end_date TIMESTAMP WITH TIME ZONE, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);',
      
      'CREATE TABLE IF NOT EXISTS "credit_transactions" (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), amount INTEGER NOT NULL, description TEXT, plan_id INTEGER REFERENCES plans(id), created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);',
      
      'CREATE TABLE IF NOT EXISTS "connections" (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), type TEXT NOT NULL, name TEXT NOT NULL, config JSONB, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);',
      
      'CREATE TABLE IF NOT EXISTS "api_keys" (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), name TEXT NOT NULL, key TEXT NOT NULL UNIQUE, secret TEXT NOT NULL, scopes TEXT[], is_active BOOLEAN DEFAULT true, expires_at TIMESTAMP WITH TIME ZONE, last_used TIMESTAMP WITH TIME ZONE, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);',
      
      'CREATE TABLE IF NOT EXISTS "system_settings" (id SERIAL PRIMARY KEY, key TEXT NOT NULL UNIQUE, value TEXT, category TEXT DEFAULT \'general\', created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);',
      
      'CREATE TABLE IF NOT EXISTS "session" (sid TEXT PRIMARY KEY, sess JSONB NOT NULL, expire TIMESTAMP WITH TIME ZONE NOT NULL);'
    ];
    
    // Connect to database
    const client = await pool.connect();
    
    try {
      // Begin transaction
      await client.query('BEGIN');
      
      // Execute each CREATE TABLE statement
      for (const sql of basicTables) {
        await client.query(sql);
        console.log(`Created table from SQL: ${sql.substring(0, 50)}...`);
      }
      
      // Commit transaction
      await client.query('COMMIT');
      console.log('All tables created successfully!');
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      console.error('Error creating tables:', error);
    } finally {
      // Release client back to pool
      client.release();
    }
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    // Close pool
    await pool.end();
  }
}

// Run the script
await createTables();
console.log('Database initialization completed');