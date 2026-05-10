"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Input, Button } from "@/components/FormElements";
import { Alert } from "@/components/EmptyState";
import { tripService } from "@/services/api";
import { useAuthStore } from "@/lib/store";
import toast from "react-hot-toast";

export default function CreateTripPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    trip_name: "",
    start_date: "",
    end_date: "",
    description: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        setError("End date must be after start date");
        setLoading(false);
        return;
      }

      const trip = await tripService.createTrip(formData);
      toast.success("Trip created successfully!");
      router.push(`/trips/${trip.trip_id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-8">
        <div className="container max-w-2xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Plan Your Next Trip
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Trip Name"
                name="trip_name"
                type="text"
                value={formData.trip_name}
                onChange={handleChange}
                placeholder="e.g., Summer Europe Adventure"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Start Date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="End Date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us about your trip..."
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  loading={loading}
                  size="lg"
                  className="flex-1"
                >
                  Create Trip
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
