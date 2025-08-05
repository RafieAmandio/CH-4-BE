# Challenge 4 Backend Documentation

Welcome to the Challenge 4 Backend API documentation. This is a Node.js/TypeScript backend application built with Express.js, Prisma ORM, and PostgreSQL.

## 📚 Documentation Index

- [Project Structure](./project-structure.md) - Overview of the codebase organization
- [Architecture](./architecture.md) - System design and architectural patterns
- [Development Guide](./development.md) - Setup and development workflow

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   pnpm prisma:migrate
   pnpm prisma:generate
   ```

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

## 🛠 Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Security**: Helmet, CORS, bcryptjs
- **Logging**: Winston with Morgan
- **Development**: ts-node-dev for hot reload

## 📋 Features

- ✅ User authentication (register/login)
- ✅ JWT-based authorization
- ✅ Password hashing with bcrypt
- ✅ Request validation
- ✅ Error handling middleware
- ✅ Structured logging
- ✅ API response standardization
- ✅ Database migrations with Prisma
- ✅ TypeScript for type safety

## 🔗 API Base URL

- **Development**: `http://localhost:3000/api`
- **Health Check**: `GET /api/health`

---

*For detailed information, please refer to the specific documentation files listed above.*