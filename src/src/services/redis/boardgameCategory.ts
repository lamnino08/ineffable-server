import { getRedis } from "@/config/database/redis";
import {
    addCategoryToBoardgame,
    checkIfUserLikedCategoryModel,
    createCategory,
    deleteCategory,
    getUserLikedCategoryIds,
    getBoardgameCountByCategory,
    getCategoriesByBoardgame,
    getCategoryById,
    likeCategoryModel,
    removeCategoryFromBoardgame,
    unlikeCategory,
    updateCategory,
    updateStatus,
    getCategorylikesCountModel,
    getCategoryLikesCountsModel,
    getBoardgameCountByCategoriesModel
} from "@/models/boardgame/boardgameCategoryModel";
import { CategoryHistory } from "@/models/history/CategoryHistoryModel";
import { Status } from "@/types/Enum/Status";
import { BoardgameCategory } from "@/types/models/Boardgame";
import { addCategoryHistory } from "../mongodb/history/CategoryHistoryService";
import { esClient } from "@/config/database/elasticsearch";

const CACHE_TTL = 3600 * 24;
// Helper function to create category and log history
export async function addCategoryRedis(
    user_id: number,
    name: string,
    description: string,
    img_url: string,
    status: Status
): Promise<number> {
    // Step 1: Create category in database
    const categoryId = await createCategory(user_id, name, description, img_url, status);

    // Step 2: Create category history
    const history: CategoryHistory = {
        action: "create",
        updated_by: user_id,
        changes: {
            name: { oldValue: null, newValue: name },
            description: { oldValue: null, newValue: description },
            img_url: { oldValue: null, newValue: img_url },
            status: { oldValue: null, newValue: status },
        },
    };

    // Step 3: Log category history
    await addCategoryHistory(categoryId, history);

    // Step 4: Index vào Elasticsearch
    await esClient.index({
        index: "boardgame_category",
        id: categoryId.toString(),
        body: {
            category_id: categoryId,
            name: name,
            description: description,
            img_url: img_url,
            status: status,
            user_id: user_id,
            created_at: new Date().toISOString(),
        },
    });

    // 5. Cập nhật Elasticsearch
    await esClient.update({
        index: "boardgame_category",
        id: categoryId.toString(),
        body: {
            doc: {
                name: name,
                description: description,
                img_url: img_url,
                updated_at: new Date().toISOString(),
            },
        },
    });

    // Step 6: Return category ID
    return categoryId;
}

export async function getCategoryByIdRedis(
    boardgameCategoryId: number,
): Promise<BoardgameCategory | null> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const cacheKey = `boardgameCategory_${boardgameCategoryId}`;

    // 1. get category from redis
    const categoryJson = await redisClient.get(cacheKey);

    if (categoryJson) {
        return JSON.parse(categoryJson);
    }

    // 2. get category from mysql
    const category = await getCategoryById(Number(boardgameCategoryId));

    if (category) {
        // 3. save category to redis
        await redisClient.set(cacheKey, JSON.stringify(category), { EX: CACHE_TTL });
    }

    return category;
}

export async function updateCategoryRedis(
    categoryId: number,
    user_id: number,
    name: string,
    description: string,
    img_url: string
) {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const cacheKey = `boardgameCategory_${categoryId}`;

    // 1. get category from redis
    const category = await getCategoryByIdRedis(Number(categoryId));

    if (category == null) {
        throw Error("Category is not exist");
    }

    // 2. detect changes
    const changes: Record<string, { oldValue: any; newValue: any }> = {};

    if (name && name !== category.name) {
        changes["name"] = { oldValue: category.name, newValue: name };
    }
    if (description && description !== category.description) {
        changes["description"] = { oldValue: category.description, newValue: description };
    }
    if (img_url && img_url !== category.img_url) {
        changes["img_url"] = { oldValue: category.img_url, newValue: img_url };
    }

    // 3. update category
    await updateCategory(categoryId, name, description, img_url);

    // 4. add history
    const history: CategoryHistory = {
        action: "update",
        updated_by: user_id,
        changes: changes,
    };
    await addCategoryHistory(categoryId, history);

    // 5. update cache
    await redisClient.set(cacheKey, JSON.stringify(category), { EX: CACHE_TTL });
}

export async function toggleStatusRedis(categoryId: number, user_id: number) {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const cacheKey = `boardgameCategory_${categoryId}`;

    // 1. get category from redis
    var category = await getCategoryByIdRedis(Number(categoryId));

    if (category == null) {
        throw Error("Category is not exist");
    }

    // 2. toggle status
    const newStatus = category.status === Status.PUBLIC ? Status.HIDE : Status.PUBLIC;

    // 3. update category
    await updateStatus(categoryId, newStatus);

    // 4. detect changes
    const oldStatus = category.status;

    const changes: Record<string, { oldValue: any; newValue: any }> = {};
    changes["status"] = { oldValue: oldStatus, newValue: newStatus };

    // 5. add history
    const history: CategoryHistory = {
        action: "update",
        updated_by: user_id,
        changes: changes,
    };
    await addCategoryHistory(categoryId, history);

    await esClient.update({
        index: "boardgame_category",
        id: categoryId.toString(),
        body: {
            doc: {
                status: newStatus,
            }
        }
    })

    category.status = newStatus;
    // 6. update cache
    await redisClient.set(cacheKey, JSON.stringify(category), { EX: CACHE_TTL });
}

export async function deleteCategoryRedis(categoryId: number, user_id: number) {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const cacheKey = `boardgameCategory_${categoryId}`;

    // 1. get category from redis
    const category = await getCategoryByIdRedis(Number(categoryId));

    if (category == null) {
        return;
    }

    // 2. delete category
    await deleteCategory(categoryId);

    // 3. add history
    const history: CategoryHistory = {
        action: "delete",
        updated_by: user_id,
    };
    await addCategoryHistory(categoryId, history);

    // 4. delete cache
    await redisClient.del(cacheKey);
}

export async function getListCategoryRedis(
    user_id: number | null, 
    search: string | null,
    status: string | null,
    filterUserId: number | null,
    page: number = 1,
    pageSize: number = 20
): Promise<BoardgameCategory[]> {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    // 🔹 Xây dựng query Elasticsearch
    const esQuery: any = {
        index: "boardgame_category",
        body: {
            query: {
                bool: {
                    must: [],
                },
            },
            size: pageSize,
            from: (page - 1) * pageSize,
            sort: [{ created_at: { order: "desc" } }],
        },
    };

    // 🔹 Lọc theo tên (search)
    if (search) {
        esQuery.body.query.bool.must.push({
            match: { name: search },
        });
    }

    // 🔹 Lọc theo status
    if (status) {
        esQuery.body.query.bool.must.push({
            term: { status: status },
        });
    }

    // 🔹 Lọc theo user_id (người sở hữu category)
    if (filterUserId) {
        esQuery.body.query.bool.must.push({
            term: { user_id: filterUserId },
        });
    }

    // 🔹 Thực hiện tìm kiếm Elasticsearch
    const { hits } = await esClient.search(esQuery);
    let categories = hits.hits.map((hit: any) => ({
        category_id: hit._id,
        ...hit._source,
    }));

    // 🔹 Nếu có `user_id`, chỉ lấy category mà user đã like
    if (user_id) {
        const likedCategoryIds = await getUserLikedCategoryIds(user_id);
        categories = categories.filter(category => likedCategoryIds.includes(category.category_id));
    }

    return categories;
}

const BOARDGAME_CATEGORY_GAME_COUNT_KEY = "boardgame_category_count_game";
/**
 * Thêm category vào boardgame (ưu tiên lưu MySQL trước, sau đó cập nhật cache Redis)
 */
export async function addCategoryToGame(gameId: number, categoryId: number) {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const cacheKey = `boardgame:${gameId}:categories`;

    // 1️⃣ Lưu vào MySQL trước
    await addCategoryToBoardgame(gameId, categoryId);

    // 2️⃣ Cập nhật cache số lượng boardgames trong category
    await redisClient.hIncrBy(BOARDGAME_CATEGORY_GAME_COUNT_KEY, categoryId.toString(), 1);

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
export const getBoardgameCategories = async (boardgameId: number): Promise<BoardgameCategory[]> => {
    const redisClient = getRedis();

    // 1. Kiểm tra Redis client
    if (!redisClient) {
        // 2. Nếu Redis không khả dụng, lấy từ MySQL
        return await getCategoriesByBoardgame(boardgameId);
    }

    // 3. Kiểm tra dữ liệu trong Redis
    const cacheKey = `boardgame:${boardgameId}:categories`;
    const cachedData = await redisClient.get(cacheKey);

    // 4. Nếu có dữ liệu trong Redis, trả về luôn
    if (cachedData) {
        return JSON.parse(cachedData);
    }

    // 5. Nếu không có, lấy từ MySQL
    const categories = await getCategoriesByBoardgame(boardgameId);

    // 6. Lưu dữ liệu vào Redis (TTL 1 ngày)
    await redisClient.set(cacheKey, JSON.stringify(categories), { EX: 3600 * 24 });

    return categories;
};

/**
 * Lấy số lượng boardgame thuộc một category (ưu tiên Redis)
 */
export async function getBoardgameCountByCategoryRedis(categoryId: number): Promise<number> {
    const redisClient = getRedis();
    if (!redisClient) throw new Error("Redis client is not initialized");
    // 1. get count from redis
    const countKey = "boardgame_category_count_game";

    const count = await redisClient.hGet(countKey, categoryId.toString());
    if (count) return parseInt(count); // if count is not null, return count

    // 2. get count from mysql
    const totalCount = await getBoardgameCountByCategory(categoryId);

    // 3. save count to redis
    await redisClient.hSet(countKey, categoryId.toString(), totalCount);

    return totalCount;
}

export async function getBoardgameCountByCategoriesRedis(categoryIds: number[]): Promise<Record<number, number>> {
    const redisClient = getRedis();
    if (!redisClient) throw new Error("Redis client is not initialized");
  
  
    // 1. Kiểm tra dữ liệu có trong Redis không
    const gameCounts: Record<number, number> = {};
    const missingCategoryIds: number[] = [];
  
    for (const categoryId of categoryIds) {
      const cachedCount = await redisClient.hGet(BOARDGAME_CATEGORY_GAME_COUNT_KEY, categoryId.toString());
      if (cachedCount != null) {
        gameCounts[categoryId] = parseInt(cachedCount);
      } else {
        missingCategoryIds.push(categoryId); 
      }
    }
  
    // 2. Nếu có category thiếu cache, lấy từ MySQL
    if (missingCategoryIds.length > 0) {
      const dbCounts = await getBoardgameCountByCategoriesModel(missingCategoryIds);
  
      // Lưu vào Redis để cache lần sau
      for (const categoryId of missingCategoryIds) {
        await redisClient.hSet(BOARDGAME_CATEGORY_GAME_COUNT_KEY, categoryId.toString(), dbCounts[categoryId]);
        gameCounts[categoryId] = dbCounts[categoryId]; 
      }
    }
  
    return gameCounts;
  }




const BOARDGAME_CATEGORY_LIKE_COUNT_KEY = "boardgame_category_like_count";
/**
 * Like a category (prioritize saving to MySQL first, then update Redis cache)
 */
export async function likeCategoryRedis(userId: number, categoryId: number) {
    const redisClient = getRedis();
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    // 1. save to mysql
    await likeCategoryModel(userId, categoryId);

    // 2. increase in redis
    await redisClient.hIncrBy(BOARDGAME_CATEGORY_LIKE_COUNT_KEY, categoryId.toString(), 1);
}

/**
 * 📌 Unlike a category (prioritize removing from MySQL first, then update Redis cache)
 */
export async function unlikeCategoryRedis(userId: number, categoryId: number) {
    const redisClient = getRedis();

    // 1️⃣ Kiểm tra xem Redis client đã được khởi tạo chưa
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    // 2️⃣ Xóa dữ liệu like trong MySQL trước
    await unlikeCategory(userId, categoryId);

    // 3️⃣ Lấy số lượt like hiện tại từ Redis
    const currentCount = await redisClient.hGet(BOARDGAME_CATEGORY_LIKE_COUNT_KEY, categoryId.toString());

    // 4️⃣ Nếu số like > 0, giảm đi 1
    if (currentCount && parseInt(currentCount) > 0) {
        await redisClient.hIncrBy(BOARDGAME_CATEGORY_LIKE_COUNT_KEY, categoryId.toString(), -1);
    }
}

/**
 * Lấy số lượng user đã like category
 */
export async function getCategoryLikeCountRedis(categoryId: number): Promise<number> {
    const redisClient = getRedis();
    if (!redisClient) throw new Error("Redis client is not initialized");

    // 1. get like count from redis
    const likeCount = await redisClient.hGet(BOARDGAME_CATEGORY_LIKE_COUNT_KEY, categoryId.toString());

    if (likeCount) {
        return parseInt(likeCount);
    }

    // 2. get like count from mysql
    const totalLikeCount = await getCategorylikesCountModel(categoryId);

    // 3. save like count to redis
    await redisClient.hSet(BOARDGAME_CATEGORY_LIKE_COUNT_KEY, categoryId.toString(), totalLikeCount);
    return totalLikeCount;
}

/**
 * Lấy số lượng user đã like nhiều category
 */
export async function getMultipleCategoryLikeCounts(categoryIds: number[]): Promise<Record<number, number>> {
    const redisClient = getRedis();
    if (!redisClient) throw new Error("Redis client is not initialized");

    // 1. Lấy like count từ Redis cho tất cả categoryIds
    const redisLikes = await redisClient.hmGet(BOARDGAME_CATEGORY_LIKE_COUNT_KEY, categoryIds.map(id => id.toString()));

    const likeCounts: Record<number, number> = {};
    const missingIds: number[] = [];

    categoryIds.forEach((id, index) => {
        const likeCount = redisLikes[index];
        if (likeCount !== null) {
            likeCounts[id] = parseInt(likeCount);
        } else {
            missingIds.push(id);
        }
    });

    // 2. Nếu có category chưa có trong Redis, lấy từ MySQL
    if (missingIds.length > 0) {
        const dbLikeCounts = await getCategoryLikesCountsModel(missingIds);

        // 3. Lưu lại vào Redis và cập nhật vào kết quả
        const redisUpdates: Record<string, number> = {};
        missingIds.forEach(id => {
            const count = dbLikeCounts[id] || 0;
            likeCounts[id] = count;
            redisUpdates[id.toString()] = count;
        });

        if (Object.keys(redisUpdates).length > 0) {
            await redisClient.hSet(BOARDGAME_CATEGORY_LIKE_COUNT_KEY, redisUpdates);
        }
    }

    return likeCounts;
}

