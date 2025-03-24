// Model category of boardgame

import connection from "@/config/database/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { BoardgameCategory } from "@/types/models/Boardgame"; // Import loại dữ liệu nếu bạn có enum cho `status`
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

export const updateStatus = async (
  category_id: number,
  status: Status
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE boardgame_categories
      SET status = ?
      WHERE category_id = ?;
    `;

    connection.query(
      query,
      [status, category_id],
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
  filters?: { status?: string; search?: string },
): Promise<BoardgameCategory[]> => {
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM boardgame_categories WHERE 1=1";
    const values: any[] = [];

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

    connection.query(query, values, (error, results: RowDataPacket[]) => {
      if (error) {
        console.error("Error fetching categories:", error);
        return reject("Failed to fetch categories");
      }
      resolve(results as BoardgameCategory[]);
    });
  });
};


/*
  Board game catergory like
*/
export const likeCategoryModel = async (user_id: number, category_id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query = "INSERT IGNORE INTO boardgame_category_likes (user_id, category_id) VALUES (?, ?)";

    connection.query(query, [user_id, category_id], (error) => {
      if (error) {
        console.error("❌ Error liking category:", error);
        return reject("Failed to like category");
      }
      resolve();
    });
  });
};

export const unlikeCategory = async (user_id: number, category_id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM boardgame_category_likes WHERE user_id = ? AND category_id = ?";

    connection.query(query, [user_id, category_id], (error) => {
      if (error) {
        console.error("❌ Error unliking category:", error);
        return reject("Failed to unlike category");
      }
      resolve();
    });
  });
};

export const checkIfUserLikedCategoryModel = async (user_id: number, category_id: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const query = "SELECT COUNT(*) as count FROM boardgame_category_likes WHERE user_id = ? AND category_id = ?";

    connection.query(query, [user_id, category_id], (error, results: RowDataPacket[]) => {
      if (error) {
        console.error("❌ Error checking like status:", error);
        return reject("Failed to check like status");
      }
      resolve(results[0].count > 0);
    });
  });
};

export const getAllCategoryLikes = async (): Promise<{ categoryId: number; likeCount: number }[]> => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT category_id, COUNT(*) AS likeCount
      FROM category_likes
      GROUP BY category_id;
    `;

    connection.query(query, (error, results: RowDataPacket[]) => {
      if (error) {
        console.error("❌ Error fetching category like counts:", error);
        return reject("Failed to fetch category like counts.");
      }

      resolve(results.map(row => ({
        categoryId: row.category_id,
        likeCount: row.likeCount,
      })));
    });
  });
};

export const getUserLikedCategoryIds = async(user_id: number): Promise<number[]> =>{
  const query = "SELECT category_id FROM boardgame_category_likes WHERE user_id = ?";
  return new Promise((resolve, reject) => {
      connection.query(query, [user_id], (error, results: RowDataPacket[]) => {
          if (error) {
              console.error("❌ Lỗi khi lấy category đã like:", error);
              return reject([]);
          }
          resolve(results.map((row: any) => row.category_id));
      });
  });
}

export const checkUserLiked = async (user_id: number, category_id: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT EXISTS (
        SELECT 1 FROM category_likes WHERE user_id = ? AND category_id = ?
      ) AS liked;
    `;

    connection.query(query, [user_id, category_id], (error, results: RowDataPacket[]) => {
      if (error) {
        console.error("❌ Error checking user like category:", error);
        return reject("Failed to check category like");
      }
      resolve(Boolean(results[0].liked));
    });
  });
};

export const getCategorylikesCountModel = async (category_id: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const query = "SELECT COUNT(*) AS total FROM boardgame_category_likes WHERE category_id = ?;";

    connection.query(query, [category_id], (error, results: RowDataPacket[]) => {
      if (error) {
        console.error("Error unlike category:", error);
        return reject("Failed unlike category");
      }
      resolve(results[0].total);
    });
  });
};

/**
 * Lấy số lượng like của nhiều category
 */
export const getCategoryLikesCountsModel = async (categoryIds: number[]): Promise<Record<number, number>> => {
  if (categoryIds.length === 0) return {};

  return new Promise((resolve, reject) => {
    const placeholders = categoryIds.map(() => "?").join(",");
    const query = `SELECT category_id, COUNT(*) AS total FROM boardgame_category_likes WHERE category_id IN (${placeholders}) GROUP BY category_id;`;

    connection.query(query, categoryIds, (error, results: RowDataPacket[]) => {
      if (error) {
        console.error("Error fetching category likes:", error);
        return reject("Failed to fetch category likes");
      }

      const likeCounts: Record<number, number> = {};
      results.forEach(row => {
        likeCounts[row.category_id] = row.total;
      });

      categoryIds.forEach(id => {
        if (!likeCounts[id]) {
          likeCounts[id] = 0;
        }
      });

      resolve(likeCounts);
    });
  });
};



export const addCategoryToBoardgame = async (
  boardgameId: number,
  categoryId: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT IGNORE INTO boardgame_categories_mapping (boardgame_id, category_id)
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
      INNER JOIN boardgame_categories c ON bcm.category_id = c.category_id
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

/**
 * Lấy số lượng boardgame của nhiều category từ MySQL
 */
export const getBoardgameCountByCategoriesModel = async (categoryIds: number[]): Promise<Record<number, number>> => {
    if (categoryIds.length === 0) return {};

    return new Promise((resolve, reject) => {
        const placeholders = categoryIds.map(() => "?").join(",");
        const query = `SELECT category_id, COUNT(*) AS total FROM boardgame_categories_mapping WHERE category_id IN (${placeholders}) GROUP BY category_id;`;

        connection.query(query, categoryIds, (error, results: RowDataPacket[]) => {
            if (error) {
                console.error("Error fetching boardgame count:", error);
                return reject("Failed to fetch boardgame count");
            }

            // Chuyển kết quả thành object { categoryId: gameCount }
            const gameCounts: Record<number, number> = {};
            results.forEach(row => {
                gameCounts[row.category_id] = row.total;
            });

            // Nếu category nào không có trong kết quả thì mặc định là 0
            categoryIds.forEach(id => {
                if (!gameCounts[id]) {
                    gameCounts[id] = 0;
                }
            });

            resolve(gameCounts);
        });
    });
};

/**
 * 📌 Lấy số lượng boardgames trong một category
 */
export const getBoardgameCountByCategory = async (categoryId: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COUNT(*) AS total 
      FROM boardgame_categories_mapping 
      WHERE category_id = ?;
    `;

    connection.query(query, [categoryId], (error, results: RowDataPacket[]) => {
      if (error) {
        console.error("[MySQL Error] getBoardgameCountByCategory:", error);
        return reject("Failed to count boardgames.");
      }
      resolve(results[0].total || 0);
    });
  });
};

/**
 * 📌 Lấy số lượng boardgames của tất cả categories
 */
export const getAllBoardgameCounts = async (): Promise<{ categoryId: number; count: number }[]> => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT category_id, COUNT(*) AS total 
      FROM boardgame_categories_mapping 
      GROUP BY category_id;
    `;

    connection.query(query, (error, results: RowDataPacket[]) => {
      if (error) {
        console.error("[MySQL Error] getAllBoardgameCounts:", error);
        return reject("Failed to count boardgames for all categories.");
      }

      resolve(
        results.map((row) => ({
          categoryId: row.category_id,
          count: row.total,
        }))
      );
    });
  });
};
