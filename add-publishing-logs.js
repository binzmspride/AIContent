import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

async function addPublishingLogsTable() {
  try {
    console.log('Tạo bảng publishing_logs...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS publishing_logs (
        id SERIAL PRIMARY KEY,
        scheduled_post_id INTEGER NOT NULL REFERENCES scheduled_posts(id),
        platform VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL,
        message TEXT,
        details JSONB,
        timestamp TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    console.log('✓ Đã tạo bảng publishing_logs');
    
    // Tạo index cho tìm kiếm nhanh
    await sql`
      CREATE INDEX IF NOT EXISTS idx_publishing_logs_scheduled_post_id 
      ON publishing_logs(scheduled_post_id);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_publishing_logs_platform 
      ON publishing_logs(platform);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_publishing_logs_status 
      ON publishing_logs(status);
    `;
    
    console.log('✓ Đã tạo indexes cho bảng publishing_logs');
    
  } catch (error) {
    console.error('Lỗi khi tạo bảng publishing_logs:', error);
  } finally {
    await sql.end();
  }
}

addPublishingLogsTable();