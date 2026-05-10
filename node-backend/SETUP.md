# Quick Setup Guide

## Prerequisites

1. **PostgreSQL** must be installed and running
2. **Node.js 18+** installed

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/globetrotter?schema=public"
JWT_SECRET="your_super_secret_jwt_key_minimum_32_characters_long"
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Important**: 
- Replace the `DATABASE_URL` with your PostgreSQL connection string
- Replace `JWT_SECRET` with a secure random string (at least 32 characters)

### 3. Create Database

Create a PostgreSQL database:

```sql
CREATE DATABASE globetrotter;
```

Or using psql command line:
```bash
createdb globetrotter
```

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Run Migrations

```bash
npm run migrate
```

This will create all database tables.

### 6. Seed Database

```bash
npm run seed
```

This creates:
- 8 sample cities
- 12 sample activities  
- 1 test user (email: `test@example.com`, password: `password123`)
- 1 sample public trip

### 7. Start Server

```bash
npm run dev
```

The API will be available at `http://localhost:4000`

## Verify Installation

1. **Health Check**:
   ```bash
   curl http://localhost:4000/health
   ```

2. **Test Signup**:
   ```bash
   curl -X POST http://localhost:4000/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password123","name":"Test User"}'
   ```

3. **Test Login**:
   ```bash
   curl -X POST http://localhost:4000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

## Troubleshooting

### Database Connection Error

- Verify PostgreSQL is running: `pg_isready` or check service status
- Verify DATABASE_URL in `.env` is correct
- Check database exists: `psql -l` should list `globetrotter`

### Port Already in Use

- Change `PORT` in `.env` to a different port (e.g., 4001)
- Or stop the process using port 4000

### Prisma Errors

- Run `npm run prisma:generate` again
- Check `DATABASE_URL` is correct
- Ensure database exists and is accessible

## Next Steps

- Connect your frontend to `http://localhost:4000`
- Use the test user credentials for initial testing
- Check `README.md` for full API documentation

