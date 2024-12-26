import crypto from "crypto";
import bcrypt from "bcrypt";
import { getRedis } from "@/config/database/redis";

// Hash email bằng SHA-256
export function hashEmail(email: string): string {
  return crypto.createHash("sha256").update(email.toLowerCase()).digest("hex");
}

// Hash mật khẩu bằng bcrypt
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 9;
  return await bcrypt.hash(password, saltRounds);
}

// Kiểm tra email đã đăng ký trong Redis bitmap
export async function isEmailRegistered(email: string): Promise<boolean> {
  const redisClient = getRedis();
  if (!redisClient) {
    throw new Error("Redis client is not initialized");
  }
  
  const emailHash = hashEmail(email);
  const bitValue = await redisClient.getBit("email_bitmap", parseInt(emailHash, 16) % 1000000);
  return bitValue === 1;
}

// Đánh dấu email đã đăng ký trong Redis bitmap
export async function markEmailAsRegistered(email: string): Promise<void> {
  const redisClient = getRedis();
  if (!redisClient) {
    throw new Error("Redis client is not initialized");
  }
  
  const emailHash = hashEmail(email);
  await redisClient.setBit("email_bitmap", parseInt(emailHash, 16) % 1000000, 1);
}

// Hash username bằng SHA-256
export function hashUsername(username: string): string {
  return crypto.createHash("sha256").update(username.toLowerCase()).digest("hex");
}

// Kiểm tra username đã được sử dụng trong Redis bitmap
export async function isUsernameRegistered(username: string): Promise<boolean> {
  const redisClient = getRedis();
  if (!redisClient) {
    throw new Error("Redis client is not initialized");
  }

  const usernameHash = hashUsername(username);
  const bitValue = await redisClient.getBit("username_bitmap", parseInt(usernameHash, 16) % 1000000);
  return bitValue === 1;
}

// Đánh dấu username đã được sử dụng trong Redis bitmap
export async function markUsernameAsRegistered(username: string): Promise<void> {
  const redisClient = getRedis();
  if (!redisClient) {
    throw new Error("Redis client is not initialized");
  }

  const usernameHash = hashUsername(username);
  await redisClient.setBit("username_bitmap", parseInt(usernameHash, 16) % 1000000, 1);
}


// Xác thực mật khẩu
export async function authenticatePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}
