# GlobeTrotter Frontend - Quick Reference

## 🚀 Start Here

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# http://localhost:3000
```

## 📍 Key Routes

| Route           | Purpose                      |
| --------------- | ---------------------------- |
| `/`             | Redirect (login if not auth) |
| `/login`        | Sign in screen               |
| `/signup`       | Create account screen        |
| `/dashboard`    | Home page with stats         |
| `/trips`        | List all trips               |
| `/trips/create` | Create new trip form         |
| `/trips/[id]`   | Trip details & planning      |
| `/profile`      | User account settings        |

## 🔑 Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 📦 Dependencies

```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "axios": "^1.6.0",
  "zustand": "^4.4.0",
  "tailwindcss": "^3.3.0",
  "react-hot-toast": "^2.4.0",
  "lucide-react": "^0.294.0",
  "date-fns": "^2.30.0"
}
```

## 🎨 Component Examples

### Button

```tsx
<Button variant="primary" size="md">Click</Button>
<Button variant="danger" loading={isLoading}>Delete</Button>
```

### Input

```tsx
<Input label="Email" type="email" error={error} onChange={handleChange} />
```

### Empty State

```tsx
<EmptyState
  icon={<MapPin />}
  title="No trips"
  description="Create one to start planning"
/>
```

## 🔌 API Usage

```typescript
import { tripService, authService } from "@/services/api";

// Login
const { token, user } = await authService.login(email, password);

// Fetch trips
const trips = await tripService.getTrips();

// Create trip
const trip = await tripService.createTrip({
  trip_name: "Europe Trip",
  start_date: "2026-06-01",
  end_date: "2026-06-15",
});

// Add stop
await tripStopsService.addStop(tripId, {
  city_id: "city-123",
  start_date: "2026-06-01",
  end_date: "2026-06-05",
});
```

## 🗂️ State Management

```typescript
import { useAuthStore, useTripStore } from "@/lib/store";

// Auth
const { user, token, logout, setUser } = useAuthStore();

// Trips
const { trips, selectedTrip, setTrips } = useTripStore();
```

## 🎯 Common Tasks

### Add New Page

1. Create file: `src/app/new-page/page.tsx`
2. Add client component: `'use client'`
3. Use Navbar component
4. Add to Navbar links

### Add Form Input

1. Use `<Input>` from FormElements
2. Handle onChange and state
3. Show error state

### Make API Call

1. Import service: `import { tripService } from '@/services/api'`
2. Call function: `const data = await tripService.getTrips()`
3. Handle errors with try/catch
4. Show toast: `toast.success('Done!')`

## 🐛 Debugging

```typescript
// Check auth state
console.log(useAuthStore.getState());

// Check trips
console.log(useTripStore.getState());

// Log API calls
// Browser DevTools → Network tab → look for http://localhost:4000
```

## ✅ Validation

```typescript
// Email validation
const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Date comparison
if (startDate >= endDate) {
  setError("End date must be after start date");
}

// Required fields
if (!formData.trip_name) {
  setError("Trip name is required");
}
```

## 📱 Responsive Classes

```css
/* Tailwind responsive prefixes */
md: /* screens ≥ 768px */
lg: /* screens ≥ 1024px */
xl: /* screens ≥ 1280px */

/* Examples */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
<button className="px-4 py-2 md:px-6 md:py-3">
```

## 🎨 Colors

```css
--primary: #1e40af    /* Blue */
--secondary: #7c3aed  /* Purple */
--success: #10b981    /* Green */
--warning: #f59e0b    /* Amber */
--danger: #ef4444     /* Red */
```

## 📋 Checklist for New Feature

- [ ] Create service function in `services/api.ts`
- [ ] Define TypeScript types in `types/index.ts`
- [ ] Create component in `components/`
- [ ] Create/update page in `app/`
- [ ] Add error handling
- [ ] Add loading state
- [ ] Add success/error toast
- [ ] Test with actual data
- [ ] Check responsive design
- [ ] Update Navbar if needed

## 🚀 Build & Deploy

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Type check
npm run type-check
```

## 🔗 Links

- Backend: `http://localhost:4000`
- Frontend: `http://localhost:3000`
- Docs: See README.md
- Setup: See SETUP.md

## 💡 Pro Tips

1. Use `line-clamp-2` to truncate text
2. Use `opacity-50` for disabled states
3. Use `transition` for smooth animations
4. Store auth token in localStorage
5. Always check `if (user)` before rendering protected content
6. Use `toast.error()` for errors
7. Use `CardSkeleton` while loading
8. Use `EmptyState` for empty lists

## 🆘 Troubleshooting

| Problem      | Solution                                    |
| ------------ | ------------------------------------------- |
| 401 errors   | Check token is saved and sent with requests |
| CORS errors  | Verify CORS_ORIGIN in backend .env          |
| Blank page   | Check browser console for errors            |
| No data      | Verify API URL in .env.local                |
| Slow loading | Use Skeletons, check Network tab            |

---

**Last Updated**: January 3, 2026
**Version**: 1.0.0
