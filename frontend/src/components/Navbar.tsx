"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Globe,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Map,
  User,
  Plus,
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { authService } from "@/services/api";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trips", label: "My Trips", icon: Map },
  { href: "/profile", label: "Profile", icon: User },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    authService.logout();
    logout();
    router.push("/login");
  };

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-premium border-b border-surface-200/50"
            : "bg-white/95 backdrop-blur-sm border-b border-surface-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              href={user ? "/dashboard" : "/"}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow duration-300">
                <Globe size={20} className="text-white" />
              </div>
              <span className="text-xl font-display font-bold tracking-tight text-surface-900">
                Travel
                <span className="text-gradient">oop</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            {user && (
              <div className="hidden md:flex items-center gap-1">
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active
                          ? "text-primary-600 bg-primary-50"
                          : "text-surface-500 hover:text-surface-800 hover:bg-surface-50"
                      }`}
                    >
                      <Icon size={16} />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {user && (
                <>
                  {/* New Trip Button */}
                  <Link
                    href="/trips/create"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 shadow-glow hover:shadow-glow-lg transition-all duration-300 active:scale-[0.97]"
                  >
                    <Plus size={16} />
                    <span>New Trip</span>
                  </Link>

                  {/* User Menu */}
                  <div className="relative hidden md:block">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-surface-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-sm font-bold">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <ChevronDown
                        size={14}
                        className={`text-surface-400 transition-transform duration-200 ${
                          userMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {userMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-premium-xl border border-surface-200/60 py-2 z-20 animate-fade-in-down">
                          <div className="px-4 py-3 border-b border-surface-100">
                            <p className="text-sm font-semibold text-surface-900 truncate">
                              {user.name || "Traveler"}
                            </p>
                            <p className="text-xs text-surface-400 truncate">
                              {user.email}
                            </p>
                          </div>
                          <Link
                            href="/profile"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 transition-colors"
                          >
                            <User size={16} />
                            Profile Settings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger-light transition-colors"
                          >
                            <LogOut size={16} />
                            Sign Out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* Mobile Menu Toggle */}
              {user && (
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden p-2 rounded-xl hover:bg-surface-50 transition-colors text-surface-600"
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && user && (
          <div className="md:hidden border-t border-surface-100 animate-fade-in-down">
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? "text-primary-600 bg-primary-50"
                        : "text-surface-600 hover:bg-surface-50"
                    }`}
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/trips/create"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-primary-600 bg-primary-50 sm:hidden"
              >
                <Plus size={18} />
                Plan New Trip
              </Link>
              <div className="divider my-2" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-danger hover:bg-danger-light transition-colors"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
