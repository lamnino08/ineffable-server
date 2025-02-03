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
} from "@/models/boardgame/boardgameMechanicModel";
import { Role } from "@/types/Enum/Role";
import { boardgameMechanicSchema } from "@/validation/boardgameValidation";

// ✅ Create a new mechanic
export const createNewMechanic = async (req: Request, res: Response): Promise<void> => {
  const { name, description, img_url } = boardgameMechanicSchema.parse(req.body)

  try {
    if (req.user) {
        const mechanicId = await createMechanic(req.user?.id, name, description, img_url);
        res.status(201).json({
          success: true,
          message: "Mechanic created successfully",
          data: mechanicId,
        });
    }
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
  const { name, description, img_url } = req.body;

  try {
    await updateMechanic(Number(mechanicId), name, description, img_url);
    res.status(200).json({
      success: true,
      message: "Mechanic updated successfully",
    });
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

// ✅ Get all mechanics (optional: filter by search)
export const getAllMechanicList = async (req: Request, res: Response) => {
  const filters = {
    status: req.query.status as string,
    search: req.query.search as string,
  };
  const pagination = {
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
  };

  try {
    const mechanics = await getAllMechanics(filters, pagination);
    res.status(200).json({
      success: true,
      message: "Fetched all mechanics successfully",
      data: mechanics,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch mechanics" });
  }
};

// ✅ Add a mechanic to a boardgame
export const addMechanicToBoardgameController = async (req: Request, res: Response): Promise<void> => {
  const { boardgameId, mechanicId } = req.body;
  const userId = req.user?.id; // Get user ID from request

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await addMechanicToBoardgame(Number(boardgameId), Number(mechanicId), userId, "ACTIVE");

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
