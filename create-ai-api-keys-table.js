import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function createAiApiKeysTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Create ai_provider enum if it doesn't exist
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE ai_provider AS ENUM ('openai', 'claude', 'gemini');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('Created ai_provider enum');

    // Create ai_api_keys table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_api_keys (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        provider ai_provider NOT NULL,
        api_key TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('Created ai_api_keys table');

    // Create index for user_id
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_api_keys_user_id ON ai_api_keys(user_id);
    `);
    console.log('Created index for user_id');

    // Create index for provider
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_api_keys_provider ON ai_api_keys(provider);
    `);
    console.log('Created index for provider');

    console.log('AI API Keys table created successfully');
  } catch (error) {
    console.error('Error creating AI API Keys table:', error);
  } finally {
    await client.end();
  }
}

createAiApiKeysTable();