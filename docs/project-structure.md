# Project Structure

This document explains the organization and structure of the Challenge 4 Backend codebase.

## 📁 Root Directory Structure

```
CH-4-BE/
├── .gitignore              # Git ignore patterns
├── README.md               # Project overview
├── package.json            # Dependencies and scripts
├── pnpm-lock.yaml         # Lock file for pnpm
├── tsconfig.json          # TypeScript configuration
├── docs/                  # Documentation files
├── prisma/                # Database schema and migrations
│   └── schema.prisma      # Prisma schema definition
└── src/                   # Source code
    ├── app/               # Express app configuration
    ├── config/            # Configuration files
    ├── controllers/       # Route handlers
    ├── middlewares/       # Custom middleware
    ├── routes/            # Route definitions
    ├── types/             # TypeScript type definitions
    ├── utils/             # Utility functions
    ├── validations/       # Input validation schemas
    └── server.ts          # Application entry point
```

## 📂 Source Code Structure (`/src`)

### `/src/app/`
- **Purpose**: Express application setup and configuration
- **Files**:
  - `index.ts` - Main Express app with middleware setup

### `/src/config/`
- **Purpose**: Configuration modules for different services
- **Files**:
  - `database.ts` - Prisma client configuration
  - `environment.ts` - Environment variables validation
  - `logger.ts` - Winston logger configuration

### `/src/controllers/`
- **Purpose**: Business logic and request handlers
- **Files**:
  - `auth.controller.ts` - Authentication endpoints (register, login)

### `/src/middlewares/`
- **Purpose**: Custom Express middleware functions
- **Files**:
  - `auth.middleware.ts` - JWT authentication middleware

### `/src/routes/`
- **Purpose**: Route definitions and organization
- **Files**:
  - `index.ts` - Main router with health check
  - `auth.routes.ts` - Authentication routes

### `/src/types/`
- **Purpose**: TypeScript type definitions and interfaces
- **Files**:
  - `index.ts` - Common types (ApiResponse, Error, etc.)

### `/src/utils/`
- **Purpose**: Reusable utility functions
- **Files**:
  - `pagination.ts` - Pagination helpers
  - `password.ts` - Password hashing utilities
  - `response.ts` - Standardized API responses
  - `token.ts` - JWT token utilities
  - `validation.ts` - Input validation helpers

### `/src/validations/`
- **Purpose**: Input validation schemas
- **Files**:
  - `auth.validation.ts` - Authentication input validation
  - `user.validation.ts` - User data validation

## 🗄️ Database Structure (`/prisma`)

### `schema.prisma`
- **Purpose**: Database schema definition
- **Contains**:
  - Database connection configuration
  - Prisma client generator
  - Data models (User, UserClass, etc.)
  - Relationships and constraints

## 📋 Key Design Patterns

### 1. **Layered Architecture**
```
Routes → Controllers → Services → Database
```

### 2. **Separation of Concerns**
- **Routes**: Define endpoints and middleware
- **Controllers**: Handle business logic
- **Utils**: Reusable functions
- **Config**: Environment and service setup

### 3. **Type Safety**
- TypeScript interfaces for all data structures
- Prisma-generated types for database models
- Custom types for API requests/responses

### 4. **Error Handling**
- Centralized error handling middleware
- Standardized error response format
- Proper HTTP status codes

### 5. **Configuration Management**
- Environment-based configuration
- Validation of required environment variables
- Centralized config modules

## 🔧 File Naming Conventions

- **Controllers**: `*.controller.ts`
- **Routes**: `*.routes.ts`
- **Middleware**: `*.middleware.ts`
- **Validation**: `*.validation.ts`
- **Types**: `index.ts` (in types folder)
- **Utils**: Descriptive names (e.g., `password.ts`, `token.ts`)

## 📦 Dependencies Organization

### Production Dependencies
- **Core**: express, @prisma/client
- **Security**: bcryptjs, helmet, cors, jsonwebtoken
- **Utilities**: compression, morgan, winston, dotenv

### Development Dependencies
- **TypeScript**: typescript, @types/*
- **Development**: ts-node-dev, prisma
- **Linting**: eslint, @typescript-eslint/*

This structure promotes maintainability, scalability, and clear separation of concerns throughout the application.