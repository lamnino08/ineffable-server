import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * ✅ Định nghĩa kiểu dữ liệu cho lịch sử thay đổi Mechanic
 */
export interface MechanicHistory {
  action: "create" | "update" | "delete"; // Hành động: Tạo, Cập nhật, Xóa
  updated_by: number; // ID của người thực hiện thay đổi
  changes?: Record<string, { oldValue: any; newValue: any }>; // Các giá trị cũ & mới
  timestamp?: Date; // Thời điểm cập nhật
}

/**
 * ✅ Định nghĩa kiểu dữ liệu chính cho cơ chế Mechanic (có tracking lịch sử)
 */
export interface MechanicDocument extends Document {
  mechanic_id: number; // ID của Mechanic
  histories: MechanicHistory[]; // Danh sách các thay đổi
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Schema cho từng sự kiện lịch sử thay đổi của Mechanic
const MechanicHistorySchema = new Schema<MechanicHistory>(
  {
    action: {
      type: String,
      enum: ["create", "update", "delete"],
      required: true,
    },
    updated_by: {
      type: Number,
      required: true,
    },
    changes: {
      type: Schema.Types.Mixed, // Lưu trữ thay đổi linh hoạt dưới dạng Object
      required: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // Tránh tạo _id không cần thiết cho từng mục lịch sử
);

// ✅ Schema chính cho Mechanic (chứa danh sách lịch sử thay đổi)
const MechanicSchema = new Schema<MechanicDocument>(
  {
    mechanic_id: {
      type: Number,
      required: true,
      unique: true,
    },
    histories: {
      type: [MechanicHistorySchema], // Cấu trúc danh sách lịch sử thay đổi
      default: [],
    },
  },
  { timestamps: true } // Thêm createdAt & updatedAt tự động
);

// ✅ Tạo và xuất Model MechanicHistory
export const MechanicHistoryModel: Model<MechanicDocument> = mongoose.model<MechanicDocument>(
  "MechanicHistory",
  MechanicSchema
);
