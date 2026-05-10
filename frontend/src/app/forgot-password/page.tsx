"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { Input, Button } from "@/components/FormElements";
import { Alert } from "@/components/EmptyState";
import { authService } from "@/services/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow">
            <Globe size={18} className="text-white" />
          </div>
          <span className="text-xl font-display font-bold">Travel<span className="text-gradient">oop</span></span>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200/60 shadow-premium p-8 animate-scale-in">
          {!sent ? (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-display font-bold text-surface-900 mb-2">Forgot Password?</h1>
                <p className="text-surface-500">Enter your email and we'll send you a 6-digit OTP to reset your password.</p>
              </div>

              {error && <Alert type="error" title="Error" message={error} onClose={() => setError("")} />}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  icon={<Mail size={16} />}
                  required
                />
                <Button type="submit" loading={loading} size="lg" className="w-full">
                  Send OTP Code
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-xl font-display font-bold text-surface-900 mb-3">OTP Sent!</h2>
              <p className="text-surface-500 mb-8">
                If <span className="font-semibold text-surface-700">{email}</span> is registered, you'll receive a 6-digit code shortly. Check your inbox (and spam folder).
              </p>
              <Button
                size="lg"
                className="w-full"
                onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)}
              >
                Enter OTP Code
              </Button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-surface-100 text-center">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 transition-colors">
              <ArrowLeft size={14} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
