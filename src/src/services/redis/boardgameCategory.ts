import { getRedis } from "@/config/database/redis";
import { addCategoryToBoardgame, getAllCategoryLikes, getBoardgameCountByCategory, getCategoriesByBoardgame, likeCategory, removeCategoryFromBoardgame, unlikeCategory } from "@/models/boardgame/boardgameCategoryModel";


/**
 * 📌 Thêm category vào boardgame (ưu tiên lưu MySQL trước, sau đó cập nhật cache Redis)
 */
export async function addCategoryToGame(gameId: number, categoryId: number) {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const countKey = "boardgame_category_count_game";
    const cacheKey = `boardgame:${gameId}:categories`;

    // 1️⃣ Lưu vào MySQL trước
    await addCategoryToBoardgame(gameId, categoryId);

    // 2️⃣ Cập nhật cache số lượng boardgames trong category
    await redisClient.hIncrBy(countKey, categoryId.toString(), 1);

    // 3️⃣ Xóa cache của boardgame này để đảm bảo dữ liệu mới nhất lần sau
    await redisClient.del(cacheKey);
}

/**
 * 📌 Xóa category khỏi boardgame (ưu tiên xóa MySQL trước, sau đó cập nhật cache Redis)
 */
export async function removeCategoryFromGame(gameId: number, categoryId: number) {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const countKey = "boardgame_category_count_game";
    const cacheKey = `boardgame:${gameId}:categories`;

    await removeCategoryFromBoardgame(gameId, categoryId);

    const currentCount = await redisClient.hGet(countKey, categoryId.toString());
    if (currentCount && parseInt(currentCount) > 0) {
        await redisClient.hIncrBy(countKey, categoryId.toString(), -1);
    }

    await redisClient.del(cacheKey);
}

// Hàm lấy danh sách categories của boardgame từ Redis
export const getBoardgameCategories = async (boardgameId: number): Promise<any[]> => {
    const redisClient = getRedis();
    
    if (!redisClient) {
        console.warn("Redis is not available. Fetching from MySQL.");
        return await getCategoriesByBoardgame(boardgameId);
    }
    
    const cacheKey = `boardgame:${boardgameId}:categories`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        return JSON.parse(cachedData);
    }

    // Nếu không có cache, lấy từ MySQL
    const categories = await getCategoriesByBoardgame(boardgameId);

    // Lưu cache vào Redis (TTL 1 tiếng)
    await redisClient.set(cacheKey, JSON.stringify(categories), { EX: 3600*24 });

    return categories;
};


/**
 * Lấy số lượng boardgame thuộc một category (ưu tiên Redis)
 */
export async function getBoardgameCount(categoryId: number): Promise<number> {
    const redisClient = getRedis();
    if (!redisClient) throw new Error("Redis client is not initialized");

    const countKey = "boardgame_category_count_game";

    // 1️⃣ Lấy dữ liệu từ Redis trước
    const count = await redisClient.hGet(countKey, categoryId.toString());
    if (count) return parseInt(count); // 🔥 Trả về ngay nếu có cache

    // 2️⃣ Nếu không có cache, lấy từ MySQL
    const totalCount = await getBoardgameCountByCategory(categoryId);

    // 3️⃣ Lưu cache vào Redis để lần sau lấy nhanh hơn
    await redisClient.hSet(countKey, categoryId.toString(), totalCount);

    return totalCount;
}

/**
 * 📌 Lấy toàn bộ danh sách số lượng boardgames theo category (ưu tiên Redis)
 */
export async function getAllBoardgameCounts(): Promise<{ categoryId: number; count: number } []> {
    
    const redisClient = getRedis();
    if (!redisClient) throw new Error("Redis client is not initialized");

    const countKey = "boardgame_category_count_game";

    // 1️⃣ Lấy dữ liệu từ Redis
    const counts = await redisClient.hGetAll(countKey);
    if (Object.keys(counts).length > 0) {
        return Object.entries(counts).map(([categoryId, count]) => ({
            categoryId: parseInt(categoryId),
            count: parseInt(count),
        }));
    }

    // 2️⃣ Nếu không có cache, truy vấn từ MySQL
    const mappedResults = await getAllBoardgameCounts();

    // 3️⃣ Lưu cache vào Redis
    mappedResults.forEach(({ categoryId, count }) => {
        redisClient.hSet(countKey, categoryId.toString(), count);
    });

    return mappedResults;
}



const boardgameCategoryCountKey = "boardgame_category_count_like"
/**
 * 📌 Like a category (prioritize saving to MySQL first, then update Redis cache)
 */
export async function likeCategoryAction(userId: number, categoryId: number) {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const countKey = boardgameCategoryCountKey;

    // 1️⃣ Save to MySQL first
    await likeCategory(userId, categoryId);

    // 2️⃣ Update cache for the number of likes on the category
    await redisClient.hIncrBy(countKey, categoryId.toString(), 1);
}

/**
 * 📌 Unlike a category (prioritize removing from MySQL first, then update Redis cache)
 */
export async function unlikeCategoryAction(userId: number, categoryId: number) {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const countKey = boardgameCategoryCountKey;

    await unlikeCategory(userId, categoryId);

    const currentCount = await redisClient.hGet(countKey, categoryId.toString());
    if (currentCount && parseInt(currentCount) > 0) {
        await redisClient.hIncrBy(countKey, categoryId.toString(), -1);
    }
}


/**
 * 📌 Get all category like counts (prioritize Redis, fallback to MySQL)
 */
export async function getAllCategoryLikeCounts(): Promise<Record<string, number>> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const countKey = boardgameCategoryCountKey;
    
    // 1️⃣ Fetch from Redis first
    const likeCounts = await redisClient.hGetAll(countKey);
    if (Object.keys(likeCounts).length > 0) {
        return Object.fromEntries(
            Object.entries(likeCounts).map(([categoryId, count]) => [categoryId, parseInt(count)])
        );
    }

    // 2️⃣ If no cache, fetch from MySQL
    const results = await getAllCategoryLikes();

    // 3️⃣ Store in Redis for future retrieval
    for (const { categoryId, likeCount } of results) {
        await redisClient.hSet(countKey, categoryId.toString(), likeCount.toString());
    }

    return Object.fromEntries(results.map(({ categoryId, likeCount }) => [categoryId.toString(), likeCount]));
}
