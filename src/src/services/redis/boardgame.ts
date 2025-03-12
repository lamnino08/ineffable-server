import { getRedis } from "@/config/database/redis";
import { getBoardgameDetails } from "@/models/boardgame/boardgameModel";


export async function setBoardgameOwner(boardgameId: number, userId: number): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }
    redisClient.hSet("boardgame_owner", boardgameId.toString(), userId.toString());
}

export async function getBoardgameOwner(boardgameId: number): Promise<number | null> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const userID = await redisClient.hGet("boardgame_owner", boardgameId.toString());

    if (userID) {
        return Number(userID);
    }

    const boardgame = await getBoardgameDetails(boardgameId)

    if (!boardgame) {
        return null;
    }

    redisClient.hSet("boardgame_owner", boardgameId.toString(), boardgame.created_by.toString());
    return boardgame.created_by;
}

export async function checkOwnerBoardgame(boardgameId: number, userId: number): Promise<boolean> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }
    const userID = await redisClient.hGet("boardgame_owner", boardgameId.toString());

    
    if (userID) {
        return userID == userId.toString();
    }

    const boardgame = await getBoardgameDetails(boardgameId);

    if (!boardgame) {
        return false;
    }

    redisClient.hSet("boardgame_owner", boardgameId.toString(), boardgame.created_by.toString());
    return boardgame.created_by == userId;
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
