# Traveloop - Premium Trip Planning Platform

A full-stack, production-ready web application for planning, organizing, and visualizing your travel experiences. Traveloop (formerly GlobeTrotter) helps you manage multi-city trips, budgets, packing lists, and itineraries in a sleek, modern UI.

## 🌍 Core Features

- **Trip Wizard**: Multi-step trip creation flow with destination tagging and custom cover images.
- **Detailed Itinerary**: Visual timeline view of your cities, dates, and scheduled activities.
- **Interactive Maps**: Full Leaflet integration visualizing your multi-city route with numbered waypoints.
- **Budget Tracking**: Granular expense logging with Recharts-powered visual breakdowns (donut and bar charts).
- **Packing Checklist**: Categorized packing lists with visual progress bars and quick-unpack options.
- **Travel Journal**: Built-in note-taking attached to specific days of your trip.
- **Public Sharing**: Generate secure, read-only links for friends to view or copy your itinerary.
- **Robust Authentication**: Secure OTP-based password resets via email and Base64 avatar uploads.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Premium glassmorphism, custom animations, curated palettes)
- **State Management**: Zustand (Persistent Auth, Trip, and UI stores)
- **Maps**: React Leaflet
- **Data Visualization**: Recharts
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT & bcryptjs
- **Email/OTP**: Nodemailer
- **Validation**: Joi

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd TravelLoop
```

### 2. Setup Backend

```bash
cd node-backend

# Install dependencies
npm install

# Setup environment variables
# Create .env file and add:
DATABASE_URL="postgresql://user:password@localhost:5432/traveloop?schema=public"
JWT_SECRET="your_jwt_secret_key"
PORT=4000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"

# SMTP for OTP Emails
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER="your_user"
SMTP_PASS="your_pass"
SMTP_FROM="noreply@traveloop.com"

# Run database migrations
npx prisma migrate dev

# Seed the database (Provides 20 cities, 30 activities, and a robust sample trip)
npm run seed

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
NEXT_PUBLIC_API_URL="http://localhost:4000"

# Start the development server
npm run dev
# Application runs on http://localhost:3000
```

## 📁 Project Structure

```
TravelLoop/
├── frontend/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/                # App router pages (login, dashboard, trips, etc.)
│   │   ├── components/         # Premium UI Components (TripMap, TripBudget, etc.)
│   │   ├── services/           # Axios API service layer mapped to backend
│   │   ├── lib/                # Zustand stores and utils
│   │   ├── types/              # Comprehensive TypeScript interfaces
│   │   └── styles/             # Global CSS and Tailwind directives
│   └── tailwind.config.ts      # Custom theme, palettes, and animations
│
├── node-backend/               # Express backend application
│   ├── src/
│   │   ├── routes/             # Feature routes (auth, trips, packing, notes, sharing)
│   │   ├── middleware/         # Auth verification and Joi validation
│   │   └── utils/              # Nodemailer email configurations
│   ├── prisma/
│   │   ├── schema.prisma       # Full relational DB schema
│   │   └── seed.js             # Rich seed data generation
│   └── package.json
│
└── README.md                    # This file
```

## 🔐 Authentication Flow

1. **Signup/Login**: Users authenticate securely with hashed passwords.
2. **JWT**: Token is stored locally and sent via HTTP Bearer headers.
3. **Password Reset**: Users receive a 6-digit OTP via Nodemailer.
4. **Profile**: Users can update preferences and upload Base64 encoded avatar images directly to the database.

## 📊 Database Schema

Key models defined in Prisma:
- **User**: Core accounts with OTP state management.
- **Trip**: Master itinerary container with dynamic status (Draft, Planned, Active).
- **TripStop**: Nested city destinations with order tracking.
- **Activity**: Catalog and trip-specific events.
- **Expense**: Categorized financial tracking.
- **PackingItem**: Boolean-tracked luggage requirements.
- **Note**: Free-text travel journals.
- **SharedTrip**: Security tokens for public sharing.
- **SavedDestination**: Bookmarked cities.

## 🚦 Running the Application

Open two terminal windows:

**Terminal 1 - Backend**
```bash
cd node-backend
npm run dev
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to interact with Traveloop.

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/NewFeature`)
2. Commit changes (`git commit -m 'Add NewFeature'`)
3. Push to branch (`git push origin feature/NewFeature`)
4. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see LICENSE file for details.

---

**Last Updated**: May 2026
