import { neon } from '@neondatabase/serverless';

async function testImageWebhook() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // Set demo webhook URL for testing
    const demoWebhookUrl = 'http://localhost:5000/api/demo/image-generation';
    
    // Update image webhook URL in database
    await sql`
      INSERT INTO system_settings (key, value, category, created_at, updated_at)
      VALUES ('imageWebhookUrl', ${demoWebhookUrl}, 'image_generation', NOW(), NOW())
      ON CONFLICT (key, category)
      DO UPDATE SET 
        value = EXCLUDED.value, 
        updated_at = NOW()
    `;
    
    // Enable image generation
    await sql`
      INSERT INTO system_settings (key, value, category, created_at, updated_at)
      VALUES ('enableImageGeneration', 'true', 'image_generation', NOW(), NOW())
      ON CONFLICT (key, category)
      DO UPDATE SET 
        value = EXCLUDED.value, 
        updated_at = NOW()
    `;
    
    // Set credits per generation
    await sql`
      INSERT INTO system_settings (key, value, category, created_at, updated_at)
      VALUES ('imageCreditsPerGeneration', '1', 'image_generation', NOW(), NOW())
      ON CONFLICT (key, category)
      DO UPDATE SET 
        value = EXCLUDED.value, 
        updated_at = NOW()
    `;
    
    console.log('✓ Image webhook configured successfully');
    console.log('Demo webhook URL:', demoWebhookUrl);
    console.log('Image generation enabled: true');
    console.log('Credits per generation: 1');
    
    // Verify settings
    const settings = await sql`
      SELECT key, value FROM system_settings 
      WHERE category = 'image_generation'
    `;
    
    console.log('\nCurrent image generation settings:');
    settings.forEach(setting => {
      console.log(`${setting.key}: ${setting.value}`);
    });
    
  } catch (error) {
    console.error('Error configuring image webhook:', error);
  }
}

testImageWebhook();