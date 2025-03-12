import { MechanicHistoryModel, MechanicHistory } from "@/models/history/MechanicHistoryModel";

/**
 * ✅ Thêm lịch sử thay đổi vào một Mechanic cụ thể.
 * @param mechanicId - ID của Mechanic.
 * @param history - Thông tin về sự kiện lịch sử.
 */
export const addMechanicHistory = async (
  mechanicId: number,
  history: MechanicHistory
): Promise<void> => {
  // ✅ Kiểm tra nếu Mechanic này đã có lịch sử chưa
  const mechanic = await MechanicHistoryModel.findOne({ mechanic_id: mechanicId });

  if (!mechanic) {
    // Nếu chưa có, tạo mới lịch sử
    await MechanicHistoryModel.create({
      mechanic_id: mechanicId,
      histories: [history],
    });
    return;
  }

  // Nếu đã tồn tại, thêm vào danh sách lịch sử
  mechanic.histories.push(history);
  await mechanic.save();
};

/**
 * ✅ Lấy danh sách lịch sử thay đổi của một Mechanic.
 * @param mechanicId - ID của Mechanic.
 * @param userId - Lọc theo user thực hiện (nếu cần).
 * @param limit - Số lượng lịch sử cần lấy.
 * @param offset - Bắt đầu từ lịch sử thứ bao nhiêu.
 * @param action - Lọc theo hành động (create, update, delete).
 * @returns Danh sách lịch sử hoặc mảng rỗng nếu không có.
 */
export const getMechanicHistories = async ({
  mechanicId,
  userId,
  limit = 10,
  offset = 0,
  action,
}: {
  mechanicId: number;
  userId?: number;
  limit?: number;
  offset?: number;
  action?: string;
}) => {
  const query: any = { mechanic_id: mechanicId };
  
    if (userId) {
      query["histories.updated_by"] = userId;
    }
  
    if (action) {
      query["histories.action"] = action.toLowerCase();
    }

  
    const mechanicyHistory = await MechanicHistoryModel.findOne(query, {
      histories: { $slice: [offset, limit] },
    });
  
    return mechanicyHistory?.histories || [];
};

/**
 * ✅ Xóa lịch sử của một Mechanic (tuỳ chọn).
 * @param mechanicId - ID của Mechanic cần xoá lịch sử.
 * @returns Trả về `true` nếu xoá thành công, `false` nếu không tìm thấy.
 */
export const deleteMechanicHistory = async (mechanicId: number): Promise<boolean> => {
  const result = await MechanicHistoryModel.deleteOne({ mechanic_id: mechanicId });
  return result.deletedCount > 0;
};
