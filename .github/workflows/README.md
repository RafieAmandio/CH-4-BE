# GitHub Actions Workflows

## CI Workflow

The `ci.yml` workflow automatically runs on every pull request and push to the `main` and `develop` branches.

### What it does:

1. **Linting**: Runs ESLint to check code quality and style
2. **Formatting**: Verifies code formatting with Prettier
3. **Testing**: Executes the full test suite with coverage
4. **Multi-version testing**: Tests against Node.js 18.x and 20.x

### Requirements:

- All checks must pass before a PR can be merged
- Tests must have adequate coverage
- Code must follow the project's linting and formatting rules

### Local Development:

Before creating a PR, run these commands locally to ensure CI will pass:

```bash
# Install dependencies
pnpm install

# Run linting
pnpm run lint

# Check formatting
pnpm run format:check

# Run tests
pnpm run test:ci

# Fix any issues
pnpm run lint:fix
pnpm run format
```

### Troubleshooting:

If CI fails:

1. Check the GitHub Actions logs for specific error messages
2. Run the failing command locally to reproduce the issue
3. Fix the issues and push the changes
4. The workflow will automatically re-run on the updated PR