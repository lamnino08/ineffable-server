import connection from "@/config/database/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { BoardgameDetails, Rule } from "@/types/models/Boardgame"
import { error } from "console";

export const addBoardgame = async (name: string, user_id: number, BBGLink: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const query: string = "INSERT INTO boardgames (name, created_by, boardgamegeek_url) VALUES (?,?, ?)";

    connection.query(query, [name, user_id, BBGLink], (error, result: ResultSetHeader) => {
      if (error) {
        console.error("Error adding boardgame:", error);
        return reject("Fail to add new boardgame");
      }
      const boardgameId = result.insertId;
      resolve(boardgameId);
    });
  });
};

export const getBoardgameDetails = async (boardgameId: string, isOwner: boolean): Promise<BoardgameDetails | null> => {
  return new Promise((resolve, reject) => {
    const query = `
        SELECT 
            b.*,
            GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') AS category_names,
            GROUP_CONCAT(DISTINCT m.name ORDER BY m.name SEPARATOR ', ') AS mechanic_names
        FROM boardgames b
        LEFT JOIN category_of_boardgame cob ON b.boardgame_id = cob.boardgame_id
        LEFT JOIN boardgame_categories c ON cob.category_id = c.category_id
        LEFT JOIN mechanic_of_boardgame mob ON b.boardgame_id = mob.boardgame_id
        LEFT JOIN boardgame_mechanic m ON mob.mechanic_id = m.mechanic_id
        WHERE b.boardgame_id = ?
        GROUP BY b.boardgame_id;
      `;

    connection.query(query, [boardgameId], (error, results: RowDataPacket[]) => {
      if (error) {
        console.error("Error fetching boardgame details:", error);
        return reject("Failed to fetch boardgame details.");
      }

      if (results.length === 0) {
        return resolve(null);
      }

      const boardgame = results[0];

      try {
        const details: BoardgameDetails = {
          isOwner: isOwner,
          boardgame_id: boardgame.boardgame_id,
          name: boardgame.name,
          description: boardgame.description,
          shortcut: boardgame.shortcut,
          genre: boardgame.genre,
          age_group: boardgame.age_group,
          min_players: boardgame.min_players,
          max_players: boardgame.max_players,
          min_play_time: boardgame.min_play_time,
          max_play_time: boardgame.max_play_time,
          complexity_rating: boardgame.complexity_rating,
          avatar_url: boardgame.avatar_url,
          background_image_url: boardgame.background_image_url,
          boardgamegeek_url: boardgame.boardgamegeek_url,
          is_approved: !!boardgame.is_approved,
          created_by: boardgame.created_by,
          created_at: boardgame.created_at,
          updated_at: boardgame.updated_at,
          categories: boardgame.category_ids ? boardgame.category_ids.split(",") : [],
          mechanics: boardgame.mechanic_ids ? boardgame.mechanic_ids.split(",") : [],
        };

        resolve(details);
      } catch (parseError) {
        console.error("Error parsing boardgame details:", parseError);
        reject("Failed to parse boardgame details.");
      }
    });
  });
};

export const GetAvatar = async (gameId: string): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const query: string = "SELECT avatar_url FROM boardgames WHERE boardgame_id = ?";

    connection.query(query, [gameId], (error, result: RowDataPacket[]) => {
      if (error) {
        console.error("Error getting avatar boardgame:", error);
        return reject("Failed to retrieve the avatar of the boardgame");
      }

      if (result.length > 0 && result[0].avatar_url) {
        resolve(result[0].avatar_url as string);
      } else {
        resolve(null);
      }
    });
  });
};

export const Getbackground = async (gameId: string): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const query: string = "SELECT background_image_url FROM boardgames WHERE boardgame_id = ?";

    connection.query(query, [gameId], (error, result: RowDataPacket[]) => {
      if (error) {
        console.error("Error getting avatar boardgame:", error);
        return reject("Failed to retrieve the avatar of the boardgame");
      }

      if (result.length > 0 && result[0].avatar_url) {
        resolve(result[0].avatar_url as string);
      } else {
        resolve(null);
      }
    });
  });
};

export const updateName = async (name: string, gameId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query: string = "UPDATE boardgames SET name = ? WHERE boardgame_id = ?";

    connection.query(query, [name, gameId], (error, result: ResultSetHeader) => {
      if (error) {
        console.error("Error updating boardgame name:", error);
        return reject("Failed to update the boardgame name");
      }

      if (result.affectedRows === 0) {
        return reject("No boardgame found with the given ID");
      }

      resolve();
    });
  });
};

export const UpdateBBGLink = async (bbgLink: string, gameId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query: string = "UPDATE boardgames SET boardgamegeek_url = ? WHERE boardgame_id = ?";

    connection.query(query, [bbgLink, gameId], (error, result: ResultSetHeader) => {
      if (error) {
        console.error("Error updating BoardGameGeek link:", error);
        return reject("Failed to update the BoardGameGeek link");
      }

      if (result.affectedRows === 0) {
        return reject("No boardgame found with the given ID");
      }

      resolve();
    });
  });
};

export const UpdateShortcut = async (shortcut: string, gameId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query: string = "UPDATE boardgames SET shortcut = ? WHERE boardgame_id = ?";

    connection.query(query, [shortcut, gameId], (error, result: ResultSetHeader) => {
      if (error) {
        console.error("Error updating BoardGameGeek shortcut:", error);
        return reject("Failed to update the BoardGameGeek shortcut");
      }

      if (result.affectedRows === 0) {
        return reject("No boardgame found with the given ID");
      }

      resolve();
    });
  });
};

export const UpdateDescription = async (description: string, gameId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query: string = "UPDATE boardgames SET description = ? WHERE boardgame_id = ?";

    connection.query(query, [description, gameId], (error, result: ResultSetHeader) => {
      if (error) {
        console.error("Error updating BoardGameGeek description:", error);
        return reject("Failed to update the BoardGameGeek description");
      }

      if (result.affectedRows === 0) {
        return reject("No boardgame found with the given ID");
      }

      resolve();
    });
  });
};

export const UpdateNumeberPlayers = async (minPlayers: string, maxPlayers: string, gameId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query: string = "UPDATE boardgames SET min_players = ?, max_players = ? WHERE boardgame_id = ?";

    connection.query(query, [minPlayers, maxPlayers, gameId], (error, result: ResultSetHeader) => {
      if (error) {
        console.error("Error updating BoardGameGeek number players:", error);
        return reject("Failed to update the BoardGameGeek number players");
      }

      if (result.affectedRows === 0) {
        return reject("No boardgame found with the given ID");
      }

      resolve();
    });
  });
};

export const UpdateDuration = async (min_time: string, max_time: string, gameId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query: string = "UPDATE boardgames SET min_play_time = ?, max_play_time = ? WHERE boardgame_id = ?";

    connection.query(query, [min_time, max_time, gameId], (error, result: ResultSetHeader) => {
      if (error) {
        console.error("Error updating BoardGameGeek duration:", error);
        return reject("Failed to update the BoardGameGeek duration");
      }

      if (result.affectedRows === 0) {
        return reject("No boardgame found with the given ID");
      }

      resolve();
    });
  });
};

export const UpdateAvatar = async (url: string, gameId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query: string = "UPDATE boardgames SET avatar_url = ? WHERE boardgame_id = ?";

    connection.query(query, [url, gameId], (error, result: ResultSetHeader) => {
      if (error) {
        console.error("Error updating avatar boardgame:", error);
        return reject("Failed to update the avatar boardgame");
      }

      if (result.affectedRows === 0) {
        return reject("No boardgame found with the given ID");
      }

      resolve();
    });
  });
};

export const UpdateBackground = async (url: string, gameId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query: string = "UPDATE boardgames SET background_image_url = ? WHERE boardgame_id = ?";

    connection.query(query, [url, gameId], (error, result: ResultSetHeader) => {
      if (error) {
        console.error("Error updating background boardgame:", error);
        return reject("Failed to update the avatar boardgame");
      }

      if (result.affectedRows === 0) {
        return reject("No boardgame found with the given ID");
      }

      resolve();
    });
  });
};

