import connection from "@/config/database/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Image,  } from "@/types/models/Boardgame"
import { ImageStatus } from "@/types/models/Boardgame";


export const addImage = async (
  boardgame_id: number,
  user_id: number,
  url: string,
  status: ImageStatus
): Promise<number> => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO boardgame_images (boardgame_id, user_id, image_url, status)
      VALUES (?, ?, ?, ?);
    `;

    connection.query(
      query,
      [boardgame_id, user_id, url, status],
      (error, result: ResultSetHeader) => {
        if (error) {
          console.error("Error add image tutorial:", error);
          return reject("Failed to create video tutorial.");
        }
        resolve(result.insertId);
      }
    );
  });
};

export const getImageById = async (image_id: number): Promise<Image | null> => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM boardgame_images WHERE image_id = ?";

    connection.query(query, [image_id], (error, result: RowDataPacket[]) => {
      if (error) {
        console.error("Error retrieving video tutorial by ID:", error);
        return reject("Failed to retrieve video tutorial.");
      }
      resolve(result.length > 0 ? (result[0] as Image) : null);
    });
  });
};

export const getImagesByGameId = async (boardgame_id: number): Promise<Image[]> => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM boardgame_images WHERE boardgame_id = ?";

    connection.query(query, [boardgame_id], (error, result: RowDataPacket[]) => {
      if (error) {
        console.error("Error retrieving video tutorials by game ID:", error);
        return reject("Failed to retrieve video tutorials.");
      }
      resolve(result.length > 0 ? (result as Image[]) : []);
    });
  });
};

export const updateStatus = async (image_id: number, newStatus: ImageStatus): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE boardgame_images
      SET status = ?
      WHERE image_id = ?;
    `;

    connection.query(query, [newStatus, image_id], (error) => {
      if (error) {
        console.error("Error toggling image tutorial status:", error);
        return reject("Failed to toggle image tutorial status.");
      }
      resolve();
    });
  });
};

export const deleteImage = async (imageId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query = `
      DELETE FROM boardgame_images
      WHERE image_id = ?;
    `;

    connection.query(query, [imageId], (error) => {
      if (error) {
        console.error("Error deleting image from boardgame:", error);
        return reject("Failed to delete the image from boardgame.");
      }
      resolve();
    });
  });
};

