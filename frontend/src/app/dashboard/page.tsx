"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { GridSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/FormElements";
import { tripService } from "@/services/api";
import { useAuthStore } from "@/lib/store";
import { MapPin, Calendar, Plus } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const loadTrips = async () => {
      try {
        const data = await tripService.getTrips();
        setTrips(data);
      } catch (err: any) {
        setError("Failed to load trips");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, [user, router]);

  const upcomingTrips = trips.filter(
    (trip) => new Date(trip.start_date) > new Date()
  );
  const totalDays = trips.reduce((sum, trip) => {
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    return (
      sum +
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
      1
    );
  }, 0);

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <div className="container py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome back, {user?.name || "Traveler"}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Ready for your next adventure?
              </p>
            </div>
            <Link href="/trips/create">
              <Button size="lg" className="flex items-center gap-2">
                <Plus size={20} />
                Plan New Trip
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-gray-600 text-sm font-medium mb-2">
                Total Trips
              </div>
              <div className="text-3xl font-bold text-primary">
                {trips.length}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-gray-600 text-sm font-medium mb-2">
                Upcoming Trips
              </div>
              <div className="text-3xl font-bold text-secondary">
                {upcomingTrips.length}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-gray-600 text-sm font-medium mb-2">
                Days Planned
              </div>
              <div className="text-3xl font-bold text-success">{totalDays}</div>
            </div>
          </div>

          {/* Upcoming Trips */}
          {loading ? (
            <GridSkeleton count={2} />
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          ) : upcomingTrips.length === 0 ? (
            <EmptyState
              icon={<MapPin size={48} />}
              title="No upcoming trips"
              description="Plan your next adventure and start exploring amazing destinations!"
              action={
                <Link href="/trips/create">
                  <Button>Create Your First Trip</Button>
                </Link>
              }
            />
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Upcoming Trips
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingTrips.slice(0, 2).map((trip) => (
                  <Link key={trip.trip_id} href={`/trips/${trip.trip_id}`}>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        {trip.trip_name}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={18} />
                          <span>
                            {new Date(trip.start_date).toLocaleDateString()} -{" "}
                            {new Date(trip.end_date).toLocaleDateString()}
                          </span>
                        </div>
                        {trip.description && (
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {trip.description}
                          </p>
                        )}
                        <div className="pt-2 text-primary font-medium">
                          View trip →
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
