"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, Map, Plane, DollarSign, Calendar, Clock,
  TrendingUp, Compass, ChevronRight, ArrowUpRight, Sparkles, Globe2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { StatCard, Button, Badge } from "@/components/FormElements";
import { DashboardSkeleton } from "@/components/Skeletons";
import { tripService } from "@/services/api";
import { useAuthStore } from "@/lib/store";
import { Trip } from "@/types";
import { format, parseISO, differenceInDays, isAfter, isBefore } from "date-fns";

const TRENDING_CITIES = [
  { name: "Santorini", country: "Greece", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=250&fit=crop", cost: "$$", tag: "Romantic" },
  { name: "Bali", country: "Indonesia", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=250&fit=crop", cost: "$", tag: "Budget-friendly" },
  { name: "Kyoto", country: "Japan", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=250&fit=crop", cost: "$$", tag: "Cultural" },
  { name: "Prague", country: "Czech Republic", img: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=400&h=250&fit=crop", cost: "$", tag: "Hidden Gem" },
];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "neutral",
  PLANNED: "primary",
  ACTIVE: "success",
  COMPLETED: "secondary",
};

function getGreeting(name?: string) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${greet}, ${name?.split(" ")[0] || "Traveler"}`;
}

function TripCard({ trip }: { trip: Trip }) {
  const daysCount = differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1;
  const now = new Date();
  const upcoming = isAfter(parseISO(trip.start_date), now);
  const ongoing = isBefore(parseISO(trip.start_date), now) && isAfter(parseISO(trip.end_date), now);
  const cityCount = trip.stops?.length || 0;
  const coverImg = trip.cover_image_url || (trip.stops?.[0]?.city?.image_url);

  return (
    <Link href={`/trips/${trip.trip_id}`}>
      <div className="card-interactive group overflow-hidden">
        {/* Cover */}
        <div className="relative h-44 bg-gradient-to-br from-primary-600 to-primary-800 overflow-hidden">
          {coverImg ? (
            <img src={coverImg} alt={trip.trip_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 flex items-center justify-center">
              <Globe2 size={48} className="text-white/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-3 right-3">
            <Badge variant={(STATUS_COLORS[trip.status || "PLANNED"]) as any} dot>
              {trip.status || "PLANNED"}
            </Badge>
          </div>
          {ongoing && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg animate-pulse-soft">
              Live Trip ✈️
            </div>
          )}
          <div className="absolute bottom-3 left-4">
            <h3 className="text-white font-display font-bold text-lg leading-tight">{trip.trip_name}</h3>
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-surface-500">
              <Calendar size={13} />
              <span>{format(parseISO(trip.start_date), "MMM d")} – {format(parseISO(trip.end_date), "MMM d, yyyy")}</span>
            </div>
            <span className="text-xs text-surface-400">{daysCount}d</span>
          </div>

          <div className="flex items-center gap-2 mt-3">
            {cityCount > 0 && (
              <Badge variant="primary">
                <Map size={10} />
                {cityCount} {cityCount === 1 ? "stop" : "stops"}
              </Badge>
            )}
            {trip.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="neutral">{tag}</Badge>
            ))}
          </div>

          {upcoming && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-primary-600 font-semibold">
              <Clock size={12} />
              <span>Starts in {differenceInDays(parseISO(trip.start_date), now)} days</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const data = await tripService.getTrips({ expand: "stops" });
      setTrips(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const upcomingTrips = trips.filter((t) => isAfter(parseISO(t.start_date), now));
  const activeTrips = trips.filter((t) => isBefore(parseISO(t.start_date), now) && isAfter(parseISO(t.end_date), now));
  const totalDays = trips.reduce((sum, t) => sum + differenceInDays(parseISO(t.end_date), parseISO(t.start_date)) + 1, 0);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-surface-50 py-8">
          <div className="container">
            <DashboardSkeleton />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-50">
        {/* Hero Banner */}
        <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&fit=crop')", backgroundSize: "cover" }} />
          <div className="relative container py-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-secondary-300" />
                  <span className="text-white/70 text-sm font-medium">Your travel dashboard</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                  {getGreeting(user?.name)} 👋
                </h1>
                <p className="text-white/70">
                  {activeTrips.length > 0
                    ? `You have ${activeTrips.length} ongoing trip${activeTrips.length > 1 ? "s" : ""}. Have a great time! ✈️`
                    : upcomingTrips.length > 0
                    ? `${upcomingTrips.length} upcoming trip${upcomingTrips.length > 1 ? "s" : ""} on the horizon!`
                    : "Ready to plan your next adventure?"}
                </p>
              </div>
              <Link
                href="/trips/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 font-bold rounded-2xl hover:bg-surface-50 shadow-premium-lg transition-all active:scale-[0.97]"
              >
                <Plus size={18} />
                Plan New Trip
              </Link>
            </div>
          </div>
        </div>

        <div className="container py-8 space-y-8">
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            <StatCard label="Total Trips" value={trips.length} icon={<Plane size={20} />} gradient="from-primary-500 to-primary-600" />
            <StatCard label="Upcoming" value={upcomingTrips.length} icon={<Clock size={20} />} gradient="from-secondary-500 to-secondary-600" />
            <StatCard label="Days Planned" value={totalDays} icon={<Calendar size={20} />} gradient="from-accent-500 to-accent-600" />
            <StatCard label="Destinations" value={trips.reduce((s, t) => s + (t.stops?.length || 0), 0)} icon={<Map size={20} />} gradient="from-purple-500 to-purple-600" />
          </div>

          {/* Active Trips */}
          {activeTrips.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="section-title text-xl">Ongoing Trips</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTrips.map((trip) => <TripCard key={trip.trip_id} trip={trip} />)}
              </div>
            </div>
          )}

          {/* Recent & Upcoming Trips */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title text-xl">
                {upcomingTrips.length > 0 ? "Upcoming Trips" : "Recent Trips"}
              </h2>
              {trips.length > 3 && (
                <Link href="/trips" className="flex items-center gap-1 text-sm text-primary-600 font-semibold hover:text-primary-700">
                  View all <ChevronRight size={16} />
                </Link>
              )}
            </div>

            {trips.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-6">
                  <Compass size={40} className="text-primary-400" />
                </div>
                <h3 className="text-xl font-display font-bold text-surface-800 mb-3">No Trips Yet</h3>
                <p className="text-surface-500 mb-8 max-w-sm mx-auto">
                  Start your travel planning journey by creating your first multi-city trip.
                </p>
                <Link href="/trips/create">
                  <Button size="lg" icon={<Plus size={18} />}>
                    Create First Trip
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(upcomingTrips.length > 0 ? upcomingTrips : trips).slice(0, 6).map((trip) => (
                  <TripCard key={trip.trip_id} trip={trip} />
                ))}
              </div>
            )}
          </div>

          {/* Trending Destinations */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="section-title text-xl">Trending Destinations</h2>
                <p className="section-subtitle text-sm">Popular cities loved by travelers</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TRENDING_CITIES.map((city) => (
                <Link key={city.name} href="/trips/create" className="group">
                  <div className="relative rounded-2xl overflow-hidden aspect-card">
                    <img src={city.img} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-display font-bold">{city.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-white/70 text-xs">{city.country}</span>
                        <Badge variant="neutral" size="sm">{city.tag}</Badge>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
                      <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight size={14} className="text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Plus, label: "Plan a New Trip", desc: "Build a multi-city itinerary", href: "/trips/create", color: "from-primary-500 to-primary-600" },
              { icon: Map, label: "Browse My Trips", desc: "Manage all your adventures", href: "/trips", color: "from-accent-500 to-accent-600" },
              { icon: TrendingUp, label: "View Profile", desc: "Update preferences & saved spots", href: "/profile", color: "from-secondary-500 to-secondary-600" },
            ].map((action) => (
              <Link key={action.label} href={action.href}>
                <div className="card p-5 group cursor-pointer flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <action.icon size={22} />
                  </div>
                  <div>
                    <p className="font-semibold text-surface-900">{action.label}</p>
                    <p className="text-sm text-surface-500">{action.desc}</p>
                  </div>
                  <ChevronRight size={18} className="text-surface-300 ml-auto group-hover:text-primary-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
