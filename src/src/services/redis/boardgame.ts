import { getRedis } from "@/config/database/redis";


export async function setBoardgameOwner(boardgameId: number, userId: number): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }
    redisClient.hSet("boardgame_owner", boardgameId.toString(), userId.toString());
}

export async function getBoardgameOwner(boardgameID: string): Promise<string | null> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const userID = await redisClient.hGet("boardgame_owner", boardgameID);
    return userID || null;
}

export async function checkOwnerBoardgame(boardgameId: string, userId: number): Promise<boolean> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }
    const userID = await redisClient.hGet("boardgame_owner", boardgameId);

    return userID == userId.toString();
}

export async function deleteBoardgameOwner(boardgameID: string): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    await redisClient.hDel("boardgame_owner", boardgameID);
}

export async function getAllBoardgameOwners(): Promise<Record<string, string>> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const ownerships = await redisClient.hGetAll("boardgame_owner");
    return ownerships;
}
