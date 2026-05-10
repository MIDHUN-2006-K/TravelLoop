"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Grid3X3, List, Map, Calendar, Globe2, Trash2, Copy, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Input, Button, Badge } from "@/components/FormElements";
import { EmptyState } from "@/components/EmptyState";
import { GridSkeleton } from "@/components/Skeletons";
import { tripService } from "@/services/api";
import { useAuthStore } from "@/lib/store";
import { Trip } from "@/types";
import { format, parseISO, differenceInDays } from "date-fns";
import toast from "react-hot-toast";

const STATUS_COLORS: Record<string, any> = {
  DRAFT: "neutral", PLANNED: "primary", ACTIVE: "success", COMPLETED: "secondary",
};

export default function TripsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    loadTrips();
  }, [user, search, statusFilter, sortBy]);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await tripService.getTrips({ search: search || undefined, status: statusFilter || undefined, sort: sortBy || undefined });
      setTrips(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (tripId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Delete this trip and all its data?")) return;
    try {
      await tripService.deleteTrip(tripId);
      toast.success("Trip deleted");
      loadTrips();
    } catch { toast.error("Failed to delete trip"); }
  };

  const handleDuplicate = async (tripId: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const newTrip = await tripService.duplicateTrip(tripId);
      toast.success("Trip duplicated!");
      router.push(`/trips/${newTrip.trip_id}`);
    } catch { toast.error("Failed to duplicate trip"); }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-50">
        {/* Header */}
        <div className="bg-white border-b border-surface-100">
          <div className="container py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-display font-bold text-surface-900">My Trips</h1>
                <p className="text-surface-500 text-sm mt-1">{trips.length} trip{trips.length !== 1 ? "s" : ""} planned</p>
              </div>
              <Link href="/trips/create">
                <Button icon={<Plus size={18} />} size="md">New Trip</Button>
              </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <div className="flex-1 min-w-56">
                <Input
                  placeholder="Search trips..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  icon={<Search size={16} />}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-white border border-surface-200 rounded-xl text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400"
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PLANNED">Planned</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-white border border-surface-200 rounded-xl text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400"
              >
                <option value="">Sort: Newest</option>
                <option value="name">Sort: Name</option>
                <option value="start_date">Sort: Start Date</option>
                <option value="updated">Sort: Recently Updated</option>
              </select>

              <div className="flex border border-surface-200 rounded-xl overflow-hidden">
                <button onClick={() => setViewMode("grid")} className={`p-2.5 ${viewMode === "grid" ? "bg-primary-50 text-primary-600" : "text-surface-400 hover:text-surface-600"}`}>
                  <Grid3X3 size={18} />
                </button>
                <button onClick={() => setViewMode("list")} className={`p-2.5 ${viewMode === "list" ? "bg-primary-50 text-primary-600" : "text-surface-400 hover:text-surface-600"}`}>
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container py-8">
          {loading ? (
            <GridSkeleton count={6} />
          ) : trips.length === 0 ? (
            <EmptyState
              icon={<Map size={40} />}
              title="No Trips Found"
              description={search || statusFilter ? "Try adjusting your filters." : "Create your first trip to get started!"}
              action={!search && !statusFilter ? (
                <Link href="/trips/create"><Button icon={<Plus size={18} />}>Plan Your First Trip</Button></Link>
              ) : undefined}
            />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <TripCard key={trip.trip_id} trip={trip} onDelete={handleDelete} onDuplicate={handleDuplicate} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {trips.map((trip) => (
                <TripListRow key={trip.trip_id} trip={trip} onDelete={handleDelete} onDuplicate={handleDuplicate} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function TripCard({ trip, onDelete, onDuplicate }: { trip: Trip; onDelete: (id: string, e: React.MouseEvent) => void; onDuplicate: (id: string, e: React.MouseEvent) => void }) {
  const days = differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1;
  const coverImg = trip.cover_image_url;

  return (
    <Link href={`/trips/${trip.trip_id}`}>
      <div className="card-interactive group overflow-hidden">
        <div className="relative h-44 overflow-hidden">
          {coverImg ? (
            <img src={coverImg} alt={trip.trip_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center">
              <Globe2 size={40} className="text-white/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge variant={STATUS_COLORS[trip.status || "PLANNED"]} dot>{trip.status || "PLANNED"}</Badge>
          </div>
          {/* Actions */}
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <button onClick={(e) => onDuplicate(trip.trip_id, e)} className="p-1.5 bg-white/90 rounded-lg text-surface-600 hover:text-primary-600 transition-colors" title="Duplicate">
              <Copy size={14} />
            </button>
            <button onClick={(e) => onDelete(trip.trip_id, e)} className="p-1.5 bg-white/90 rounded-lg text-surface-600 hover:text-danger transition-colors" title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-display font-bold text-surface-900 text-lg mb-1 truncate">{trip.trip_name}</h3>
          <div className="flex items-center gap-1 text-xs text-surface-500 mb-3">
            <Calendar size={12} />
            <span>{format(parseISO(trip.start_date), "MMM d")} – {format(parseISO(trip.end_date), "MMM d, yyyy")} · {days}d</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(trip.stops?.length || 0) > 0 && <Badge variant="primary"><Map size={10} />{trip.stops!.length} stop{trip.stops!.length !== 1 ? "s" : ""}</Badge>}
            {trip.tags?.slice(0, 2).map((t) => <Badge key={t} variant="neutral">{t}</Badge>)}
          </div>
        </div>
      </div>
    </Link>
  );
}

function TripListRow({ trip, onDelete, onDuplicate }: { trip: Trip; onDelete: (id: string, e: React.MouseEvent) => void; onDuplicate: (id: string, e: React.MouseEvent) => void }) {
  return (
    <Link href={`/trips/${trip.trip_id}`}>
      <div className="card p-4 flex items-center gap-4 group">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white flex-shrink-0">
          <Globe2 size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-surface-900 truncate">{trip.trip_name}</h3>
            <Badge variant={STATUS_COLORS[trip.status || "PLANNED"]}>{trip.status || "PLANNED"}</Badge>
          </div>
          <p className="text-sm text-surface-500 mt-0.5">
            {format(parseISO(trip.start_date), "MMM d")} – {format(parseISO(trip.end_date), "MMM d, yyyy")} · {(trip.stops?.length || 0)} stops
          </p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <button onClick={(e) => onDuplicate(trip.trip_id, e)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-500 hover:text-primary-600 transition-colors">
            <Copy size={16} />
          </button>
          <button onClick={(e) => onDelete(trip.trip_id, e)} className="p-2 rounded-lg hover:bg-red-50 text-surface-500 hover:text-danger transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}
