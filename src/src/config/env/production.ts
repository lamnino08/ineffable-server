import dotenv from 'dotenv';

// Load environment variables from the corresponding .env file
dotenv.config();

interface Config {
  port: string;
  mysql: {
    host: string;
    user: string;
    password: string;
    database: string;
  };
  mongodb: string;
  jwtSecret: string;
  chatgptKey?: string;
}

// Define the config object with proper types
const config: Config = {
  port: process.env.PORT || '3000',
  mysql: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'my_database',
  },
  mongodb: process.env.MONGO_URL || "mongodb://localhost:27017/inneffable",
  jwtSecret: process.env.JWT_SECRET || 'default_secret_key',
  chatgptKey: process.env.CHATGPT_KEY, // Optional since it might be undefined
};

export default config;
