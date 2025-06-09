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
    
    await client.query(`
      UPDATE settings 
      SET value = $1 
      WHERE key = 'imageWebhookUrl'
    `, [webhookUrl]);
    
    console.log('Image webhook URL configured:', webhookUrl);
    
    // Verify the settings
    const result = await client.query(`
      SELECT key, value FROM settings 
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