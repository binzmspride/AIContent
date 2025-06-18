import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function addSampleImages() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Sample images for social media content
    const sampleImages = [
      {
        userId: 1, // admin user
        title: 'Technology Background',
        prompt: 'Modern technology background with digital elements',
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800',
        alt: 'Modern technology background with blue tones and digital patterns',
        sourceText: 'Technology theme image',
        creditsUsed: 0,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 1,
        title: 'Business Professional',
        prompt: 'Professional business environment',
        imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
        alt: 'Professional business meeting environment',
        sourceText: 'Business theme image',
        creditsUsed: 0,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 1,
        title: 'Social Media Design',
        prompt: 'Colorful social media design elements',
        imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800',
        alt: 'Colorful social media design with modern elements',
        sourceText: 'Social media theme image',
        creditsUsed: 0,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 1,
        title: 'Anime Style Art',
        prompt: 'Anime style artwork with vibrant colors',
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        alt: 'Anime style artwork with colorful characters and vibrant design',
        sourceText: 'Anime theme image',
        creditsUsed: 0,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 1,
        title: 'Gaming Content',
        prompt: 'Gaming content design for social media',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
        alt: 'Gaming setup with colorful lighting perfect for gaming content',
        sourceText: 'Gaming theme image',
        creditsUsed: 0,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert sample images
    for (const image of sampleImages) {
      const insertQuery = `
        INSERT INTO images (
          user_id, title, prompt, image_url, source_text, 
          credits_used, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT DO NOTHING
      `;
      
      await client.query(insertQuery, [
        image.userId,
        image.title,
        image.prompt,
        image.imageUrl,
        image.sourceText,
        image.creditsUsed,
        image.status,
        image.createdAt,
        image.updatedAt
      ]);
    }

    console.log('Sample images added successfully');
    
  } catch (error) {
    console.error('Error adding sample images:', error);
  } finally {
    await client.end();
  }
}

addSampleImages();