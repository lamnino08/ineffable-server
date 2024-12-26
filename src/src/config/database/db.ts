import mysql, { Connection, ConnectionOptions } from "mysql2";
import dotenv from "dotenv";

dotenv.config({ path: ".env.dev" });

// const config: ConnectionOptions = {
//   host: process.env.DB_HOST as string,
//   user: process.env.DB_USER as string,
//   password: process.env.DB_PASSWORD as string,
//   database: process.env.DB_NAME as string,
// };

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: env === 'production' ? '.env.production' : '.env.development' });

const config: ConnectionOptions = {
    host: process.env.DB_HOST as string,
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_NAME as string,
};

const connection: Connection = mysql.createConnection(config);

connection.connect((err: mysql.QueryError | null) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL!");
});

export default connection;
