// src/app.ts
import express from "express";
import path from "path";
import swaggerUi from "swagger-ui-express";
import cors from 'cors'
import config from "@/config";

import authRoute from '@/routes/authRoute';
import boardgameRoute from '@/routes/boardgame/boardgameRoute';
import uploadRoute from '@/routes/uploadRoute';
import AIRoute from '@/routes/AI-SEARCH/AIRoute';

import swaggerDocs from "@/config/swagger"
import { initRedis } from "@/config/database/redis";
import connectMongoDB  from "@/config/database/mongoDb"
import { i18nMiddleware } from "./middleware/i18nMiddlware";


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

app.use("/public", express.static(path.resolve("public")));

// Redis
initRedis();
connectMongoDB();


// i18n language
app.use(i18nMiddleware);

// Routes
app.use("/auth", authRoute);
app.use("/ai", AIRoute);
app.use("/boardgame", boardgameRoute);
app.use("/file", uploadRoute);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}/`);
  console.log(`API DOC: http://localhost:${PORT}/api-docs`);
});
