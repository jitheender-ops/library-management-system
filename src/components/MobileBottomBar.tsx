import React, { useState } from "react";
import { ScreenId, SECTIONS_METADATA } from "./Header";
import { haptic } from "../utils/haptics";
import {
  Home,
  Search,
  BookOpen,
  QrCode,
  Menu,
  X,
  Bookmark,
  Bell,
  CreditCard,
  User,
  ShieldCheck,
  Flame,
  Sparkles,
  ChevronRight,
} from "lucide-react";

interface MobileBottomBarProps {
  activeScreen: ScreenId;
  onScreenChange: (screen: ScreenId) => void;
  activeLoansCount: number;
  unreadNotificationsCount: number;
  finesTotal: number;
  currentStreak: number;
  onOpenSidebar?: () => void;
}

const MobileBottomBarComponent: React.FC<MobileBottomBarProps> = ({
  activeScreen,
  onScreenChange,
  activeLoansCount,
  unreadNotificationsCount,
  finesTotal,
  currentStreak,
  onOpenSidebar,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSelect = (screen: ScreenId) => {
    haptic.selection();
    onScreenChange(screen);
    setIsDrawerOpen(false);
  };

  const handleOpenSections = () => {
    haptic.light();
    if (onOpenSidebar) {
      onOpenSidebar();
    } else {
      setIsDrawerOpen(true);
    }
  };

  const isMoreActive = [
    "reservations",
    "notifications",
    "fines",
    "profile",
    "admin",
    "streak",
    "ai-advisor",
  ].includes(activeScreen);

  return (
    <>
      {/* Mobile Sticky Bottom Navigation Bar (Visible on mobile screens < 640px) */}
      <nav
        aria-label="Mobile Navigation"
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200/90 shadow-lg px-2 pt-1 pb-safe"
      >
        <div className="flex items-center justify-around h-14">
          {/* Home */}
          <button
            type="button"
            onClick={() => handleSelect("home")}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors cursor-pointer ${
              activeScreen === "home"
                ? "text-blue-600 font-bold"
                : "text-stone-500 hover:text-stone-800 font-medium"
            }`}
          >
            <div className="relative">
              <Home className="w-5 h-5" />
              {activeScreen === "home" && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
              )}
            </div>
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          {/* Search */}
          <button
            type="button"
            onClick={() => handleSelect("search")}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors cursor-pointer ${
              activeScreen === "search"
                ? "text-blue-600 font-bold"
                : "text-stone-500 hover:text-stone-800 font-medium"
            }`}
          >
            <div className="relative">
              <Search className="w-5 h-5" />
              {activeScreen === "search" && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
              )}
            </div>
            <span className="text-[10px] mt-0.5">Search</span>
          </button>

          {/* Scan (Prominent Center Pill) */}
          <button
            type="button"
            onClick={() => handleSelect("scan")}
            className="flex flex-col items-center justify-center flex-1 h-full group cursor-pointer"
          >
            <div
              className={`w-10 h-10 -mt-3 rounded-2xl flex items-center justify-center shadow-md transition-colors ${
                activeScreen === "scan"
                  ? "bg-blue-600 text-white shadow-blue-500/30 scale-105"
                  : "bg-stone-900 text-white hover:bg-blue-600"
              }`}
            >
              <QrCode className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] mt-0.5 ${
                activeScreen === "scan" ? "text-blue-600 font-bold" : "text-stone-500 font-medium"
              }`}
            >
              Scan
            </span>
          </button>

          {/* My Books */}
          <button
            type="button"
            onClick={() => handleSelect("borrowed")}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors cursor-pointer ${
              activeScreen === "borrowed"
                ? "text-blue-600 font-bold"
                : "text-stone-500 hover:text-stone-800 font-medium"
            }`}
          >
            <div className="relative">
              <BookOpen className="w-5 h-5" />
              {activeLoansCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center leading-tight">
                  {activeLoansCount}
                </span>
              )}
              {activeScreen === "borrowed" && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
              )}
            </div>
            <span className="text-[10px] mt-0.5">My Books</span>
          </button>

          {/* More Sections / Menu Drawer */}
          <button
            type="button"
            onClick={handleOpenSections}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors cursor-pointer ${
              isMoreActive
                ? "text-blue-600 font-bold"
                : "text-stone-500 hover:text-stone-800 font-medium"
            }`}
          >
            <div className="relative">
              <Menu className="w-5 h-5" />
              {(unreadNotificationsCount > 0 || finesTotal > 0) && (
                <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
              {isMoreActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
              )}
            </div>
            <span className="text-[10px] mt-0.5">Sections</span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Sheet: All 11 Sections */}
      {isDrawerOpen && (
        <div
          className="sm:hidden fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="bg-white rounded-t-3xl max-h-[82vh] overflow-y-auto p-4 pb-8 space-y-4 shadow-2xl border-t border-stone-200 animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Handle & Header */}
            <div className="flex flex-col items-center pb-2">
              <div className="w-12 h-1.5 bg-stone-300 rounded-full mb-3" />
              <div className="w-full flex items-center justify-between px-1">
                <div>
                  <h3 className="text-base font-bold text-stone-900">All Library Sections</h3>
                  <p className="text-xs text-stone-500">Quick access to all 11 modules</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sections Grid / List */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {SECTIONS_METADATA.map((sec) => {
                const IconComponent = sec.icon;
                const isCurrent = activeScreen === sec.id;

                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => handleSelect(sec.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-left border transition-colors cursor-pointer ${
                      isCurrent
                        ? "bg-blue-50 border-blue-300 text-blue-700 font-bold shadow-xs"
                        : "bg-stone-50 border-stone-200/80 text-stone-700 hover:bg-stone-100 font-medium"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isCurrent ? "bg-blue-600 text-white" : "bg-white text-stone-700 border border-stone-200"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs truncate">{sec.label}</div>
                      {sec.id === "notifications" && unreadNotificationsCount > 0 && (
                        <span className="text-[10px] text-rose-600 font-bold">
                          {unreadNotificationsCount} new alerts
                        </span>
                      )}
                      {sec.id === "fines" && finesTotal > 0 && (
                        <span className="text-[10px] text-amber-700 font-bold">
                          ₹{finesTotal} due
                        </span>
                      )}
                      {sec.id === "streak" && currentStreak > 0 && (
                        <span className="text-[10px] text-orange-600 font-bold">
                          🔥 {currentStreak} days
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Helper Note */}
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-center text-xs text-stone-500">
              Tip: You can also swipe or use the <span className="font-semibold text-stone-700">Left / Right</span> arrows at the top bar to move between sections anytime.
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const MobileBottomBar = React.memo(MobileBottomBarComponent);
