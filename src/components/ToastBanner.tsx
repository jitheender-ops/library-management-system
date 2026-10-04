import React from "react";
import { CheckCircle2, X } from "lucide-react";

interface ToastBannerProps {
  message: string;
  onClose: () => void;
}

export const ToastBanner: React.FC<ToastBannerProps> = ({ message, onClose }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md bg-stone-900 text-white px-4 py-3 rounded-xl shadow-xl border border-stone-800 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <p className="text-xs sm:text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="p-1 text-stone-400 hover:text-white rounded-md transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
