import { getRedis } from "@/config/database/redis";

export async function addLikeToCategory(categoryId: number, userId: number) {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }
    return await redisClient.sAdd(`category_likes:${categoryId}`, userId.toString());
}

/**
 * ✅ Xóa user khỏi danh sách like của category
 */
export async function removeLikeFromCategory(categoryId: number, userId: number) {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }
    return await redisClient.sRem(`category_likes:${categoryId}`, userId.toString());
}

/**
 * ✅ Lấy số lượng user đã like category
 */
export async function getLikeCount(categoryId: number) {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }
    return await redisClient.sCard(`category_likes:${categoryId}`);
}

/**
 * ✅ Kiểm tra xem user có like category không
 */
export async function hasUserLikedCategory(categoryId: number, userId: number): Promise<boolean> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }
    const isMember = await redisClient.sIsMember(`category_likes:${categoryId}`, userId.toString());
    return isMember; 
}

/**
 * ✅ Lấy danh sách user đã like một category
 */
export async function getUsersLikedCategory(categoryId: number) {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }
    return await redisClient.sMembers(`category_likes:${categoryId}`);
}
