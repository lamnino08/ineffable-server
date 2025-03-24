import { Request, Response } from "express";
import {
  createMechanic,
  getMechanicById,
  updateMechanic,
  deleteMechanic,
  getAllMechanics,
  addMechanicToBoardgame,
  getMechanicsByBoardgame,
  removeMechanicFromBoardgame,
  getBoardgamesByMechanic,
  updateMechanicStatus,
} from "@/models/boardgame/boardgameMechanicModel";
import { Role } from "@/types/Enum/Role";
import { boardgameMechanicSchema } from "@/validation/boardgameValidation";
import { MechanicHistory } from "@/models/history/MechanicHistoryModel";
import { addMechanicHistory, getMechanicHistories } from "@/services/mongodb/history/MechanicHistoryService";
import { getUserNameById } from "@/models/userModel";
import { Status } from "@/types/Enum/Status";
import { addLikeToMechanic, getListLikeCount, hasUserLikedMechanic, removeLikeFromMechanic } from "@/services/redis/mechanicLiked";
import { addMechanicToUserLikes, getUserLikedMechanics, removeMechanicFromUserLikes } from "@/services/mongodb/like/mechanicLike";
import { addMechanicToGame, likeMechanicAction, unlikeMechanicAction } from "@/services/redis/boardgameMechanic";
import { BoardgameHistory } from "@/models/history/BoargameHistoryModel";
import { addBoardgameHistory } from "@/services/mongodb/history/BoardgameHistoryService";

// ✅ Create a new mechanic
export const createNewMechanic = async (req: Request, res: Response): Promise<void> => {
  const { name, description, img_url } = boardgameMechanicSchema.parse(req.body);

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {

    const mechanicId = await createMechanic(req.user.id, name, description, img_url);

    const history: MechanicHistory = {
      action: "create",
      updated_by: req.user.id,
      changes: {
        name: { oldValue: null, newValue: name },
        description: { oldValue: null, newValue: description },
        img_url: { oldValue: null, newValue: img_url },
        status: { oldValue: null, newValue: "public" },
      },
    };

    res.status(201).json({
      success: true,
      message: "Mechanic created successfully",
      data: mechanicId,
    });

    await addMechanicHistory(mechanicId, history);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create mechanic" });
  }
};

// ✅ Get mechanic by ID
export const getMechanic = async (req: Request, res: Response): Promise<void> => {
  const { mechanicId } = req.params;

  try {
    const mechanic = await getMechanicById(Number(mechanicId));
    if (!mechanic) {
      res.status(404).json({ error: "Mechanic not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: mechanic,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch mechanic" });
  }
};

// ✅ Update a mechanic
export const updateMechanicDetails = async (req: Request, res: Response) => {
  const { mechanicId } = req.params;
  const { name, description, img_url } = boardgameMechanicSchema.parse(req.body);

  try {
    // 1. get old version of mechanic
    const mechanicOld = await getMechanicById(Number(mechanicId));
    if (!mechanicOld) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    // 2. detect changes
    const changes: Record<string, { oldValue: any; newValue: any }> = {};

    if (name && name !== mechanicOld.name) {
      changes["name"] = { oldValue: mechanicOld.name, newValue: name };
    }
    if (description && description !== mechanicOld.description) {
      changes["description"] = { oldValue: mechanicOld.description, newValue: description };
    }
    if (img_url && img_url !== mechanicOld.img_url) {
      changes["img_url"] = { oldValue: mechanicOld.img_url, newValue: img_url };
    }

    // 3. update mechanic
    await updateMechanic(Number(mechanicId), name, description, img_url);

    // 4. return response
    res.status(200).json({
      success: true,
      message: "Mechanic updated successfully",
    });

    // 5. add mechanic history
    if (req.user) {
      if (Object.keys(changes).length > 0) {
        const history: MechanicHistory = {
          action: "update",
          updated_by: req.user.id,
          changes,
        };
        await addMechanicHistory(Number(mechanicId), history);
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update mechanic" });
  }
};

export const toggleStatus = async (req: Request, res: Response) => {
  const { mechanicId } = req.params;

  try {
    const mechanicOld = await getMechanicById(Number(mechanicId));
    if (!mechanicOld) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    const newStatus = mechanicOld.status === "public" ? Status.HIDE : Status.PUBLIC;

    const changes: Record<string, { oldValue: any; newValue: any }> = {};

    changes["status"] = { oldValue: mechanicOld.status, newValue: newStatus };

    await updateMechanicStatus(Number(mechanicId), newStatus);
    res.status(200).json({
      success: true,
      message: "Mechanic updated successfully",
    });

    if (req.user) {
      if (Object.keys(changes).length > 0) {
        const history: MechanicHistory = {
          action: "update",
          updated_by: req.user.id,
          changes,
        };
        await addMechanicHistory(Number(mechanicId), history);
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update mechanic" });
  }
};

// ✅ Delete a mechanic
export const deleteMechanicById = async (req: Request, res: Response) => {
  const { mechanicId } = req.params;

  try {
    await deleteMechanic(Number(mechanicId));
    res.status(200).json({
      success: true,
      message: "Mechanic deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete mechanic" });
  }
};

/**
 * ✅ Get all mechanics (Optional: filter by status & search)
 */
export const getAllMechanicList = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const filters = {
    status: req.query.status as string,
    search: req.query.search as string,
  };

  try {
    // ✅ Lấy danh sách mechanics từ database
    const mechanics = await getAllMechanics(filters);

    // ✅ Lấy số lượng game sử dụng mỗi mechanic từ Redis
    // const gameCounts = await getAllBoardgameCounts();

    // ✅ Lấy danh sách mechanic mà user đã like
    // let likedMechanics: number[] = [];
    // if (req.user) {
    //   likedMechanics = await getUserLikedMechanics(req.user.id);
    // }

    // ✅ Lấy số lượng like của từng mechanic
    // const mechanicIds = mechanics.map(mech => mech.mechanic_id);
    // const likeCounts = await getListLikeCount(mechanicIds);

    // ✅ Gộp dữ liệu số lượng game + số lượng like vào danh sách mechanics
    const mechanicsWithGameCount = mechanics.map(mechanic => ({
      ...mechanic,
      // game_count: gameCounts[mechanic.mechanic_id].count || 0,
      // liked: likedMechanics.includes(mechanic.mechanic_id),
      // like_count: likeCounts[mechanic.mechanic_id] || 0,
    }));

    // ✅ Trả về danh sách mechanics kèm dữ liệu bổ sung
    res.status(200).json({
      success: true,
      message: "Fetched all mechanics successfully",
      data: mechanicsWithGameCount,
    });
  } catch (err) {
    console.error("Error fetching mechanics:", err);
    res.status(500).json({ error: "Failed to fetch mechanics" });
  }
};


/**
 * ✅ Lấy lịch sử cập nhật của một mechanic
 * @route GET /mechanic/history/:mechanicId
 */
export const getMechanicHistory = async (req: Request, res: Response) => {
  try {
    const mechanicId = parseInt(req.params.mechanicId, 10);
    const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    const action = req.query.action ? (req.query.action as string).toLowerCase() : undefined;

    // ✅ Danh sách action hợp lệ
    const allowedActions = ["create", "update", "delete"];
    if (action && !allowedActions.includes(action)) {
      res.status(400).json({
        success: false,
        error: "Invalid action type. Allowed values: CREATE, UPDATE, DELETE",
      });
      return;
    }

    // ✅ Lấy danh sách lịch sử mechanic từ MongoDB
    const histories = await getMechanicHistories({
      mechanicId,
      userId,
      limit,
      offset,
      action,
    });

    // ✅ Thêm thông tin user vào lịch sử
    const historiesWithUser = await Promise.all(
      histories.map(async (history) => {
        const user = await getUserNameById(history.updated_by);
        return {
          action: history.action,
          changes: history.changes,
          timestamp: history.timestamp,
          updated_by: user
            ? {
              id: history.updated_by,
              username: user.username,
            }
            : null,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Mechanic history retrieved successfully",
      data: historiesWithUser,
    });
  } catch (err) {
    console.error("Error fetching mechanic history:", err);
    res.status(500).json({ success: false, error: "Failed to retrieve history" });
  }
};




/**
 * ✅ Like mechanic
 * @route POST /api/mechanic/like/:mechanicId
 */
export const likeMechanic = async (req: Request, res: Response) => {
  try {
    const { mechanicId } = req.params;

    if (req.user) {
      likeMechanicAction(req.user.id, Number(mechanicId)); // Redis
    }

    res.status(200).json({ success: true, message: "Mechanic liked successfully" });
  } catch (error) {
    console.error("Error liking mechanic:", error);
    res.status(500).json({ error: "Failed to like mechanic" });
  }
};

/**
 * ✅ Unlike mechanic
 * @route DELETE /api/mechanic/unlike/:mechanicId
 */
export const unlikeMechanic = async (req: Request, res: Response) => {
  try {
    const { mechanicId } = req.params;

    if (req.user) {
      await removeLikeFromMechanic(Number(mechanicId), req.user.id); // Redis
      await removeMechanicFromUserLikes(req.user.id, Number(mechanicId)); // MongoDB
    }

    res.status(200).json({ success: true, message: "Mechanic unliked successfully" });
  } catch (error) {
    console.error("Error unliking mechanic:", error);
    res.status(500).json({ error: "Failed to unlike mechanic" });
  }
};

export const checkUserLike = async (req: Request, res: Response) => {
  try {
    const { mechanicId } = req.params;

    if (req.user) {
      unlikeMechanicAction(req.user.id, Number(mechanicId)); // Redis
    }

    res.status(200).json({ success: true, message: "Mechanic unliked successfully" });
  } catch (error) {
    console.error("Error unliking mechanic:", error);
    res.status(500).json({ error: "Failed to unlike mechanic" });
  }
};




/**
 * ✅ Lấy danh sách mechanic mà user đã like
 * @route GET /api/mechanic/liked-mechanics/:userId
 */
export const getUserLikedMechanicsController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ error: "Missing userId" });
      return;
    }

    const likedMechanics = await getUserLikedMechanics(Number(userId));
    res.status(200).json({ userId, likedMechanics });
  } catch (error) {
    console.error("Error fetching user liked mechanics:", error);
    res.status(500).json({ error: "Failed to fetch user liked mechanics" });
  }
};


// ✅ Add a mechanic to a boardgame
export const addMechanicToBoardgameController = async (req: Request, res: Response) => {
  const { gameId, mechanicId } = req.params;

  try {
    await addMechanicToGame(Number(gameId), Number(mechanicId));
    if (req.user) {
          const history: BoardgameHistory = {
            action: "mapping",
            updated_by: req.user.id,
            mapping_details: {
              type: "mechanic",
              item_id: Number(mechanicId),
              action: "add",
            }
          }
          await addBoardgameHistory(Number(gameId), history);
        }

    res.status(201).json({
      success: true,
      message: "Mechanic added to boardgame successfully",
    });
  } catch (err) {
    console.error("Error adding mechanic to boardgame:", err);
    res.status(500).json({ error: "Failed to add mechanic to boardgame" });
  }
};

// ✅ Get all mechanics for a specific boardgame
export const getMechanicsForBoardgame = async (req: Request, res: Response) => {
  const { boardgameId } = req.params;

  try {
    const mechanics = await getMechanicsByBoardgame(Number(boardgameId));
    res.status(200).json({
      success: true,
      data: mechanics,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch mechanics for boardgame" });
  }
};

// ✅ Remove a mechanic from a boardgame
export const removeMechanicFromBoardgameController = async (req: Request, res: Response) => {
  const { boardgameId, mechanicId } = req.body;

  try {
    await removeMechanicFromBoardgame(Number(boardgameId), Number(mechanicId));
    res.status(200).json({
      success: true,
      message: "Mechanic removed from boardgame successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove mechanic from boardgame" });
  }
};

// ✅ Get all boardgames associated with a mechanic
export const getBoardgamesForMechanic = async (req: Request, res: Response) => {
  const { mechanicId } = req.params;

  try {
    const boardgames = await getBoardgamesByMechanic(Number(mechanicId));
    res.status(200).json({
      success: true,
      data: boardgames,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch boardgames for mechanic" });
  }
};
function getMechanicLikeCount(arg0: number) {
  throw new Error("Function not implemented.");
}

