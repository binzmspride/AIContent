import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function updateArticlesSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Add new columns
    console.log('Adding text_content and image_urls columns...');
    await client.query(`
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS text_content TEXT,
      ADD COLUMN IF NOT EXISTS image_urls JSONB
    `);

    console.log('Columns added successfully');

    // Update existing articles
    console.log('Updating existing articles...');
    const articles = await client.query('SELECT id, content FROM articles WHERE text_content IS NULL OR image_urls IS NULL');

    for (const article of articles.rows) {
      const content = article.content || '';
      
      // Extract image URLs
      const imageRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
      const imageUrls = [];
      let match;
      
      while ((match = imageRegex.exec(content)) !== null) {
        imageUrls.push(match[1]);
      }
      
      // Remove img tags to get text content
      const textContent = content.replace(/<img[^>]*>/g, '').trim();
      
      await client.query(
        'UPDATE articles SET text_content = $1, image_urls = $2 WHERE id = $3',
        [textContent, JSON.stringify(imageUrls), article.id]
      );
    }

    console.log(`Updated ${articles.rows.length} articles`);
    
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

updateArticlesSchema();