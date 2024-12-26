import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || '3000',
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'my_database',
  },
  jwtSecret: process.env.JWT_SECRET || 'default_secret_key',
};
