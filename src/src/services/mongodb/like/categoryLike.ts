import mongoose from "mongoose";

// ✅ Định nghĩa schema
const UserLikeCategorySchema = new mongoose.Schema({
    user_id: { type: Number, required: true, unique: true },
    liked_categories: { type: [Number], default: [] }
}, { collection: "user_liked_categories" });

// ✅ Model
export const UserLikeCategory = mongoose.model("UserLikeCategory", UserLikeCategorySchema);

/**
 * ✅ Thêm category vào danh sách like của user
 */
export async function addCategoryToUserLikes(userId: number, categoryId: number) {
    return await UserLikeCategory.updateOne(
        { user_id: userId },
        { $addToSet: { liked_categories: categoryId } },
        { upsert: true }
    );
}

/**
 * ✅ Xóa category khỏi danh sách like của user
 */
export async function removeCategoryFromUserLikes(userId: number, categoryId: number) {
    return await UserLikeCategory.updateOne(
        { user_id: userId },
        { $pull: { liked_categories: categoryId } }
    );
}

/**
 * ✅ Lấy danh sách category mà user đã like
 */
export async function getUserLikedCategories(userId: number) {
    const user = await UserLikeCategory.findOne({ user_id: userId }, { liked_categories: 1, _id: 0 });
    return user ? user.liked_categories : [];
}
