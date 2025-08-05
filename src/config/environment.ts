import dotenv from "dotenv";
import { logger } from "./logger";

// Load environment variables
dotenv.config();

// Environment variables with default values and type checking
interface EnvironmentConfig {
  PORT: number;
  JWT_SECRET: string;
  ENVIRONMENT: "development" | "production" | "test";
  DATABASE_URL: string;
}

// Function to verify that all required environment variables are present
const verifyEnv = (): EnvironmentConfig => {
  // Check for required environment variables
  const requiredEnvVars = ["PORT", "JWT_SECRET", "ENVIRONMENT", "DATABASE_URL"];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingEnvVars.join(
      ", "
    )}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Parse environment
  const environment = process.env.ENVIRONMENT;
  if (!["development", "production", "test"].includes(environment || "")) {
    throw new Error(
      `Invalid ENVIRONMENT value: ${environment}. Must be one of: development, production, test`
    );
  }

  return {
    PORT: parseInt(process.env.PORT || "3000", 10),
    JWT_SECRET: process.env.JWT_SECRET || "",
    ENVIRONMENT: (environment || "development") as
      | "development"
      | "production"
      | "test",
    DATABASE_URL: process.env.DATABASE_URL || "",
  };
};

// Export the environment configuration
export const env = verifyEnv();
