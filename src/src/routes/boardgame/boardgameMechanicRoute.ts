import { Router } from "express";
import { verifyToken, AdminCheck } from "@/middleware/auth";
import {
  createNewMechanic,
  getMechanic,
  updateMechanicDetails,
  deleteMechanicById,
  getAllMechanicList,
  addMechanicToBoardgameController,
  getMechanicsForBoardgame,
  removeMechanicFromBoardgameController,
  getBoardgamesForMechanic,
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

// Get all mechanics
router.get("/", getAllMechanicList);

// Add a mechanic to a boardgame
router.post("/boardgame/:gameId/add", checkBoardgameOwner, validate(boardgameMechanicSchema), addMechanicToBoardgameController);

// Get all mechanics for a specific boardgame
router.get("/boardgame/:boardgameId", verifyToken, getMechanicsForBoardgame);

// Remove a mechanic from a boardgame
router.delete("/remove-from-boardgame", verifyToken, removeMechanicFromBoardgameController);

// Get all boardgames associated with a specific mechanic
router.get("/boardgames/:mechanicId", verifyToken, getBoardgamesForMechanic);

export default router;
