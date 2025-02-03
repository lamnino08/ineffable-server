import { CategoryHistoryModel, CategoryHistory } from "@/models/history/CategoryHistoryModel";

/**
 * Add a history entry for a specific category.
 * @param categoryId - ID of the category.
 * @param history - Details about the history event.
 */
export const addCategoryHistory = async (
  categoryId: number,
  history: CategoryHistory
): Promise<void> => {
  // Check if the category history document already exists
  const category = await CategoryHistoryModel.findOne({ category_id: categoryId });

  if (!category) {
    await CategoryHistoryModel.create({
      category_id: categoryId,
      histories: [history],
    });
    return;
  }

  // Append the new history entry and save
  category.histories.push(history);
  await category.save();
};

/**
 * Retrieve all history entries for a specific category.
 * @param categoryId - ID of the category.
 * @returns Array of history entries or an empty array if no history exists.
 */
export const getCategoryHistories = async ({
  categoryId,
  userId,
  limit = 10,
  offset = 0,
  action,
}: {
  categoryId: number;
  userId?: number;
  limit?: number;
  offset?: number;
  action?: string;
}) => {
  const query: any = { category_id: categoryId };

  if (userId) {
    query["histories.updated_by"] = userId;
  }

  if (action) {
    query["histories.action"] = action.toLowerCase();
  }

  const categoryHistory = await CategoryHistoryModel.findOne(query, {
    histories: { $slice: [offset, limit] },
  });

  return categoryHistory?.histories || [];
};


/**
 * Delete a category history document (optional utility function).
 * @param categoryId - ID of the category to delete.
 * @returns Whether the delete operation was successful.
 */
export const deleteCategoryHistory = async (categoryId: number): Promise<boolean> => {
  const result = await CategoryHistoryModel.deleteOne({ category_id: categoryId });
  return result.deletedCount > 0;
};
