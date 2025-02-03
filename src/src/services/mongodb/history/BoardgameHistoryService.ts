import { Boardgame, BoardgameHistory } from "@/models/history/BoargameHistoryModel";

/**
 * Add a history entry for a specific boardgame.
 * @param boardgameId - ID of the boardgame.
 * @param history - Details about the history event.
 */
export const addBoardgameHistory = async (
  boardgameId: number,
  history: BoardgameHistory
): Promise<void> => {
  // Check if the boardgame document already exists
  const boardgame = await Boardgame.findOne({ boardgame_id: boardgameId });

  if (!boardgame) {
    await Boardgame.create({
      boardgame_id: boardgameId,
      histories: [history],
    });
    return;
  }

  // Append the new history entry and save
  console.log(boardgame);
  boardgame.histories.push(history);
  await boardgame.save();
};

/**
 * Retrieve all history entries for a specific boardgame.
 * @param boardgameId - ID of the boardgame.
 * @returns Array of history entries or an empty array if no history exists.
 */
export const getBoardgameHistories = async (
  boardgameId: number
): Promise<BoardgameHistory[]> => {
  const boardgame = await Boardgame.findOne({ boardgame_id: boardgameId });
  return boardgame?.histories || [];
};

/**
 * Delete a boardgame history document (optional utility function).
 * @param boardgameId - ID of the boardgame to delete.
 * @returns Whether the delete operation was successful.
 */
export const deleteBoardgameHistory = async (
  boardgameId: number
): Promise<boolean> => {
  const result = await Boardgame.deleteOne({ boardgame_id: boardgameId });
  return result.deletedCount > 0;
};
