# GlobeTrotter - Trip Planning Application

A full-stack web application for planning and organizing trips with stops, activities, budgets, and itineraries.

## 🌍 Features

- **Trip Management**: Create, edit, and manage multiple trips
- **Trip Stops**: Add multiple stops/destinations to your trips with custom stopping places
- **Activity Management**: Add activities to each stop with dates and costs
- **Budget Tracking**: Track trip expenses by category and by day
- **Interactive Maps**: Visualize trip routes on an interactive map (Leaflet)
- **Timeline View**: View trip itinerary in a calendar/timeline format
- **Budget Analysis**: Detailed budget breakdown and expense tracking
- **Trip Sharing**: Share trips publicly via generated links
- **User Authentication**: Secure login and registration system

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + PostCSS
- **Maps**: Leaflet + React Leaflet
- **State Management**: Zustand
- **UI Components**: Custom components + Lucide icons
- **Notifications**: React Hot Toast

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Joi

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Git

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ODOO-x-SNS
```

### 2. Setup Backend

```bash
cd node-backend

# Install dependencies
npm install

# Setup environment variables
# Create .env file and add:
DATABASE_URL=postgresql://user:password@localhost:5432/globetrotter
JWT_SECRET=your_jwt_secret_key

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed

# Start the backend server
npm run dev
# Server runs on http://localhost:4000
```

### 3. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local file with:
NEXT_PUBLIC_API_URL=http://localhost:4000

# Start the development server
npm run dev
# Application runs on http://localhost:3000
```

## 📁 Project Structure

```
ODOO-x-SNS/
├── frontend/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/                # App router pages
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── dashboard/
│   │   │   ├── trips/
│   │   │   │   └── [id]/
│   │   │   └── public/trips/   # Public trip viewing
│   │   ├── components/         # Reusable UI components
│   │   ├── services/           # API service layer
│   │   ├── lib/                # Utilities and helpers
│   │   ├── types/              # TypeScript types
│   │   └── styles/             # Global styles
│   ├── public/                 # Static assets
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── next.config.js
│
├── node-backend/               # Express backend application
│   ├── src/
│   │   ├── routes/             # API route handlers
│   │   │   ├── auth.js
│   │   │   ├── trips.js
│   │   │   ├── cities.js
│   │   │   └── activities.js
│   │   ├── middleware/         # Express middleware
│   │   │   ├── auth.js
│   │   │   └── validation.js
│   │   ├── utils/              # Utility functions
│   │   └── index.js            # Entry point
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   ├── migrations/         # Database migrations
│   │   └── seed.js             # Database seeding
│   ├── package.json
│   ├── jest.config.js
│   └── docker-compose.yml      # Docker setup (optional)
│
└── README.md                    # This file
```

## 🔌 API Endpoints

### Authentication

- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Trips

- `GET /trips?user=true` - Get user's trips
- `GET /trips/:id` - Get trip details
- `GET /trips/:id/public` - Get public trip (no auth required)
- `POST /trips` - Create new trip
- `PATCH /trips/:id` - Update trip
- `DELETE /trips/:id` - Delete trip
- `POST /trips/:id/copy` - Duplicate trip

### Trip Stops

- `POST /trips/:tripId/stops` - Add stop to trip
- `PATCH /trips/:tripId/stops/:stopId` - Update stop
- `DELETE /trips/:tripId/stops/:stopId` - Delete stop

### Activities

- `POST /trips/:tripId/stops/:stopId/activities` - Add activity
- `PATCH /trips/:tripId/stops/:stopId/activities/:actId` - Update activity
- `DELETE /trips/:tripId/stops/:stopId/activities/:actId` - Delete activity

### Cities

- `GET /cities/search?q=query` - Search cities
- `GET /cities` - Get all cities

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. User registers/logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. Token sent in `Authorization` header for protected routes
5. Backend validates token on each request

## 📊 Database Schema

Key models:

- **User**: User accounts and authentication
- **Trip**: Trip metadata and planning
- **TripStop**: Stops/destinations within a trip (supports custom stopping_place)
- **Activity**: Activities available at each stop
- **TripActivity**: Activities scheduled for a trip stop
- **Expense**: Budget tracking for trips
- **City**: City database with coordinates

## 🚦 Running in Development

### Terminal 1 - Backend

```bash
cd node-backend
npm run dev
```

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

### Terminal 3 - Database (if using Docker)

```bash
cd node-backend
docker-compose up
```

## 🏗️ Building for Production

### Frontend

```bash
cd frontend
npm run build
npm run start
```

### Backend

```bash
cd node-backend
npm run build  # If applicable
npm start
```

## 🧪 Testing

### Backend Tests

```bash
cd node-backend
npm test
```

### Frontend (if setup)

```bash
cd frontend
npm test
```

## 🔧 Environment Variables

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Backend (.env)

```
DATABASE_URL=postgresql://user:password@localhost:5432/globetrotter
JWT_SECRET=your_secret_key_here
NODE_ENV=development
PORT=4000
```

## 📝 Features in Detail

### Trip Planning

- Create trips with start/end dates and descriptions
- Add multiple stops with custom names or city selection
- Set dates for each stop
- Track trip duration and location count

### Activity Management

- Add activities to each stop
- Schedule activities on specific dates
- Track activity costs
- Add notes to activities

### Budget Tracking

- Real-time budget calculations
- Track expenses by category
- Daily expense breakdown
- Total trip cost analysis

### Map Visualization

- Interactive maps for trip routes
- Stop markers with order numbers
- Only shows stops with actual coordinates
- Responsive design

### Public Sharing

- Generate shareable public links
- View public trips without authentication
- Share trip details with friends and family

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
# Verify DATABASE_URL in .env
# Run migrations: npx prisma migrate dev
```

### Port Already in Use

```bash
# Change ports in environment or kill process:
# Frontend: Update in next.config.js or use PORT=3001 npm run dev
# Backend: Update in .env or use PORT=5000 npm run dev
```

### SSR/Hydration Errors

- Leaflet maps use dynamic imports with `ssr: false`
- Ensure browser-only code is properly wrapped

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit changes (`git commit -m 'Add AmazingFeature'`)
3. Push to branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👨‍💻 Author

GlobeTrotter Development Team

## 📞 Support

For issues and questions, please open an issue in the repository.

---

**Last Updated**: January 3, 2026
