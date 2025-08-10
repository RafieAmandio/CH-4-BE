# Testing Configuration

This project uses SQLite for testing to ensure test isolation and prevent affecting development/production databases.

## How It Works

### Database Configuration
- **Test Database**: SQLite (`test.db` file)
- **Location**: Project root directory
- **Schema**: Uses `prisma/schema.test.prisma` (SQLite-compatible)
- **Configuration**: Automatically set via `tests/setup/env.ts`
- **Table Creation**: Automatic via global setup

### Environment Variables (Test)
- `DATABASE_URL`: `file:./test.db`
- `ENVIRONMENT`: `test`
- `JWT_SECRET`: `test-jwt-secret-key`
- `PORT`: `3001`
- `PRISMA_SCHEMA_PATH`: `./prisma/schema.test.prisma`

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm run test:coverage

# Run tests in CI mode
pnpm run test:ci

# Run tests in watch mode
pnpm run test:watch
```

## Database Cleanup

- The `test.db` file is automatically deleted after test runs
- Each test run starts with a fresh database created by `prisma db push --force-reset`
- The global setup uses `prisma.user.deleteMany({})` for schema-agnostic cleanup
- No hardcoded SQL queries - automatically adapts to schema changes

## Benefits of SQLite for Testing

✅ **Fast**: No network overhead
✅ **Isolated**: Separate from development data
✅ **Simple**: No additional setup required
✅ **CI-Friendly**: Works in GitHub Actions out of the box
✅ **Clean**: Automatic cleanup after tests

## Alternative: In-Memory Database

For even faster tests, you can switch to in-memory SQLite by editing `tests/setup/env.ts`:

```typescript
// Uncomment this line for in-memory database
process.env.DATABASE_URL = 'file::memory:?cache=shared';
```

**Note**: In-memory databases are faster but data doesn't persist between test files.