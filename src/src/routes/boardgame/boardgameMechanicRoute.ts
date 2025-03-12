import { Router } from "express";
import { verifyToken, AdminCheck, optionalToken } from "@/middleware/auth";
import {
  createNewMechanic,
  getMechanic,
  updateMechanicDetails,
  deleteMechanicById,
  getAllMechanicList,
  getMechanicHistory,
  addMechanicToBoardgameController,
  getMechanicsForBoardgame,
  removeMechanicFromBoardgameController,
  getBoardgamesForMechanic,
  toggleStatus,
  likeMechanic,
  unlikeMechanic,
  checkUserLike,
} from "@/controllers/boardgame/boardgameMechanicController";
import { validate, boardgameMechanicSchema } from "@/validation/boardgameValidation";
import { checkBoardgameOwner } from "@/middleware/boardgameMiddleware";

const router = Router();

// Create a new mechanic
router.post("/add", AdminCheck, validate(boardgameMechanicSchema), createNewMechanic);

// Get a mechanic by ID
router.get("/:mechanicId", getMechanic);

// Update a mechanic
router.put("/:mechanicId", AdminCheck, validate(boardgameMechanicSchema), updateMechanicDetails);

// Delete a mechanic
router.delete("/:mechanicId", AdminCheck, deleteMechanicById);

router.patch("/:mechanicId/toggle-status", AdminCheck, toggleStatus);

// Get all mechanics
router.get("/", optionalToken, getAllMechanicList);

router.get("/:mechanicId/history", AdminCheck, getMechanicHistory);



router.post("/:mechanicId/like", verifyToken, likeMechanic);

// ✅ Unlike category
router.delete("/:mechanicId/unlike", verifyToken, unlikeMechanic);

router.get("/:mechanicId/check-like", optionalToken, checkUserLike);


// Add a mechanic to a boardgame
router.post("/boardgame/:gameId/add/:mechanicId", checkBoardgameOwner, addMechanicToBoardgameController);

// Get all mechanics for a specific boardgame
router.get("/boardgame/:boardgameId", verifyToken, getMechanicsForBoardgame);

// Remove a mechanic from a boardgame
router.delete("/remove-from-boardgame", verifyToken, removeMechanicFromBoardgameController);

// Get all boardgames associated with a specific mechanic
router.get("/boardgames/:mechanicId", verifyToken, getBoardgamesForMechanic);

export default router;
