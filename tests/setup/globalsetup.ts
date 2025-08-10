import prisma from '../../src/config/database';
import { logger } from '../../src/config/logger';

// Global setup for tests
beforeAll(async () => {
  try {
    // Truncate all tables before running tests
    await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
  } catch (_error) {
    logger.warn('Could not truncate tables:', _error);
  }
});

// Global teardown for tests
afterAll(async () => {
  // Disconnect Prisma client
  await prisma.$disconnect();
});

export {};
