// src/models/Date.ts
export interface Date {
    date_ID?: number; // Primary Key
    value: Date; // Giá trị ngày
    format: 'day' | 'month' | 'year'; // Định dạng ngày tháng
  }
  