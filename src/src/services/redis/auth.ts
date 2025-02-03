import crypto from "crypto";
import bcrypt from "bcrypt";
import { getRedis } from "@/config/database/redis";

const MAX_BITMAP_SIZE = 10000000;

export function hashEmail(email: string): string {
  return crypto.createHash("sha256").update(email.toLowerCase()).digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 9;
  return await bcrypt.hash(password, saltRounds);
}

export async function isEmailRegistered(email: string): Promise<boolean> {
  const redisClient = getRedis();
  if (!redisClient) {
    throw new Error("Redis client is not initialized");
  }
  
  const emailHash = hashEmail(email);
  const bitValue = await redisClient.getBit("email_bitmap", parseInt(emailHash, 16) % MAX_BITMAP_SIZE);
  return bitValue === 1;
}

export async function markEmailAsRegistered(email: string): Promise<void> {
  const redisClient = getRedis();
  if (!redisClient) {
    throw new Error("Redis client is not initialized");
  }
  
  const emailHash = hashEmail(email);
  await redisClient.setBit("email_bitmap", parseInt(emailHash, 16) % MAX_BITMAP_SIZE, 1);
}

export function hashUsername(username: string): string {
  return crypto.createHash("sha256").update(username.toLowerCase()).digest("hex");
}

export async function isUsernameRegistered(username: string): Promise<boolean> {
  const redisClient = getRedis();
  if (!redisClient) {
    throw new Error("Redis client is not initialized");
  }

  const usernameHash = hashUsername(username);
  const bitValue = await redisClient.getBit("username_bitmap", parseInt(usernameHash, 16) % MAX_BITMAP_SIZE);
  return bitValue === 1;
}

export async function markUsernameAsRegistered(username: string): Promise<void> {
  const redisClient = getRedis();
  if (!redisClient) {
    throw new Error("Redis client is not initialized");
  }

  const usernameHash = hashUsername(username);
  await redisClient.setBit("username_bitmap", parseInt(usernameHash, 16) % MAX_BITMAP_SIZE, 1);
}

export async function authenticatePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}
