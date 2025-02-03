import { Router } from "express";
import { verifyToken, optionalToken } from "@/middleware/auth";
import { BoardgameRequestSchema, validate } from "@/validation/boardgameValidation";
import { AddImage, GetImagesByGameId, DeleteImage, UpdateImageStatus } from "@/controllers/boardgame/boardgameImageController";


const router = Router();

router.post("/:gameId/add", verifyToken, validate(BoardgameRequestSchema.image.schema), AddImage);
router.get("/:gameId/get-all",  GetImagesByGameId);
router.patch("/:imageId/toggle-public", verifyToken, UpdateImageStatus);
router.delete("/:imageId/delete", verifyToken, DeleteImage);
 
export default router;
