import { getRedis } from "@/config/database/redis";

interface VideoOwnerInfo {
    boardgameId: number;
    userId: number;
}

export async function setVideoOwner(videoId: number, boardgameId: number, userId: number): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const ownerInfo: VideoOwnerInfo = { boardgameId, userId };
    await redisClient.hSet("video_owner", videoId.toString(), JSON.stringify(ownerInfo));
}

export async function getVideoOwner(videoId: number): Promise<VideoOwnerInfo | null> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const ownerInfoJson = await redisClient.hGet("video_owner", videoId.toString());
    if (!ownerInfoJson) {
        return null;
    }

    return JSON.parse(ownerInfoJson) as VideoOwnerInfo;
}

export async function deleteVideoOwner(videoId: string): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }
    await redisClient.hDel("video_owner", videoId);
}
