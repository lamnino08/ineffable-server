import { Router } from "express";
import { verifyToken } from "@/middleware/auth";
import { addBoardgame } from "@/controllers/boardgameController";
import { validate, boardgameCreateSchema } from "@/validation/boardgameValidation";

const router = Router();

/**
 * @swagger
 * /boardgame:
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
router.post("/", verifyToken, validate(boardgameCreateSchema), addBoardgame);

export default router;
