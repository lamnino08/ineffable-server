import { getRedis } from "@/config/database/redis";

interface RuleOwnerInfo {
    boardgameId: number;
    userId: number;
}

export async function setRuleOwner(ruleId: number, boardgameId: number, userId: number): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const ownerInfo: RuleOwnerInfo = { boardgameId, userId };
    await redisClient.hSet("rule_owner", ruleId.toString(), JSON.stringify(ownerInfo));
}

export async function getRuleOwner(ruleId: string): Promise<RuleOwnerInfo | null> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const ownerInfoJson = await redisClient.hGet("rule_owner", ruleId);
    if (!ownerInfoJson) {
        return null;
    }

    return JSON.parse(ownerInfoJson) as RuleOwnerInfo;
}

export async function deleteRuleOwner(ruleId: string): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }
    await redisClient.hDel("rule_owner", ruleId);
}
