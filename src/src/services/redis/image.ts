import { getRedis } from "@/config/database/redis";

interface ImageOwnerInfo {
    boardgameId: number;
    userId: number;
}

export async function setImageOwner(imageId: number, boardgameId: number, userId: number): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const ownerInfo: ImageOwnerInfo = { boardgameId, userId };
    await redisClient.hSet("image_owner", imageId.toString(), JSON.stringify(ownerInfo));
}

export async function getImageOwner(imageId: string): Promise<ImageOwnerInfo | null> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const ownerInfoJson = await redisClient.hGet("image_owner", imageId);
    if (!ownerInfoJson) {
        return null;
    }

    return JSON.parse(ownerInfoJson) as ImageOwnerInfo;
}

export async function deleteImageOwner(imageId: string): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }
    await redisClient.hDel("image_owner", imageId);
}
