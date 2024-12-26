// src/models/User.ts
export interface User {
    user_id?: number;
    username: string;
    email_hash: string;
    password_hash: string;
    role?: 'admin' | 'user';
    created_at?: Date;
  }
  