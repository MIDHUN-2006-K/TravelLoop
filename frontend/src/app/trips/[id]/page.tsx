"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { CardSkeleton } from "@/components/Skeletons";
import { Alert } from "@/components/EmptyState";
import { Button } from "@/components/FormElements";
const TripMap = dynamic(() => import("@/components/TripMap"), { ssr: false });
import ItineraryTimeline from "@/components/ItineraryTimeline";
import TripBudget from "@/components/TripBudget";
import ActivityManager from "@/components/ActivityManager";
import { tripService, tripStopsService, helperService } from "@/services/api";
import { useAuthStore } from "@/lib/store";
import { Trip, MapPoint } from "@/types";
import { MapPin, Calendar, Edit2, Plus, Trash2, X, Share2 } from "lucide-react";
import toast from "react-hot-toast";

type TabType = "overview" | "timeline" | "budget";

export default function TripDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;
  const { user } = useAuthStore();

  // State management
  const [trip, setTrip] = useState<Trip | null>(null);
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddStop, setShowAddStop] = useState(false);
  const [stoppingPlace, setStoppingPlace] = useState("");
  const [stopDates, setStopDates] = useState({ start: "", end: "" });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    loadTrip();
  }, [tripId, user, router]);

  const loadTrip = async () => {
    try {
      setLoading(true);
      const data = await tripService.getTripById(tripId, "stops,activities");
      setTrip(data);

      // Load map points
      const points = await helperService.getTripMapPoints(tripId);
      setMapPoints(points);

      setError("");
    } catch (err) {
      setError("Failed to load trip");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stoppingPlace.trim() || !stopDates.start || !stopDates.end) {
      toast.error("Please fill in all stop details");
      return;
    }

    if (new Date(stopDates.end) < new Date(stopDates.start)) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      await tripStopsService.addStop(tripId, {
        stopping_place: stoppingPlace,
        start_date: stopDates.start,
        end_date: stopDates.end,
        order_index: trip?.stops?.length || 0,
      });

      toast.success("Stop added successfully");
      setShowAddStop(false);
      setStoppingPlace("");
      setStopDates({ start: "", end: "" });
      await loadTrip();
    } catch (err) {
      toast.error("Failed to add stop");
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!confirm("Delete this stop and its activities?")) return;

    try {
      await tripStopsService.deleteStop(tripId, stopId);
      toast.success("Stop deleted");
      await loadTrip();
    } catch (err) {
      toast.error("Failed to delete stop");
    }
  };

  const handleShareTrip = async () => {
    const shareUrl = `${window.location.origin}/public/trips/${tripId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Public link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  if (loading)
    return (
      <>
        <Navbar />
        <CardSkeleton />
      </>
    );

  if (error || !trip) {
    return (
      <>
        <Navbar />
        <main className="container py-8">
          <Alert
            type="error"
            title="Error"
            message={error || "Trip not found"}
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
        <div className="max-w-7xl mx-auto px-4">
          {/* Trip Header */}
          <div className="mb-8">
            <Link
              href="/trips"
              className="text-primary hover:underline mb-4 inline-block"
            >
              ← Back to Trips
            </Link>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {trip.trip_name}
                  </h1>
                  {trip.description && (
                    <p className="text-gray-600 text-lg">{trip.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleShareTrip}
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Share2 size={16} />
                    Share
                  </Button>
                  <Link href={`/trips/${tripId}/edit`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Edit2 size={16} />
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>

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
                <div>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {trip.is_public ? "🔓 Public" : "🔒 Private"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Container */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Tab Buttons */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex-1 px-6 py-4 font-medium transition ${
                  activeTab === "overview"
                    ? "text-primary border-b-2 border-primary bg-blue-50"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                role="tab"
                aria-selected={activeTab === "overview"}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("timeline")}
                className={`flex-1 px-6 py-4 font-medium transition ${
                  activeTab === "timeline"
                    ? "text-primary border-b-2 border-primary bg-blue-50"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                role="tab"
                aria-selected={activeTab === "timeline"}
              >
                Timeline
              </button>
              <button
                onClick={() => setActiveTab("budget")}
                className={`flex-1 px-6 py-4 font-medium transition ${
                  activeTab === "budget"
                    ? "text-primary border-b-2 border-primary bg-blue-50"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                role="tab"
                aria-selected={activeTab === "budget"}
              >
                Budget
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Map */}
                  {mapPoints.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Route Map
                      </h2>
                      <TripMap points={mapPoints} height="400px" />
                    </div>
                  )}

                  {/* Stops Section */}
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Stops ({trip.stops?.length || 0})
                      </h2>
                      {!showAddStop && (
                        <Button
                          onClick={() => {
                            setShowAddStop(true);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Plus size={18} />
                          Add Stop
                        </Button>
                      )}
                    </div>

                    {/* Add Stop Form */}
                    {showAddStop && (
                      <form
                        onSubmit={handleAddStop}
                        className="mb-8 p-6 bg-blue-50 rounded-lg border-2 border-primary"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold text-lg">
                            Add New Stop
                          </h3>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddStop(false);
                              setStoppingPlace("");
                              setStopDates({ start: "", end: "" });
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Stopping Place
                            </label>
                            <input
                              type="text"
                              value={stoppingPlace}
                              onChange={(e) => setStoppingPlace(e.target.value)}
                              placeholder="e.g., Paris, Tokyo, New York"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={stopDates.start}
                              onChange={(e) =>
                                setStopDates({
                                  ...stopDates,
                                  start: e.target.value,
                                })
                              }
                              min={trip.start_date}
                              max={trip.end_date}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              End Date
                            </label>
                            <input
                              type="date"
                              value={stopDates.end}
                              onChange={(e) =>
                                setStopDates({
                                  ...stopDates,
                                  end: e.target.value,
                                })
                              }
                              min={trip.start_date}
                              max={trip.end_date}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              required
                            />
                          </div>
                        </div>
                        <Button type="submit" size="sm">
                          Add Stop
                        </Button>
                      </form>
                    )}

                    {/* Stops List */}
                    {trip.stops && trip.stops.length > 0 ? (
                      <div className="space-y-4">
                        {trip.stops.map((stop, index) => (
                          <div
                            key={stop.stop_id}
                            className="p-6 border border-gray-200 rounded-lg hover:border-primary transition"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                  </span>
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {stop.city
                                        ? `${stop.city.name}, ${stop.city.country}`
                                        : `${stop.stopping_place}`}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      {new Date(
                                        stop.start_date
                                      ).toLocaleDateString()}{" "}
                                      -{" "}
                                      {new Date(
                                        stop.end_date
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteStop(stop.stop_id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>

                            {/* Activity Manager */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <ActivityManager
                                tripId={tripId}
                                stop={stop}
                                onActivityAdded={loadTrip}
                                onActivityDeleted={loadTrip}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <MapPin size={40} className="mx-auto mb-3 opacity-50" />
                        <p>
                          No stops added yet. Add your first stop to get
                          started!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline Tab */}
              {activeTab === "timeline" && trip && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Itinerary Timeline
                  </h2>
                  <ItineraryTimeline trip={trip} />
                </div>
              )}

              {/* Budget Tab */}
              {activeTab === "budget" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Trip Budget
                  </h2>
                  <TripBudget tripId={tripId} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
