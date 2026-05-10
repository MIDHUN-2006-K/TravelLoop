"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Globe, Calendar, Map, Copy, Share2, Plane, Clock } from "lucide-react";
import { Button, Badge } from "@/components/FormElements";
import { sharingService, tripService } from "@/services/api";
import { useAuthStore } from "@/lib/store";
import { PublicTrip } from "@/types";
import { format, parseISO, differenceInDays } from "date-fns";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const CATEGORY_ICONS: Record<string, string> = {
  sightseeing: "🏛️", food: "🍽️", adventure: "🧗", nightlife: "🌙",
  culture: "🎭", shopping: "🛍️",
};

export default function SharedTripPage() {
  const params = useParams();
  const token = params.token as string;
  const { user } = useAuthStore();
  const router = useRouter();
  const [trip, setTrip] = useState<PublicTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    loadSharedTrip();
  }, [token]);

  const loadSharedTrip = async () => {
    try {
      const data = await sharingService.getSharedTrip(token);
      setTrip(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Trip not found or link has expired");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTrip = async () => {
    if (!user) { router.push("/signup"); return; }
    if (!trip) return;
    setCopying(true);
    try {
      const newTrip = await tripService.copyPublicTrip(trip.trip_id);
      toast.success("Trip copied to your account!");
      router.push(`/trips/${newTrip.trip_id}`);
    } catch { toast.error("Failed to copy trip"); }
    finally { setCopying(false); }
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-surface-500">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <p className="text-6xl mb-4">🔗</p>
          <h2 className="text-2xl font-display font-bold text-surface-900 mb-3">Link Not Found</h2>
          <p className="text-surface-500 mb-8">{error}</p>
          <Link href="/">
            <Button>Go to Traveloop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalDays = differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1;

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Minimal Nav */}
      <nav className="bg-white border-b border-surface-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <Globe size={16} className="text-white" />
          </div>
          <span className="font-display font-bold">Travel<span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500">oop</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={handleShareLink} className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 transition-colors">
            <Share2 size={14} />
            Share
          </button>
          {user ? (
            <Button size="sm" loading={copying} onClick={handleCopyTrip} icon={<Copy size={14} />}>
              Copy This Trip
            </Button>
          ) : (
            <Link href="/signup">
              <Button size="sm">Sign Up to Copy</Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="relative h-56 md:h-72 bg-gradient-to-br from-primary-800 to-primary-600 overflow-hidden">
        {trip.cover_image_url && (
          <img src={trip.cover_image_url} alt={trip.trip_name} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <div className="flex items-center gap-2 mb-3">
            {trip.tags?.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">{tag}</span>
            ))}
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-2">{trip.trip_name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
            <span><Calendar size={14} className="inline mr-1" />{format(parseISO(trip.start_date), "MMM d")} – {format(parseISO(trip.end_date), "MMM d, yyyy")}</span>
            <span><Clock size={14} className="inline mr-1" />{totalDays} days</span>
            <span><Map size={14} className="inline mr-1" />{trip.stops?.length} destinations</span>
            {trip.author?.name && <span><Plane size={14} className="inline mr-1" />By {trip.author.name}</span>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {trip.description && (
          <div className="bg-white rounded-2xl border border-surface-200/60 p-6">
            <h2 className="font-display font-bold text-surface-900 mb-3">About This Trip</h2>
            <p className="text-surface-600 leading-relaxed">{trip.description}</p>
          </div>
        )}

        {/* Itinerary */}
        <div>
          <h2 className="text-2xl font-display font-bold text-surface-900 mb-5">Itinerary</h2>
          <div className="space-y-4">
            {trip.stops?.map((stop: any, i: number) => (
              <div key={stop.stop_id} className="bg-white rounded-2xl border border-surface-200/60 overflow-hidden">
                <div className="flex items-center gap-4 p-5 bg-surface-50 border-b border-surface-100">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-surface-900">{stop.city?.name || stop.stopping_place}</h3>
                    <p className="text-sm text-surface-500">{stop.city?.country} · {format(parseISO(stop.start_date), "MMM d")} – {format(parseISO(stop.end_date), "MMM d")}</p>
                  </div>
                </div>
                {stop.activities && stop.activities.length > 0 && (
                  <div className="p-4 space-y-2">
                    {stop.activities.map((ta: any) => (
                      <div key={ta.trip_activity_id} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-50">
                        <span>{CATEGORY_ICONS[ta.category || ""] || "📍"}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-surface-900">{ta.name}</p>
                          <p className="text-xs text-surface-400">{ta.scheduled_date ? format(parseISO(ta.scheduled_date), "MMM d") : ""}{ta.custom_cost ? ` · $${ta.custom_cost}` : ""}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-display font-bold text-white mb-3">Love this itinerary?</h3>
          <p className="text-white/70 mb-6">Copy this trip to your Traveloop account and customize it for your own adventure.</p>
          {user ? (
            <Button loading={copying} onClick={handleCopyTrip} className="!bg-white !text-primary-700 hover:!bg-surface-50" icon={<Copy size={18} />}>
              Copy This Trip
            </Button>
          ) : (
            <Link href="/signup">
              <Button className="!bg-white !text-primary-700 hover:!bg-surface-50">Create Free Account & Copy</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
