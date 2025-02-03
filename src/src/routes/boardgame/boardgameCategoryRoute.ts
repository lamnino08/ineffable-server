import { Router } from "express";
import { verifyToken, AdminCheck, optionalToken } from "@/middleware/auth";
import {
  createNewCategory,
  getCategory,
  updateCategoryDetails,
  deleteCategoryById,
  getAllCategoryList,
  addCategoryToBoardgameController,
  getCategoriesForBoardgame,
  removeCategoryFromBoardgameController,
  getBoardgamesForCategory,
  likeCategory,
  unlikeCategory,
  getCategoryLikeCount,
  getUserLikedCategoriesController,
  getCategoryHistory,
} from "@/controllers/boardgame/boardgameCategoryController";
import { validate, boardgameCategorySchema } from "@/validation/boardgameValidation";
import { checkBoardgameOwner } from "@/middleware/boardgameMiddleware";

const router = Router();

// Create a new category
router.post("/add", AdminCheck, validate(boardgameCategorySchema), createNewCategory);

// Get a category by ID
router.get("/:categoryId", getCategory);

// Update a category
router.put("/:categoryId", AdminCheck, validate(boardgameCategorySchema), updateCategoryDetails);

// Delete a category
router.delete("/:categoryId", AdminCheck, deleteCategoryById);



router.post("/:categoryId/like", verifyToken, likeCategory);

// ✅ Unlike category
router.delete("/:categoryId/unlike", verifyToken, unlikeCategory);

// ✅ Lấy số lượng like của category
router.get("/:categoryId/likes", optionalToken ,getCategoryLikeCount);

// ✅ Lấy danh sách category mà user đã like
router.get("/liked-categories/:userId", getUserLikedCategoriesController);


router.get("/:categoryId/history", AdminCheck, getCategoryHistory);



// Get all categories (optional: filter by user)
router.get("/", getAllCategoryList);

// Add a category to a boardgame
router.post("/boardgame/:gameId/add", checkBoardgameOwner, validate(boardgameCategorySchema) , addCategoryToBoardgameController);

// Get all categories for a specific boardgame
router.get("/boardgame/:boardgameId", verifyToken, getCategoriesForBoardgame);

// Remove a category from a boardgame
router.delete("/remove-from-boardgame", verifyToken, removeCategoryFromBoardgameController);

// Get all boardgames associated with a specific category
router.get("/boardgames/:categoryId", verifyToken, getBoardgamesForCategory);

export default router;
