"use client";

// This is a client-side middleware redirect handler
// Used in the root layout to check auth state

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export function useAuthMiddleware() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();

  useEffect(() => {
    // Public routes (don't need auth)
    const publicRoutes = ["/login", "/signup", "/"];

    // Protected routes (need auth)
    const isPublicRoute = publicRoutes.includes(pathname);
    const isAuthRoute = pathname === "/login" || pathname === "/signup";

    if (!user && !isPublicRoute) {
      // User not logged in, trying to access protected route
      router.push("/login");
    } else if (user && isAuthRoute) {
      // User logged in, trying to access auth routes
      router.push("/dashboard");
    }
  }, [user, pathname, router]);
}

// Usage in layout.tsx:
// import { useAuthMiddleware } from '@/lib/middleware'
//
// export default function Layout({ children }) {
//   useAuthMiddleware()
//   return <>{children}</>
// }
