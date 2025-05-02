import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Starting database seeding...");

    // Create default admin account
    const adminUser = await db.query.users.findFirst({
      where: eq(schema.users.username, 'admin')
    });

    if (!adminUser) {
      console.log("Creating admin user...");
      const adminPassword = await hashPassword('admin@1238');
      await db.insert(schema.users).values({
        username: 'admin',
        email: 'admin@example.com',
        password: adminPassword,
        fullName: 'Administrator',
        role: 'admin',
        credits: 100,
      });
      console.log("Admin user created successfully");
    } else {
      console.log("Admin user already exists, skipping");
    }

    // Create credit plans
    const existingCreditPlans = await db.query.plans.findMany({
      where: eq(schema.plans.type, 'credit')
    });

    if (existingCreditPlans.length === 0) {
      console.log("Creating credit plans...");
      await db.insert(schema.plans).values([
        {
          name: 'Gói Cơ Bản',
          description: '50 tín dụng tạo bài viết, mỗi tín dụng tạo 1 bài ~1000 từ',
          type: 'credit',
          price: 500000,
          value: 50,
        },
        {
          name: 'Gói Nâng Cao',
          description: '100 tín dụng tạo bài viết, mỗi tín dụng tạo 1 bài ~1500 từ',
          type: 'credit',
          price: 900000,
          value: 100,
        },
        {
          name: 'Gói Chuyên Nghiệp',
          description: '250 tín dụng tạo bài viết, mỗi tín dụng tạo 1 bài ~2000 từ',
          type: 'credit',
          price: 2000000,
          value: 250,
        }
      ]);
      console.log("Credit plans created successfully");
    } else {
      console.log("Credit plans already exist, skipping");
    }

    // Create storage plans
    const existingStoragePlans = await db.query.plans.findMany({
      where: eq(schema.plans.type, 'storage')
    });

    if (existingStoragePlans.length === 0) {
      console.log("Creating storage plans...");
      await db.insert(schema.plans).values([
        {
          name: 'Gói Lưu Trữ Basic',
          description: 'Lưu trữ tối đa 50 bài viết, 5GB dung lượng lưu trữ',
          type: 'storage',
          price: 200000,
          value: 5 * 1024 * 1024 * 1024, // 5GB in bytes
          duration: 30, // 1 month
        },
        {
          name: 'Gói Lưu Trữ Business',
          description: 'Lưu trữ tối đa 200 bài viết, 20GB dung lượng lưu trữ',
          type: 'storage',
          price: 500000,
          value: 20 * 1024 * 1024 * 1024, // 20GB in bytes
          duration: 30, // 1 month
        },
        {
          name: 'Gói Lưu Trữ Enterprise',
          description: 'Lưu trữ không giới hạn bài viết, 50GB dung lượng lưu trữ',
          type: 'storage',
          price: 1000000,
          value: 50 * 1024 * 1024 * 1024, // 50GB in bytes
          duration: 30, // 1 month
        }
      ]);
      console.log("Storage plans created successfully");
    } else {
      console.log("Storage plans already exist, skipping");
    }

    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
