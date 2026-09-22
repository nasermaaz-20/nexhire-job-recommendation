
import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import jobRoutes from "./routes/job.routes.js";
import interactionRoutes from "./routes/interaction.routes.js";
import companyRoutes from "./routes/company.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import referenceRoutes from "./routes/reference.routes.js";
import recommendationRoutes from "./routes/recommendation.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { getUserById } from "./controllers/user.controller.js";

import { errorHandler } from "./middlewares/errorHandler.js";

BigInt.prototype.toJSON = function () {
  return Number(this);
};
dotenv.config();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json());
app.use(morgan("dev"));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use("/api/auth", authLimiter, authRoutes);
// Public route to get user by ID (no auth required)
app.get("/api/users/public/:userId", getUserById);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api", referenceRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/admin", adminRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, data: { status: "ok" }, message: "Health check" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

