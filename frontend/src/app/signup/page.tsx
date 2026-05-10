"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import { Input, Button } from "@/components/FormElements";
import { Alert } from "@/components/EmptyState";
import { authService } from "@/services/api";
import { useAuthStore } from "@/lib/store";
import toast from "react-hot-toast";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const bar = ["bg-red-400", "bg-amber-400", "bg-emerald-500"][score - 1] || "bg-surface-200";
  if (!password) return null;
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= score ? bar : "bg-surface-200"}`} />
        ))}
      </div>
      <div className="flex gap-3">
        {checks.map((c) => (
          <span key={c.label} className={`text-xs flex items-center gap-1 ${c.ok ? "text-emerald-600" : "text-surface-400"}`}>
            <CheckCircle size={10} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { setError("Please agree to the terms to continue"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setError("");
    setLoading(true);
    try {
      const { token, user } = await authService.signup(form.email, form.password, form.name);
      localStorage.setItem("authToken", token);
      setToken(token);
      setUser(user);
      toast.success("Welcome to Traveloop! 🌍 Let's plan your first trip.");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-950 via-primary-800 to-secondary-700 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&fit=crop')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.2 }} />
        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-8 border border-white/20">
            <Globe size={32} className="text-white" />
          </div>
          <h2 className="text-4xl font-display font-bold text-white mb-4">Start Your Journey</h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Create your free account and start building beautiful, personalized travel itineraries in minutes.
          </p>
          <div className="mt-12 space-y-3">
            {["✓ Free forever, no credit card needed", "✓ Unlimited trips and destinations", "✓ Share with friends & family"].map((item) => (
              <div key={item} className="text-white/80 text-sm">{item}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-surface-50">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow">
              <Globe size={18} className="text-white" />
            </div>
            <span className="text-xl font-display font-bold">Travel<span className="text-gradient">oop</span></span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-surface-900 mb-2">Create Account</h1>
            <p className="text-surface-500">Already have an account? <Link href="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link></p>
          </div>

          {error && <Alert type="error" title="Sign Up Failed" message={error} onClose={() => setError("")} />}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Alex Traveler"
              icon={<User size={16} />}
              autoComplete="name"
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              icon={<Mail size={16} />}
              required
              autoComplete="email"
            />

            <div>
              <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                icon={<Lock size={16} />}
                required
                autoComplete="new-password"
              />
              <div className="flex justify-between mt-2">
                <PasswordStrength password={form.password} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs text-surface-400 hover:text-surface-600 flex items-center gap-1 ml-auto mt-0.5">
                  {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-400" />
              <span className="text-sm text-surface-600">
                I agree to the <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
              </span>
            </label>

            <Button type="submit" loading={loading} size="lg" className="w-full">
              Create Free Account
              <ArrowRight size={18} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
