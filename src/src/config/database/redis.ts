import { createClient, RedisClientType } from "redis";

const client: { instanceConnect?: RedisClientType<Record<string, never>> } = {};

export const initRedis = async (): Promise<void> => {
  const instanceRedis = createClient({
    url: "redis://localhost:6379",
  }) as RedisClientType<Record<string, never>>;

  instanceRedis.on("connect", () => {
    console.log("Redis Connection Status: Connected");
  });

  instanceRedis.on("end", () => {
    console.log("Redis Connection Status: Disconnected");
  });

  instanceRedis.on("reconnecting", () => {
    console.log("Redis Connection Status: Reconnecting");
  });

  instanceRedis.on("error", (err) => {
    console.error(`Redis Connection Status: Error - ${err}`);
  });

  client.instanceConnect = instanceRedis;

  await instanceRedis.connect();
  console.log("Redis initialized successfully!");
};

export const getRedis = (): RedisClientType<Record<string, never>> | undefined => {
  return client.instanceConnect;
};

export const closeRedis = async (): Promise<void> => {
  if (client.instanceConnect) {
    await client.instanceConnect.quit();
    console.log("Redis connection closed.");
  }
};
