import { getRedis } from "@/config/database/redis";
import { addMechanicToBoardgame, getAllMechanicLikes, getBoardgameCountByMechanic, getMechanicsByBoardgame, likeMechanic, removeMechanicFromBoardgame, unlikeMechanic } from "@/models/boardgame/boardgameMechanicModel";
import { BoardgameMechanic } from "@/types/models/Boardgame";

/**
 * 📌 Add mechanic to boardgame (prioritize saving to MySQL first, then update Redis cache)
 */
export async function addMechanicToGame(gameId: number, mechanicId: number) {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const countKey = "boardgame_mechanic_count_game";
    const cacheKey = `boardgame:${gameId}:mechanics`;

    // 1. Save to MySQL first
    await addMechanicToBoardgame(gameId, mechanicId);

    // 2️. Update cache for the count of boardgames in the mechanic
    await redisClient.hIncrBy(countKey, mechanicId.toString(), 1);

    // 3. Invalidate cache for this boardgame to ensure fresh data next time
    await redisClient.del(cacheKey);
}

/**
 * 📌 Remove mechanic from boardgame (prioritize removing from MySQL first, then update Redis cache)
 */
export async function removeMechanicFromGame(gameId: number, mechanicId: number) {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const countKey = "boardgame_mechanic_count_game";
    const cacheKey = `boardgame:${gameId}:mechanics`;

    await removeMechanicFromBoardgame(gameId, mechanicId);

    const currentCount = await redisClient.hGet(countKey, mechanicId.toString());
    if (currentCount && parseInt(currentCount) > 0) {
        await redisClient.hIncrBy(countKey, mechanicId.toString(), -1);
    }

    await redisClient.del(cacheKey);
}

// Fetch list of mechanics for a boardgame from Redis
// Fetch list of mechanics for a boardgame from Redis
export const getBoardgameMechanics = async (boardgameId: number): Promise<BoardgameMechanic[]> => {
    const redisClient = getRedis();

    // 1. Kiểm tra Redis client
    if (!redisClient) {
        // 2. Nếu Redis không khả dụng, lấy từ MySQL
        return await getMechanicsByBoardgame(boardgameId);
    }

    // 3. Kiểm tra dữ liệu trong Redis
    const cacheKey = `boardgame:${boardgameId}:mechanics`;
    const cachedData = await redisClient.get(cacheKey);

    // 4. Nếu có dữ liệu trong Redis, trả về luôn
    if (cachedData) {
        return JSON.parse(cachedData);
    }

    // 5. Nếu không có, lấy từ MySQL
    const mechanics = await getMechanicsByBoardgame(boardgameId);

    // 6. Lưu dữ liệu vào Redis (TTL 1 ngày)
    await redisClient.set(cacheKey, JSON.stringify(mechanics), { EX: 3600 * 24 });

    return mechanics;
};


/**
 * 📌 Get the number of boardgames in a mechanic (prioritize Redis)
 */
export async function getboardgameCounrByMechanicId(mechanicId: number): Promise<number> {
    const redisClient = getRedis();
    if (!redisClient) throw new Error("Redis client is not initialized");

    const countKey = "boardgame_mechanic_count_game";

    // 1️⃣ Fetch from Redis first
    const count = await redisClient.hGet(countKey, mechanicId.toString());
    if (count) return parseInt(count); // 🔥 Return immediately if cached

    // 2️⃣ If no cache, fetch from MySQL
    const totalCount = await getBoardgameCountByMechanic(mechanicId);

    // 3️⃣ Store cache in Redis for faster future retrieval
    await redisClient.hSet(countKey, mechanicId.toString(), totalCount);

    return totalCount;
}

/**
 * 📌 Get the total list of boardgame counts by mechanic (prioritize Redis)
 */
export async function getAllBoardgameCountsByMechanic(): Promise<{ mechanicId: number; count: number }[]> {
    const redisClient = getRedis();
    if (!redisClient) throw new Error("Redis client is not initialized");

    const countKey = "boardgame_mechanic_count_game";

    // 1️⃣ Fetch from Redis
    const counts = await redisClient.hGetAll(countKey);
    if (Object.keys(counts).length > 0) {
        return Object.entries(counts).map(([mechanicId, count]) => ({
            mechanicId: parseInt(mechanicId),
            count: parseInt(count),
        }));
    }

    // 2️⃣ If no cache, query from MySQL
    const mappedResults = await getAllBoardgameCountsByMechanic();

    // 3️⃣ Store cache in Redis
    mappedResults.forEach(({ mechanicId, count }) => {
        redisClient.hSet(countKey, mechanicId.toString(), count);
    });

    return mappedResults;
}


const boardgameMechanicCountKey = "boardgame_mechanic_count_like";

/**
 * 📌 Like a mechanic (prioritize saving to MySQL first, then update Redis cache)
 */
export async function likeMechanicAction(userId: number, mechanicId: number) {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const countKey = boardgameMechanicCountKey;

    // 1️⃣ Save to MySQL first
    await likeMechanic(userId, mechanicId);

    // 2️⃣ Update cache for the number of likes on the mechanic
    await redisClient.hIncrBy(countKey, mechanicId.toString(), 1);
}

/**
 * 📌 Unlike a mechanic (prioritize removing from MySQL first, then update Redis cache)
 */
export async function unlikeMechanicAction(userId: number, mechanicId: number) {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const countKey = boardgameMechanicCountKey;

    await unlikeMechanic(userId, mechanicId);

    const currentCount = await redisClient.hGet(countKey, mechanicId.toString());
    if (currentCount && parseInt(currentCount) > 0) {
        await redisClient.hIncrBy(countKey, mechanicId.toString(), -1);
    }
}

/**
 * 📌 Get all mechanic like counts (prioritize Redis, fallback to MySQL)
 */
export async function getAllMechanicLikeCounts(): Promise<Record<string, number>> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const countKey = boardgameMechanicCountKey;
    
    // 1️⃣ Fetch from Redis first
    const likeCounts = await redisClient.hGetAll(countKey);
    if (Object.keys(likeCounts).length > 0) {
        return Object.fromEntries(
            Object.entries(likeCounts).map(([mechanicId, count]) => [mechanicId, parseInt(count)])
        );
    }

    // 2️⃣ If no cache, fetch from MySQL
    const results = await getAllMechanicLikes();

    // 3️⃣ Store in Redis for future retrieval
    for (const { mechanicId, likeCount } of results) {
        await redisClient.hSet(countKey, mechanicId.toString(), likeCount.toString());
    }

    return Object.fromEntries(results.map(({ mechanicId, likeCount }) => [mechanicId.toString(), likeCount]));
}

