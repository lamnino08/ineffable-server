import mysql, { Connection, ConnectionOptions } from "mysql2";
import config from "@/config";

const configSql: ConnectionOptions = {
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
};

const connection: Connection = mysql.createConnection(configSql);

connection.connect((err: mysql.QueryError | null) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL!");
});

export default connection;
