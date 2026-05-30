import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.route";
import loanRouter from "./routes/loan.route";

const app = express();

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || [
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Cookies
app.use(cookieParser());

// Health check
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/loans", loanRouter);

// Global Error Handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    res.status(err?.statusCode || 500).json({
      success: false,
      message: err?.message || "Internal Server Error",
      errors: err?.errors || [],
      data: null,
    });
  }
);

export { app };