import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

async function checkPlans() {
  try {
    console.log('Checking plans table...');
    
    // Check table structure
    const structure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'plans'
      ORDER BY ordinal_position
    `);
    console.log('Plans table structure:');
    structure.rows.forEach(row => console.log(`  ${row.column_name}: ${row.data_type}`));
    
    // Check existing data
    const result = await pool.query('SELECT * FROM plans LIMIT 5');
    console.log('\nPlans data:');
    console.log(JSON.stringify(result.rows, null, 2));
    
    // Try to fix missing value column if needed
    if (!structure.rows.find(r => r.column_name === 'value')) {
      console.log('\nAdding missing value column...');
      await pool.query('ALTER TABLE plans ADD COLUMN value BIGINT NOT NULL DEFAULT 100');
      
      // Update existing plans with default values
      await pool.query('UPDATE plans SET value = 100 WHERE value IS NULL OR value = 0');
      console.log('Value column added and updated!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkPlans();