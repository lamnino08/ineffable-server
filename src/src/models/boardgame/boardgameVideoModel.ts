import connection from "@/config/database/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { BoardgameDetails, Rule, VideoTutorial } from "@/types/models/Boardgame"
import { RuleStatus } from "@/types/models/Boardgame";


export const createAVideoTutorial = async (
  boardgame_id: number,
  title: string,
  user_id: number,
  language: string,
  url: string,
  description: string | undefined,
  status: string
): Promise<number> => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO video_tutorials (boardgame_id, title, user_id, language, url, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;

    connection.query(
      query,
      [boardgame_id, title, user_id, language, url, description, status],
      (error, result: ResultSetHeader) => {
        if (error) {
          console.error("Error creating video tutorial:", error);
          return reject("Failed to create video tutorial.");
        }
        resolve(result.insertId);
      }
    );
  });
};

export const getVideoTutorialById = async (video_id: number): Promise<VideoTutorial | null> => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM video_tutorials WHERE video_id = ?";

    connection.query(query, [video_id], (error, result: RowDataPacket[]) => {
      if (error) {
        console.error("Error retrieving video tutorial by ID:", error);
        return reject("Failed to retrieve video tutorial.");
      }
      resolve(result.length > 0 ? (result[0] as VideoTutorial) : null);
    });
  });
};

export const getVideoTutorialsByGameId = async (
  boardgame_id: number,
  limit: number = 10,
  offset: number = 0,
  status?: string
): Promise<VideoTutorial[]> => {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM video_tutorials WHERE boardgame_id = ?`;
    const params: any[] = [boardgame_id];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    connection.query(query, params, (error, result: RowDataPacket[]) => {
      if (error) {
        console.error("❌ Error retrieving video tutorials by game ID:", error);
        return reject("Failed to retrieve video tutorials.");
      }
      resolve(result as VideoTutorial[]);
    });
  });
};


export const updateVideoTutorial = async (
  video_id: number,
  title: string,
  language: string,
  url: string,
  description: string | undefined,
  status: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE video_tutorials
      SET title = ?, language = ?, url = ?, description = ?, status = ?
      WHERE video_id = ?;
    `;

    connection.query(
      query,
      [title, language, url, description, status, video_id],
      (error) => {
        if (error) {
          console.error("Error updating video tutorial:", error);
          return reject("Failed to update video tutorial.");
        }
        resolve();
      }
    );
  });
};

export const updateStatus = async (video_id: number, newStatus: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE video_tutorials
      SET status = ?
      WHERE video_id = ?;
    `;

    connection.query(query, [newStatus, video_id], (error) => {
      if (error) {
        console.error("Error toggling video tutorial status:", error);
        return reject("Failed to toggle video tutorial status.");
      }
      resolve();
    });
  });
};

export const deleteVideo = async (videoId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query = `
      DELETE FROM video_tutorials
      WHERE video_id = ?;
    `;

    connection.query(query, [videoId], (error) => {
      if (error) {
        console.error("Error deleting rule from boardgame:", error);
        return reject("Failed to delete the rule from boardgame.");
      }
      resolve();
    });
  });
};

