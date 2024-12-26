import { Request, Response } from "express";

export const addBoardgame = async (req: Request, res: Response) => {
  const { name, boardgamegeek_url } = req.body;

  try {


    res.status(201).json({
      success: true,
      message: "Boardgame created successfully",
    //   boardgame_id: result.insertId,
    });
  } catch (err) {
    console.error("Error adding boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
