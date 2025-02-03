import { getRedis } from "@/config/database/redis";

async function deleteEmailBitmap(): Promise<void> {
  const redisClient = getRedis();
  if (!redisClient) {
    throw new Error("Redis client is not initialized");
  }

  const result = await redisClient.del("email_bitmap"); 
  if (result === 1) {
    console.log(`Bitmap email_bitmap has been deleted successfully.`);
  } else {
    console.log(`Bitmap email_bitmap does not exist or could not be deleted.`);
  }
}

(async () => {
  try {
    await deleteEmailBitmap();
    console.log("Operation completed.");
  } catch (error) {
    console.error("Error while deleting email_bitmap:", error);
  }
})();
