import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

async function addSocialContentWebhookSettings() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('Adding Social Media Content webhook settings...');
    
    // Add social content webhook URL setting
    await sql`
      INSERT INTO system_settings (key, value, category, created_at, updated_at)
      VALUES ('socialContentWebhookUrl', '', 'social_content', NOW(), NOW())
      ON CONFLICT (key, category)
      DO UPDATE SET 
        value = EXCLUDED.value, 
        updated_at = NOW()
    `;
    
    // Add social content credits per generation setting
    await sql`
      INSERT INTO system_settings (key, value, category, created_at, updated_at)
      VALUES ('socialContentCreditsPerGeneration', '1', 'social_content', NOW(), NOW())
      ON CONFLICT (key, category)
      DO UPDATE SET 
        value = EXCLUDED.value, 
        updated_at = NOW()
    `;
    
    // Add enable social content generation setting
    await sql`
      INSERT INTO system_settings (key, value, category, created_at, updated_at)
      VALUES ('enableSocialContentGeneration', 'false', 'social_content', NOW(), NOW())
      ON CONFLICT (key, category)
      DO UPDATE SET 
        value = EXCLUDED.value, 
        updated_at = NOW()
    `;
    
    console.log('✓ Social Media Content webhook settings added successfully');
    
    // Verify settings
    const settings = await sql`
      SELECT key, value FROM system_settings 
      WHERE category = 'social_content'
    `;
    
    console.log('\nCurrent social content settings:');
    settings.forEach(setting => {
      console.log(`${setting.key}: ${setting.value}`);
    });
    
  } catch (error) {
    console.error('Error adding social content webhook settings:', error);
  }
}

addSocialContentWebhookSettings();