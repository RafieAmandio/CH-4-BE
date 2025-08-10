// Test environment configuration
// This file sets up environment variables for testing

// Use SQLite for testing to avoid affecting development/production data
process.env.DATABASE_URL = 'file:./test.db';
process.env.ENVIRONMENT = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.PORT = '3001';

// Use test-specific Prisma schema
process.env.PRISMA_SCHEMA_PATH = './prisma/schema.test.prisma';
process.env.DIRECT_URL = 'file:./test.db';

// Optional: Use in-memory SQLite for faster tests
// Uncomment the line below if you prefer in-memory database
// process.env.DATABASE_URL = 'file::memory:?cache=shared';
