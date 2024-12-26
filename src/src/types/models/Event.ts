// src/models/Event.ts
import { Field } from './Field'; // Field model cho các trường tùy chỉnh

export interface Event {
  event_ID?: number; // Primary Key
  title: string;
  description: string;
  start_date: Date; // Ngày bắt đầu
  end_date: Date; // Ngày kết thúc
  location?: string; // Địa điểm
  user_ID: number; // ID của người tạo sự kiện
  created_at: Date;

  // Danh sách các trường tùy chỉnh cho sự kiện
  fields?: Field[];
}
