# System Architecture

This document describes the architectural design, patterns, and component interactions of the Challenge 4 Backend API.

## 🏗️ High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   Load Balancer │    │   PostgreSQL    │
│  (Web/Mobile)   │◄──►│   (Optional)    │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        ▲
                                ▼                        │
                       ┌─────────────────┐               │
                       │  Express.js API │               │
                       │   Application   │───────────────┘
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Prisma ORM     │
                       │  (Data Layer)   │
                       └─────────────────┘
```

## 🔄 Request Flow

### 1. **Incoming Request Processing**
```
HTTP Request
    ↓
🛡️ Security Middleware (Helmet, CORS)
    ↓
📝 Logging Middleware (Morgan)
    ↓
📦 Body Parsing (JSON/URL-encoded)
    ↓
🗂️ Route Matching (/api/*)
    ↓
🔐 Authentication Middleware (if required)
    ↓
✅ Input Validation
    ↓
🎯 Controller Logic
    ↓
🗄️ Database Operations (Prisma)
    ↓
📤 Response Formatting
    ↓
HTTP Response
```

### 2. **Error Handling Flow**
```
Error Occurs
    ↓
🚨 Error Caught by Middleware
    ↓
📋 Error Logging (Winston)
    ↓
🔍 Error Type Classification
    ↓
📝 Standardized Error Response
    ↓
📤 HTTP Error Response
```

## 🧩 Component Architecture

### **Application Layer**
```typescript
// src/app/index.ts
Express App
├── Security Middleware
├── Logging Middleware  
├── Body Parsing
├── Route Registration
├── Error Handling
└── 404 Handler
```

### **Configuration Layer**
```typescript
// src/config/
Configuration
├── Environment Variables
├── Database Connection
├── Logger Setup
└── Validation
```

### **Route Layer**
```typescript
// src/routes/
Routing
├── Health Check
├── Authentication Routes
├── Protected Routes
└── Route Grouping
```

### **Controller Layer**
```typescript
// src/controllers/
Business Logic
├── Request Processing
├── Input Validation
├── Business Rules
├── Database Operations
└── Response Generation
```

### **Data Layer**
```typescript
// Prisma ORM
Data Access
├── Model Definitions
├── Query Building
├── Transaction Management
└── Type Generation
```

## 🔐 Security Architecture

### **Authentication Flow**
```
1. User Registration/Login
   ├── Password Hashing (bcrypt)
   ├── JWT Token Generation
   └── Secure Token Storage

2. Protected Route Access
   ├── Token Extraction (Header)
   ├── Token Verification
   ├── User Context Loading
   └── Request Authorization
```

### **Security Layers**
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **bcryptjs**: Password hashing
- **JWT**: Stateless authentication
- **Input Validation**: XSS/Injection prevention

## 📊 Data Architecture

### **Database Design Principles**
- **Normalization**: Proper table relationships
- **UUID Primary Keys**: Scalable identifiers
- **Timestamps**: Created/updated tracking
- **Constraints**: Data integrity enforcement

### **Prisma Integration**
```typescript
// Database Operations Pattern
Controller
    ↓
Prisma Client
    ↓
SQL Generation
    ↓
PostgreSQL
    ↓
Type-safe Results
```

## 🔄 Middleware Pipeline

### **Global Middleware Stack**
```typescript
1. helmet()           // Security headers
2. cors()             // CORS handling
3. compression()      // Response compression
4. express.json()     // JSON parsing
5. express.urlencoded() // Form parsing
6. morgan()           // Request logging
7. routes             // Application routes
8. 404Handler         // Not found handler
9. errorHandler       // Global error handler
```

### **Route-Specific Middleware**
```typescript
// Protected routes
router.use('/protected', authenticateToken)

// Validation middleware
router.post('/register', validateRegisterInput)
```

## 📝 Logging Architecture

### **Logging Levels**
- **Error**: Application errors
- **Warn**: Warning conditions
- **Info**: General information
- **Debug**: Debug information

### **Log Destinations**
- **Console**: Development environment
- **Files**: Production logging
- **External Services**: Monitoring (future)

## 🚀 Scalability Considerations

### **Horizontal Scaling**
- Stateless design (JWT tokens)
- Database connection pooling
- Load balancer ready

### **Performance Optimizations**
- Response compression
- Efficient database queries
- Connection pooling
- Caching strategies (future)

### **Monitoring & Health Checks**
- Health endpoint (`/api/health`)
- Graceful shutdown handling
- Process signal handling
- Error tracking and logging

## 🔧 Development Architecture

### **Development Workflow**
```
Code Changes
    ↓
TypeScript Compilation
    ↓
Hot Reload (ts-node-dev)
    ↓
Automatic Restart
```

### **Build Process**
```
TypeScript Source
    ↓
TSC Compilation
    ↓
JavaScript Output (dist/)
    ↓
Production Ready
```

## 📋 Design Patterns Used

1. **MVC Pattern**: Model-View-Controller separation
2. **Middleware Pattern**: Request processing pipeline
3. **Repository Pattern**: Data access abstraction (Prisma)
4. **Factory Pattern**: Configuration and service creation
5. **Singleton Pattern**: Database connection
6. **Strategy Pattern**: Different authentication strategies

This architecture ensures maintainability, scalability, and security while following Node.js and Express.js best practices.