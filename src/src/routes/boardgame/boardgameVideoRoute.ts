import { Router } from "express";
import { verifyToken, optionalToken } from "@/middleware/auth";
import { BoardgameRequestSchema, validate } from "@/validation/boardgameValidation";
import { 
    AddVideo,
    getAVideo,
    getVideoTutorialsByGame,
    TogglePublic,
    UpdateVideo,
    DeleteVideo
} from "@/controllers/boardgame/boardgameVideoController";

const router = Router();

router.post("/:gameId/add", verifyToken, validate(BoardgameRequestSchema.video.schema), AddVideo);
router.get("/:gameId/get-all",  getVideoTutorialsByGame);
router.get("/:videoId", getAVideo);
router.post("/:videoId/update", verifyToken, validate(BoardgameRequestSchema.video.schema), UpdateVideo);
router.patch("/:videoId/toggle-public", verifyToken, TogglePublic);
 router.delete("/:videoId/delete", verifyToken, DeleteVideo);
 
export default router;
