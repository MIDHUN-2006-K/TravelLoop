# GlobeTrotter Frontend

A modern, responsive Next.js 14 frontend for the GlobeTrotter travel planning application.

## 🚀 Features

- **Authentication**: Secure signup/login with JWT tokens
- **Dashboard**: Quick overview of trips and statistics
- **Trip Management**: Create, view, edit, and delete trips
- **Trip Planning**: Add cities (stops) and activities to trips
- **Responsive Design**: Mobile-first, fully responsive UI
- **Real-time Feedback**: Toast notifications for user actions
- **Loading States**: Skeleton loaders for better UX
- **Error Handling**: Comprehensive error boundaries and alerts

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js 14 App Router
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home/redirect
│   │   ├── login/        # Login page
│   │   ├── signup/       # Signup page
│   │   ├── dashboard/    # Dashboard page
│   │   ├── trips/        # Trips listing and creation
│   │   └── profile/      # User profile
│   ├── components/       # Reusable React components
│   │   ├── Navbar.tsx    # Navigation bar
│   │   ├── FormElements.tsx  # Form inputs and buttons
│   │   ├── EmptyState.tsx    # Empty/error states
│   │   └── Skeletons.tsx     # Loading skeletons
│   ├── lib/              # Utilities and stores
│   │   ├── apiClient.ts  # Axios API client
│   │   └── store.ts      # Zustand state management
│   ├── services/         # API service functions
│   │   └── api.ts        # API endpoints
│   ├── types/            # TypeScript types
│   │   └── index.ts      # All type definitions
│   └── styles/           # Global styles
└── public/               # Static files
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **UI Components**: Lucide Icons
- **Notifications**: React Hot Toast
- **Date Utils**: date-fns

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API URL
```

## 🚀 Running the Application

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start
```

The app will be available at `http://localhost:3000`

## 🔐 Authentication Flow

1. User signs up or logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. Token automatically added to all API requests
5. On token expiration (401), user redirected to login

## 🎯 API Integration

All API calls are made through the service layer in `src/services/api.ts`:

```typescript
// Example: Create a trip
const trip = await tripService.createTrip({
  trip_name: "Europe Tour",
  start_date: "2026-06-01",
  end_date: "2026-06-15",
  description: "Summer vacation",
});
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎨 Color Scheme

- **Primary**: `#1e40af` (Blue)
- **Secondary**: `#7c3aed` (Purple)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Amber)
- **Danger**: `#ef4444` (Red)

## 🔄 State Management

Using Zustand for global state:

```typescript
// Auth store
const { user, token, setUser, logout } = useAuthStore();

// Trip store
const { trips, selectedTrip, setTrips } = useTripStore();
```

## 🚫 Important Constraints

✅ **What's Implemented**:

- Frontend-only features (UI, UX, layouts)
- API integration with existing endpoints
- Form validation and error handling
- Loading and empty states
- Responsive design

❌ **What's NOT Modified**:

- Backend API endpoints
- Database schema
- Request/response formats
- API authentication logic

## 📚 Component Usage

### Button

```tsx
<Button variant="primary" size="md" loading={false}>
  Click me
</Button>
```

### Form Inputs

```tsx
<Input label="Email" type="email" error={error} onChange={handleChange} />
```

### Empty State

```tsx
<EmptyState
  icon={<MapIcon />}
  title="No trips"
  description="Create your first trip"
  action={<Button>Create</Button>}
/>
```

## 🐛 Debugging

Enable verbose logging by setting in `.env.local`:

```
DEBUG=*
```

Check browser console (F12) for detailed API call information.

## 📖 Contributing

Follow these conventions:

- Use TypeScript strict mode
- Name components with PascalCase
- Use semantic HTML
- Keep components under 300 lines
- Add proper error boundaries

## 📄 License

MIT
