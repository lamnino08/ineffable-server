// Model category of boardgame

import connection from "@/config/database/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { BoardgameCategoryStatus, BoardgameCategory } from "@/types/models/Boardgame"; // Import loại dữ liệu nếu bạn có enum cho `status`
import { Status } from "@/types/Enum/Status";

// Category
export const createCategory = async (
  user_id: number,
  name: string,
  description: string,
  img_url: string,
  status: Status
): Promise<number> => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO boardgame_categories (user_id, name, description, img_url, status)
      VALUES (?, ?, ?, ?, ?);
    `;

    connection.query(
      query,
      [user_id, name, description, img_url, status],
      (error, result: ResultSetHeader) => {
        if (error) {
          console.error("Error creating category:", error);
          return reject("Failed to create category");
        }
        resolve(result.insertId); // Return the inserted category_id
      }
    );
  });
};

export const getCategoryById = async (category_id: number): Promise<BoardgameCategory | null> => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM boardgame_categories WHERE category_id = ?";

    connection.query(query, [category_id], (error, results: RowDataPacket[]) => {
      if (error) {
        console.error("Error fetching category by ID:", error);
        return reject("Failed to fetch category");
      }
      if (results.length > 0) {
        resolve(results[0] as BoardgameCategory); // Cast result to `Category`
      } else {
        resolve(null); // Return null if not found
      }
    });
  });
};

export const updateCategory = async (
  category_id: number,
  name: string,
  description: string,
  img_url: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE boardgame_categories
      SET name = ?, description = ?, img_url = ?
      WHERE category_id = ?;
    `;

    connection.query(
      query,
      [name, description, img_url, category_id],
      (error) => {
        if (error) {
          console.error("Error updating category:", error);
          return reject("Failed to update category");
        }
        resolve();
      }
    );
  });
};

export const deleteCategory = async (category_id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM boardgame_categories WHERE category_id = ?";

    connection.query(query, [category_id], (error) => {
      if (error) {
        console.error("Error deleting category:", error);
        return reject("Failed to delete category");
      }
      resolve();
    });
  });
};

export const getAllCategories = async (
  user_id?: number,
  filters?: { status?: string; search?: string },
  pagination?: { limit?: number; offset?: number }
): Promise<BoardgameCategory[]> => {
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM boardgame_categories WHERE 1=1"; 
    const values: any[] = [];

    if (user_id) {
      query += " AND user_id = ?";
      values.push(user_id);
    }

    // Filter by `status` if provided
    if (filters?.status) {
      query += " AND status = ?";
      values.push(filters.status);
    }

    // Search by name or description
    if (filters?.search) {
      query += " AND (name LIKE ? OR description LIKE ?)";
      const searchTerm = `%${filters.search}%`;
      values.push(searchTerm, searchTerm);
    }

    // Add pagination
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
        console.error("Error fetching categories:", error);
        return reject("Failed to fetch categories");
      }
      resolve(results as BoardgameCategory[]); 
    });
  });
};



export const addCategoryToBoardgame = async (
  boardgameId: number,
  categoryId: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO boardgame_categories_mapping (boardgame_id, category_id)
      VALUES (?, ?);
    `;

    connection.query(query, [boardgameId, categoryId], (error) => {
      if (error) {
        console.error("Error adding category to boardgame:", error);
        return reject("Failed to add category to boardgame.");
      }
      resolve();
    });
  });
};
 
// Category and boardgame
export const getCategoriesByBoardgame = async (
  boardgameId: number
): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT c.*
      FROM boardgame_categories_mapping bcm
      INNER JOIN category c ON bcm.category_id = c.category_id
      WHERE bcm.boardgame_id = ?;
    `;

    connection.query(query, [boardgameId], (error, results: RowDataPacket[]) => {
      if (error) {
        console.error("Error retrieving categories for boardgame:", error);
        return reject("Failed to retrieve categories for boardgame.");
      }
      resolve(results);
    });
  });
};

export const removeCategoryFromBoardgame = async (
  boardgameId: number,
  categoryId: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query = `
      DELETE FROM boardgame_categories_mapping
      WHERE boardgame_id = ? AND category_id = ?;
    `;

    connection.query(query, [boardgameId, categoryId], (error) => {
      if (error) {
        console.error("Error removing category from boardgame:", error);
        return reject("Failed to remove category from boardgame.");
      }
      resolve();
    });
  });
};

export const getBoardgamesByCategory = async (
  categoryId: number
): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT b.*
      FROM boardgame_categories_mapping bcm
      INNER JOIN boardgames b ON bcm.boardgame_id = b.boardgame_id
      WHERE bcm.category_id = ?;
    `;

    connection.query(query, [categoryId], (error, results: RowDataPacket[]) => {
      if (error) {
        console.error("Error retrieving boardgames for category:", error);
        return reject("Failed to retrieve boardgames for category.");
      }
      resolve(results);
    });
  });
};
