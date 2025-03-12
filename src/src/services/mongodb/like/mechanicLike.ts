import mongoose from "mongoose";

// ✅ Định nghĩa schema cho "user_liked_mechanics"
const UserLikeMechanicSchema = new mongoose.Schema({
    user_id: { type: Number, required: true, unique: true }, // ID người dùng
    liked_mechanics: { type: [Number], default: [] } // Danh sách mechanic đã like
}, { collection: "user_liked_mechanics" });

// ✅ Model
export const UserLikeMechanic = mongoose.model("UserLikeMechanic", UserLikeMechanicSchema);

/**
 * ✅ Thêm mechanic vào danh sách like của user
 */
export async function addMechanicToUserLikes(userId: number, mechanicId: number) {
    return await UserLikeMechanic.updateOne(
        { user_id: userId },
        { $addToSet: { liked_mechanics: mechanicId } }, // Chỉ thêm nếu chưa tồn tại
        { upsert: true } // Nếu user chưa có, tạo mới
    );
}

/**
 * ✅ Xóa mechanic khỏi danh sách like của user
 */
export async function removeMechanicFromUserLikes(userId: number, mechanicId: number) {
    return await UserLikeMechanic.updateOne(
        { user_id: userId },
        { $pull: { liked_mechanics: mechanicId } } // Xóa khỏi danh sách
    );
}

/**
 * ✅ Lấy danh sách mechanic mà user đã like
 */
export async function getUserLikedMechanics(userId: number) {
    const user = await UserLikeMechanic.findOne({ user_id: userId }, { liked_mechanics: 1, _id: 0 });
    return user ? user.liked_mechanics : [];
}
