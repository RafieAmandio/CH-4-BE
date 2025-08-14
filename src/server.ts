import app from "./app/index.js";
import { env } from "./config/environment.js";
import { logger } from "./config/logger.js";

// Start the server
const server = app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT} in ${env.ENVIRONMENT} mode`);
  logger.info(`API available at http://localhost:${env.PORT}/api`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Promise Rejection:", err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  logger.error("Uncaught Exception:", err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle SIGTERM signal
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
  });
});

export default server;
