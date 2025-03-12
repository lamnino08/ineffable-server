import { Request, Response } from "express";
import {
  createAVideoTutorial,
  getVideoTutorialById,
  getVideoTutorialsByGameId,
  updateVideoTutorial,
  updateStatus,
  deleteVideo
} from "@/models/boardgame/boardgameVideoModel";
import { boardgameRuleSchema, boardgameVideoTutorialSchema } from "@/validation/boardgameValidation";
import { checkOwnerBoardgame, getBoardgameOwner } from "@/services/redis/boardgame";
import { RuleStatus, VideoStatus } from "@/types/models/Boardgame";
import { deleteVideoOwner, getVideoOwner, setVideoOwner } from "@/services/redis/video";
import { addVideoHistory } from "@/services/mongodb/history/BoardgameVideoHistoryService";
import { getUserNameById } from "@/models/userModel";

export const AddVideo = async (req: Request, res: Response) => {
  const gameId = req.params.gameId;

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized. Please log in to perform this action." });
    return
  }

  try {
    const userId = req.user.id;

    const { title, language, url, description } = boardgameVideoTutorialSchema.parse(req.body);

    let status: VideoStatus = "pending";
    if (await checkOwnerBoardgame(Number(gameId), userId)) {
      status = "public";
    }

    const videoId = await createAVideoTutorial(Number(gameId), title, userId, language, url, description, status);

    addVideoHistory(videoId, {
      action: "create",
      updated_by: userId,
      changes: {
        title: { oldValue: null, newValue: title },
        language: { oldValue: null, newValue: language },
        url: { oldValue: null, newValue: url },
        description: { oldValue: null, newValue: description },
        status: { oldValue: null, newValue: status },
      },
    }); // mongoDB history
    setVideoOwner(videoId, Number(gameId), userId); // redis

    res.status(201).json({
      success: true,
      message: req.t("boardgame.rule.add.success"),
      data: videoId
    });
  } catch (err) {
    console.error("Error adding rule of boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAVideo = async (req: Request, res: Response) => {
  try {
    const video_id = Number(req.params.videoId);
    const video = await getVideoTutorialById(video_id);

    res.status(201).json({
      success: true,
      message: "Video tutorial retrieved successfully.",
      data: video
    });
  } catch (err) {
    console.error("Error retrieving video tutorial:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const getVideoTutorialsByGame = async (req: Request, res: Response) => {
  try {
    const gameId = req.params.gameId;
    const { limit = 10, offset = 0, status } = req.query; // Lấy limit, offset và status từ query params

    // Chuyển đổi limit và offset về kiểu số nguyên
    const parsedLimit = parseInt(limit as string, 10);
    const parsedOffset = parseInt(offset as string, 10);

    // Lấy danh sách video từ DB với điều kiện status nếu có
    const videos = await getVideoTutorialsByGameId(Number(gameId), parsedLimit, parsedOffset, status as string);

    const videosWithUser = await Promise.all(
      videos.map(async (video) => {
        const user = await getUserNameById(video.user_id);
        return {
          ...video,
          username: user?.username || "",
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Video tutorials retrieved successfully.",
      data: videosWithUser
    });
  } catch (err) {
    console.error("Error retrieving video tutorials:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const UpdateVideo = async (req: Request, res: Response) => {
  const video_id = Number(req.params.videoId);

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized. Please log in to perform this action." });
    return
  }

  try {
    const userId = req.user.id;

    const videoOwnerInfo = await getVideoOwner(video_id);

    if (!videoOwnerInfo) {
      res.status(404).json({ error: "Rule not found." });
      return;
    }

    const { boardgameId, userId: videoOwnerId } = videoOwnerInfo;
    const boardgameOwnerId = await getBoardgameOwner(boardgameId);

    if (!boardgameOwnerId) {
      res.status(404).json({ error: "Boardgame not found." });
      return;
    }

    const isVideoOwner = videoOwnerId === userId;
    const isBoardgameOwner = boardgameOwnerId === userId;

    if (!isVideoOwner && !isBoardgameOwner && req.user.role !== "admin") {
      res.status(403).json({ error: "Forbidden. You don't have permission to update this video." });
      return;
    }

    const { title, language, url, description } = boardgameVideoTutorialSchema.parse(req.body);

    let status: RuleStatus = "pending";
    if (isBoardgameOwner) {
      status = "public";
    }

    const videoOld = await getVideoTutorialById(video_id);

    if (videoOld) {
      let changes: Record<string, { oldValue: any; newValue: any }> = {};

      if (videoOld.title !== title) changes.title = { oldValue: videoOld.title, newValue: title };
      if (videoOld.language !== language) changes.language = { oldValue: videoOld.language, newValue: language };
      if (videoOld.url !== url) changes.link = { oldValue: videoOld.url, newValue: url };
      if (videoOld.description !== description) changes.description = { oldValue: videoOld.description, newValue: description };
      if (videoOld.status !== status) changes.status = { oldValue: videoOld.status, newValue: status };

      addVideoHistory(Number(video_id), {
        action: "update",
        updated_by: userId,
        changes,
      });
    }

    updateVideoTutorial(video_id, title, language, url, description, status);

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
  const videoId = req.params.videoId;

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized. Please log in to perform this action." });
    return
  }

  try {
    const userId = req.user.id;

    const videoOwnerInfo = await getVideoOwner(Number(videoId));

    if (!videoOwnerInfo) {
      res.status(404).json({ error: "Rule not found." });
      return;
    }

    const { boardgameId, userId: videoOwnerId } = videoOwnerInfo;
    const boardgameOwnerId = await getBoardgameOwner(boardgameId);

    if (!boardgameOwnerId) {
      res.status(404).json({ error: "Boardgame not found." });
      return;
    }

    const isVideoOwner = videoOwnerId === userId;
    const isBoardgameOwner = boardgameOwnerId === userId;

    if (!isBoardgameOwner && !isVideoOwner && req.user.role !== "admin") {
      res.status(403).json({ error: "Forbidden. You don't have permission to update this video." });
      return;
    }

    res.status(201).json({
      success: true,
      message: req.t("boardgame.rule.add.success"),
      data: null
    });

    const video = await getVideoTutorialById(Number(videoId));

    let nextStatus: RuleStatus = "public";
    if (video?.status === "public") {
      nextStatus = "hide";
    }

    updateStatus(Number(videoId), nextStatus);
    let changes: Record<string, { oldValue: any; newValue: any }> = {};
    changes.status = { oldValue: video?.status, newValue: nextStatus };
    addVideoHistory(Number(videoId), {
      action: "update",
      updated_by: userId,
      changes,
    });
  } catch (err) {
    console.error("Error update status video of boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const DeleteVideo = async (req: Request, res: Response) => {
  const videoId = req.params.videoId;

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized. Please log in to perform this action." });
    return
  }

  try {
    const userId = req.user.id;

    const videoOwnerInfo = await getVideoOwner(Number(videoId));

    if (!videoOwnerInfo) {
      res.status(404).json({ error: "Rule not found." });
      return;
    }

    const { boardgameId, userId: videoOwnerId } = videoOwnerInfo;
    const boardgameOwnerId = await getBoardgameOwner(boardgameId);

    if (!boardgameOwnerId) {
      res.status(404).json({ error: "Boardgame not found." });
      return;
    }

    const isVideoOwner = videoOwnerId === userId;
    const isBoardgameOwner = boardgameOwnerId === userId;

    if (!isBoardgameOwner && !isVideoOwner && req.user.role !== "admin") {
      res.status(403).json({ error: "Forbidden. You don't have permission to update this video." });
      return;
    }

    res.status(201).json({
      success: true,
      message: req.t("boardgame.rule.add.success"),
      data: null
    });

    deleteVideo(Number(videoId));
    deleteVideoOwner(videoId);
    addVideoHistory(Number(videoId), {
      action: "delete",
      updated_by: userId,
      changes: {},
    });

  } catch (err) {
    console.error("Error update status video of boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
