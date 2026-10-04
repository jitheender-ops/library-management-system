import React from "react";
import { AdminCirculationStats, Book } from "../types";
import {
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  PlusCircle,
  FileText,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";

interface AdminDashboardViewProps {
  stats: AdminCirculationStats;
  catalog: Book[];
  onNavigate: (screen: string) => void;
  onOpenAddBook?: () => void;
}

const AdminDashboardViewComponent: React.FC<AdminDashboardViewProps> = ({
  stats,
  catalog,
  onNavigate,
  onOpenAddBook,
}) => {
  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight">Library Dashboard</h1>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Librarian & Catalog Administration
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          Librarian Admin
        </span>
      </div>

      {/* 4 Key Circulation Metrics matching Screen 10 in image */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[11px] font-medium text-stone-500">Total Books</div>
          <div className="text-xl font-bold text-stone-900 mt-1">
            {stats.totalBooks.toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[11px] font-medium text-emerald-600">Available</div>
          <div className="text-xl font-bold text-emerald-700 mt-1">
            {stats.availableBooks.toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[11px] font-medium text-amber-600">Issued</div>
          <div className="text-xl font-bold text-amber-700 mt-1">
            {stats.issuedBooks.toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[11px] font-medium text-purple-600">Reserved</div>
          <div className="text-xl font-bold text-purple-700 mt-1">
            {stats.reservedBooks.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Quick Management Section matching Screen 10 in image */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
          Quick Management
        </h2>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onNavigate("search")}
            className="flex flex-col items-center justify-center p-3 bg-white hover:bg-blue-50/70 border border-stone-200 rounded-xl transition-all group shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-stone-800 text-center">Add Book</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("search")}
            className="flex flex-col items-center justify-center p-3 bg-white hover:bg-blue-50/70 border border-stone-200 rounded-xl transition-all group shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-stone-800 text-center">Manage Books</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("profile")}
            className="flex flex-col items-center justify-center p-3 bg-white hover:bg-blue-50/70 border border-stone-200 rounded-xl transition-all group shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-stone-800 text-center">Manage Users</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("fines")}
            className="flex flex-col items-center justify-center p-3 bg-white hover:bg-blue-50/70 border border-stone-200 rounded-xl transition-all group shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-stone-800 text-center">View Fines</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("ai-advisor")}
            className="flex flex-col items-center justify-center p-3 bg-white hover:bg-blue-50/70 border border-stone-200 rounded-xl transition-all group shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-stone-800 text-center">Reports</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("profile")}
            className="flex flex-col items-center justify-center p-3 bg-white hover:bg-blue-50/70 border border-stone-200 rounded-xl transition-all group shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Settings className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-stone-800 text-center">Settings</span>
          </button>
        </div>
      </div>

      {/* Recent Activity Feed matching Screen 10 in image */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
          Recent Activity
        </h2>

        <div className="space-y-2">
          <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900">New Book Added</div>
                <div className="text-[10px] text-stone-500">Clean Architecture</div>
              </div>
            </div>
            <span className="text-[10px] text-stone-400 font-medium">2h ago</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900">Book Returned</div>
                <div className="text-[10px] text-stone-500">Deep Work</div>
              </div>
            </div>
            <span className="text-[10px] text-stone-400 font-medium">3h ago</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900">Reservation Fulfilled</div>
                <div className="text-[10px] text-stone-500">Sapiens</div>
              </div>
            </div>
            <span className="text-[10px] text-stone-400 font-medium">5h ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboardView = React.memo(AdminDashboardViewComponent);
