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
  updateStatus,
  likeCategory,
  unlikeCategory,
} from "@/models/boardgame/boardgameCategoryModel";

import {
  addCategoryToGame,
  getAllCategoryLikeCounts,
  getBoardgameCategories,
  likeCategoryAction,
  removeCategoryFromGame,
  unlikeCategoryAction
} from "@/services/redis/boardgameCategory"
import { Role } from "@/types/Enum/Role";
import { Status } from "@/types/Enum/Status";
import { getAllBoardgameCounts, getBoardgameCount } from "@/services/redis/boardgameCategory";
import { getUserLikedCategories } from "@/services/mongodb/like/categoryLike";
import { addLikeToCategory, getLikeCount, getListLikeCount, hasUserLikedCategory, removeLikeFromCategory } from "@/services/redis/categoryLiked";
import { CategoryHistory } from "@/models/history/CategoryHistoryModel";
import { addCategoryHistory, getCategoryHistories } from "@/services/mongodb/history/CategoryHistoryService";
import { getUserNameById } from "@/models/userModel";
import { BoardgameCategory } from "@/types/models/Boardgame";
import { BoardgameHistory } from "@/models/history/BoargameHistoryModel";
import { addBoardgameHistory } from "@/services/mongodb/history/BoardgameHistoryService";
import { console } from "inspector";
// Create a new category
export const createNewCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, description, img_url } = req.body;

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    let status = Status.PENDING;
    if (req.user?.role == Role.ADMIN) {
      status = Status.PUBLIC;
    }

    const categoryId = await createCategory(req.user.id, name, description, img_url, status);

    const history: CategoryHistory = {
      action: "create",
      updated_by: req.user.id,
      changes: {
        name: { oldValue: null, newValue: name },
        description: { oldValue: null, newValue: description },
        img_url: { oldValue: null, newValue: img_url },
        status: { oldValue: null, newValue: status },
      },
    };

    await addCategoryHistory(categoryId, history);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: categoryId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create category" });
  }
};

// Get a category by ID
export const getCategory = async (req: Request, res: Response): Promise<void> => {
  const { categoryId } = req.params;

  try {
    const category = await getCategoryById(Number(categoryId));
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    const gameCount = await getBoardgameCount(Number(categoryId));
    const likeCount = await getLikeCount(Number(categoryId));


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
  const { categoryId } = req.params;
  const { name, description, img_url } = req.body;

  try {
    //1. get old version of category
    const category = await getCategoryById(Number(categoryId));
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
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
    await updateCategory(Number(categoryId), name, description, img_url);
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
    });

    // 4. add history
    if (req.user) {
      if (Object.keys(changes).length > 0) {
        const history: CategoryHistory = {
          action: "update",
          updated_by: req.user.id,
          changes,
        };
        await addCategoryHistory(Number(categoryId), history);
      }
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update category" });
  }
};

// Update a category
export const toggleStatus = async (req: Request, res: Response) => {
  const { categoryId } = req.params;

  try {
    // 1. get old version of category
    const category = await getCategoryById(Number(categoryId));
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    // 2. store change
    const oldStatus = category.status;
    const newStatus = oldStatus === Status.PUBLIC ? Status.HIDE : Status.PUBLIC;

    const changes: Record<string, { oldValue: any; newValue: any }> = {};
    changes["status"] = { oldValue: oldStatus, newValue: newStatus };

    // 3. update category
    await updateStatus(Number(categoryId), newStatus);

    // 4. response
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
    });

    // 5. add history
    if (req.user) {
      if (Object.keys(changes).length > 0) {
        const history: CategoryHistory = {
          action: "update",
          updated_by: req.user.id,
          changes,
        };
        await addCategoryHistory(Number(categoryId), history);
      }
    }

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

// Get all categories (optional: filter by user_id)
export const getAllCategoryList = async (req: Request, res: Response) => {
  const filters = {
    status: req.query.status as string,
    search: req.query.search as string,
  };

  try {
    console.log("HEre");
    const categories = await getAllCategories(filters);

    const gameCounts = await getAllBoardgameCounts();

    const likeCounts = await getAllCategoryLikeCounts();
    const categoriesWithGameCount = categories.map(category => ({
      ...category,
      game_count: gameCounts[category.category_id] || 0,
      like_count: likeCounts[category.category_id] || 0,
    }));

    res.status(200).json({
      success: true,
      message: "Get all categories successfully",
      data: categoriesWithGameCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};


/**
 * ✅ Like category
 * @route POST /api/category/like
 */
export const likeCategoryController = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;

    if (req.user) {
      await likeCategoryAction(req.user.id, Number(categoryId));
    }

    res.status(200).json({ success: true, message: "Category liked successfully" });
  } catch (error) {
    console.error("Error liking category:", error);
    res.status(500).json({ error: "Failed to like category" });
  }
}

/**
* ✅ Unlike category
* @route DELETE /api/category/unlike
*/
export const unlikeCategoryController = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;

    if (req.user) {
      await unlikeCategoryAction(req.user.id, Number(categoryId));
    }

    res.status(200).json({ success: true, message: "Category unliked successfully" });
  } catch (error) {
    console.error("Error unliking category:", error);
    res.status(500).json({ error: "Failed to unlike category" });
  }
}

/**
* ✅ Lấy số lượng user đã like category
* @route GET /api/category/likes/:categoryId
*/
export const getCategoryLikeCount = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId) {
      res.status(400).json({ error: "Missing categoryId" });
      return
    }

    const likeCount = await getLikeCount(Number(categoryId));
    const liked = req.user ? await hasUserLikedCategory(Number(categoryId), req.user.id) : false;

    res.status(200).json({
      success: true,
      message: "",
      data: {
        categoryId,
        likeCount,
        liked
      }
    });
  } catch (error) {
    console.error("Error fetching category like count:", error);
    res.status(500).json({ error: "Failed to fetch like count" });
  }
}

/**
* ✅ Lấy danh sách category mà user đã like
* @route GET /api/category/liked-categories/:userId
*/
export const getUserLikedCategoriesController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ error: "Missing userId" });
      return
    }

    const likedCategories = await getUserLikedCategories(Number(userId));
    res.status(200).json({ userId, likedCategories });
  } catch (error) {
    console.error("Error fetching user liked categories:", error);
    res.status(500).json({ error: "Failed to fetch user liked categories" });
  }
}

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
