import { getRedis } from "@/config/database/redis";
import { getBoardgameDetails, updateAgeModel, UpdateAvatar, UpdateBackground, UpdateBBGLink, UpdateDescription, UpdateDuration, updateName, UpdateNumeberPlayers, UpdateShortcut, UpdateWeightModel } from "@/models/boardgame/boardgameModel";
import { BoardgameDetails } from "@/types/models/Boardgame";
import { addBoardgameHistory } from "../mongodb/history/BoardgameHistoryService";


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

export async function getBoardgameDetailByID(boardgameID: number): Promise<BoardgameDetails | null> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    // 2. get boardgame from redis
    const boardgame_json = await redisClient.get(`boardgame_${boardgameID}`);

    // 3. if boardgame exists in redis, return it
    if (boardgame_json) {
        return JSON.parse(boardgame_json);
    }

    // 4. if boardgame does not exist in redis, get it from mysql
    const boardgame = await getBoardgameDetails(boardgameID);

    // 5. if boardgame exists in mysql, store it in redis and return it
    if (boardgame) {
        await redisClient.set(`boardgame_${boardgameID}`, JSON.stringify(boardgame));
        return boardgame;
    }

    return null;
}

export async function boardgameUpdateTitle(boardgameID: number, name: string, userID: number): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    // 1. Lấy thông tin cũ từ MySQL (chắc chắn luôn có dữ liệu chuẩn)
    const gameOld = await getBoardgameDetailByID(Number(boardgameID));

    if (!gameOld) {
        console.log("Boardgame not found in MySQL");
        return;
    }

    // 2. Ghi lại lịch sử cập nhật
    let changes: Record<string, { oldValue: any; newValue: any }> = {};
    changes.name = { oldValue: gameOld.name, newValue: name };

    addBoardgameHistory(Number(boardgameID), {
        action: "update",
        updated_by: userID,
        changes
    });

    // 3. Cập nhật tên boardgame trong MySQL
    await updateName(boardgameID, name);

    // 4. Cập nhật lại Redis với dữ liệu mới từ MySQL
    await redisClient.set(`boardgame_${boardgameID}`, JSON.stringify(gameOld));
}

export async function boardgameUpdateBGGLink(boardgameID: number, BGGLink: string, userID: number): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    // 1. Lấy thông tin cũ từ MySQL
    const gameOld = await getBoardgameDetailByID(Number(boardgameID));

    if (!gameOld) {
        console.log("Boardgame not found in MySQL");
        return;
    }

    // 2. Ghi lại lịch sử cập nhật
    let changes: Record<string, { oldValue: any; newValue: any }> = {};
    changes.boardgamegeek_url = { oldValue: gameOld.boardgamegeek_url, newValue: BGGLink };

    addBoardgameHistory(Number(boardgameID), {
        action: "update",
        updated_by: userID,
        changes
    });

    // 3. Cập nhật BGGLink trong MySQL
    await UpdateBBGLink(BGGLink, boardgameID);

    // 4. Cập nhật lại Redis với dữ liệu mới
    gameOld.boardgamegeek_url = BGGLink;
    await redisClient.set(`boardgame_${boardgameID}`, JSON.stringify(gameOld), { EX: 3600 * 24 });
}

export async function boardgameUpdateShortcut(boardgameID: number, shortcut: string, userID: number): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    // 1. Lấy thông tin cũ từ MySQL
    const gameOld = await getBoardgameDetailByID(Number(boardgameID));

    if (!gameOld) {
        console.log("Boardgame not found in MySQL");
        return;
    }

    // 2. Ghi lại lịch sử cập nhật
    let changes: Record<string, { oldValue: any; newValue: any }> = {};
    changes.shortcut = { oldValue: gameOld.shortcut, newValue: shortcut };

    addBoardgameHistory(Number(boardgameID), {
        action: "update",
        updated_by: userID,
        changes
    });

    // 3. Cập nhật shortcut trong MySQL
    await UpdateShortcut(shortcut, boardgameID);

    // 4. Cập nhật lại Redis với dữ liệu mới
    gameOld.shortcut = shortcut;
    await redisClient.set(`boardgame_${boardgameID}`, JSON.stringify(gameOld), { EX: 3600 * 24 });
}

export async function boardgameUpdateDescription(boardgameID: number, description: string, userID: number): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    // 1. Lấy thông tin cũ từ MySQL
    const gameOld = await getBoardgameDetailByID(Number(boardgameID));

    if (!gameOld) {
        console.log("Boardgame not found in MySQL");
        return;
    }

    // 2. Ghi lại lịch sử cập nhật
    let changes: Record<string, { oldValue: any; newValue: any }> = {};
    changes.description = { oldValue: gameOld.description, newValue: description };

    addBoardgameHistory(Number(boardgameID), {
        action: "update",
        updated_by: userID,
        changes
    });

    // 3. Cập nhật description trong MySQL
    await UpdateDescription(description, boardgameID);

    // 4. Cập nhật lại Redis với dữ liệu mới
    gameOld.description = description;
    await redisClient.set(`boardgame_${boardgameID}`, JSON.stringify(gameOld), { EX: 3600 * 24 });
}

export async function boardgameUpdateAge(boardgameID: number, age: number, userID: number): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    // 1. Lấy thông tin cũ từ MySQL
    const gameOld = await getBoardgameDetailByID(Number(boardgameID));

    if (!gameOld) {
        console.log("Boardgame not found in MySQL");
        return;
    }

    // 2. Ghi lại lịch sử cập nhật
    let changes: Record<string, { oldValue: any; newValue: any }> = {};
    changes.age = { oldValue: gameOld.age, newValue: age };

    addBoardgameHistory(Number(boardgameID), {
        action: "update",
        updated_by: userID,
        changes
    });

    // 3. Cập nhật age trong MySQL
    await updateAgeModel(Number(age), boardgameID);

    // 4. Cập nhật lại Redis với dữ liệu mới
    gameOld.age = age;
    await redisClient.set(`boardgame_${boardgameID}`, JSON.stringify(gameOld), { EX: 3600 * 24 });
}

export async function boardgameUpdateWeight(boardgameID: number, weight: number, userID: number): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    // 1. Lấy thông tin cũ từ MySQL
    const gameOld = await getBoardgameDetailByID(Number(boardgameID));

    if (!gameOld) {
        console.log("Boardgame not found in MySQL");
        return;
    }

    // 2. Ghi lại lịch sử cập nhật
    let changes: Record<string, { oldValue: any; newValue: any }> = {};
    changes.weight = { oldValue: gameOld.weight, newValue: weight };

    addBoardgameHistory(Number(boardgameID), {
        action: "update",
        updated_by: userID,
        changes
    });

    // 3. Cập nhật weight trong MySQL
    await UpdateWeightModel(Number(weight), boardgameID);

    // 4. Cập nhật lại Redis với dữ liệu mới
    gameOld.weight = weight;
    await redisClient.set(`boardgame_${boardgameID}`, JSON.stringify(gameOld), { EX: 3600 * 24 });
}

export async function boardgameUpdateNumberPlayers(
    boardgameID: number,
    minPlayers: number,
    maxPlayers: number,
    userID: number
): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    // 1. Lấy thông tin cũ từ MySQL
    const gameOld = await getBoardgameDetailByID(Number(boardgameID));

    if (!gameOld) {
        console.log("Boardgame not found in MySQL");
        return;
    }

    // 2. Ghi lại lịch sử cập nhật
    let changes: Record<string, { oldValue: any; newValue: any }> = {};
    changes.numberPlayer = {
        oldValue: {
            min_players: gameOld.min_players,
            max_players: gameOld.max_players
        },
        newValue: {
            min_players: minPlayers,
            max_players: maxPlayers
        }
    };

    addBoardgameHistory(Number(boardgameID), {
        action: "update",
        updated_by: userID,
        changes
    });

    // 3. Cập nhật số lượng người chơi trong MySQL
    await UpdateNumeberPlayers(minPlayers, maxPlayers, boardgameID);

    // 4. Cập nhật lại Redis với dữ liệu mới
    gameOld.min_players = minPlayers;
    gameOld.max_players = maxPlayers;
    await redisClient.set(`boardgame_${boardgameID}`, JSON.stringify(gameOld), { EX: 3600 * 24 });
}

export async function boardgameUpdateDuration(
    boardgameID: number,
    min: number,
    max: number,
    userID: number
): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    // 1. Lấy thông tin cũ từ MySQL
    const gameOld = await getBoardgameDetailByID(Number(boardgameID));

    if (!gameOld) {
        console.log("Boardgame not found in MySQL");
        return;
    }

    // 2. Ghi lại lịch sử cập nhật
    let changes: Record<string, { oldValue: any; newValue: any }> = {};
    changes.duration = {
        oldValue: {
            min_play_time: gameOld.min_play_time,
            max_play_time: gameOld.max_play_time,
        },
        newValue: {
            min_play_time: min,
            max_play_time: max,
        },
    };

    addBoardgameHistory(Number(boardgameID), {
        action: "update",
        updated_by: userID,
        changes,
    });

    // 3. Cập nhật duration trong MySQL
    await UpdateDuration(min, max, boardgameID);

    // 4. Cập nhật lại Redis với dữ liệu mới
    gameOld.min_play_time = min;
    gameOld.max_play_time = max;
    await redisClient.set(`boardgame_${boardgameID}`, JSON.stringify(gameOld), { EX: 3600 * 24 });
}

export async function boardgameUpdateAvatar(boardgameID: number, avatar_url: string, userID: number): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    // 1. Lấy thông tin cũ từ MySQL
    const gameOld = await getBoardgameDetailByID(Number(boardgameID));

    if (!gameOld) {
        console.log("Boardgame not found in MySQL");
        return;
    }

    // 2. Ghi lại lịch sử cập nhật
    let changes: Record<string, { oldValue: any; newValue: any }> = {};
    changes.avatar_url = { oldValue: gameOld.avatar_url, newValue: avatar_url };

    addBoardgameHistory(Number(boardgameID), {
        action: "update",
        updated_by: userID,
        changes
    });

    // 3. Cập nhật avatar trong MySQL
    await UpdateAvatar(avatar_url, boardgameID);

    // 4. Cập nhật lại Redis với dữ liệu mới
    gameOld.avatar_url = avatar_url;
    await redisClient.set(`boardgame_${boardgameID}`, JSON.stringify(gameOld), { EX: 3600 * 24 });
}

export async function boardgameUpdateBackground(
    boardgameID: number,
    background_image_url: string,
    userID: number
  ): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) {
      throw new Error("Redis client is not initialized");
    }
  
    // 1. Lấy thông tin cũ từ MySQL
    const gameOld = await getBoardgameDetailByID(Number(boardgameID));
  
    if (!gameOld) {
      console.log("Boardgame not found in MySQL");
      return;
    }
  
    // 2. Ghi lại lịch sử cập nhật
    let changes: Record<string, { oldValue: any; newValue: any }> = {};
    changes.background_image_url = { oldValue: gameOld.background_image_url, newValue: background_image_url };
  
    addBoardgameHistory(Number(boardgameID), {
      action: "update",
      updated_by: userID,
      changes,
    });
  
    // 3. Cập nhật background_image_url trong MySQL
    await UpdateBackground(background_image_url, boardgameID);
  
    // 4. Cập nhật lại Redis với dữ liệu mới
    gameOld.background_image_url = background_image_url;
    await redisClient.set(`boardgame_${boardgameID}`, JSON.stringify(gameOld), { EX: 3600 * 24 });
  }
  
export async function deleteBoardgameDetailFromRedis(boardgameID: number): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    // 1. Tạo cache key
    const cacheKey = `boardgame_${boardgameID}`;

    // 2. Xóa boardgame khỏi Redis
    await redisClient.del(cacheKey);
}

