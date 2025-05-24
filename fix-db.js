import { Pool } from 'pg';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const scryptAsync = promisify(scrypt);

// Hash password function
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixDatabase() {
  try {
    console.log('Fixing database schema...');
    
    // Drop and recreate users table with all needed columns
    await pool.query(`
      DROP TABLE IF EXISTS users CASCADE;
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        credits INTEGER NOT NULL DEFAULT 0,
        language TEXT NOT NULL DEFAULT 'vi',
        is_verified BOOLEAN NOT NULL DEFAULT false,
        verification_token TEXT,
        verification_token_expiry TIMESTAMP,
        reset_password_token TEXT,
        reset_password_token_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    console.log('Users table recreated successfully');
    
    // Create admin user with new password
    const hashedPassword = await hashPassword('admin@1238');
    await pool.query(`
      INSERT INTO users (username, email, password, full_name, role, credits, language, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, ['admin', 'admin@example.com', hashedPassword, 'Administrator', 'admin', 1000, 'vi', true]);
    
    console.log('Admin user created with password: admin@1238');
    
    // Create translations table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS translations (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        vi TEXT NOT NULL,
        en TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'common',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    console.log('Translations table ensured');
    
    console.log('Database fix completed successfully!');
    
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await pool.end();
  }
}

fixDatabase();