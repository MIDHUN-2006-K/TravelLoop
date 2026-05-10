"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Input, Textarea, Button, Select } from "@/components/FormElements";
import { Alert } from "@/components/EmptyState";
import { tripService } from "@/services/api";
import { useAuthStore } from "@/lib/store";
import { Plane, Tag, ChevronRight, ChevronLeft, Check } from "lucide-react";
import toast from "react-hot-toast";

const STEPS = ["Trip Details", "Customize", "Review"];
const POPULAR_TAGS = ["adventure", "culture", "food", "beach", "city", "nature", "nightlife", "family", "solo", "honeymoon", "backpacking", "luxury"];
const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft — still planning" },
  { value: "PLANNED", label: "Planned — ready to go" },
  { value: "ACTIVE", label: "Active — I'm traveling!" },
];

export default function CreateTripPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    trip_name: "",
    start_date: "",
    end_date: "",
    description: "",
    status: "PLANNED",
    cover_image_url: "",
    tags: [] as string[],
  });

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.trip_name) { setError("Trip name is required"); return false; }
      if (!form.start_date) { setError("Start date is required"); return false; }
      if (!form.end_date) { setError("End date is required"); return false; }
      if (new Date(form.start_date) >= new Date(form.end_date)) { setError("End date must be after start date"); return false; }
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 2));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const trip = await tripService.createTrip(form);
      toast.success("Trip created! Now add your destinations 🗺️");
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
      <main className="min-h-screen bg-surface-50 py-10">
        <div className="container max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-surface-900 mb-2">Plan Your Next Trip</h1>
            <p className="text-surface-500">Fill in the details to create your personalized itinerary</p>
          </div>

          {/* Step Progress */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((label, i) => (
              <React.Fragment key={label}>
                <div className={`flex items-center gap-2 ${i <= step ? "text-primary-600" : "text-surface-400"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${i < step ? "bg-primary-500 border-primary-500 text-white" : i === step ? "border-primary-500 text-primary-600" : "border-surface-300 text-surface-400"}`}>
                    {i < step ? <Check size={14} /> : i + 1}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${i === step ? "text-primary-600" : ""}`}>{label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded ${i < step ? "bg-primary-500" : "bg-surface-200"}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className="card p-8">
            {error && <Alert type="error" title="Error" message={error} onClose={() => setError("")} />}

            {/* STEP 1 — Details */}
            {step === 0 && (
              <div className="space-y-6 animate-fade-in">
                <Input
                  label="Trip Name *"
                  name="trip_name"
                  value={form.trip_name}
                  onChange={handleChange}
                  placeholder="e.g., Summer Europe Adventure"
                  icon={<Plane size={16} />}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Start Date *" name="start_date" type="date" value={form.start_date} onChange={handleChange} required />
                  <Input label="End Date *" name="end_date" type="date" value={form.end_date} onChange={handleChange} min={form.start_date} required />
                </div>
                <Textarea
                  label="Description (Optional)"
                  name="description"
                  value={form.description}
                  onChange={handleChange as any}
                  placeholder="What's this trip about? Jot down your goals and expectations..."
                  rows={4}
                />
              </div>
            )}

            {/* STEP 2 — Customize */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <Select label="Trip Status" name="status" value={form.status} onChange={handleChange}>
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>

                <Input
                  label="Cover Image URL (Optional)"
                  name="cover_image_url"
                  type="url"
                  value={form.cover_image_url}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  hint="Add a beautiful cover image for your trip card"
                />

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-3">
                    <span className="flex items-center gap-2"><Tag size={14} /> Trip Tags</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          form.tags.includes(tag)
                            ? "bg-primary-500 text-white shadow-glow"
                            : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 — Review */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="font-display font-bold text-surface-900">Review Your Trip</h3>
                <div className="bg-surface-50 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Plane size={18} className="text-primary-500" />
                    <div>
                      <p className="text-xs text-surface-500">Trip Name</p>
                      <p className="font-semibold text-surface-900">{form.trip_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded bg-primary-100 flex items-center justify-center text-primary-600 text-xs">📅</div>
                    <div>
                      <p className="text-xs text-surface-500">Dates</p>
                      <p className="font-semibold text-surface-900">{form.start_date} → {form.end_date}</p>
                    </div>
                  </div>
                  {form.description && (
                    <div>
                      <p className="text-xs text-surface-500">Description</p>
                      <p className="text-surface-700 text-sm mt-1">{form.description}</p>
                    </div>
                  )}
                  {form.tags.length > 0 && (
                    <div>
                      <p className="text-xs text-surface-500 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {form.tags.map((tag) => (
                          <span key={tag} className="px-2.5 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-surface-500">
                  After creating the trip, you'll be able to add destinations, activities, set a budget, and more.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button variant="ghost" onClick={() => step === 0 ? router.back() : setStep((s) => s - 1)} icon={<ChevronLeft size={18} />}>
                {step === 0 ? "Cancel" : "Back"}
              </Button>
              {step < 2 ? (
                <Button onClick={handleNext} icon={<ChevronRight size={18} />}>Continue</Button>
              ) : (
                <Button loading={loading} onClick={handleSubmit} icon={<Check size={18} />}>
                  Create Trip
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
