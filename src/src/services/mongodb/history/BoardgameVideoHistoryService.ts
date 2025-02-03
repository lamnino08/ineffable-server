import { BoardgameVideo, BoardgameVideoHistory } from "@/models/history/BoardgameVideoHistoryModel";

/**
 * Add a history entry for a specific video.
 * @param videoId - ID of the video.
 * @param history - Details about the history event.
 */
export const addVideoHistory = async (
  videoId: number,
  history: BoardgameVideoHistory
): Promise<void> => {
  // Check if the video document already exists
  const video = await BoardgameVideo.findOne({ video_id: videoId });

  if (!video) {
    // Create a new video document with the initial history entry
    await BoardgameVideo.create({
      video_id: videoId,
      histories: [history],
    });
    return;
  }

  // Append the new history entry and save
  video.histories.push(history);
  await video.save();
};

/**
 * Retrieve all history entries for a specific video.
 * @param videoId - ID of the video.
 * @returns Array of history entries or an empty array if no history exists.
 */
export const getVideoHistories = async (
  videoId: number
): Promise<BoardgameVideoHistory[]> => {
  const video = await BoardgameVideo.findOne({ video_id: videoId });
  return video?.histories || [];
};

/**
 * Delete a video history document (optional utility function).
 * @param videoId - ID of the video to delete.
 * @returns Whether the delete operation was successful.
 */
export const deleteVideoHistory = async (videoId: number): Promise<boolean> => {
  const result = await BoardgameVideo.deleteOne({ video_id: videoId });
  return result.deletedCount > 0;
};
