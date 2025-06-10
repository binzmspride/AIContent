import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function configureImageWebhook() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Update webhook URL to use our demo endpoint
    const webhookUrl = 'http://localhost:5000/api/demo/image-generation';
    
    // Insert or update image webhook URL
    await client.query(`
      INSERT INTO system_settings (key, value, category, created_at, updated_at)
      VALUES ('imageWebhookUrl', $1, 'image_generation', NOW(), NOW())
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `, [webhookUrl]);
    
    // Enable image generation
    await client.query(`
      INSERT INTO system_settings (key, value, category, created_at, updated_at)
      VALUES ('enableImageGeneration', 'true', 'image_generation', NOW(), NOW())
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `);
    
    // Set credits per generation
    await client.query(`
      INSERT INTO system_settings (key, value, category, created_at, updated_at)
      VALUES ('imageCreditsPerGeneration', '1', 'image_generation', NOW(), NOW())
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `);
    
    console.log('Image webhook URL configured:', webhookUrl);
    console.log('Image generation enabled: true');
    console.log('Credits per generation: 1');
    
    // Verify the settings
    const result = await client.query(`
      SELECT key, value FROM system_settings 
      WHERE category = 'image_generation'
    `);
    
    console.log('Current image generation settings:');
    result.rows.forEach(row => {
      console.log(`  ${row.key}: ${row.value}`);
    });

  } catch (error) {
    console.error('Error configuring webhook:', error);
  } finally {
    await client.end();
  }
}

configureImageWebhook();