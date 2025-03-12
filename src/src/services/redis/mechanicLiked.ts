import { getRedis } from "@/config/database/redis";

/**
 * ✅ Thêm user vào danh sách like của mechanic
 */
export async function addLikeToMechanic(mechanicId: number, userId: number) {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }
    return await redisClient.sAdd(`mechanic_likes:${mechanicId}`, userId.toString());
}

/**
 * ✅ Xóa user khỏi danh sách like của mechanic
 */
export async function removeLikeFromMechanic(mechanicId: number, userId: number) {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }
    return await redisClient.sRem(`mechanic_likes:${mechanicId}`, userId.toString());
}

/**
 * ✅ Lấy số lượng user đã like mechanic
 */
export async function getLikeCount(mechanicId: number) {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }
    return await redisClient.sCard(`mechanic_likes:${mechanicId}`);
}

/**
 * ✅ Fetch số lượng like của nhiều mechanic cùng lúc
 */
export async function getListLikeCount(mechanicIds: number[]) {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    if (mechanicIds.length === 0) return {};

    const pipeline = redisClient.multi();
    mechanicIds.forEach(id => pipeline.sCard(`mechanic_likes:${id}`));

    const results = await pipeline.exec();

    const likeCountsMap: Record<number, number> = {};
    mechanicIds.forEach((id, index) => {
        likeCountsMap[id] = Number(results[index]) || 0; // Nếu không có dữ liệu, mặc định là 0
    });

    return likeCountsMap;
}

/**
 * ✅ Kiểm tra xem user có like mechanic hay không
 */
export async function hasUserLikedMechanic(mechanicId: number, userId: number): Promise<boolean> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }
    const isMember = await redisClient.sIsMember(`mechanic_likes:${mechanicId}`, userId.toString());
    return isMember;
}

/**
 * ✅ Lấy danh sách user đã like một mechanic
 */
export async function getUsersLikedMechanic(mechanicId: number) {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }
    return await redisClient.sMembers(`mechanic_likes:${mechanicId}`);
}
