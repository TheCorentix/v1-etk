import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";

// Import configurations
import { env } from "./config/env";
import { logger } from "./config/logger";

// Import middlewares
import { apiRateLimiter } from "./middleware/rateLimiter.middleware";
import { notFoundMiddleware } from "./middleware/notFound.middleware";
import { errorMiddleware } from "./middleware/error.middleware";

// Import routes
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import customisationRoutes from "./routes/customisation.routes";
import lookbookRoutes from "./routes/lookbook.routes";
import settingsRoutes from "./routes/settings.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import homepageRoutes from "./routes/homepage.routes";

// Load environment variables
dotenv.config();

// Create Express App
const app = express();

// ----------------------
// Global Middlewares
// ----------------------
app.use(helmet());

const allowedOrigins = [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// Connect morgan logger to winston HTTP log stream
app.use(
  morgan("combined", {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
  })
);

// Apply global rate limiting to all api endpoints
app.use("/api", apiRateLimiter);

// ----------------------
// Routes Mounting
// ----------------------
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customisations", customisationRoutes);
app.use("/api/lookbooks", lookbookRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/homepage", homepageRoutes);

// Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ETNIKO Backend is running successfully 🚀",
    timestamp: new Date().toISOString(),
  });
});

// ----------------------
// Error Handlers
// ----------------------
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;