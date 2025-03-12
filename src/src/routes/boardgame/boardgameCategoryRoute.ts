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
  likeCategoryController,
  getCategoryLikeCount,
  getUserLikedCategoriesController,
  getCategoryHistory,
  toggleStatus,
  unlikeCategoryController,
} from "@/controllers/boardgame/boardgameCategoryController";
import { validate, boardgameCategorySchema } from "@/validation/boardgameValidation";
import { checkBoardgameOwner } from "@/middleware/boardgameMiddleware";

const router = Router();

// Create a new category
router.post("/add", AdminCheck, validate(boardgameCategorySchema), createNewCategory);

// Get a category by ID
router.get("/:categoryId", optionalToken, getCategory);

// Update a category
router.put("/:categoryId", AdminCheck, validate(boardgameCategorySchema), updateCategoryDetails);

// Delete a category
router.delete("/:categoryId", AdminCheck, deleteCategoryById);

// Get all categories (optional: filter by user)
router.get("/", optionalToken, getAllCategoryList);




router.post("/:categoryId/like", verifyToken, likeCategoryController);

// ✅ Unlike category
router.delete("/:categoryId/unlike", verifyToken, unlikeCategoryController);

// ✅ Lấy số lượng like của category
router.get("/:categoryId/likes", optionalToken ,getCategoryLikeCount);




// ✅ Lấy danh sách category mà user đã like
router.get("/liked-categories/:userId", getUserLikedCategoriesController);

router.patch("/:categoryId/toggle-status", AdminCheck, toggleStatus);

router.get("/:categoryId/history", AdminCheck, getCategoryHistory);


// Add a category to a boardgame
router.post("/boardgame/:gameId/add/:categoryId", checkBoardgameOwner, addCategoryToBoardgameController);

// Get all categories for a specific boardgame
router.get("/boardgame/:boardgameId", verifyToken, getCategoriesForBoardgame);

// Remove a category from a boardgame
router.delete("/boardgame/:gameId/remove/:categoryId", checkBoardgameOwner, removeCategoryFromBoardgameController);


export default router;
