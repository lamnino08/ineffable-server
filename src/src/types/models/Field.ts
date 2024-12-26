// src/models/Field.ts
type FieldValue = string | number | boolean | Date | string[]; // Các kiểu dữ liệu cho giá trị trường

export interface Field {
  field_of_event_ID?: number; // Primary Key
  user_ID: number; // ID của người tạo trường
  property_type: number; // ID loại thuộc tính (text, number, select, v.v.)
  name: string; // Tên trường (VD: Tiêu đề, Địa điểm, v.v.)
  color?: string; // Màu của trường (có thể không có)
  value: FieldValue; // Giá trị của trường (có thể là string, number, boolean, Date, v.v.)
  created_at?: Date;
}
