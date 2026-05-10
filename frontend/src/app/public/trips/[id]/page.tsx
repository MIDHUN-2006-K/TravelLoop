"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { CardSkeleton } from "@/components/Skeletons";
import { Alert } from "@/components/EmptyState";
import { Button } from "@/components/FormElements";
import TripMap from "@/components/TripMap";
import ItineraryTimeline from "@/components/ItineraryTimeline";
import { tripService, helperService } from "@/services/api";
import { useAuthStore } from "@/lib/store";
import { Trip, MapPoint } from "@/types";
import { MapPin, Calendar, Copy, Share2 } from "lucide-react";
import toast from "react-hot-toast";

export default function PublicTripPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;
  const { user } = useAuthStore();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPublicTrip();
  }, [tripId]);

  const loadPublicTrip = async () => {
    try {
      setLoading(true);
      // Use public endpoint - no auth required
      const data = await tripService.getPublicTrip(tripId, "stops,activities");
      setTrip(data);

      // Get map points
      const points = await helperService.getTripMapPoints(tripId);
      setMapPoints(points);

      setError("");
    } catch (err) {
      setError("Failed to load public itinerary");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTrip = async () => {
    if (!user) {
      // Prompt login
      toast.error("Please sign in to copy this trip");
      router.push("/login");
      return;
    }

    try {
      const copiedTrip = await tripService.copyTrip(tripId);
      toast.success("Trip copied successfully!");
      router.push(`/trips/${copiedTrip.trip_id}`);
    } catch (err) {
      toast.error("Failed to copy trip");
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/public/trips/${tripId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <CardSkeleton />
      </>
    );
  }

  if (error || !trip) {
    return (
      <>
        <Navbar />
        <main className="container py-8">
          <Alert
            type="error"
            title="Error"
            message={error || "Itinerary not found"}
          />
        </main>
      </>
    );
  }

  const totalDays =
    Math.ceil(
      (new Date(trip.end_date).getTime() -
        new Date(trip.start_date).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-8">
        <div className="container">
          {/* Trip Header */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      🔓 Public Itinerary
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {trip.trip_name}
                  </h1>
                  {trip.description && (
                    <p className="text-gray-600 text-lg">{trip.description}</p>
                  )}
                </div>
              </div>

              {/* Trip Meta */}
              <div className="flex items-center gap-6 text-gray-600 pt-4 border-t border-gray-200 flex-wrap">
                <div className="flex items-center gap-2">
                  <Calendar size={20} />
                  <span>
                    {new Date(trip.start_date).toLocaleDateString()} -{" "}
                    {new Date(trip.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={20} />
                  <span>
                    {trip.stops?.length || 0} stops • {totalDays} days
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 flex-wrap">
                {user && (
                  <Button
                    onClick={handleCopyTrip}
                    className="flex items-center gap-2"
                    variant="primary"
                  >
                    <Copy size={16} />
                    Copy to My Trips
                  </Button>
                )}

                <Button
                  onClick={handleShare}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Share2 size={16} />
                  Share Link
                </Button>

                <Button
                  onClick={handlePrint}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  🖨️ Print
                </Button>
              </div>

              {!user && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <p className="text-sm text-blue-900">
                    <strong>Want to copy this trip?</strong>{" "}
                    <Link
                      href="/login"
                      className="underline font-semibold hover:text-blue-700"
                    >
                      Sign in or create an account
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Route Map */}
          {mapPoints.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Route Map
              </h2>
              <TripMap points={mapPoints} height="400px" />
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Itinerary</h2>
            <ItineraryTimeline trip={trip} />
          </div>

          {/* Stops Overview */}
          {trip.stops && trip.stops.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Stops</h2>
              <div className="space-y-4">
                {trip.stops.map((stop, index) => (
                  <div
                    key={stop.stop_id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary transition"
                  >
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {stop.city
                            ? `${stop.city.name}, ${stop.city.country}`
                            : `${stop.stopping_place}`}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(stop.start_date).toLocaleDateString()} -{" "}
                          {new Date(stop.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Activities */}
                    {stop.activities && stop.activities.length > 0 && (
                      <div className="ml-12 pt-3 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Activities:
                        </p>
                        <ul className="space-y-1">
                          {stop.activities.map((activity) => (
                            <li
                              key={activity.trip_activity_id}
                              className="text-sm text-gray-600"
                            >
                              • {activity.name}
                              {activity.custom_cost && (
                                <span className="ml-2 text-gray-500">
                                  (${activity.custom_cost.toFixed(2)})
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA for non-logged-in users */}
          {!user && (
            <div className="mt-12 bg-gradient-to-r from-primary to-secondary text-white rounded-lg shadow-lg p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Plan Your Own Trip?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Create your personalized travel itinerary with GlobeTrotter.
              </p>
              <Link href="/signup">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white border-white hover:bg-white hover:text-primary"
                >
                  Get Started Free
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </>
  );
}
