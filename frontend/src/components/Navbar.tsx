"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, LogOut, Menu, X } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { authService } from "@/services/api";
import { useState } from "react";

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    logout();
    router.push("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-xl text-primary"
          >
            <MapPin size={28} />
            <span>GlobeTrotter</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-primary transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/trips"
                  className="text-gray-600 hover:text-primary transition"
                >
                  My Trips
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-primary transition"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-danger transition"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && user && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
            >
              Dashboard
            </Link>
            <Link
              href="/trips"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
            >
              My Trips
            </Link>
            <Link
              href="/profile"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-danger hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
