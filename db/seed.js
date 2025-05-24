import { Pool } from 'pg';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const scryptAsync = promisify(scrypt);

// Kết nối tới PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Kiểm tra xem đã có tài khoản admin chưa
    const adminExists = await client.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      ['admin', 'admin@example.com']
    );

    // Tạo tài khoản admin nếu chưa tồn tại
    if (adminExists.rows.length === 0) {
      console.log('Creating admin user...');
      const hashedPassword = await hashPassword('admin@1238');
      
      await client.query(
        'INSERT INTO users (username, email, password, full_name, role, status, email_verified) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        ['admin', 'admin@example.com', hashedPassword, 'Administrator', 'admin', 'active', true]
      );
    }

    // Kiểm tra xem đã có kế hoạch nào chưa
    const plansExist = await client.query('SELECT COUNT(*) FROM plans');
    
    // Tạo các kế hoạch nếu chưa tồn tại
    if (parseInt(plansExist.rows[0].count) === 0) {
      console.log('Creating default plans...');
      
      const plans = [
        {
          name: 'Free Plan',
          description: 'Basic features with limited credits',
          price: 0,
          type: 'free',
          credits: 5,
          duration_days: 30,
          features: JSON.stringify(['5 credits', 'Basic content generation', 'Standard support']),
          is_active: true
        },
        {
          name: 'Standard Plan',
          description: 'More credits and additional features',
          price: 19.99,
          type: 'subscription',
          credits: 50,
          duration_days: 30,
          features: JSON.stringify(['50 credits', 'Advanced content generation', 'Priority support', 'Content optimization']),
          is_active: true
        },
        {
          name: 'Premium Plan',
          description: 'Full access to all features',
          price: 49.99,
          type: 'subscription',
          credits: 150,
          duration_days: 30,
          features: JSON.stringify(['150 credits', 'Premium content generation', 'VIP support', 'Advanced optimization', 'API access']),
          is_active: true
        },
        {
          name: 'Credit Pack - Small',
          description: 'Extra 20 credits for your account',
          price: 9.99,
          type: 'one_time',
          credits: 20,
          duration_days: null,
          features: JSON.stringify(['20 additional credits']),
          is_active: true
        },
        {
          name: 'Credit Pack - Medium',
          description: 'Extra 50 credits for your account',
          price: 19.99,
          type: 'one_time',
          credits: 50,
          duration_days: null,
          features: JSON.stringify(['50 additional credits']),
          is_active: true
        },
        {
          name: 'Credit Pack - Large',
          description: 'Extra 120 credits for your account',
          price: 39.99,
          type: 'one_time',
          credits: 120,
          duration_days: null,
          features: JSON.stringify(['120 additional credits']),
          is_active: true
        }
      ];
      
      for (const plan of plans) {
        await client.query(
          'INSERT INTO plans (name, description, price, type, credits, duration_days, features, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [plan.name, plan.description, plan.price, plan.type, plan.credits, plan.duration_days, plan.features, plan.is_active]
        );
      }
    }

    // Kiểm tra xem đã có các cài đặt hệ thống chưa
    const settingsExist = await client.query('SELECT COUNT(*) FROM system_settings');
    
    // Tạo các cài đặt hệ thống mặc định nếu chưa tồn tại
    if (parseInt(settingsExist.rows[0].count) === 0) {
      console.log('Creating default system settings...');
      
      const settings = [
        {
          key: 'app_name',
          value: 'SEO AI Writer',
          category: 'general'
        },
        {
          key: 'app_description',
          value: 'AI-powered SEO content generation platform',
          category: 'general'
        },
        {
          key: 'app_base_url',
          value: '',
          category: 'general'
        },
        {
          key: 'smtp_server',
          value: '',
          category: 'email'
        },
        {
          key: 'smtp_port',
          value: '587',
          category: 'email'
        },
        {
          key: 'smtp_username',
          value: '',
          category: 'email'
        },
        {
          key: 'smtp_password',
          value: '',
          category: 'email'
        },
        {
          key: 'email_sender',
          value: 'noreply@example.com',
          category: 'email'
        },
        {
          key: 'webhook_url',
          value: '',
          category: 'integrations'
        },
        {
          key: 'default_language',
          value: 'en',
          category: 'localization'
        }
      ];
      
      for (const setting of settings) {
        await client.query(
          'INSERT INTO system_settings (key, value, category) VALUES ($1, $2, $3)',
          [setting.key, setting.value, setting.category]
        );
      }
    }

    await client.query('COMMIT');
    console.log('Seed completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during seeding:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Chạy seed
await seed();