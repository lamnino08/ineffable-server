import { Router } from "express";
import { verifyToken, AdminCheck, optionalToken } from "@/middleware/auth";
import {
  createNewCategory,
  getCategory,
  updateCategoryDetails,
  deleteCategoryById,
  getCategoryList,
  addCategoryToBoardgameController,
  getCategoriesForBoardgame,
  removeCategoryFromBoardgameController,
  likeCategoryController,
  checkIfUserLikedCategoryController,
  getCategoryHistory,
  toggleStatus,
  unlikeCategoryController,
} from "@/controllers/boardgame/boardgameCategoryController";
import { validate, boardgameCategorySchema } from "@/validation/boardgameValidation";
import { checkBoardgameOwner } from "@/middleware/boardgameMiddleware";

const router = Router();

// Create a new category
router.post("/add", verifyToken, validate(boardgameCategorySchema), createNewCategory);

// Get a category by ID
router.get("/:categoryId", optionalToken, getCategory);

// Update a category
router.put("/:categoryId", AdminCheck, validate(boardgameCategorySchema), updateCategoryDetails);

router.patch("/:categoryId/toggle-status", AdminCheck, toggleStatus);

// Delete a category
router.delete("/:categoryId", AdminCheck, deleteCategoryById);

// Get all categories (optional: filter by user)
router.get("/", optionalToken, getCategoryList);


router.post("/:categoryId/like", verifyToken, likeCategoryController);

// ✅ Unlike category
router.delete("/:categoryId/unlike", verifyToken, unlikeCategoryController);

router.get("/:categoryId/check-user-liked", optionalToken, checkIfUserLikedCategoryController);

router.get("/:categoryId/history", AdminCheck, getCategoryHistory);


// Add a category to a boardgame
router.post("/boardgame/:gameId/add/:categoryId", checkBoardgameOwner, addCategoryToBoardgameController);

// Get all categories for a specific boardgame
router.get("/boardgame/:boardgameId", verifyToken, getCategoriesForBoardgame);

// Remove a category from a boardgame
router.delete("/boardgame/:gameId/remove/:categoryId", checkBoardgameOwner, removeCategoryFromBoardgameController);


export default router;
