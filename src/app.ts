import express from "express";
import cors from "cors";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import availabilityRouter from "./modules/availability/availability.route";

const app = express();

app.use(morgan("dev"));

// 1. Better Auth Internal Dynamic Routes
app.all("/api/auth/*path", toNodeHandler(auth));

// 2. Global Middleware Rules
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Base Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// 4. Custom Application API Routes
app.use("/api/availability", availabilityRouter);

export default app;
