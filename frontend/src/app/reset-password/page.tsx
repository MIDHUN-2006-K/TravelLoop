"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Globe, Lock, Key, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Input, Button } from "@/components/FormElements";
import { Alert } from "@/components/EmptyState";
import { authService } from "@/services/api";
import toast from "react-hot-toast";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(prefillEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { setError("OTP must be exactly 6 digits"); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    setError("");
    setLoading(true);
    try {
      await authService.resetPassword(email, otp, newPassword);
      setSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP or it has expired. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <h2 className="text-xl font-display font-bold text-surface-900 mb-2">Password Reset!</h2>
        <p className="text-surface-500">Redirecting you to sign in...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-surface-900 mb-2">Reset Password</h1>
        <p className="text-surface-500">Enter the 6-digit OTP sent to your email and choose a new password.</p>
      </div>

      {error && <Alert type="error" title="Error" message={error} onClose={() => setError("")} />}

      <form onSubmit={handleSubmit} className="space-y-5">
        {!prefillEmail && (
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        )}

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">6-Digit OTP Code</label>
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="w-full px-4 py-3 bg-white border border-surface-200 rounded-xl text-center text-3xl font-mono font-bold text-primary-600 tracking-[1rem] focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400 transition-all"
            required
          />
          <p className="text-xs text-surface-400 mt-1.5 text-center">Check your inbox for the OTP code</p>
        </div>

        <div>
          <Input
            label="New Password"
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min. 6 characters"
            icon={<Lock size={16} />}
            required
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs text-surface-400 hover:text-surface-600 flex items-center gap-1 mt-2">
            {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
            {showPassword ? "Hide" : "Show"} password
          </button>
        </div>

        <Button type="submit" loading={loading} size="lg" className="w-full">
          <Key size={18} />
          Reset Password
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow">
            <Globe size={18} className="text-white" />
          </div>
          <span className="text-xl font-display font-bold">Travel<span className="text-gradient">oop</span></span>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200/60 shadow-premium p-8 animate-scale-in">
          <Suspense fallback={<div className="skeleton h-64 w-full rounded-xl" />}>
            <ResetPasswordForm />
          </Suspense>

          <div className="mt-6 pt-6 border-t border-surface-100 text-center">
            <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Didn't receive OTP? Resend
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
