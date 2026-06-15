import express from "express";
import cors from "cors";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import availabilityRouter from "./modules/availability/availability.route";
import bookingRouter from "./modules/booking/booking.route";
import reviewRouter from "./modules/review/review.route";
import profileRouter from "./modules/profile/profile.route";
import tutorRouter from "./modules/tutor/tutor.route";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import adminRouter from "./modules/admin/admin.route";

const app = express();

app.use(morgan("dev"));

// 1. Global Middleware Rules
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Better Auth Internal Dynamic Routes
app.all("/api/auth/*path", toNodeHandler(auth));

// 3. Base Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// 4. Custom Application API Routes
app.use("/api/availability", availabilityRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/profile", profileRouter);
app.use("/api/tutor", tutorRouter);
app.use("/api/admin", adminRouter);

// 5. Global Error Handler (Must be registered last)
app.use(globalErrorHandler);

export default app;
