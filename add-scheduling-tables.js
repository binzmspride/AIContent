const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function addSchedulingTables() {
  try {
    console.log('Tạo enum types...');
    
    // Create enums
    await sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_status') THEN
          CREATE TYPE post_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'platform') THEN
          CREATE TYPE platform AS ENUM ('wordpress', 'facebook', 'twitter', 'linkedin', 'instagram');
        END IF;
      END $$;
    `;
    
    console.log('Tạo bảng social_connections...');
    
    // Create social_connections table
    await sql`
      CREATE TABLE IF NOT EXISTS social_connections (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        platform platform NOT NULL,
        account_name TEXT NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        token_expiry TIMESTAMP,
        account_id TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    console.log('Tạo bảng scheduled_posts...');
    
    // Create scheduled_posts table
    await sql`
      CREATE TABLE IF NOT EXISTS scheduled_posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        article_id INTEGER REFERENCES articles(id),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        featured_image TEXT,
        platforms JSONB NOT NULL,
        scheduled_time TIMESTAMP NOT NULL,
        status post_status NOT NULL DEFAULT 'pending',
        published_urls JSONB DEFAULT '{}',
        error_logs JSONB DEFAULT '[]',
        retry_count INTEGER NOT NULL DEFAULT 0,
        max_retries INTEGER NOT NULL DEFAULT 3,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    console.log('Tạo bảng post_templates...');
    
    // Create post_templates table
    await sql`
      CREATE TABLE IF NOT EXISTS post_templates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        description TEXT,
        platform platform NOT NULL,
        template JSONB NOT NULL,
        is_default BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    console.log('Tạo bảng posting_analytics...');
    
    // Create posting_analytics table
    await sql`
      CREATE TABLE IF NOT EXISTS posting_analytics (
        id SERIAL PRIMARY KEY,
        scheduled_post_id INTEGER NOT NULL REFERENCES scheduled_posts(id),
        platform platform NOT NULL,
        post_id TEXT,
        post_url TEXT,
        impressions INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        engagement INTEGER DEFAULT 0,
        last_sync_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    console.log('Tạo indexes...');
    
    // Create indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_social_connections_user_id ON social_connections(user_id);
      CREATE INDEX IF NOT EXISTS idx_social_connections_platform ON social_connections(platform);
      CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON scheduled_posts(user_id);
      CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
      CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_time ON scheduled_posts(scheduled_time);
      CREATE INDEX IF NOT EXISTS idx_post_templates_user_id ON post_templates(user_id);
      CREATE INDEX IF NOT EXISTS idx_post_templates_platform ON post_templates(platform);
      CREATE INDEX IF NOT EXISTS idx_posting_analytics_scheduled_post_id ON posting_analytics(scheduled_post_id);
    `;
    
    console.log('✅ Đã tạo thành công tất cả bảng scheduling!');
  } catch (error) {
    console.error('❌ Lỗi khi tạo bảng scheduling:', error);
    throw error;
  }
}

addSchedulingTables();