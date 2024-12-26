import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 8000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'database_name',
  },
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
};
