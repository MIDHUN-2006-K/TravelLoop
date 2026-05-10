import React, { ReactNode } from "react";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-gray-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      {action}
    </div>
  );
}

interface AlertProps {
  type: "error" | "success" | "info" | "warning";
  title: string;
  message: string;
  onClose?: () => void;
}

export function Alert({ type, title, message, onClose }: AlertProps) {
  const colors = {
    error: "bg-red-50 border-red-200 text-red-900",
    success: "bg-green-50 border-green-200 text-green-900",
    info: "bg-blue-50 border-blue-200 text-blue-900",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
  };

  const iconMap = {
    error: <AlertCircle className="text-red-500" />,
    success: <CheckCircle className="text-green-500" />,
    info: <Info className="text-blue-500" />,
    warning: <AlertCircle className="text-yellow-500" />,
  };

  return (
    <div
      className={`border rounded-lg p-4 flex items-start gap-4 ${colors[type]}`}
    >
      <div className="mt-1">{iconMap[type]}</div>
      <div className="flex-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm opacity-90">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-lg opacity-50 hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
}
