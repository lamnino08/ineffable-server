import { Request, Response } from "express";
import { addBoardgame, getBoardgameDetails, updateAgeModel, UpdateAvatar, UpdateBackground, UpdateBBGLink, UpdateDescription, UpdateDuration, updateName, UpdateNumeberPlayers, UpdateShortcut, UpdateWeightModel } from "@/models/boardgame/boardgameModel";
import fileHelper from "@/helpers/firebaseHelper";
import { checkOwnerBoardgame, getBoardgameOwner, setBoardgameOwner } from "@/services/redis/boardgame"
import jwt from "jsonwebtoken";
import { addBoardgameHistory } from "@/services/mongodb/history/BoardgameHistoryService";
import { boardgameUpdateAgeSchema, boardgameUpdateWeightSchema } from "@/validation/boardgameValidation";
import { getBoardgameCategories } from "@/services/redis/boardgameCategory";
import { getBoardgameMechanics } from "@/services/redis/boardgameMechanic";

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

    const boardgame = await getBoardgameDetails(Number(gameId));
    if (boardgame) boardgame.categories = await getBoardgameCategories(Number(gameId));
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
    const gameId = req.params.gameId;
    const { name } = req.body;

    res.status(201).json({
      success: true,
      message: req.t("boardgame.update.name.success"),
    });

    const userId = req.user?.id;
    if (userId) {
      const gameOld = await getBoardgameDetails(Number(gameId));
      let changes: Record<string, { oldValue: any; newValue: any }> = {};

      changes.name = { oldValue: gameOld?.name, newValue: name };
      addBoardgameHistory(Number(gameId), {
        action: "update",
        updated_by: userId,
        changes
      });
    }

    updateName(name, gameId); // mysql
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export const updateAge = async (req: Request, res: Response) => {
  try {
    const gameId = req.params.gameId;
    const { age } = boardgameUpdateAgeSchema.parse(req.body);

    res.status(201).json({
      success: true,
      message: req.t("boardgame.update.name.success"),
    });

    const userId = req.user?.id;
    if (userId) {
      const gameOld = await getBoardgameDetails(Number(gameId));
      let changes: Record<string, { oldValue: any; newValue: any }> = {};

      changes.age = { oldValue: gameOld?.age, newValue: age };
      addBoardgameHistory(Number(gameId), {
        action: "update",
        updated_by: userId,
        changes
      });
    }

    updateAgeModel(Number(age), gameId); // mysql
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export const updateWeight = async (req: Request, res: Response) => {
  try {
    const gameId = req.params.gameId;
    const { weight } = boardgameUpdateWeightSchema.parse(req.body);

    res.status(201).json({
      success: true,
      message: req.t("boardgame.update.name.success"),
    });

    const userId = req.user?.id;
    if (userId) {
      const gameOld = await getBoardgameDetails(Number(gameId));
      let changes: Record<string, { oldValue: any; newValue: any }> = {};

      changes.weight = { oldValue: gameOld?.weight, newValue: weight };
      addBoardgameHistory(Number(gameId), {
        action: "update",
        updated_by: userId,
        changes
      });
    }

    UpdateWeightModel(Number(weight), gameId); // mysql
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export const updateBBGLink = async (req: Request, res: Response) => {
  try {
    const gameId = req.params.gameId;
    const { BGGLink } = req.body;
    UpdateBBGLink(BGGLink, gameId);

    res.status(201).json({
      success: true,
      message: req.t("boardgame.update.bgglink.success"),
    });

    const userId = req.user?.id;
    if (userId) {
      const gameOld = await getBoardgameDetails(Number(gameId));
      let changes: Record<string, { oldValue: any; newValue: any }> = {};

      changes.boardgamegeek_url = { oldValue: gameOld?.boardgamegeek_url, newValue: BGGLink };
      addBoardgameHistory(Number(gameId), {
        action: "update",
        updated_by: userId,
        changes
      });
    }
  } catch (err) {
    console.error("Error update BGGLink boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const updateShortcut = async (req: Request, res: Response) => {
  try {
    const gameId = req.params.gameId;
    const { shortcut } = req.body;

    res.status(201).json({
      success: true,
      message: req.t("boardgame.update.shortcut.success"),
    });

    const userId = req.user?.id;
    if (userId) {
      const gameOld = await getBoardgameDetails(Number(gameId));
      let changes: Record<string, { oldValue: any; newValue: any }> = {};

      changes.shortcut = { oldValue: gameOld?.shortcut, newValue: shortcut };
      addBoardgameHistory(Number(gameId), {
        action: "update",
        updated_by: userId,
        changes
      });
    }
    UpdateShortcut(shortcut, gameId);
  } catch (err) {
    console.error("Error update shortcut boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const updateDescription = async (req: Request, res: Response) => {
  try {
    const gameId = req.params.gameId;
    const { description } = req.body;

    res.status(201).json({
      success: true,
      message: req.t("boardgame.update.description.success"),
    });
    UpdateDescription(description, gameId); //mysql
    const userId = req.user?.id;
    if (userId) {
      const gameOld = await getBoardgameDetails(Number(gameId));
      let changes: Record<string, { oldValue: any; newValue: any }> = {};

      changes.description = { oldValue: gameOld?.description, newValue: description };
      addBoardgameHistory(Number(gameId), {
        action: "update",
        updated_by: userId,
        changes
      });
    } // history
  } catch (err) {
    console.error("Error update shortcut boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const updateNumberPlayers = async (req: Request, res: Response) => {
  try {
    const gameId = req.params.gameId;
    const { minPlayers, maxPlayers } = req.body;

    res.status(201).json({
      success: true,
      message: req.t("boardgame.update.number-player.success"),
    });

    const userId = req.user?.id;
    if (userId) {
      const gameOld = await getBoardgameDetails(Number(gameId));
      let changes: Record<string, { oldValue: any; newValue: any }> = {};

      changes.numberPlayer = {
        oldValue: {
          min_players: gameOld?.min_players,
          maxPlayers: gameOld?.max_players
        },
        newValue:
        {
          min_players: minPlayers,
          max_players: maxPlayers
        }
      };
      addBoardgameHistory(Number(gameId), {
        action: "update",
        updated_by: userId,
        changes
      });
    } // history
    UpdateNumeberPlayers(minPlayers, maxPlayers, gameId); // mysql
  } catch (err) {
    console.error("Error update shortcut boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const updateDuration = async (req: Request, res: Response) => {
  try {
    const gameId = req.params.gameId;
    const { min, max } = req.body;

    res.status(201).json({
      success: true,
      message: req.t("boardgame.update.duration.success"),
    });

    const userId = req.user?.id;
    if (userId) {
      const gameOld = await getBoardgameDetails(Number(gameId));
      let changes: Record<string, { oldValue: any; newValue: any }> = {};

      changes.numberPlayer = {
        oldValue: {
          min_play_time: gameOld?.min_play_time,
          max_play_time: gameOld?.max_play_time
        },
        newValue:
        {
          min_play_time: min,
          max_play_time: max
        }
      };
      addBoardgameHistory(Number(gameId), {
        action: "update",
        updated_by: userId,
        changes
      });
    } // history
    UpdateDuration(min, max, gameId);
  } catch (err) {
    console.error("Error update shortcut boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const updateAvatar = async (req: Request, res: Response) => {
  try {
    const gameId = req.params.gameId;
    const { url } = req.body;

    res.status(201).json({
      success: true,
      message: req.t("boardgame.update.duration.success"),
    });

    const userId = req.user?.id;
    if (userId) {
      const gameOld = await getBoardgameDetails(Number(gameId));
      let changes: Record<string, { oldValue: any; newValue: any }> = {};

      changes.avatar_url = { oldValue: gameOld?.avatar_url, newValue: url };
      addBoardgameHistory(Number(gameId), {
        action: "update",
        updated_by: userId,
        changes
      });
    } // history


    UpdateAvatar(url, gameId);
  } catch (err) {
    console.error("Error update shortcut boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const updateBackground = async (req: Request, res: Response) => {
  try {
    const gameId = req.params.gameId;
    const { url } = req.body;
    res.status(201).json({
      success: true,
      message: req.t("boardgame.update.duration.success"),
    });

    const userId = req.user?.id;
    if (userId) {
      const gameOld = await getBoardgameDetails(Number(gameId));
      let changes: Record<string, { oldValue: any; newValue: any }> = {};

      changes.background_image_url = { oldValue: gameOld?.background_image_url, newValue: url };
      addBoardgameHistory(Number(gameId), {
        action: "update",
        updated_by: userId,
        changes
      });
    } // history
    UpdateBackground(url, gameId);
  } catch (err) {
    console.error("Error update shortcut boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

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
      return ;
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
