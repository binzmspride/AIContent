import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function completePlansFix() {
  try {
    console.log('Adding missing columns to plans table...');
    
    // Add missing columns
    await pool.query(`
      ALTER TABLE plans ADD COLUMN IF NOT EXISTS duration INTEGER;
    `);
    
    console.log('All columns added successfully!');
    
    // Now add some simple plans without duration first
    const simplePlans = [
      {
        name: 'Gói Cơ Bản',
        description: 'Gói dành cho người mới bắt đầu',
        type: 'credit',
        price: 99000,
        value: 100
      },
      {
        name: 'Gói Chuyên Nghiệp', 
        description: 'Gói dành cho doanh nghiệp nhỏ',
        type: 'credit',
        price: 299000,
        value: 500
      },
      {
        name: 'Gói Doanh Nghiệp',
        description: 'Gói dành cho doanh nghiệp lớn', 
        type: 'credit',
        price: 799000,
        value: 2000
      }
    ];
    
    for (const plan of simplePlans) {
      await pool.query(
        `INSERT INTO plans (name, description, type, price, value) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (name) DO NOTHING`,
        [plan.name, plan.description, plan.type, plan.price, plan.value]
      );
    }
    
    console.log('Sample plans added successfully!');
    
  } catch (error) {
    console.error('Error fixing plans table:', error);
  } finally {
    await pool.end();
  }
}

completePlansFix();