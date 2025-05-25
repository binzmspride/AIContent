import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addSimplePlans() {
  try {
    console.log('Adding sample plans...');
    
    // Check if plans already exist
    const existingPlans = await pool.query('SELECT COUNT(*) FROM plans');
    if (existingPlans.rows[0].count > 0) {
      console.log('Plans already exist, skipping...');
      return;
    }
    
    // Add simple plans
    await pool.query(`
      INSERT INTO plans (name, description, type, price, value) VALUES
      ('Gói Cơ Bản', 'Gói dành cho người mới bắt đầu', 'credit', 99000, 100),
      ('Gói Chuyên Nghiệp', 'Gói dành cho doanh nghiệp nhỏ', 'credit', 299000, 500),
      ('Gói Doanh Nghiệp', 'Gói dành cho doanh nghiệp lớn', 'credit', 799000, 2000)
    `);
    
    console.log('Sample plans added successfully!');
    
  } catch (error) {
    console.error('Error adding plans:', error);
  } finally {
    await pool.end();
  }
}

addSimplePlans();