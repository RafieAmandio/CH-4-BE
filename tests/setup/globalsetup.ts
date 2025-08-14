import prisma from '../../src/config/database';
import { logger } from '../../src/config/logger';

// Global setup for tests
beforeAll(async () => {
  try {
    // Use Prisma's deleteMany for schema-agnostic database cleanup
    // This works for both SQLite and PostgreSQL without hardcoded SQL
    await prisma.user.deleteMany({});
  } catch (_error) {
    logger.warn('Could not clear database:', _error);
  }
});

// Global teardown for tests
afterAll(async () => {
  // Disconnect Prisma client
  await prisma.$disconnect();
});

export {};
