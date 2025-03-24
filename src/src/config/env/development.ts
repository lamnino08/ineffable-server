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
  elasticsearch: {
    url: string,
    username: string,
    password: string
  }
  redis_url: string;
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
  elasticsearch: {
    url: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || 'Zop6OKInQJQi8lwsrY26',
  },
  redis_url: process.env.REDIS_URL || 'redis://localhost:6379',
};

export default config;
