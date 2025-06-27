import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateSocialTranslationsCategory() {
  try {
    console.log('Updating social content translations category...');
    
    const result = await pool.query(
      "UPDATE translations SET category = 'social' WHERE key LIKE 'social.%'"
    );
    
    console.log('Updated', result.rowCount, 'social translations');
    
    // Check current translations
    const check = await pool.query(
      "SELECT key, category FROM translations WHERE key LIKE 'social.%' ORDER BY key"
    );
    
    console.log('Social translations now categorized:');
    check.rows.forEach(row => {
      console.log(`- ${row.key}: ${row.category}`);
    });
    
    await pool.end();
    console.log('Database update completed successfully');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateSocialTranslationsCategory();