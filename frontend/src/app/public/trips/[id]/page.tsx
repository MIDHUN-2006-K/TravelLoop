"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

// This old route redirects to the new shared trip flow via /trips/:id
export default function LegacyPublicTripPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  useEffect(() => {
    // Redirect to the trip's authenticated view; if not auth'd the app will redirect to login
    router.replace(`/trips/${tripId}`);
  }, [tripId, router]);

  return null;
}
