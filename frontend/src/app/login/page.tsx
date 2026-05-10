"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Input, Button } from "@/components/FormElements";
import { Alert } from "@/components/EmptyState";
import { authService } from "@/services/api";
import { useAuthStore } from "@/lib/store";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await authService.login(email, password);
      localStorage.setItem("authToken", token);
      setToken(token);
      setUser(user);
      toast.success("Welcome back! 🌍");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-950 via-primary-800 to-primary-600 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&fit=crop')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.25 }} />
        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-8 border border-white/20">
            <Globe size={32} className="text-white" />
          </div>
          <h2 className="text-4xl font-display font-bold text-white mb-4">Welcome Back, Explorer</h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Your next adventure is waiting. Sign in to continue planning your perfect multi-city journey.
          </p>
          <div className="mt-12 flex justify-center gap-4">
            {["Paris", "Tokyo", "Bali", "Santorini"].map((city) => (
              <div key={city} className="px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/80 text-xs font-medium">{city}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-surface-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow">
              <Globe size={18} className="text-white" />
            </div>
            <span className="text-xl font-display font-bold">Travel<span className="text-gradient">oop</span></span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-surface-900 mb-2">Sign In</h1>
            <p className="text-surface-500">Don't have an account? <Link href="/signup" className="text-primary-600 font-semibold hover:text-primary-700">Create one free</Link></p>
          </div>

          {error && <Alert type="error" title="Login Failed" message={error} onClose={() => setError("")} />}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              icon={<Mail size={16} />}
              required
              autoComplete="email"
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                icon={<Lock size={16} />}
                required
                autoComplete="current-password"
              />
              <div className="flex items-center justify-between mt-2">
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs text-surface-400 hover:text-surface-600 flex items-center gap-1 transition-colors">
                  {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                  {showPassword ? "Hide" : "Show"} password
                </button>
                <Link href="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
              <span>Sign In</span>
              <ArrowRight size={18} />
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-surface-200 text-center">
            <p className="text-xs text-surface-400">Test account: <span className="font-mono">test@traveloop.com</span> / <span className="font-mono">password123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
