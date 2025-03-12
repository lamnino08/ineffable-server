import express from "express";
import upload from "@/middleware/uploadFileMiddleware";
import {
    deleteFile,
    uploadFile
} from "@/controllers/uploadController";

const router = express.Router();

router.post("/upload/:type/:id", upload.single("file"), uploadFile);

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
