# Challenge 4 Backend

A RESTful API backend for Challenge 4 built with Express, TypeScript, Prisma, and PostgreSQL.

## Features

- User authentication (register, login, profile)
- User CRUD operations
- JWT-based authentication
- Input validation
- Error handling
- Logging
- Pagination
- Standardized API responses

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - ORM for database access
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Winston** - Logging
- **Morgan** - HTTP request logging
- **Express Validator** - Input validation
- **ULID** - Unique ID generation
- **Luxon** - Date/time handling

## Project Structure

```
src/
├── app/            # Express app setup
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middlewares/    # Custom middlewares
├── models/         # Database models (via Prisma)
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── validations/    # Input validation schemas
└── server.ts       # Entry point
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- pnpm (install with `npm install -g pnpm` or `curl -fsSL https://get.pnpm.io/install.sh | sh -`)
- PostgreSQL

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/RafieAmandio/CH-4-BE.git
   cd CH-4-BE
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your database credentials and other settings.

4. Generate Prisma client:

   ```bash
   pnpm prisma:generate
   ```

5. Run database migrations:
   ```bash
   pnpm prisma:migrate
   ```

### Development

Start the development server:

```bash
pnpm dev
```

The API will be available at http://localhost:3000/api

### Production

Build the project:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get current user profile (requires authentication)

### Users

- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:id` - Get a user by ID
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

## Response Format

### Success Response

```json
{
  "message": "Success message",
  "content": {
    // Response data
  },
  "errors": []
}
```

### Paginated Response

```json
{
  "message": "Success message",
  "content": {
    "totalData": 100,
    "totalPage": 10,
    "entries": [
      // Array of items
    ]
  },
  "errors": []
}
```

### Error Response

```json
{
  "message": "Error message",
  "content": null,
  "errors": [
    {
      "field": "email",
      "message": "Email is already in use"
    }
  ]
}
```

## License

ISC
