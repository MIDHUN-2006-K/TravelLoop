"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Calendar, Map, DollarSign, CheckSquare, BookOpen, Share2,
  Plus, Trash2, Edit2, Globe2, ArrowLeft, Copy, ExternalLink,
  Clock, ChevronDown, X, Plane,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button, Badge, Input, Modal } from "@/components/FormElements";
import { Alert } from "@/components/EmptyState";
import { TimelineSkeleton } from "@/components/Skeletons";
import PackingChecklist from "@/components/PackingChecklist";
import TripNotes from "@/components/TripNotes";
import { tripService, tripStopsService, activitiesService, citiesService, catalogActivitiesService, sharingService, expenseService } from "@/services/api";
import { useAuthStore } from "@/lib/store";
import { Trip, TripStop, City, Activity, Expense } from "@/types";
import { format, parseISO, differenceInDays } from "date-fns";
import toast from "react-hot-toast";

// Dynamic imports for heavy components
const TripMap = dynamic(() => import("@/components/TripMap"), { ssr: false, loading: () => <div className="skeleton h-96 rounded-2xl" /> });
const TripBudget = dynamic(() => import("@/components/TripBudget"), { ssr: false });

const TABS = [
  { id: "overview", label: "Overview", icon: Globe2 },
  { id: "itinerary", label: "Itinerary", icon: Calendar },
  { id: "budget", label: "Budget", icon: DollarSign },
  { id: "map", label: "Map", icon: Map },
  { id: "packing", label: "Packing", icon: CheckSquare },
  { id: "notes", label: "Notes", icon: BookOpen },
];

const CATEGORY_ICONS: Record<string, string> = {
  sightseeing: "🏛️", food: "🍽️", adventure: "🧗", nightlife: "🌙",
  culture: "🎭", shopping: "🛍️",
};

export default function TripDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;
  const { user } = useAuthStore();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState("");

  // Modals
  const [showAddStop, setShowAddStop] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState<string | null>(null); // stopId
  const [showShare, setShowShare] = useState(false);
  const [showEditTrip, setShowEditTrip] = useState(false);

  // Share
  const [shareToken, setShareToken] = useState("");
  const [sharing, setSharing] = useState(false);

  // Add Stop form
  const [stopForm, setStopForm] = useState({ city_id: "", stopping_place: "", start_date: "", end_date: "", order_index: "0" });
  const [cities, setCities] = useState<City[]>([]);
  const [citySearch, setCitySearch] = useState("");

  // Add Activity
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitySearch, setActivitySearch] = useState("");
  const [activityCat, setActivityCat] = useState("");

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    loadTrip();
  }, [user, tripId]);

  const loadTrip = async () => {
    try {
      setLoading(true);
      const data = await tripService.getTripById(tripId, "stops,activities,expenses");
      setTrip(data);
    } catch { setError("Failed to load trip"); }
    finally { setLoading(false); }
  };

  const loadCities = async (q?: string) => {
    try {
      const data = await citiesService.getCities({ search: q });
      setCities(data);
    } catch {}
  };

  const loadActivities = async (stopId: string) => {
    if (!trip) return;
    const stop = trip.stops?.find((s) => s.stop_id === stopId);
    if (!stop?.city?.city_id) return;
    try {
      const data = await catalogActivitiesService.getActivities({ cityId: stop.city.city_id, category: activityCat || undefined });
      setActivities(data);
    } catch {}
  };

  useEffect(() => {
    if (showAddStop) loadCities();
  }, [showAddStop]);

  useEffect(() => {
    if (citySearch.length > 1) loadCities(citySearch);
  }, [citySearch]);

  useEffect(() => {
    if (showAddActivity) loadActivities(showAddActivity);
  }, [showAddActivity, activityCat]);

  // ---- Actions ----
  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const stopData = {
        city_id: stopForm.city_id || undefined,
        stopping_place: !stopForm.city_id ? stopForm.stopping_place : undefined,
        start_date: stopForm.start_date,
        end_date: stopForm.end_date,
        order_index: parseInt(stopForm.order_index),
      };
      await tripStopsService.addStop(tripId, stopData);
      toast.success("Destination added!");
      setShowAddStop(false);
      setStopForm({ city_id: "", stopping_place: "", start_date: "", end_date: "", order_index: "0" });
      loadTrip();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add destination");
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!confirm("Remove this destination and all its activities?")) return;
    try {
      await tripStopsService.deleteStop(tripId, stopId);
      toast.success("Destination removed");
      loadTrip();
    } catch { toast.error("Failed to remove destination"); }
  };

  const handleAddActivity = async (activityId: string, stopId: string) => {
    if (!trip) return;
    const stop = trip.stops?.find((s) => s.stop_id === stopId);
    try {
      await activitiesService.addActivityToTrip(tripId, stopId, {
        activity_id: activityId,
        scheduled_date: stop?.start_date,
      });
      toast.success("Activity added!");
      loadTrip();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add activity");
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await activitiesService.deleteActivity(tripId, activityId);
      toast.success("Activity removed");
      loadTrip();
    } catch { toast.error("Failed to remove activity"); }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const share = await sharingService.shareTrip(tripId);
      setShareToken(share.share_token);
    } catch { toast.error("Failed to create share link"); }
    finally { setSharing(false); }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/shared/${shareToken}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  // ---- Render ----
  if (loading) return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-50 py-8">
        <div className="container">
          <div className="skeleton h-12 w-1/2 mb-8 rounded-xl" />
          <TimelineSkeleton />
        </div>
      </main>
    </>
  );

  if (!trip) return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-surface-900 mb-4">Trip not found</h2>
          <Button onClick={() => router.push("/trips")} icon={<ArrowLeft size={18} />} variant="ghost">Back to Trips</Button>
        </div>
      </main>
    </>
  );

  const totalDays = differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-50">
        {/* Hero Banner */}
        <div className="relative h-56 md:h-72 bg-gradient-to-br from-primary-800 to-primary-600 overflow-hidden">
          {trip.cover_image_url ? (
            <img src={trip.cover_image_url} alt={trip.trip_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #141d57 0%, #1a45f5 50%, #3366ff 100%)" }} />
          )}
          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute inset-0 flex flex-col justify-end p-6">
            <button onClick={() => router.push("/trips")} className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors">
              <ArrowLeft size={16} /> My Trips
            </button>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant={(trip.status === "ACTIVE" ? "success" : trip.status === "COMPLETED" ? "secondary" : "primary") as any} dot>
                    {trip.status || "PLANNED"}
                  </Badge>
                  {trip.tags?.slice(0, 3).map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">{t}</span>
                  ))}
                </div>
                <h1 className="text-2xl md:text-4xl font-display font-bold text-white">{trip.trip_name}</h1>
                <p className="text-white/70 text-sm mt-1">
                  {format(parseISO(trip.start_date), "MMM d")} – {format(parseISO(trip.end_date), "MMM d, yyyy")} · {totalDays} days · {trip.stops?.length || 0} destinations
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="!bg-white/10 !text-white hover:!bg-white/20" icon={<Share2 size={16} />} onClick={() => setShowShare(true)}>
                  Share
                </Button>
                <Button size="sm" variant="ghost" className="!bg-white/10 !text-white hover:!bg-white/20" icon={<Edit2 size={16} />} onClick={() => setShowEditTrip(true)}>
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="bg-white border-b border-surface-100 sticky top-16 z-30">
          <div className="container">
            <div className="flex overflow-x-auto scrollbar-hide">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      active ? "border-primary-500 text-primary-600" : "border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-200"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container py-8">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fade-in">
              {trip.description && (
                <div className="card p-6">
                  <h3 className="font-display font-semibold text-surface-900 mb-3">About This Trip</h3>
                  <p className="text-surface-600 leading-relaxed">{trip.description}</p>
                </div>
              )}

              {/* Stops Preview */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="section-title">Destinations</h2>
                  <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowAddStop(true)}>Add Destination</Button>
                </div>

                {(!trip.stops || trip.stops.length === 0) ? (
                  <div className="card p-10 text-center">
                    <p className="text-4xl mb-3">🗺️</p>
                    <p className="font-semibold text-surface-700 mb-1">No destinations yet</p>
                    <p className="text-sm text-surface-400 mb-6">Add cities to build your itinerary</p>
                    <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowAddStop(true)}>Add First Destination</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trip.stops.map((stop, i) => (
                      <div key={stop.stop_id} className="card p-5 group">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-surface-900 truncate">
                              {stop.city?.name || stop.stopping_place || "Unknown"}
                            </h3>
                            <p className="text-xs text-surface-500">{stop.city?.country}</p>
                            <p className="text-sm text-surface-500 mt-1">
                              {format(parseISO(stop.start_date), "MMM d")} – {format(parseISO(stop.end_date), "MMM d")}
                            </p>
                            <p className="text-xs text-surface-400 mt-1">
                              {(stop.activities?.length || 0)} activities
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteStop(stop.stop_id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-surface-300 hover:text-danger transition-all rounded-lg hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ITINERARY TAB */}
          {activeTab === "itinerary" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="section-title">Itinerary</h2>
                <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowAddStop(true)}>Add Destination</Button>
              </div>

              {(!trip.stops || trip.stops.length === 0) ? (
                <div className="card p-12 text-center">
                  <p className="text-4xl mb-3">📅</p>
                  <p className="font-semibold text-surface-700">No stops yet</p>
                  <p className="text-sm text-surface-400 mt-1 mb-6">Add destinations to build your itinerary</p>
                  <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowAddStop(true)}>Add Destination</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {trip.stops.map((stop, i) => (
                    <div key={stop.stop_id} className="relative">
                      {i < (trip.stops?.length || 0) - 1 && (
                        <div className="absolute left-6 top-full w-0.5 h-6 bg-surface-200 z-0" />
                      )}
                      <div className="card overflow-hidden">
                        {/* Stop Header */}
                        <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-surface-50 to-white border-b border-surface-100">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-glow">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-display font-bold text-surface-900 text-lg">
                              {stop.city?.name || stop.stopping_place}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-sm text-surface-500">{stop.city?.country}</span>
                              <span className="text-surface-300">·</span>
                              <span className="text-sm text-surface-500">
                                <Clock size={12} className="inline mr-1" />
                                {format(parseISO(stop.start_date), "MMM d")} – {format(parseISO(stop.end_date), "MMM d")}
                              </span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" icon={<Plus size={14} />} onClick={() => setShowAddActivity(stop.stop_id)}>
                            Activity
                          </Button>
                        </div>

                        {/* Activities */}
                        <div className="p-4">
                          {(!stop.activities || stop.activities.length === 0) ? (
                            <p className="text-sm text-surface-400 text-center py-4">No activities yet. Add some!</p>
                          ) : (
                            <div className="space-y-2">
                              {stop.activities.map((ta) => (
                                <div key={ta.trip_activity_id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 hover:bg-surface-100 group transition-colors">
                                  <span className="text-lg">{CATEGORY_ICONS[ta.category || "sightseeing"] || "📍"}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-surface-900 text-sm truncate">{ta.name}</p>
                                    <p className="text-xs text-surface-500">
                                      {ta.scheduled_date ? format(parseISO(ta.scheduled_date), "MMM d") : ""}{ta.custom_cost ? ` · $${ta.custom_cost}` : ""}
                                    </p>
                                  </div>
                                  {ta.category && <Badge variant="neutral" size="sm">{ta.category}</Badge>}
                                  <button
                                    onClick={() => handleDeleteActivity(ta.trip_activity_id)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-surface-300 hover:text-danger transition-all"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MAP TAB */}
          {activeTab === "map" && (
            <div className="animate-fade-in">
              <h2 className="section-title mb-4">Route Map</h2>
              <TripMap tripId={tripId} />
            </div>
          )}

          {/* BUDGET TAB */}
          {activeTab === "budget" && (
            <div className="animate-fade-in">
              <h2 className="section-title mb-4">Budget Overview</h2>
              <TripBudget tripId={tripId} />
            </div>
          )}

          {/* PACKING TAB */}
          {activeTab === "packing" && (
            <div className="animate-fade-in">
              <h2 className="section-title mb-4">Packing Checklist</h2>
              <PackingChecklist tripId={tripId} />
            </div>
          )}

          {/* NOTES TAB */}
          {activeTab === "notes" && (
            <div className="animate-fade-in">
              <TripNotes tripId={tripId} />
            </div>
          )}
        </div>
      </main>

      {/* ---- MODALS ---- */}

      {/* Add Destination Modal */}
      <Modal isOpen={showAddStop} onClose={() => setShowAddStop(false)} title="Add Destination" size="md">
        <form onSubmit={handleAddStop} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Search City</label>
            <input
              type="text"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder="Search for a city..."
              className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400"
            />
            {cities.length > 0 && (
              <div className="mt-2 border border-surface-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                {cities.map((city) => (
                  <button
                    key={city.city_id}
                    type="button"
                    onClick={() => { setStopForm((p) => ({ ...p, city_id: city.city_id })); setCitySearch(`${city.name}, ${city.country}`); setCities([]); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-surface-50 transition-colors flex items-center gap-3 ${stopForm.city_id === city.city_id ? "bg-primary-50 text-primary-700" : "text-surface-700"}`}
                  >
                    <Globe2 size={14} className="text-surface-400" />
                    <span>{city.name}, <span className="text-surface-400">{city.country}</span></span>
                  </button>
                ))}
              </div>
            )}
            {!stopForm.city_id && (
              <Input
                label="Or enter a custom place"
                value={stopForm.stopping_place}
                onChange={(e) => setStopForm((p) => ({ ...p, stopping_place: e.target.value }))}
                placeholder="e.g., Countryside France"
                className="mt-3"
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={stopForm.start_date} onChange={(e) => setStopForm((p) => ({ ...p, start_date: e.target.value }))} min={trip.start_date} max={trip.end_date} required />
            <Input label="End Date" type="date" value={stopForm.end_date} onChange={(e) => setStopForm((p) => ({ ...p, end_date: e.target.value }))} min={stopForm.start_date || trip.start_date} max={trip.end_date} required />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowAddStop(false)}>Cancel</Button>
            <Button type="submit" icon={<Plus size={16} />}>Add Destination</Button>
          </div>
        </form>
      </Modal>

      {/* Add Activity Modal */}
      <Modal isOpen={!!showAddActivity} onClose={() => { setShowAddActivity(null); setActivitySearch(""); setActivityCat(""); }} title="Add Activity" size="lg">
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={activitySearch}
              onChange={(e) => setActivitySearch(e.target.value)}
              placeholder="Search activities..."
              className="flex-1 px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/30"
            />
            <select
              value={activityCat}
              onChange={(e) => setActivityCat(e.target.value)}
              className="px-3 py-2.5 border border-surface-200 rounded-xl text-sm"
            >
              <option value="">All Categories</option>
              {["sightseeing", "food", "adventure", "nightlife", "culture", "shopping"].map((c) => (
                <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {activities
              .filter((a) => !activitySearch || a.name.toLowerCase().includes(activitySearch.toLowerCase()))
              .map((activity) => (
                <div key={activity.activity_id} className="flex items-center gap-3 p-3 rounded-xl border border-surface-200 hover:border-primary-300 hover:bg-primary-50 group transition-all cursor-pointer" onClick={() => showAddActivity && handleAddActivity(activity.activity_id, showAddActivity)}>
                  <span className="text-xl">{CATEGORY_ICONS[activity.category || ""] || "📍"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-900 text-sm">{activity.name}</p>
                    <p className="text-xs text-surface-500">
                      {activity.category} {activity.duration ? `· ${activity.duration}min` : ""} {activity.avg_cost ? `· $${activity.avg_cost}` : ""}
                    </p>
                  </div>
                  <Badge variant="primary" size="sm">+ Add</Badge>
                </div>
              ))}
            {activities.length === 0 && (
              <p className="text-sm text-surface-400 text-center py-6">No activities found for this city</p>
            )}
          </div>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal isOpen={showShare} onClose={() => setShowShare(false)} title="Share Trip" size="sm">
        <div className="space-y-4">
          {!shareToken ? (
            <>
              <p className="text-surface-600 text-sm">Generate a shareable link so others can view your trip itinerary.</p>
              <Button loading={sharing} onClick={handleShare} className="w-full" icon={<Share2 size={18} />}>
                Generate Share Link
              </Button>
            </>
          ) : (
            <>
              <div className="p-3 bg-surface-50 border border-surface-200 rounded-xl">
                <p className="text-xs text-surface-500 mb-1">Share link</p>
                <p className="text-sm font-mono text-surface-700 truncate">{`${typeof window !== 'undefined' ? window.location.origin : ''}/shared/${shareToken}`}</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleCopyLink} className="flex-1" variant="outline" icon={<Copy size={16} />}>Copy Link</Button>
                <Button onClick={() => window.open(`/shared/${shareToken}`, "_blank")} variant="ghost" icon={<ExternalLink size={16} />}>Preview</Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
