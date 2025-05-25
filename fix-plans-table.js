import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixPlansTable() {
  try {
    console.log('Adding missing value column to plans table...');
    
    // Add value column if it doesn't exist
    await pool.query(`
      ALTER TABLE plans ADD COLUMN IF NOT EXISTS value BIGINT NOT NULL DEFAULT 0;
    `);
    
    console.log('Value column added successfully!');
    
    // Now add some sample plans
    const plans = [
      {
        name: 'Gói Cơ Bản',
        description: 'Gói dành cho người mới bắt đầu',
        type: 'credit',
        price: 99000,
        value: 100,
        duration: 30
      },
      {
        name: 'Gói Chuyên Nghiệp', 
        description: 'Gói dành cho doanh nghiệp nhỏ',
        type: 'credit',
        price: 299000,
        value: 500,
        duration: 30
      },
      {
        name: 'Gói Doanh Nghiệp',
        description: 'Gói dành cho doanh nghiệp lớn', 
        type: 'credit',
        price: 799000,
        value: 2000,
        duration: 30
      }
    ];
    
    for (const plan of plans) {
      await pool.query(
        `INSERT INTO plans (name, description, type, price, value, duration) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (name) DO NOTHING`,
        [plan.name, plan.description, plan.type, plan.price, plan.value, plan.duration]
      );
    }
    
    console.log('Sample plans added successfully!');
    
  } catch (error) {
    console.error('Error fixing plans table:', error);
  } finally {
    await pool.end();
  }
}

fixPlansTable();