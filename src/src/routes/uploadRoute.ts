import express from "express";
import upload from "@/middleware/uploadFileMiddleware";
import { deleteFile, uploadFileCategory, uploadFileGame, uploadFileUser } from "@/controllers/uploadController";

const router = express.Router();

/**
 * @swagger
 * /file/upload/game/{gameid}:
 *   post:
 *     summary: Upload a file for a specific game
 *     description: Uploads a file to the server for a specific game. Supported file types are JPEG, PNG, and PDF.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: gameid
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the game to associate the file with.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload.
 *     responses:
 *       200:
 *         description: File uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 filePath:
 *                   type: string
 *                   description: Path to the uploaded file.
 *       400:
 *         description: Invalid file type or upload error.
 *       404:
 *         description: Game ID not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/upload/game/:gameId", upload.single("file"), uploadFileGame);

/**
 * @swagger
 * /file/upload/user/{userId}:
 *   post:
 *     summary: Upload a file for a specific game
 *     description: Uploads a file to the server for a specific game. Supported file types are JPEG, PNG, and PDF.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the game to associate the file with.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload.
 *     responses:
 *       200:
 *         description: File uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 filePath:
 *                   type: string
 *                   description: Path to the uploaded file.
 *       400:
 *         description: Invalid file type or upload error.
 *       404:
 *         description: Game ID not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/upload/user/:userId", upload.single("file"), uploadFileUser);

router.post("/upload/category/:categoryId", upload.single("file"), uploadFileCategory);

/**
 * @swagger
 * /file/delete:
 *   delete:
 *     summary: Delete a file
 *     description: Deletes a file from the server.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - filePath
 *             properties:
 *               filePath:
 *                 type: string
 *                 description: The path of the file to delete.
 *     responses:
 *       200:
 *         description: File deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: File not found.
 *       500:
 *         description: Internal server error.
 */
router.delete("/delete", deleteFile);

export default router;
