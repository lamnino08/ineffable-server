import { Router } from "express";
import { searchBoardgame } from "@/controllers/AI-Search/AIBoardgameController"
const router = Router();

/**
 * @swagger
 * /ai/boardgame-search:
 *   get:
 *     summary: Tìm kiếm boardgame
 *     description: Trả về danh sách boardgame dựa trên từ khóa tìm kiếm
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: false
 *         description: Tên của boardgame
 *     responses:
 *       200:
 *         description: Thành công, trả về danh sách boardgame
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Catan"
 *                   description:
 *                     type: string
 *                     example: "Một boardgame kinh điển về xây dựng và giao thương"
 *       400:
 *         description: Lỗi request không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.get("/boardgame-search", searchBoardgame)

export default router;