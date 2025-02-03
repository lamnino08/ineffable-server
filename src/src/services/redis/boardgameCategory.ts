import { getRedis } from "@/config/database/redis";

/**
 * Thêm boardgame vào category và cập nhật số lượng
 */
export async function addBoardgameToCategory(categoryId: number): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }
    await redisClient.hIncrBy("boardgame_category_count", categoryId.toString(), 1);
}

/**
 * Giảm số lượng boardgame khi bị xóa khỏi category
 */
export async function removeBoardgameFromCategory(categoryId: number): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }
    
    const currentCount = await redisClient.hGet("boardgame_category_count", categoryId.toString());
    if (currentCount && parseInt(currentCount) > 1) {
        await redisClient.hIncrBy("boardgame_category_count", categoryId.toString(), -1);
    } else {
        await redisClient.hDel("boardgame_category_count", categoryId.toString());
    }
}

/**
 * Lấy số lượng boardgame trong một category
 */
export async function getBoardgameCount(categoryId: number): Promise<number> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const count = await redisClient.hGet("boardgame_category_count", categoryId.toString());
    return count ? parseInt(count) : 0;
}

/**
 * Lấy toàn bộ danh sách số lượng boardgame theo category
 */
export async function getAllBoardgameCounts(): Promise<Record<string, number>> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const counts = await redisClient.hGetAll("boardgame_category_count");
    const parsedCounts: Record<string, number> = {};
    
    Object.keys(counts).forEach((categoryId) => {
        parsedCounts[categoryId] = parseInt(counts[categoryId]);
    });

    return parsedCounts;
}
