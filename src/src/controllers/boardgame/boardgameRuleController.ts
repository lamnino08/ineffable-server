import { Request, Response } from "express";
import { createARule, GetRuleByGameId, GetRuleById, updateARule, updateStatus, DeleteRule } from "@/models/boardgame/boardgameRuleModel";
import { boardgameRuleSchema } from "@/validation/boardgameValidation";
import { checkOwnerBoardgame, getBoardgameOwner } from "@/services/redis/boardgame";
import { RuleStatus } from "@/types/models/Boardgame";
import { deleteRuleOwner, getRuleOwner, setRuleOwner } from "@/services/redis/rule";
import { addRuleHistory } from "@/services/mongodb/history/RuleHistoryService";
import { getUserNameById } from "@/models/userModel";

export const AddRule = async (req: Request, res: Response) => {
  const gameId = req.params.gameId;

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized. Please log in to perform this action." });
    return
  }

  try {
    const userId = req.user.id;
    const { title, language, link, type, description } = boardgameRuleSchema.parse(req.body);

    let status: RuleStatus = "pending";
    if (await checkOwnerBoardgame(Number(gameId), userId) || req.user.role === "admin") {
      status = "public";
    }

    const ruleId = await createARule(title, gameId, userId, link, language, type, description, status);

    setRuleOwner(ruleId, Number(gameId), userId); // redis

    addRuleHistory(ruleId, {
      action: "create",
      updated_by: userId,
      changes: {
        title: { oldValue: null, newValue: title },
        language: { oldValue: null, newValue: language },
        link: { oldValue: null, newValue: link },
        type: { oldValue: null, newValue: type },
        description: { oldValue: null, newValue: description },
        status: { oldValue: null, newValue: status },
      },
    });

    res.status(201).json({
      success: true,
      message: req.t("boardgame.rule.add.success"),
      ruleId: ruleId
    });
  } catch (err) {
    console.error("Error adding rule of boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getARule = async (req: Request, res: Response) => {
  try {
    const ruleId = req.params.ruleId;
    const rule = await GetRuleById(ruleId);

    res.status(201).json({
      success: true,
      message: "Get a rule of game successfully",
      data: rule
    });
  } catch (err) {
    console.error("Error get rule boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const getByGameid = async (req: Request, res: Response) => {
  try {
    const gameId = req.params.gameId;
    const { limit = 10, offset = 0, status } = req.query; // Lấy limit, offset và status từ query params

    // Chuyển đổi limit và offset về kiểu số nguyên
    const parsedLimit = parseInt(limit as string, 10);
    const parsedOffset = parseInt(offset as string, 10);

    // Lấy danh sách rule từ DB với điều kiện status nếu có
    const rules = await GetRuleByGameId(gameId, parsedLimit, parsedOffset, status as string);

    const rulesWithUser = await Promise.all(
      rules.map(async (rule) => {
        const user = await getUserNameById(rule.user_id);
        return {
          ...rule,
          username: user?.username || "",
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Get rules of game successfully",
      data: rulesWithUser
    });
  } catch (err) {
    console.error("Error get rule boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const UpdateRule = async (req: Request, res: Response) => {
  const ruleId = req.params.ruleId;

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized. Please log in to perform this action." });
    return
  }

  try {
    const userId = req.user.id;

    const ruleOwnerInfo = await getRuleOwner(ruleId);

    if (!ruleOwnerInfo) {
      res.status(404).json({ error: "Rule not found." });
      return;
    }

    const { boardgameId, userId: ruleOwnerId } = ruleOwnerInfo;
    const boardgameOwnerId = await getBoardgameOwner(boardgameId);

    if (!boardgameOwnerId) {
      res.status(404).json({ error: "Boardgame not found." });
      return;
    }

    // Kiểm tra quyền sửa rule
    const isRuleOwner = ruleOwnerId === userId;
    const isBoardgameOwner = boardgameOwnerId === userId;

    if (!isRuleOwner && !isBoardgameOwner && req.user.role !== "admin") {
      res.status(403).json({ error: "Forbidden. You don't have permission to update this rule." });
      return;
    }

    const { title, language, link, type, description } = boardgameRuleSchema.parse(req.body);

    const ruleOld = await GetRuleById(ruleId);

    let status: RuleStatus = "pending";
    if (isBoardgameOwner) {
      status = "public";
    }

    if (ruleOld) {
      let changes: Record<string, { oldValue: any; newValue: any }> = {};

      if (ruleOld.title !== title) changes.title = { oldValue: ruleOld.title, newValue: title };
      if (ruleOld.language !== language) changes.language = { oldValue: ruleOld.language, newValue: language };
      if (ruleOld.rule_url !== link) changes.link = { oldValue: ruleOld.rule_url, newValue: link };
      if (ruleOld.type !== type) changes.type = { oldValue: ruleOld.type, newValue: type };
      if (ruleOld.description !== description) changes.description = { oldValue: ruleOld.description, newValue: description };
      if (ruleOld.status !== status) changes.status = { oldValue: ruleOld.status, newValue: status };

      addRuleHistory(Number(ruleId), {
        action: "update",
        updated_by: userId,
        changes,
      });
    }

    updateARule(Number(ruleId), title, link, language, type, description, status);

    res.status(201).json({
      success: true,
      message: req.t("boardgame.rule.add.success"),
      data: null
    });
  } catch (err) {
    console.error("Error adding rule of boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const TogglePublic = async (req: Request, res: Response) => {
  const ruleId = req.params.ruleId;

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized. Please log in to perform this action." });
    return
  }

  try {
    const userId = req.user.id;

    const ruleOwnerInfo = await getRuleOwner(ruleId);

    if (!ruleOwnerInfo) {
      res.status(404).json({ error: "Rule not found." });
      return;
    }

    const { boardgameId, userId: ruleOwnerId } = ruleOwnerInfo;
    const boardgameOwnerId = await getBoardgameOwner(boardgameId);

    if (!boardgameOwnerId) {
      res.status(404).json({ error: "Boardgame not found." });
      return;
    }

    console.log("boardgameOwnerId", boardgameOwnerId, userId);
    const isBoardgameOwner = boardgameOwnerId === userId;

    if (!isBoardgameOwner && req.user.role !== "admin") {
      res.status(403).json({ error: "Forbidden. You don't have permission to update this rule." });
      return;
    }

    const ruleOld = await GetRuleById(ruleId);

    let nextStatus: RuleStatus = "public";
    if (ruleOld?.status === "public") {
      nextStatus = "hide";
    }

    updateStatus(nextStatus, Number(ruleId));
    let changes: Record<string, { oldValue: any; newValue: any }> = {};
    changes.status = { oldValue: ruleOld?.status, newValue: nextStatus };
    addRuleHistory(Number(ruleId), {
      action: "update",
      updated_by: userId,
      changes,
    });

    res.status(201).json({
      success: true,
      message: req.t("boardgame.rule.add.success"),
      data: null
    });
  } catch (err) {
    console.error("Error adding rule of boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteRule = async (req: Request, res: Response) => {
  const ruleId = req.params.ruleId;

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized. Please log in to perform this action." });
    return
  }

  try {
    const userId = req.user.id;

    const ruleOwnerInfo = await getRuleOwner(ruleId);

    if (!ruleOwnerInfo) {
      res.status(404).json({ error: "Rule not found." });
      return;
    }

    const { boardgameId, userId: ruleOwnerId } = ruleOwnerInfo;
    const boardgameOwnerId = await getBoardgameOwner(boardgameId);

    if (!boardgameOwnerId) {
      res.status(404).json({ error: "Boardgame not found." });
      return;
    }

    const isBoardgameOwner = boardgameOwnerId === userId;

    if (!isBoardgameOwner && req.user.role !== "admin") {
      res.status(403).json({ error: "Forbidden. You don't have permission to delete rule." });
      return;
    }

    res.status(201).json({
      success: true,
      message: req.t("boardgame.rule.add.success"),
      data: null
    });

    DeleteRule(Number(ruleId)); // mysql
    deleteRuleOwner(ruleId); // redis
    addRuleHistory(Number(ruleId), {
      action: "delete",
      updated_by: userId,
      changes: {},
    });
  } catch (err) {
    console.error("Error adding rule of boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
