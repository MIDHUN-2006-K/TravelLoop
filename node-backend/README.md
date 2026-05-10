# GlobeTrotter Backend API

RESTful API backend for the GlobeTrotter travel planning application.

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Joi

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Setup

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/globetrotter?schema=public"
   JWT_SECRET="your_secure_secret_key_min_32_characters"
   PORT=4000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Set up the database**:
   ```bash
   # Generate Prisma Client
   npm run prisma:generate

   # Run migrations
   npm run migrate

   # Seed the database
   npm run seed
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:4000`

## API Endpoints

### Authentication

- `POST /auth/signup` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user (requires auth)

### Trips

- `GET /trips?user=true` - List user's trips
- `GET /trips/:id?expand=stops,activities` - Get trip details
- `POST /trips` - Create a new trip
- `PATCH /trips/:id` - Update trip
- `DELETE /trips/:id` - Delete trip
- `GET /trips/:id/public` - Get public trip (no auth)
- `POST /trips/:id/copy` - Copy a public trip
- `GET /trips/:id/summary` - Get budget summary

### Stops

- `POST /trips/:tripId/stops` - Add stop to trip
- `PATCH /trips/:tripId/stops/:stopId` - Update stop
- `DELETE /trips/:tripId/stops/:stopId` - Remove stop

### Activities

- `POST /trips/:tripId/stops/:stopId/activities` - Add activity to stop
- `PATCH /trips/:tripId/activities/:activityId` - Update activity
- `DELETE /trips/:tripId/activities/:activityId` - Remove activity

### Cities

- `GET /cities?search=:query` - Search cities
- `GET /cities?popular=true` - Get popular cities

### Activities (Catalog)

- `GET /activities?cityId=:cityId` - Get activities for a city
- `GET /activities?category=:category` - Filter by category
- `GET /activities?maxCost=:maxCost` - Filter by max cost

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are valid for 7 days.

## Database Schema

### Main Tables

- **User**: User accounts
- **Trip**: Travel trips
- **City**: City catalog
- **TripStop**: Stops within a trip
- **Activity**: Activity catalog
- **TripActivity**: Activities added to stops
- **Expense**: Trip expenses

See `prisma/schema.prisma` for full schema details.

## Development

### Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:studio` - Open Prisma Studio

### Project Structure

```
src/
├── index.js              # Server entry point
├── routes/               # Route handlers
│   ├── auth.js
│   ├── trips.js
│   ├── cities.js
│   └── activities.js
└── middleware/           # Middleware functions
    ├── auth.js          # JWT authentication
    └── validation.js    # Request validation

prisma/
├── schema.prisma        # Database schema
└── seed.js             # Seed data script
```

## Testing

Run the test suite:
```bash
npm test
```

## Error Handling

All errors follow a consistent format:
```json
{
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Seed Data

The seed script creates:
- 8 sample cities (Paris, Tokyo, New York, London, Rome, Barcelona, Dubai, Sydney)
- 12 sample activities
- 1 test user (email: `test@example.com`, password: `password123`)
- 1 sample public trip

## CORS

CORS is configured to allow requests from the frontend origin. Update `CORS_ORIGIN` in `.env` for production.

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET` (32+ characters)
3. Configure proper CORS origin
4. Use environment variables for all secrets
5. Set up proper database connection pooling
6. Enable HTTPS
7. Set up error monitoring (Sentry)

## License

ISC

