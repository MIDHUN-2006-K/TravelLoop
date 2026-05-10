"use client";

import React from "react";
import Link from "next/link";
import {
  Globe, Map, DollarSign, CheckSquare, Share2, ArrowRight, Star,
  Plane, Users, Sparkles,
} from "lucide-react";

const FEATURES = [
  { icon: Map, title: "Interactive Maps", desc: "Visualize your entire route with beautiful interactive maps and route lines between destinations.", color: "from-blue-500 to-blue-600" },
  { icon: DollarSign, title: "Budget Analytics", desc: "Track expenses across categories with real-time charts and per-day cost breakdowns.", color: "from-emerald-500 to-emerald-600" },
  { icon: CheckSquare, title: "Packing Checklist", desc: "Never forget essentials again. Smart packing lists organized by category with progress tracking.", color: "from-purple-500 to-purple-600" },
  { icon: Share2, title: "Share Adventures", desc: "Share your itineraries with friends and family. Let others copy your trips as templates.", color: "from-orange-500 to-orange-600" },
];

const DESTINATIONS = [
  { name: "Paris", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop", country: "France" },
  { name: "Tokyo", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop", country: "Japan" },
  { name: "Bali", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&fit=crop", country: "Indonesia" },
  { name: "Santorini", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop", country: "Greece" },
  { name: "New York", img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop", country: "USA" },
  { name: "Barcelona", img: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=300&fit=crop", country: "Spain" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow">
              <Globe size={20} className="text-white" />
            </div>
            <span className="text-xl font-display font-bold">
              Travel<span className="text-gradient">oop</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-surface-600 hover:text-surface-900 transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 shadow-glow hover:shadow-glow-lg transition-all active:scale-[0.97]">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-800 to-primary-600" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&fit=crop')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/60 via-transparent to-primary-950/80" />

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/80 text-sm font-medium mb-8 animate-fade-in-down">
            <Sparkles size={14} className="text-secondary-400" />
            Multi-city travel planning, reimagined
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-tight mb-6 animate-fade-in-up">
            Plan Your{" "}
            <span className="relative">
              <span className="text-secondary-400">Perfect</span>
            </span>{" "}
            <br />Adventure
          </h1>

          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            Build personalized multi-city itineraries, track your budget, manage activities, and share your adventures — all in one beautifully designed platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-2xl text-lg hover:bg-surface-50 shadow-premium-xl hover:shadow-premium-xl transition-all active:scale-[0.98]">
              <Plane size={20} />
              Start Planning Free
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-2xl text-lg hover:bg-white/20 transition-all">
              Sign In
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-20 animate-fade-in" style={{ animationDelay: "400ms" }}>
            {[
              { label: "Cities Covered", value: "200+" },
              { label: "Trips Planned", value: "10K+" },
              { label: "Happy Travelers", value: "5K+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-display font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-surface-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-surface-900 mb-4">
              Everything You Need to Travel Smarter
            </h2>
            <p className="text-surface-500 text-lg max-w-2xl mx-auto">
              From planning to packing, Traveloop covers every aspect of your travel journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card p-6 group cursor-default">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={22} />
                </div>
                <h3 className="text-lg font-display font-bold text-surface-900 mb-2">{feature.title}</h3>
                <p className="text-surface-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-surface-900 mb-4">
              Explore Popular Destinations
            </h2>
            <p className="text-surface-500 text-lg">Discover cities loved by travelers worldwide</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {DESTINATIONS.map((dest) => (
              <div key={dest.name} className="group cursor-pointer">
                <div className="relative rounded-2xl overflow-hidden aspect-square mb-3">
                  <img src={dest.img} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <p className="text-white font-bold text-sm">{dest.name}</p>
                    <p className="text-white/70 text-xs">{dest.country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-white/70 text-xl mb-10">
            Join thousands of travelers planning better trips with Traveloop.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-primary-700 font-bold rounded-2xl text-lg hover:bg-surface-50 shadow-premium-xl transition-all active:scale-[0.98]">
            <Users size={22} />
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-surface-950 text-surface-400 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
              <Globe size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-white">Traveloop</span>
          </div>
          <p className="text-sm">© 2026 Traveloop. Explore more, stress less.</p>
        </div>
      </footer>
    </div>
  );
}
