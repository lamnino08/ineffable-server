import { SelectOption } from "./SelectOption";

// src/models/MultipSelections.ts
export interface MultipSelections {
    multip_selection_ID?: number; // Primary Key
    description: string; // Mô tả về nhóm lựa chọn
    options: SelectOption[]; // Danh sách các lựa chọn
  }
  