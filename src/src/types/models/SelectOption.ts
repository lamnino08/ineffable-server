// src/models/SelectOption.ts
export interface SelectOption {
    select_option_ID?: number; // Primary Key
    multip_selection_ID: number; // ID của multip_selection mà nó thuộc về
    description: string; // Mô tả của lựa chọn
    is_chosen: boolean; // Có được chọn hay không
  }
  