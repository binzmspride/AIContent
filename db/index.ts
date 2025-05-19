import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Tạo hàm trợ giúp để lấy kết nối cơ sở dữ liệu
function getDatabaseConnection() {
  // Kiểm tra biến môi trường DATABASE_URL 
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL must be set. Using default connection.");
    // Không thiết lập URL mặc định để tránh lỗi kết nối
  }

  try {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
  } catch (error) {
    console.error("Failed to create database pool:", error);
    return null;
  }
}

// Khởi tạo kết nối
const pool = getDatabaseConnection();

// Test kết nối nếu có thể
if (pool) {
  pool.connect()
    .then((client) => {
      console.log("Successfully connected to PostgreSQL database");
      client.release();
    })
    .catch((err) => {
      console.error("Error connecting to PostgreSQL database:", err);
    });
}

// Khởi tạo Drizzle ORM
let db;
try {
  if (pool) {
    db = drizzle(pool, { schema });
  } else {
    console.error("Could not initialize Drizzle - no valid pool");
    db = {};
  }
} catch (error) {
  console.error("Error initializing Drizzle:", error);
  db = {};
}

export { pool, db };