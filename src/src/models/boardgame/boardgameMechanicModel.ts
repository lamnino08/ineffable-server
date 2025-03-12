import connection from "@/config/database/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { BoardgameMechanic } from "@/types/models/Boardgame";
import { Status } from "@/types/Enum/Status";

// ✅ Tạo cơ chế mới (Create Mechanic)
export const createMechanic = async (
  user_id: number,
  name: string,
  description: string,
  img_url: string,
): Promise<number> => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO boardgame_mechanics (user_id, name, description, img_url)
      VALUES (?, ?, ?, ?);
    `;

    connection.query(
      query,
      [user_id, name, description, img_url],
      (error, result: ResultSetHeader) => {
        if (error) {
          console.error("Error creating mechanic:", error);
          return reject("Failed to create mechanic");
        }
        resolve(result.insertId);
      }
    );
  });
};

// ✅ Lấy cơ chế theo ID (Read Mechanic)
export const getMechanicById = async (mechanic_id: number): Promise<BoardgameMechanic | null> => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM boardgame_mechanics WHERE mechanic_id = ?";

    connection.query(query, [mechanic_id], (error, results: RowDataPacket[]) => {
      if (error) {
        console.error("Error fetching mechanic by ID:", error);
        return reject("Failed to fetch mechanic");
      }
      if (results.length > 0) {
        resolve(results[0] as BoardgameMechanic);
      } else {
        resolve(null);
      }
    });
  });
};

// ✅ Cập nhật thông tin cơ chế (Update Mechanic)
export const updateMechanic = async (
  mechanic_id: number,
  name: string,
  description: string,
  img_url: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE boardgame_mechanics
      SET name = ?, description = ?, img_url = ?
      WHERE mechanic_id = ?;
    `;

    connection.query(query, [name, description, img_url, mechanic_id], (error) => {
      if (error) {
        console.error("Error updating mechanic:", error);
        return reject("Failed to update mechanic");
      }
      resolve();
    });
  });
};

// ✅ Cập nhật trạng thái của cơ chế (Update Status)
export const updateMechanicStatus = async (
  mechanic_id: number,
  status: Status
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE boardgame_mechanics
      SET status = ?
      WHERE mechanic_id = ?;
    `;

    connection.query(query, [status, mechanic_id], (error) => {
      if (error) {
        console.error("Error updating mechanic status:", error);
        return reject("Failed to update mechanic status");
      }
      resolve();
    });
  });
};

// ✅ Xóa cơ chế (Delete Mechanic)
export const deleteMechanic = async (mechanic_id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM boardgame_mechanics WHERE mechanic_id = ?";

    connection.query(query, [mechanic_id], (error) => {
      if (error) {
        console.error("Error deleting mechanic:", error);
        return reject("Failed to delete mechanic");
      }
      resolve();
    });
  });
};

// ✅ Lấy danh sách cơ chế (Get All Mechanics)
export const getAllMechanics = async (
  filters?: { status?: string; search?: string },
): Promise<BoardgameMechanic[]> => {
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM boardgame_mechanics WHERE 1=1";
    const values: any[] = [];

    if (filters?.status) {
      query += " AND status = ?";
      values.push(filters.status);
    }

    if (filters?.search) {
      query += " AND (name LIKE ? OR description LIKE ?)";
      const searchTerm = `%${filters.search}%`;
      values.push(searchTerm, searchTerm);
    }

    connection.query(query, values, (error, results: RowDataPacket[]) => {
      if (error) {
        console.error("Error fetching mechanics:", error);
        return reject("Failed to fetch mechanics");
      }
      resolve(results as BoardgameMechanic[]);
    });
  });
};

/**
 * ✅ Like a mechanic (prevents duplicates)
 */
export const likeMechanic = async (user_id: number, mechanic_id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query = "INSERT IGNORE INTO mechanic_likes (user_id, mechanic_id) VALUES (?, ?)";

    connection.query(query, [user_id, mechanic_id], (error) => {
      if (error) {
        console.error("❌ Error liking mechanic:", error);
        return reject("Failed to like mechanic");
      }
      resolve();
    });
  });
};

/**
 * ✅ Unlike a mechanic
 */
export const unlikeMechanic = async (user_id: number, mechanic_id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM mechanic_likes WHERE user_id = ? AND mechanic_id = ?";

    connection.query(query, [user_id, mechanic_id], (error) => {
      if (error) {
        console.error("❌ Error unliking mechanic:", error);
        return reject("Failed to unlike mechanic");
      }
      resolve();
    });
  });
};

export const getAllMechanicLikes = async (): Promise<{ mechanicId: number; likeCount: number }[]> => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT mechanic_id, COUNT(*) AS likeCount
      FROM mechanic_likes
      GROUP BY mechanic_id;
    `;

    connection.query(query, (error, results: RowDataPacket[]) => {
      if (error) {
        console.error("❌ Error fetching mechanic like counts:", error);
        return reject("Failed to fetch mechanic like counts.");
      }

      resolve(results.map(row => ({
        mechanicId: row.mechanic_id,
        likeCount: row.likeCount,
      })));
    });
  });
};

/**
 * ✅ Check if user liked a mechanic
 */
export const checkUserLikedMechanic = async (user_id: number, mechanic_id: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT EXISTS (
        SELECT 1 FROM mechanic_likes WHERE user_id = ? AND mechanic_id = ?
      ) AS liked;
    `;

    connection.query(query, [user_id, mechanic_id], (error, results: RowDataPacket[]) => {
      if (error) {
        console.error("❌ Error checking user like mechanic:", error);
        return reject("Failed to check mechanic like");
      }
      resolve(Boolean(results[0].liked));
    });
  });
};

export const getMechanicLikesCount = async (mechanic_id: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const query = "SELECT COUNT(*) AS total FROM mechanic_likes WHERE mechanic_id = ?;";

    connection.query(query, [mechanic_id], (error, results: RowDataPacket[]) => {
      if (error) {
        console.error("Error unlike mechanic:", error);
        return reject("Failed unlike mechanic");
      }
      resolve(results[0].total);
    });
  });
};


// ✅ Thêm Mechanic vào Boardgame
export const addMechanicToBoardgame = async (
  boardgameId: number,
  mechanicId: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO boardgame_mechanics_mapping (boardgame_id, mechanic_id)
      VALUES (?, ?);
    `;

    connection.query(query, [boardgameId, mechanicId], (error) => {
      if (error) {
        console.error("Error adding mechanic to boardgame:", error);
        return reject("Failed to add mechanic to boardgame.");
      }
      resolve();
    });
  });
};

// ✅ Lấy danh sách Mechanics của Boardgame
export const getMechanicsByBoardgame = async (
  boardgameId: number
): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT m.*
      FROM boardgame_mechanics_mapping bmm
      INNER JOIN boardgame_mechanics m ON bmm.mechanic_id = m.mechanic_id
      WHERE bmm.boardgame_id = ?;
    `;

    connection.query(query, [boardgameId], (error, results: RowDataPacket[]) => {
      if (error) {
        console.error("Error retrieving mechanics for boardgame:", error);
        return reject("Failed to retrieve mechanics for boardgame.");
      }
      resolve(results);
    });
  });
};

// ✅ Xóa Mechanic khỏi Boardgame
export const removeMechanicFromBoardgame = async (
  boardgameId: number,
  mechanicId: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query = `
      DELETE FROM boardgame_mechanics_mapping
      WHERE boardgame_id = ? AND mechanic_id = ?;
    `;

    connection.query(query, [boardgameId, mechanicId], (error) => {
      if (error) {
        console.error("Error removing mechanic from boardgame:", error);
        return reject("Failed to remove mechanic from boardgame.");
      }
      resolve();
    });
  });
};

// ✅ Lấy danh sách Boardgames có Mechanic nhất định
export const getBoardgamesByMechanic = async (
  mechanicId: number
): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT b.*
      FROM boardgame_mechanics_mapping bmm
      INNER JOIN boardgames b ON bmm.boardgame_id = b.boardgame_id
      WHERE bmm.mechanic_id = ?;
    `;

    connection.query(query, [mechanicId], (error, results: RowDataPacket[]) => {
      if (error) {
        console.error("Error retrieving boardgames for mechanic:", error);
        return reject("Failed to retrieve boardgames for mechanic.");
      }
      resolve(results);
    });
  });
};


// ✅ Lấy danh sách Boardgames có Mechanic nhất định
export const getBoardgameCountByMechanic = async (mechanicId: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COUNT(*) AS count
      FROM boardgame_mechanics_mapping
      WHERE mechanic_id = ?;
    `;

    connection.query(query, [mechanicId], (error, results: RowDataPacket[]) => {
      if (error) {
        console.error("Error retrieving boardgame count for mechanic:", error);
        return reject("Failed to retrieve boardgame count for mechanic.");
      }
      resolve(results[0].count); // Directly return the count instead of an array
    });
  });
};
