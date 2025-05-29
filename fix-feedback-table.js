import { db } from './db/index.ts';
import { sql } from 'drizzle-orm';

async function createFeedbackTable() {
  try {
    console.log('Creating feedback table...');
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'unread',
        page TEXT,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    
    console.log('Feedback table created successfully!');
    
    // Check if table exists
    const result = await db.execute(sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'feedback'
    `);
    
    console.log('Feedback table exists:', result.length > 0);
    
  } catch (error) {
    console.error('Error creating feedback table:', error);
  }
}

createFeedbackTable();