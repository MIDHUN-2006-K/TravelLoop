"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/FormElements";
import { Alert } from "@/components/EmptyState";
import { authService } from "@/services/api";
import { useAuthStore } from "@/lib/store";
import { User } from "@/types";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    loadProfile();
  }, [user, router]);

  const loadProfile = async () => {
    try {
      const data = await authService.getCurrentUser();
      setProfile(data);
    } catch (err) {
      setError("Failed to load profile");
    }
  };

  const handleLogout = () => {
    authService.logout();
    logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  if (!user) return null;

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-8">
        <div className="container max-w-2xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Profile Settings
          </h1>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {error && (
              <Alert
                type="error"
                title="Error"
                message={error}
                onClose={() => setError("")}
              />
            )}

            {profile && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Account Information
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                      {profile.email}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                      {profile.name || "Not set"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Member Since
                    </label>
                    <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Danger Zone
                  </h2>
                  <Button
                    variant="danger"
                    size="lg"
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full"
                  >
                    <LogOut size={18} />
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
