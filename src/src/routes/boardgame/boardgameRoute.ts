import { Router } from "express";
import { verifyToken, optionalToken } from "@/middleware/auth";
import {
    AddBoardgame,
    getABoardgame,
    updateBBGLink,
    updateShortcut,
    updateTitle, 
    updateDescription, 
    updateNumberPlayers, 
    updateDuration, 
    updateAvatar,
    updateBackground,
    checkOwner,
    updateAge,
    updateWeight
} from "@/controllers/boardgame/boardgameController";
import { BoardgameRequestSchema, validate } from "@/validation/boardgameValidation";
import { checkBoardgameOwner } from "@/middleware/boardgameMiddleware";
import boardgameRuleRoute from "@/routes/boardgame/boardgameRuleRoute";
import boardgameVideoRoute from "@/routes/boardgame/boardgameVideoRoute";
import boardgameImageRoute from "@/routes/boardgame/boardgameImageRoute";
import boardgameCategoryRoute from "@/routes/boardgame/boardgameCategoryRoute";
import boardgameMechanicRoute from "@/routes/boardgame/boardgameMechanicRoute";

const router = Router();

router.use("/category", boardgameCategoryRoute);
router.use("/mechanic", boardgameMechanicRoute);
router.use("/rules", boardgameRuleRoute);
router.use("/videos", boardgameVideoRoute);
router.use("/images", boardgameImageRoute);

/**
 * @swagger
 * /boardgame/add:
 *   post:
 *     summary: Add a new boardgame
 *     description: Adds a new boardgame with the provided name and BoardGameGeek URL.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               boardgamegeek_url:
 *                 type: string
 *             required:
 *               - name
 *               - boardgamegeek_url
 *     responses:
 *       201:
 *         description: Boardgame created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/add", verifyToken, validate(BoardgameRequestSchema.create.schema), AddBoardgame);

/**
 * @swagger
 * /boardgame/{gameId}:
 *   get:
 *     summary: Get details of a boardgame
 *     description: Fetches detailed information about a specific boardgame by its ID.
 *     parameters:
 *       - name: gameId
 *         in: path
 *         required: true
 *         description: The ID of the boardgame to fetch.
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Boardgame details retrieved successfully
 *       400:
 *         description: Invalid game ID
 *       404:
 *         description: Boardgame not found
 *       500:
 *         description: Internal server error
 */
router.get("/:gameId", optionalToken, getABoardgame);
router.get("/:gameId/check-owner", checkOwner);

router.patch("/:gameId/update/name", checkBoardgameOwner, validate(BoardgameRequestSchema.updateTitle.schema), updateTitle);
router.patch("/:gameId/update/BBGLink", checkBoardgameOwner, validate(BoardgameRequestSchema.updateBBGLink.Schema), updateBBGLink);
router.patch("/:gameId/update/shortcut", checkBoardgameOwner, validate(BoardgameRequestSchema.updateShortcut.schema), updateShortcut);
router.patch("/:gameId/update/description", checkBoardgameOwner, validate(BoardgameRequestSchema.updateDescription.schema), updateDescription);
router.patch("/:gameId/update/age", checkBoardgameOwner, validate(BoardgameRequestSchema.updateAge.schema), updateAge);
router.patch("/:gameId/update/weight", checkBoardgameOwner, validate(BoardgameRequestSchema.updateWeight.schema), updateWeight);
router.patch("/:gameId/update/number-players", checkBoardgameOwner, validate(BoardgameRequestSchema.updateNumberPlayers.schema), updateNumberPlayers);
router.patch("/:gameId/update/duration", checkBoardgameOwner, validate(BoardgameRequestSchema.updateDuration.schema), updateDuration);
router.patch("/:gameId/update/avatar", checkBoardgameOwner, validate(BoardgameRequestSchema.uploadAvatar.schema), updateAvatar);
router.patch("/:gameId/update/background", checkBoardgameOwner, validate(BoardgameRequestSchema.uploadBackground.schema), updateBackground);

export default router;
