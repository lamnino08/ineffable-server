import { Request, Response } from "express";
import {
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoriesByBoardgame,
  removeCategoryFromBoardgame,
  getBoardgamesByCategory,
  checkIfUserLikedCategoryModel,
} from "@/models/boardgame/boardgameCategoryModel";

import {
  addCategoryRedis,
  addCategoryToGame,
  getBoardgameCategories,
  getBoardgameCountByCategoryRedis,
  getCategoryByIdRedis,
  likeCategoryRedis,
  removeCategoryFromGame,
  toggleStatusRedis,
  updateCategoryRedis,
  getCategoryLikeCountRedis,
  unlikeCategoryRedis,
  getListCategoryRedis,
  getMultipleCategoryLikeCounts,
  getBoardgameCountByCategoriesRedis
} from "@/services/redis/boardgameCategory"
import { Role } from "@/types/Enum/Role";
import { Status } from "@/types/Enum/Status";
import { getCategoryHistories } from "@/services/mongodb/history/CategoryHistoryService";
import { getUserNameById } from "@/models/userModel";
import { BoardgameHistory } from "@/models/history/BoargameHistoryModel";
import { addBoardgameHistory } from "@/services/mongodb/history/BoardgameHistoryService";
import { console } from "inspector";

// Create a new category
export const createNewCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, description, img_url } = req.body;

  // Step 1: Authentication check
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Step 2: Set category status based on role
    let status = Status.PENDING;
    if (req.user?.role == Role.ADMIN) {
      status = Status.PUBLIC;
    }

    // Step 3: Create category and log history
    const categoryId = await addCategoryRedis(req.user.id, name, description, img_url, status);

    // Step 4: Send response back to client
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: categoryId,
    });
  } catch (err) {
    // Step 5: Error handling
    console.error(err);
    res.status(500).json({ error: "Failed to create category" });
  }
};

// Get a category by ID
export const getCategory = async (req: Request, res: Response): Promise<void> => {
  // 1. get category id
  const { categoryId } = req.params;

  try {
    // 2. get category from redis
    const category = await getCategoryByIdRedis(Number(categoryId));
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    //  3. get game count
    const gameCount = await getBoardgameCountByCategoryRedis(Number(categoryId));

    // 4. get like count
    const likeCount = await getCategoryLikeCountRedis(Number(categoryId));

    // 5. return category with game count and like count
    res.status(200).json({
      success: true,
      data: {
        ...category,
        game_count: gameCount,
        like_count: likeCount,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch category" });
  }
};

// Update a category
export const updateCategoryDetails = async (req: Request, res: Response) => {
  // 1. get user id
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { categoryId } = req.params;
  const { name, description, img_url } = req.body;

  try {
    // 2. detect changes
    await updateCategoryRedis(Number(categoryId), req.user.id, name, description, img_url);
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update category" });
  }
};

// Update
export const toggleStatus = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { categoryId } = req.params;

  try {
    // 1. get old version of category
    await toggleStatusRedis(Number(categoryId), req.user.id);

    // 4. response
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update category" });
  }
};

// Delete a category
export const deleteCategoryById = async (req: Request, res: Response) => {
  const { categoryId } = req.params;

  try {
    await deleteCategory(Number(categoryId));
    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete category" });
  }
};

export const getCategoryList = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Nhận params từ request
    const user_id = Number(req.query.user_id) || null;
    const search = req.query.search ? String(req.query.search) : null;
    const status = req.query.status ? String(req.query.status) : null;
    const filterUserId = req.query.filterUserId ? Number(req.query.filterUserId) : null;
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;

    // 2️⃣ Gọi service để lấy dữ liệu category
    const categories = await getListCategoryRedis(user_id, search, status, filterUserId, page, pageSize);
    const categoryIds = categories.map(category => category.category_id);
    const likeCount = await getMultipleCategoryLikeCounts(categoryIds);
    const gameCount = await getBoardgameCountByCategoriesRedis(categoryIds)

    const result = categories.map(category => ({
      ...category,
      like_count: likeCount[category.category_id] | 0,
      game_count: gameCount[category.category_id] | 0,
    }));

    // 3️⃣ Trả về JSON response
    res.status(200).json({
      success: true,
      message: "Lấy danh sách category thành công",
      data: result
    });
  } catch (error) {
    console.error("🔥 Lỗi khi lấy danh sách category:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách category",
    });
  }
};

/**
 * Like category
 */
export const likeCategoryController = async (req: Request, res: Response) => {
  try {
    // 1. get category id
    const { categoryId } = req.params;

    if (req.user) {
      // 2. call redis service
      await likeCategoryRedis(req.user.id, Number(categoryId));
    }

    res.status(200).json({ success: true, message: "Category liked successfully" });
  } catch (error) {
    console.error("Error liking category:", error);
    res.status(500).json({ error: "Failed to like category" });
  }
}

/**
 * 🚀 Unlike category
 */
export const unlikeCategoryController = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Lấy categoryId từ request params
    const { categoryId } = req.params;

    if (req.user) {
      // 2️⃣ Gọi service để xử lý unlike category
      await unlikeCategoryRedis(req.user.id, Number(categoryId));
    }

    // 3️⃣ Trả về phản hồi thành công
    res.status(200).json({ success: true, message: "Category unliked successfully" });
  } catch (error) {
    console.error("Error unliking category:", error);
    res.status(500).json({ error: "Failed to unlike category" });
  }
};

/**
 * 🚀 API: Check if user liked a category
 */
export const checkIfUserLikedCategoryController = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Lấy categoryId từ request params
    const { categoryId } = req.params;

    if (!req.user) {
    res.status(200).json({ success: true, data: false });
      return;
    }

    // 2️⃣ Kiểm tra trong Redis trước
    const isLiked = await checkIfUserLikedCategoryModel(req.user.id, Number(categoryId));

    // 3️⃣ Trả về kết quả
    res.status(200).json({ success: true, data: isLiked });
  } catch (error) {
    console.error("Error checking if user liked category:", error);
    res.status(500).json({ error: "Failed to check like status" });
  }
};



export const getCategoryHistory = async (req: Request, res: Response) => {
  try {
    const categoryId = parseInt(req.params.categoryId, 10);
    const userId = req.params.userId ? parseInt(req.params.userId, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    const action = req.query.action ? (req.query.action as string).toLowerCase() : undefined;

    // ✅ Allowed action types
    const allowedActions = ["create", "update", "delete"];
    if (action && !allowedActions.includes(action)) {
      res.status(400).json({
        success: false,
        error: "Invalid action type. Allowed values: CREATE, UPDATE, DELETE",
      });
      return;
    }

    // ✅ Fetch history with optional filters
    const histories = await getCategoryHistories({
      categoryId,
      userId,
      limit,
      offset,
      action,
    });

    const historiesWithUser = await Promise.all(
      histories.map(async (history) => {
        const user = await getUserNameById(history.updated_by);
        return {
          action: history.action,
          changes: history.changes,
          timestamp: history.timestamp,
          updated_by: user
            ? {
              id: history.updated_by,
              username: user.username,
            }
            : null,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Category history retrieved successfully",
      data: historiesWithUser,
    });
  } catch (err) {
    console.error("Error fetching category history:", err);
    res.status(500).json({ success: false, error: "Failed to retrieve history" });
  }
};


// Add a category to a boardgame
export const addCategoryToBoardgameController = async (req: Request, res: Response): Promise<void> => {
  const { gameId, categoryId } = req.params;

  try {
    await addCategoryToGame(Number(gameId), Number(categoryId));
    res.status(201).json({
      success: true,
      message: "Categories added to boardgame successfully",
    });
    if (req.user) {
      const history: BoardgameHistory = {
        action: "mapping",
        updated_by: req.user.id,
        mapping_details: {
          type: "category",
          item_id: Number(categoryId),
          action: "add",
        }
      }
      await addBoardgameHistory(Number(gameId), history);
    }
  } catch (err) {
    console.error("Error adding categories to boardgame:", err);
    res.status(500).json({ error: "Failed to add categories to boardgame" });
  }
};

// Get all categories for a boardgame
export const getCategoriesForBoardgame = async (req: Request, res: Response) => {
  const { boardgameId } = req.params;
  console.log(boardgameId);

  try {
    const categories = await getBoardgameCategories(Number(boardgameId));
    console.log(categories);
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch categories for boardgame" });
  }
};

// Remove a category from a boardgame
export const removeCategoryFromBoardgameController = async (req: Request, res: Response) => {
  const { gameId, categoryId } = req.params;

  try {
    await removeCategoryFromGame(Number(gameId), Number(categoryId));
    if (req.user) {
      const history: BoardgameHistory = {
        action: "mapping",
        updated_by: req.user.id,
        mapping_details: {
          type: "category",
          item_id: Number(categoryId),
          action: "remove",
        }
      }
      await addBoardgameHistory(Number(gameId), history);
    }
    res.status(200).json({
      success: true,
      message: "Category removed from boardgame successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove category from boardgame" });
  }
};

// Get all boardgames associated with a category
export const getBoardgamesForCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;

  try {
    const boardgames = await getBoardgamesByCategory(Number(categoryId));
    res.status(200).json({
      success: true,
      data: boardgames,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch boardgames for category" });
  }
};
