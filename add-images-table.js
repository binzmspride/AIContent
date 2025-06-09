import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function addImagesTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Create images table
    await client.query(`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        article_id INTEGER REFERENCES articles(id),
        title TEXT NOT NULL,
        prompt TEXT NOT NULL,
        image_url TEXT NOT NULL,
        source_text TEXT,
        credits_used INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'generated',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    console.log('Images table created successfully');

    // Create settings table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        category TEXT DEFAULT 'general',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Add image generation settings to settings table
    await client.query(`
      INSERT INTO settings (key, value, category) VALUES 
      ('imageWebhookUrl', '', 'image_generation'),
      ('imageCreditsPerGeneration', '1', 'image_generation'),
      ('enableImageGeneration', 'true', 'image_generation')
      ON CONFLICT (key) DO NOTHING;
    `);

    console.log('Image generation settings added');

  } catch (error) {
    console.error('Error creating images table:', error);
  } finally {
    await client.end();
  }
}

addImagesTable();