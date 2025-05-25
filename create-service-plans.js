import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createServicePlans() {
  try {
    console.log('Creating 4 service plans...');
    
    // First, clear existing plans
    await pool.query('DELETE FROM plans');
    
    // Create 4 service plans
    const plans = [
      {
        name: 'Gói Miễn Phí',
        description: 'Gói cơ bản dành cho người mới bắt đầu - hoàn toàn miễn phí',
        type: 'free',
        price: '0.00',
        credits: 10,
        duration_days: null, // Không giới hạn thời gian
        features: JSON.stringify([
          '10 credits miễn phí',
          'Tạo nội dung SEO cơ bản',
          'Hỗ trợ cộng đồng',
          'Xuất file văn bản'
        ]),
        is_active: true,
        value: 10
      },
      {
        name: 'Gói Cơ Bản',
        description: 'Gói phù hợp cho cá nhân và blogger',
        type: 'subscription',
        price: '99000',
        credits: 100,
        duration_days: 30,
        features: JSON.stringify([
          '100 credits hàng tháng',
          'Tạo nội dung SEO chuyên nghiệp',
          'Tối ưu từ khóa nâng cao',
          'Hỗ trợ email ưu tiên',
          'Xuất đa định dạng'
        ]),
        is_active: true,
        value: 100
      },
      {
        name: 'Gói Chuyên Nghiệp',
        description: 'Gói dành cho doanh nghiệp nhỏ và agency',
        type: 'subscription',
        price: '299000',
        credits: 500,
        duration_days: 30,
        features: JSON.stringify([
          '500 credits hàng tháng',
          'AI content generation nâng cao',
          'Phân tích đối thủ cạnh tranh',
          'API access',
          'Hỗ trợ 24/7',
          'Quản lý nhiều website',
          'Báo cáo chi tiết'
        ]),
        is_active: true,
        value: 500
      },
      {
        name: 'Gói Doanh Nghiệp',
        description: 'Gói toàn diện cho doanh nghiệp lớn',
        type: 'subscription',
        price: '799000',
        credits: 2000,
        duration_days: 30,
        features: JSON.stringify([
          '2000 credits hàng tháng',
          'Unlimited content generation',
          'Custom AI model training',
          'White-label solution',
          'Dedicated account manager',
          'Priority support',
          'Advanced analytics',
          'Multi-language support',
          'Bulk content generation'
        ]),
        is_active: true,
        value: 2000
      }
    ];
    
    for (let i = 0; i < plans.length; i++) {
      const plan = plans[i];
      const result = await pool.query(
        `INSERT INTO plans (name, description, type, price, credits, duration_days, features, is_active, value) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING id`,
        [plan.name, plan.description, plan.type, plan.price, plan.credits, plan.duration_days, plan.features, plan.is_active, plan.value]
      );
      
      console.log(`✅ Created plan: ${plan.name} (ID: ${result.rows[0].id})`);
    }
    
    console.log('\n🎉 All 4 service plans created successfully!');
    console.log('📋 Plans summary:');
    console.log('   1. Gói Miễn Phí - 10 credits (FREE)');
    console.log('   2. Gói Cơ Bản - 100 credits (99,000 VND)');  
    console.log('   3. Gói Chuyên Nghiệp - 500 credits (299,000 VND)');
    console.log('   4. Gói Doanh Nghiệp - 2000 credits (799,000 VND)');
    
  } catch (error) {
    console.error('Error creating service plans:', error);
  } finally {
    await pool.end();
  }
}

createServicePlans();