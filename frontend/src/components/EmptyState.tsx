import React, { ReactNode } from "react";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";

/* ============================================
   EMPTY STATE
   ============================================ */
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      {icon && (
        <div className="w-20 h-20 rounded-2xl bg-surface-100 flex items-center justify-center mb-6 text-surface-400">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-display font-bold text-surface-800 mb-2">
        {title}
      </h3>
      <p className="text-surface-500 mb-8 max-w-sm leading-relaxed">
        {description}
      </p>
      {action}
    </div>
  );
}

/* ============================================
   ALERT
   ============================================ */
interface AlertProps {
  type: "error" | "success" | "info" | "warning";
  title: string;
  message: string;
  onClose?: () => void;
}

export function Alert({ type, title, message, onClose }: AlertProps) {
  const config = {
    error: {
      bg: "bg-red-50 border-red-200",
      text: "text-red-900",
      desc: "text-red-700",
      icon: <AlertCircle size={18} className="text-red-500" />,
    },
    success: {
      bg: "bg-green-50 border-green-200",
      text: "text-green-900",
      desc: "text-green-700",
      icon: <CheckCircle size={18} className="text-green-500" />,
    },
    info: {
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-900",
      desc: "text-blue-700",
      icon: <Info size={18} className="text-blue-500" />,
    },
    warning: {
      bg: "bg-amber-50 border-amber-200",
      text: "text-amber-900",
      desc: "text-amber-700",
      icon: <AlertTriangle size={18} className="text-amber-500" />,
    },
  };

  const c = config[type];

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border ${c.bg} animate-fade-in-down mb-4`}
    >
      <div className="flex-shrink-0 mt-0.5">{c.icon}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${c.text}`}>{title}</p>
        <p className={`text-sm ${c.desc} mt-0.5`}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
        >
          <X size={14} className={c.desc} />
        </button>
      )}
    </div>
  );
}
