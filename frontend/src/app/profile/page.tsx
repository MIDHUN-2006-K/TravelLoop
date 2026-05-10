"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Input, Button, Badge } from "@/components/FormElements";
import { Alert } from "@/components/EmptyState";
import { authService, savedService } from "@/services/api";
import { useAuthStore } from "@/lib/store";
import { User, SavedDestination } from "@/types";
import { User as UserIcon, Mail, Globe, Trash2, Camera, LogOut, Save, Bookmark, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [saved, setSaved] = useState<SavedDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("profile");
  const [form, setForm] = useState({ name: "", language: "en" });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [profileData, savedData] = await Promise.all([
        authService.getCurrentUser(),
        savedService.getSaved(),
      ]);
      setProfile(profileData);
      setSaved(savedData);
      setForm({ name: profileData.name || "", language: profileData.language || "en" });
    } catch { setError("Failed to load profile"); }
    finally { setLoading(false); }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await authService.updateProfile(form);
      setProfile(updated);
      setUser({ ...user!, name: updated.name });
      toast.success("Profile updated!");
    } catch { toast.error("Failed to update profile"); }
    finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image too large (max 5MB)"); return; }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setUploadingAvatar(true);
      try {
        const result = await authService.uploadAvatar(base64);
        setProfile((p) => p ? { ...p, profile_photo: result.profile_photo } : p);
        toast.success("Avatar updated!");
      } catch { toast.error("Failed to upload image"); }
      finally { setUploadingAvatar(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSaved = async (savedId: string) => {
    try {
      await savedService.removeDestination(savedId);
      setSaved((prev) => prev.filter((s) => s.saved_id !== savedId));
      toast.success("Destination removed");
    } catch { toast.error("Failed to remove"); }
  };

  const handleLogout = () => {
    authService.logout();
    logout();
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    try {
      await authService.deleteAccount();
      authService.logout();
      logout();
      toast.success("Account deleted");
      router.push("/");
    } catch { toast.error("Failed to delete account"); }
  };

  if (loading) return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-50 py-10">
        <div className="container max-w-3xl">
          <div className="skeleton h-10 w-40 mb-8 rounded-xl" />
          <div className="skeleton h-64 w-full rounded-2xl" />
        </div>
      </main>
    </>
  );

  const avatarSrc = profile?.profile_photo || null;
  const initials = (profile?.name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-50 py-10">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-display font-bold text-surface-900 mb-8">Profile Settings</h1>

          {error && <Alert type="error" title="Error" message={error} onClose={() => setError("")} />}

          <div className="flex gap-4 mb-6">
            {[
              { id: "profile", label: "Profile", icon: UserIcon },
              { id: "saved", label: "Saved Destinations", icon: Bookmark },
              { id: "account", label: "Account", icon: AlertTriangle },
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === sec.id ? "bg-primary-50 text-primary-700" : "text-surface-500 hover:text-surface-700 hover:bg-surface-100"
                }`}
              >
                <sec.icon size={15} />
                {sec.label}
              </button>
            ))}
          </div>

          {/* PROFILE SECTION */}
          {activeSection === "profile" && (
            <div className="card p-8 animate-fade-in">
              {/* Avatar */}
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                    {avatarSrc ? <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" /> : initials}
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-premium border border-surface-200 flex items-center justify-center hover:bg-surface-50 transition-colors"
                  >
                    {uploadingAvatar ? <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /> : <Camera size={14} className="text-surface-600" />}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>
                <div>
                  <p className="font-display font-bold text-surface-900 text-xl">{profile?.name || "Anonymous"}</p>
                  <p className="text-surface-500 text-sm">{profile?.email}</p>
                  {profile?.created_at && <p className="text-xs text-surface-400 mt-1">Joined {new Date(profile.created_at).toLocaleDateString()}</p>}
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <Input
                  label="Full Name"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Your name"
                  icon={<UserIcon size={16} />}
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-surface-700">Email Address</label>
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-500">
                    <Mail size={16} />
                    {profile?.email}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-surface-700">Language</label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/30"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                    <option value="ja">日本語</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
                <div className="flex justify-between pt-2">
                  <Button type="button" variant="ghost" icon={<LogOut size={16} />} onClick={handleLogout} className="text-danger">
                    Sign Out
                  </Button>
                  <Button type="submit" loading={saving} icon={<Save size={16} />}>Save Changes</Button>
                </div>
              </form>
            </div>
          )}

          {/* SAVED SECTION */}
          {activeSection === "saved" && (
            <div className="card p-8 animate-fade-in">
              <h2 className="font-display font-bold text-surface-900 mb-6">Saved Destinations</h2>
              {saved.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-4xl mb-3">🔖</p>
                  <p className="font-semibold text-surface-700">No saved destinations yet</p>
                  <p className="text-sm text-surface-400 mt-1">Cities you save will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {saved.map((s) => (
                    <div key={s.saved_id} className="flex items-center gap-4 p-4 rounded-xl border border-surface-200 hover:border-surface-300 group transition-colors">
                      {s.city.image_url ? (
                        <img src={s.city.image_url} alt={s.city.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white flex-shrink-0">
                          <Globe size={18} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-surface-900">{s.city.name}</p>
                        <p className="text-sm text-surface-500">{s.city.country}</p>
                        {s.notes && <p className="text-xs text-surface-400 mt-0.5 truncate">{s.notes}</p>}
                      </div>
                      <button
                        onClick={() => handleRemoveSaved(s.saved_id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-surface-300 hover:text-danger transition-all rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ACCOUNT SECTION */}
          {activeSection === "account" && (
            <div className="card p-8 animate-fade-in space-y-6">
              <div>
                <h2 className="font-display font-bold text-surface-900 mb-2">Danger Zone</h2>
                <p className="text-sm text-surface-500">These actions are irreversible. Please proceed carefully.</p>
              </div>
              <div className="border border-red-200 rounded-2xl p-5 bg-red-50/50">
                <h3 className="font-semibold text-red-800 mb-1">Delete Account</h3>
                <p className="text-sm text-red-600 mb-4">This will permanently delete your account and all trips, activities, notes, and packing lists.</p>
                {!showDeleteConfirm ? (
                  <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>Delete My Account</Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-red-700">Are you absolutely sure?</p>
                    <div className="flex gap-3">
                      <Button variant="danger" size="sm" onClick={handleDeleteAccount}>Yes, Delete Everything</Button>
                      <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
