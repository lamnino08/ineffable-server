import connection from "@/config/database/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Status } from "@/types/Enum/Status";

// ✅ Create a new mechanic
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

        connection.query(query, [user_id, name, description, img_url], (error, result: ResultSetHeader) => {
            if (error) {
                console.error("Error creating mechanic:", error);
                return reject("Failed to create mechanic");
            }
            resolve(result.insertId);
        });
    });
};

// ✅ Get mechanic by ID
export const getMechanicById = async (mechanic_id: number): Promise<any | null> => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM boardgame_mechanics WHERE mechanic_id = ?";

        connection.query(query, [mechanic_id], (error, results: RowDataPacket[]) => {
            if (error) {
                console.error("Error fetching mechanic by ID:", error);
                return reject("Failed to fetch mechanic");
            }
            resolve(results.length > 0 ? results[0] : null);
        });
    });
};

// ✅ Update mechanic details
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

// ✅ Delete mechanic
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

// ✅ Get all mechanics (optional: filter by status/search)
export const getAllMechanics = async (
    filters?: { status?: string; search?: string },
    pagination?: { limit?: number; offset?: number }
): Promise<any[]> => {
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

        if (pagination?.limit) {
            query += " LIMIT ?";
            values.push(pagination.limit);
        }
        if (pagination?.offset) {
            query += " OFFSET ?";
            values.push(pagination.offset);
        }

        connection.query(query, values, (error, results: RowDataPacket[]) => {
            if (error) {
                console.error("Error fetching mechanics:", error);
                return reject("Failed to fetch mechanics");
            }
            resolve(results);
        });
    });
};

export const addMechanicToBoardgame = async (boardgameId: number, mechanicId: number, userId: number, status: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const query = `
        INSERT INTO mechanic_of_boardgame (boardgame_id, mechanic_id, user_id, create_at)
        VALUES (?, ?, ?, NOW());
      `;

        connection.query(query, [boardgameId, mechanicId, userId], (error) => {
            if (error) {
                console.error("Error adding mechanic to boardgame:", error);
                return reject("Failed to add mechanic to boardgame.");
            }
            resolve();
        });
    });
};

export const getMechanicsByBoardgame = async (boardgameId: number): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT m.*
        FROM mechanic_of_boardgame mob
        INNER JOIN boardgame_mechanics m ON mob.mechanic_id = m.mechanic_id
        WHERE mob.boardgame_id = ?;
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

export const removeMechanicFromBoardgame = async (boardgameId: number, mechanicId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        const query = `
        DELETE FROM mechanic_of_boardgame
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

export const getBoardgamesByMechanic = async (mechanicId: number): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT b.*
        FROM mechanic_of_boardgame mob
        INNER JOIN boardgames b ON mob.boardgame_id = b.boardgame_id
        WHERE mob.mechanic_id = ?;
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
  

