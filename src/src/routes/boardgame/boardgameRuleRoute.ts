import { Router } from "express";
import { verifyToken, optionalToken } from "@/middleware/auth";
import { BoardgameRequestSchema, validate } from "@/validation/boardgameValidation";
import { AddRule, getARule, getByGameid, UpdateRule, TogglePublic, deleteRule } from "@/controllers/boardgame/boardgameRuleController";

const router = Router();

router.post("/:gameId/add", verifyToken, validate(BoardgameRequestSchema.rule.schema), AddRule);
router.get("/:gameId/get-all",  getByGameid);
router.get("/:ruleId", getARule);
router.post("/:ruleId/update", verifyToken, validate(BoardgameRequestSchema.rule.schema), UpdateRule);
router.patch("/:ruleId/toggle-public", verifyToken, TogglePublic);
router.delete("/:ruleId/delete", verifyToken, deleteRule);
 
export default router;
