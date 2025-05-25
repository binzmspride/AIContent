import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixUserPlans() {
  try {
    console.log('Checking user_plans table structure...');
    
    // Check existing columns
    const structure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_plans'
      ORDER BY ordinal_position
    `);
    
    console.log('Current user_plans structure:');
    structure.rows.forEach(row => console.log(`  ${row.column_name}: ${row.data_type}`));
    
    // Add missing used_storage column if needed
    if (!structure.rows.find(r => r.column_name === 'used_storage')) {
      console.log('Adding used_storage column...');
      await pool.query('ALTER TABLE user_plans ADD COLUMN used_storage INTEGER NOT NULL DEFAULT 0');
      console.log('used_storage column added!');
    }
    
    console.log('user_plans table fixed successfully!');
    
  } catch (error) {
    console.error('Error fixing user_plans:', error);
  } finally {
    await pool.end();
  }
}

fixUserPlans();