import { Request, Response } from "express";
import { addBoardgame, getBoardgameDetails, updateAgeModel, UpdateAvatar, UpdateBackground, UpdateBBGLink, UpdateDescription, UpdateDuration, updateName, UpdateNumeberPlayers, UpdateShortcut, UpdateWeightModel } from "@/models/boardgame/boardgameModel";
import fileHelper from "@/helpers/firebaseHelper";
import { boardgameUpdateAge, boardgameUpdateAvatar, boardgameUpdateBackground, boardgameUpdateBGGLink, boardgameUpdateDescription, boardgameUpdateDuration, boardgameUpdateNumberPlayers, boardgameUpdateShortcut, boardgameUpdateTitle, boardgameUpdateWeight, checkOwnerBoardgame, deleteBoardgameDetailFromRedis, getBoardgameDetailByID, getBoardgameOwner, setBoardgameOwner } from "@/services/redis/boardgame"
import jwt from "jsonwebtoken";
import { addBoardgameHistory } from "@/services/mongodb/history/BoardgameHistoryService";
import { boardgameUpdateAgeSchema, boardgameUpdateWeightSchema } from "@/validation/boardgameValidation";
import { getBoardgameCategories } from "@/services/redis/boardgameCategory";
import { getBoardgameMechanics } from "@/services/redis/boardgameMechanic";
import { number } from "zod";

export const AddBoardgame = async (req: Request, res: Response) => {
  const { name, BBGLink } = req.body;

  if (req.user) {
    try {
      const userId = req.user.id;
      const boardgameId = await addBoardgame(name, userId, BBGLink);

      res.status(201).json({
        success: true,
        message: req.t("boardgame.add.success"),
        data: boardgameId
      });

      setBoardgameOwner(boardgameId, userId); // redis
      let changes: Record<string, { oldValue: any; newValue: any }> = {};
      changes.name = { oldValue: null, newValue: name };
      changes.boardgamegeek_url = { oldValue: null, newValue: BBGLink };

      addBoardgameHistory(boardgameId, {
        action: "create",
        updated_by: userId,
        changes
      });
    } catch (err) {
      console.error("Error adding boardgame:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const getABoardgame = async (req: Request, res: Response) => {
  try {
    const gameId = req.params.gameId;

    let user_id = req.user?.id;
    let isOwner = false;

    if (user_id) {
      isOwner = await checkOwnerBoardgame(Number(gameId), user_id);
    }

    // 1. get common boardgame details
    const boardgame = await getBoardgameDetailByID(Number(gameId));

    // 2. get boardgame categories
    if (boardgame) boardgame.categories = await getBoardgameCategories(Number(gameId));

    // 3. get boardgame mechanics
    if (boardgame) boardgame.mechanics = await getBoardgameMechanics(Number(gameId));
    res.status(201).json({
      success: true,
      message: "Get a boardgame successfully",
      data: boardgame
    });
  } catch (err) {
    console.error("Error adding boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const updateTitle = async (req: Request, res: Response) => {
  try {
    // 1. Lấy gameId từ request params
    const gameId = req.params.gameId;

    // 2. Lấy name từ request body
    const { name } = req.body;

    // 3. Trả về response thành công ngay lập tức
    res.status(201).json({
      success: true,
      message: req.t("boardgame.update.name.success"),
    });

    // 4. Lấy userId từ request (nếu có)
    const userId = req.user?.id;

    // 5. Nếu có userId, ghi lại lịch sử cập nhật
    if (userId) {
      await boardgameUpdateTitle(Number(gameId), name, userId);
    }
  } catch (err) {
    // 8. Xử lý lỗi nếu có
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateAge = async (req: Request, res: Response) => {
  try {
    // 1. Lấy gameId từ request params
    const gameId = req.params.gameId;

    // 2. Lấy age từ request body (validate bằng schema)
    const { age } = boardgameUpdateAgeSchema.parse(req.body);

    // 3. Trả về response thành công ngay lập tức
    res.status(201).json({
      success: true,
      message: req.t("boardgame.update.age.success"),
    });

    // 4. Lấy userId từ request (nếu có)
    const userId = req.user?.id;

    // 5. Nếu có userId, gọi hàm cập nhật `age`
    if (userId) {
      await boardgameUpdateAge(Number(gameId), Number(age), userId);
    }
  } catch (err) {
    // 6. Xử lý lỗi nếu có
    console.error("Error updating age boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateWeight = async (req: Request, res: Response) => {
  try {
    // 1. Lấy gameId từ request params
    const gameId = req.params.gameId;

    // 2. Lấy weight từ request body (validate bằng schema)
    const { weight } = boardgameUpdateWeightSchema.parse(req.body);

    // 3. Trả về response thành công ngay lập tức
    res.status(201).json({
      success: true,
      message: req.t("boardgame.update.weight.success"),
    });

    // 4. Lấy userId từ request (nếu có)
    const userId = req.user?.id;

    // 5. Nếu có userId, gọi hàm cập nhật `weight`
    if (userId) {
      await boardgameUpdateWeight(Number(gameId), Number(weight), userId);
    }
  } catch (err) {
    // 6. Xử lý lỗi nếu có
    console.error("Error updating weight boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateBBGLink = async (req: Request, res: Response) => {
  try {
    // 1. Lấy gameId từ request params
    const gameId = req.params.gameId;

    // 2. Lấy BGGLink từ request body
    const { BGGLink } = req.body;

    // 3. Trả về response thành công ngay lập tức
    res.status(201).json({
      success: true,
      message: req.t("boardgame.update.bgglink.success"),
    });

    // 4. Lấy userId từ request (nếu có)
    const userId = req.user?.id;

    // 5. Nếu có userId, gọi hàm cập nhật `BGGLink`
    if (userId) {
      await boardgameUpdateBGGLink(Number(gameId), BGGLink, userId);
    }
  } catch (err) {
    // 6. Xử lý lỗi nếu có
    console.error("Error updating BGGLink boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateShortcut = async (req: Request, res: Response) => {
  try {
    // 1. Lấy gameId từ request params
    const gameId = req.params.gameId;

    // 2. Lấy shortcut từ request body
    const { shortcut } = req.body;

    // 3. Trả về response thành công ngay lập tức
    res.status(201).json({
      success: true,
      message: req.t("boardgame.update.shortcut.success"),
    });

    // 4. Lấy userId từ request (nếu có)
    const userId = req.user?.id;

    // 5. Nếu có userId, gọi hàm cập nhật `shortcut`
    if (userId) {
      await boardgameUpdateShortcut(Number(gameId), shortcut, userId);
    }
  } catch (err) {
    // 6. Xử lý lỗi nếu có
    console.error("Error updating shortcut boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateDescription = async (req: Request, res: Response) => {
  try {
    // 1. Lấy gameId từ request params
    const gameId = req.params.gameId;

    // 2. Lấy description từ request body
    const { description } = req.body;

    // 3. Trả về response thành công ngay lập tức
    res.status(201).json({
      success: true,
      message: req.t("boardgame.update.description.success"),
    });

    // 4. Lấy userId từ request (nếu có)
    const userId = req.user?.id;

    // 5. Nếu có userId, gọi hàm cập nhật `description`
    if (userId) {
      await boardgameUpdateDescription(Number(gameId), description, userId);
    }
  } catch (err) {
    // 6. Xử lý lỗi nếu có
    console.error("Error updating description boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateNumberPlayers = async (req: Request, res: Response) => {
  try {
    // 1. Lấy gameId từ request params
    const gameId = req.params.gameId;

    // 2. Lấy minPlayers và maxPlayers từ request body
    const { minPlayers, maxPlayers } = req.body;

    // 3. Trả về response thành công ngay lập tức
    res.status(201).json({
      success: true,
      message: req.t("boardgame.update.number-player.success"),
    });

    // 4. Lấy userId từ request (nếu có)
    const userId = req.user?.id;

    // 5. Nếu có userId, gọi hàm cập nhật `number of players`
    if (userId) {
      await boardgameUpdateNumberPlayers(Number(gameId), minPlayers, maxPlayers, userId);
    }
  } catch (err) {
    // 6. Xử lý lỗi nếu có
    console.error("Error updating number of players for boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateDuration = async (req: Request, res: Response) => {
  try {
    // 1. Lấy gameId từ request params
    const gameId = req.params.gameId;

    // 2. Lấy min và max từ request body
    const { min, max } = req.body;

    // 3. Trả về response thành công ngay lập tức
    res.status(201).json({
      success: true,
      message: req.t("boardgame.update.duration.success"),
    });

    // 4. Lấy userId từ request (nếu có)
    const userId = req.user?.id;

    // 5. Nếu có userId, gọi hàm cập nhật `duration`
    if (userId) {
      await boardgameUpdateDuration(Number(gameId), min, max, userId);
    }
  } catch (err) {
    // 6. Xử lý lỗi nếu có
    console.error("Error updating duration for boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateAvatar = async (req: Request, res: Response) => {
  try {
    // 1. Lấy gameId từ request params
    const gameId = req.params.gameId;

    // 2. Lấy url từ request body
    const { url } = req.body;

    // 3. Trả về response thành công ngay lập tức
    res.status(201).json({
      success: true,
      message: req.t("boardgame.update.avatar.success"),
    });

    // 4. Lấy userId từ request (nếu có)
    const userId = req.user?.id;

    // 5. Nếu có userId, gọi hàm cập nhật `avatar`
    if (userId) {
      await boardgameUpdateAvatar(Number(gameId), url, userId);
    }
  } catch (err) {
    // 6. Xử lý lỗi nếu có
    console.error("Error updating avatar for boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateBackground = async (req: Request, res: Response) => {
  try {
    // 1. Lấy gameId từ request params
    const gameId = req.params.gameId;

    // 2. Lấy url từ request body
    const { url } = req.body;

    // 3. Trả về response thành công ngay lập tức
    res.status(201).json({
      success: true,
      message: req.t("boardgame.update.background.success"),
    });

    // 4. Lấy userId từ request (nếu có)
    const userId = req.user?.id;

    // 5. Nếu có userId, gọi hàm cập nhật `background`
    if (userId) {
      await boardgameUpdateBackground(Number(gameId), url, userId);
    }
  } catch (err) {
    // 6. Xử lý lỗi nếu có
    console.error("Error updating background for boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const checkOwner = async (req: Request, res: Response): Promise<void> => {
  const gameId = req.params.gameId;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Unauthorized. Token is missing.",
      data: false,
    });
    return
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      res.status(401).json({
        success: false,
        message: "Token is expired.",
        data: false,
      });
      return;
    }

    // If the user has an admin role, grant access
    if (decoded.role === "admin") {
      res.status(200).json({
        success: true,
        message: "Access granted. User is admin.",
        data: true,
      });
      return;
    }

    // Check if the user is the boardgame owner
    const boardgameOwner = await getBoardgameOwner(Number(gameId));
    const isOwner = boardgameOwner === decoded.id;

    res.status(200).json({
      success: true,
      message: isOwner
        ? "Access granted. User is the owner."
        : "Access denied. User is not the owner.",
      data: isOwner,
    });
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(401).json({
      success: false,
      message: "Invalid token. Authentication failed.",
      data: false,
    });
  }
};
