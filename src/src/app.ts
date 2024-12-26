// src/app.ts
import express from "express";
import path from "path";
import swaggerUi from "swagger-ui-express";
import cors from 'cors'
import config from "@/config";

import authRoute from '@/routes/authRoute'
import boardgameRoute from '@/routes/boardgameRoute'

import swaggerDocs from "@/config/swagger"
import { initRedis } from "@/config/database/redis"

// import { i18nMiddleware } from "@/middleware/i18nMiddlware";

const app = express();
const PORT = config.port;

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.use(cors({
  origin: `*`,  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Redis
initRedis();

// i18n language
// app.use(i18nMiddleware);

// Routes
app.use("/auth", authRoute);
app.use("/boardgame", boardgameRoute);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}/`);
  console.log(`API DOC: http://localhost:${PORT}/api-docs`);
});
