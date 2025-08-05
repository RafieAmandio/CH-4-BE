# Development Guide

This guide covers everything you need to know to set up, develop, and contribute to the Challenge 4 Backend API.

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **pnpm**: v8.0.0 or higher (recommended package manager)
- **PostgreSQL**: v13.0 or higher
- **Git**: Latest version

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd CH-4-BE
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Environment setup**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key
   ENVIRONMENT=development
   DATABASE_URL="postgresql://username:password@localhost:5432/ch4_backend"
   ```

4. **Database setup**:
   ```bash
   # Create database
   createdb ch4_backend
   
   # Run migrations
   pnpm prisma:migrate
   
   # Generate Prisma client
   pnpm prisma:generate
   ```

5. **Start development server**:
   ```bash
   pnpm dev
   ```

   The API will be available at `http://localhost:3000`

## 📦 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `pnpm dev` | Start development server with hot reload |
| `build` | `pnpm build` | Build for production |
| `start` | `pnpm start` | Start production server |
| `lint` | `pnpm lint` | Run ESLint |
| `prisma:generate` | `pnpm prisma:generate` | Generate Prisma client |
| `prisma:migrate` | `pnpm prisma:migrate` | Run database migrations |
| `prisma:studio` | `pnpm prisma:studio` | Open Prisma Studio |
| `prisma:reset` | `pnpm prisma:reset` | Reset database (dev only) |

## 🛠️ Development Workflow

### 1. **Feature Development**

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
# ...

# Test your changes
pnpm dev

# Lint your code
pnpm lint

# Commit changes
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name
```

### 2. **Database Changes**

```bash
# Modify prisma/schema.prisma
# ...

# Create migration
pnpm prisma migrate dev --name describe_your_changes

# Generate new client
pnpm prisma generate
```

### 3. **Adding New Endpoints**

1. **Create validation schema** (`src/validations/`):
   ```typescript
   // src/validations/example.validation.ts
   import { body } from "express-validator";
   
   export const exampleValidation = [
     body("field").notEmpty().withMessage("Field is required")
   ];
   ```

2. **Create controller** (`src/controllers/`):
   ```typescript
   // src/controllers/example.controller.ts
   import { Request, Response } from "express";
   import { sendSuccess, sendError } from "../utils/response";
   
   export const exampleHandler = async (req: Request, res: Response) => {
     try {
       // Your logic here
       sendSuccess(res, "Success message", data);
     } catch (error) {
       sendError(res, "Error message", errors, 500);
     }
   };
   ```

3. **Create routes** (`src/routes/`):
   ```typescript
   // src/routes/example.routes.ts
   import { Router } from "express";
   import * as controller from "../controllers/example.controller";
   import { exampleValidation } from "../validations/example.validation";
   import { validate } from "../utils/validation";
   
   const router = Router();
   
   router.post("/endpoint", exampleValidation, validate, controller.exampleHandler);
   
   export default router;
   ```

4. **Register routes** (`src/routes/index.ts`):
   ```typescript
   import exampleRoutes from "./example.routes";
   
   router.use("/example", exampleRoutes);
   ```

## 🧪 Testing

### Manual Testing

1. **Health Check**:
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Register User**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123",
       "grade": "12",
       "school": "Test School",
       "phone": "+1234567890",
       "major": "Computer Science",
       "interests": ["Programming"]
     }'
   ```

3. **Login**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

### Using Postman/Insomnia

1. Import the API collection (if available)
2. Set environment variables:
   - `baseUrl`: `http://localhost:3000/api`
   - `token`: JWT token from login response

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|----------|
| `PORT` | Server port | No | 3000 |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `ENVIRONMENT` | Environment (development/production) | Yes | - |
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 🐛 Debugging

### Development Debugging

1. **Console Logging**:
   ```typescript
   console.log("Debug info:", data);
   ```

2. **Winston Logger**:
   ```typescript
   import logger from "../config/logger";
   
   logger.info("Info message");
   logger.error("Error message", error);
   logger.debug("Debug message");
   ```

3. **VS Code Debugging**:
   Create `.vscode/launch.json`:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "name": "Debug API",
         "type": "node",
         "request": "launch",
         "program": "${workspaceFolder}/src/server.ts",
         "outFiles": ["${workspaceFolder}/dist/**/*.js"],
         "runtimeArgs": ["-r", "ts-node/register"],
         "env": {
           "NODE_ENV": "development"
         }
       }
     ]
   }
   ```

### Database Debugging

1. **Prisma Studio**:
   ```bash
   pnpm prisma:studio
   ```
   Opens at `http://localhost:5555`

2. **Query Logging**:
   Add to Prisma client:
   ```typescript
   const prisma = new PrismaClient({
     log: ['query', 'info', 'warn', 'error'],
   });
   ```

## 📝 Code Style

### ESLint Configuration

The project uses ESLint with TypeScript rules:

```bash
# Run linting
pnpm lint

# Fix auto-fixable issues
pnpm lint --fix
```

### Coding Conventions

1. **File Naming**:
   - Controllers: `*.controller.ts`
   - Routes: `*.routes.ts`
   - Middleware: `*.middleware.ts`
   - Utilities: `*.ts` (descriptive names)

2. **Function Naming**:
   - Use camelCase
   - Be descriptive: `getUserById` not `getUser`

3. **Variable Naming**:
   - Use camelCase
   - Constants: UPPER_SNAKE_CASE

4. **Import Organization**:
   ```typescript
   // External libraries
   import express from "express";
   import { Request, Response } from "express";
   
   // Internal modules
   import { sendSuccess } from "../utils/response";
   import prisma from "../config/database";
   
   // Types
   import { UserInput } from "../types";
   ```

## 🔒 Security Best Practices

1. **Environment Variables**:
   - Never commit `.env` files
   - Use strong JWT secrets
   - Validate all environment variables

2. **Input Validation**:
   - Always validate user input
   - Use express-validator
   - Sanitize data before database operations

3. **Password Security**:
   - Hash passwords with bcrypt
   - Use appropriate salt rounds (12+)
   - Never log passwords

4. **JWT Tokens**:
   - Use strong secrets
   - Set appropriate expiration times
   - Validate tokens on protected routes

## 🚨 Common Issues

### Database Connection Issues

```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Verify DATABASE_URL format
echo $DATABASE_URL
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)
```

### Prisma Issues

```bash
# Reset database (development only)
pnpm prisma:reset

# Regenerate client
pnpm prisma:generate

# Check migration status
pnpm prisma migrate status
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

### Commit Message Format

```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance
```

Example:
```
feat(auth): add password reset functionality

- Add forgot password endpoint
- Add reset password endpoint
- Add email validation
- Update user model with reset token
```

This development guide should help you get up and running quickly and maintain consistent development practices across the team.