"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { GridSkeleton } from "@/components/Skeletons";
import { EmptyState, Alert } from "@/components/EmptyState";
import { Button } from "@/components/FormElements";
import { tripService } from "@/services/api";
import { useAuthStore } from "@/lib/store";
import { MapPin, Calendar, Copy, Trash2, Plus } from "lucide-react";
import { Trip } from "@/types";
import toast from "react-hot-toast";

export default function TripsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    loadTrips();
  }, [user, router]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await tripService.getTrips();
      setTrips(data);
    } catch (err) {
      setError("Failed to load trips");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tripId: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;

    try {
      await tripService.deleteTrip(tripId);
      setTrips(trips.filter((t) => t.trip_id !== tripId));
      toast.success("Trip deleted successfully");
    } catch (err) {
      toast.error("Failed to delete trip");
    }
  };

  const handleCopy = async (tripId: string) => {
    try {
      const newTrip = await tripService.copyTrip(tripId);
      setTrips([newTrip, ...trips]);
      toast.success("Trip copied successfully");
    } catch (err) {
      toast.error("Failed to copy trip");
    }
  };

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <div className="container py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Trips</h1>
              <p className="text-gray-600 mt-2">
                Manage and plan all your travel adventures
              </p>
            </div>
            <Link href="/trips/create">
              <Button size="lg" className="flex items-center gap-2">
                <Plus size={20} />
                New Trip
              </Button>
            </Link>
          </div>

          {/* Content */}
          {loading ? (
            <GridSkeleton count={6} />
          ) : error ? (
            <Alert type="error" title="Error" message={error} />
          ) : trips.length === 0 ? (
            <EmptyState
              icon={<MapPin size={48} />}
              title="No trips yet"
              description="Start planning your first trip and create unforgettable memories"
              action={
                <Link href="/trips/create">
                  <Button>Create Your First Trip</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <div
                  key={trip.trip_id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {trip.trip_name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={16} />
                      <span>
                        {new Date(trip.start_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        -{" "}
                        {new Date(trip.end_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    {trip.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {trip.description}
                      </p>
                    )}

                    {/* Trip Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 font-medium">
                          Stops
                        </div>
                        <div className="text-lg font-bold text-primary">
                          {trip.stops?.length || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-medium">
                          Status
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {trip.is_public ? "Public" : "Private"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-gray-50 flex gap-2">
                    <Link href={`/trips/${trip.trip_id}`} className="flex-1">
                      <Button variant="primary" className="w-full">
                        View
                      </Button>
                    </Link>
                    <button
                      onClick={() => handleCopy(trip.trip_id)}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded transition"
                      title="Copy trip"
                    >
                      <Copy size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(trip.trip_id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete trip"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
