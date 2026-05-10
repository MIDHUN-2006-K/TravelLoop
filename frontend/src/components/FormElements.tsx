"use client";

import React, {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";
import { Loader2, X } from "lucide-react";

/* ============================================
   INPUT
   ============================================ */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  hint?: string;
}

export function Input({
  label,
  error,
  icon,
  hint,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-surface-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl text-sm text-surface-900 placeholder:text-surface-400
            focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400
            disabled:bg-surface-50 disabled:text-surface-400 disabled:cursor-not-allowed
            transition-all duration-200
            ${icon ? "pl-11" : ""}
            ${error ? "border-danger focus:ring-danger/30 focus:border-danger" : ""}
            ${className}
          `}
          {...props}
        />
      </div>
      {hint && !error && (
        <p className="text-xs text-surface-400">{hint}</p>
      )}
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
    </div>
  );
}

/* ============================================
   TEXTAREA
   ============================================ */
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-surface-700">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-3 bg-white border border-surface-200 rounded-xl text-sm text-surface-900 placeholder:text-surface-400
          focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400
          disabled:bg-surface-50 disabled:text-surface-400
          transition-all duration-200 resize-none
          ${error ? "border-danger focus:ring-danger/30 focus:border-danger" : ""}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
    </div>
  );
}

/* ============================================
   BUTTON
   ============================================ */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-glow hover:shadow-glow-lg active:shadow-none",
    secondary:
      "bg-surface-100 text-surface-700 hover:bg-surface-200 active:bg-surface-300",
    danger:
      "bg-danger text-white hover:bg-red-600 active:bg-red-700",
    ghost:
      "text-surface-600 hover:text-surface-900 hover:bg-surface-100 active:bg-surface-200",
    outline:
      "border-2 border-surface-200 text-surface-700 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center font-semibold rounded-xl
        transition-all duration-200 active:scale-[0.97]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === "sm" ? 14 : 18} className="animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
}

/* ============================================
   SELECT
   ============================================ */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({
  label,
  error,
  className = "",
  children,
  ...props
}: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-surface-700">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl text-sm text-surface-900
          focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400
          transition-all duration-200 cursor-pointer
          ${error ? "border-danger" : ""}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
    </div>
  );
}

/* ============================================
   BADGE
   ============================================ */
interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "neutral";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  children,
  variant = "primary",
  size = "sm",
  dot,
}: BadgeProps) {
  const variants = {
    primary: "bg-primary-100 text-primary-700",
    secondary: "bg-secondary-100 text-secondary-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    neutral: "bg-surface-100 text-surface-600",
  };

  const dotColors = {
    primary: "bg-primary-500",
    secondary: "bg-secondary-500",
    success: "bg-green-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    neutral: "bg-surface-400",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold
        ${variants[variant]}
        ${size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
}

/* ============================================
   MODAL
   ============================================ */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="overlay" onClick={onClose} />
      <div
        className={`relative bg-white rounded-2xl shadow-premium-xl w-full ${sizes[size]} max-h-[85vh] overflow-y-auto animate-scale-in z-50`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
            <h3 className="text-lg font-display font-bold text-surface-900">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ============================================
   STAT CARD
   ============================================ */
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
  gradient?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  gradient = "from-primary-500 to-primary-600",
}: StatCardProps) {
  return (
    <div className="card p-5 group">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-surface-500">{label}</p>
        {icon && (
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-shadow`}
          >
            {icon}
          </div>
        )}
      </div>
      <p className="text-3xl font-display font-bold text-surface-900 tracking-tight">
        {value}
      </p>
      {trend && (
        <p className="text-xs text-accent-600 font-medium mt-1">{trend}</p>
      )}
    </div>
  );
}

/* ============================================
   TOGGLE
   ============================================ */
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={`w-11 h-6 rounded-full transition-colors duration-200 ${
            checked ? "bg-primary-500" : "bg-surface-300"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        />
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
      {label && (
        <span className="text-sm font-medium text-surface-700">{label}</span>
      )}
    </label>
  );
}
