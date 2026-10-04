import React from "react";
import { StudentProfile } from "../types";
import { haptic } from "../utils/haptics";
import {
  BookOpen,
  Search,
  Bookmark,
  Bell,
  CreditCard,
  QrCode,
  User,
  ShieldCheck,
  Flame,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";

export type ScreenId =
  | "home"
  | "search"
  | "borrowed"
  | "reservations"
  | "notifications"
  | "fines"
  | "scan"
  | "profile"
  | "admin"
  | "streak"
  | "ai-advisor";

export interface SectionMeta {
  id: ScreenId;
  label: string;
  shortTitle: string;
  number: string;
  icon: React.ComponentType<{ className?: string }>;
  category?: string;
  description?: string;
}

export const SECTIONS_METADATA: SectionMeta[] = [
  { id: "home", label: "Home", shortTitle: "Home", number: "1", icon: BookOpen, category: "Discover", description: "Dashboard & quick stats" },
  { id: "search", label: "Search Catalog", shortTitle: "Search", number: "2", icon: Search, category: "Discover", description: "Find books & check availability" },
  { id: "ai-advisor", label: "AI Advisor", shortTitle: "AI Advisor", number: "3", icon: Sparkles, category: "Discover", description: "Smart book suggestions" },
  { id: "borrowed", label: "Borrowed Books", shortTitle: "Borrowed", number: "4", icon: BookOpen, category: "My Library", description: "Active loans & renewals" },
  { id: "reservations", label: "Reservations", shortTitle: "Holds", number: "5", icon: Bookmark, category: "My Library", description: "Pickup queue & lockers" },
  { id: "streak", label: "Reading Streak", shortTitle: "Streak", number: "6", icon: Flame, category: "My Library", description: "Daily reading goal & timer" },
  { id: "fines", label: "Fines & Dues", shortTitle: "Fines", number: "7", icon: CreditCard, category: "My Library", description: "Account balance & clearance" },
  { id: "scan", label: "Barcode Scanner", shortTitle: "Scanner", number: "8", icon: QrCode, category: "Services", description: "Self-checkout & ISBN lookup" },
  { id: "notifications", label: "Alerts & Notices", shortTitle: "Alerts", number: "9", icon: Bell, category: "Services", description: "Due date & hold reminders" },
  { id: "profile", label: "Student Profile", shortTitle: "Profile", number: "10", icon: User, category: "Services", description: "Digital card & privileges" },
  { id: "admin", label: "Staff Admin", shortTitle: "Admin", number: "11", icon: ShieldCheck, category: "Services", description: "Librarian management desk" },
];

interface HeaderProps {
  activeScreen: ScreenId;
  onScreenChange: (screen: ScreenId) => void;
  student: StudentProfile;
  activeLoansCount: number;
  activeReservationsCount: number;
  unreadNotificationsCount: number;
  finesTotal: number;
  currentStreak: number;
  onToggleSidebar?: () => void;
}

const HeaderComponent: React.FC<HeaderProps> = ({
  activeScreen,
  onScreenChange,
  student,
  activeLoansCount,
  activeReservationsCount,
  unreadNotificationsCount,
  finesTotal,
  currentStreak,
  onToggleSidebar,
}) => {
  const currentIndex = SECTIONS_METADATA.findIndex((s) => s.id === activeScreen);
  const currentMeta = SECTIONS_METADATA[currentIndex] || SECTIONS_METADATA[0];
  const CurrentIcon = currentMeta.icon;

  // Step to adjacent section left / right
  const handleGoLeftSection = () => {
    if (currentIndex > 0) {
      haptic.selection();
      onScreenChange(SECTIONS_METADATA[currentIndex - 1].id);
    }
  };

  const handleGoRightSection = () => {
    if (currentIndex < SECTIONS_METADATA.length - 1) {
      haptic.selection();
      onScreenChange(SECTIONS_METADATA[currentIndex + 1].id);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs select-none">
      {/* Top Banner with Institution Badge */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 text-white py-1 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] sm:text-xs font-extrabold tracking-wider uppercase text-blue-100 truncate">
              SMART LIBRARY PORTAL • CAMPUS CIRCULATION SYSTEM
            </span>
          </div>
          <div className="text-[10px] text-blue-100/90 font-medium hidden sm:block">
            All 11 Sections Listed In Left Sidebar
          </div>
        </div>
      </div>

      {/* Simplified, Clean Navigation Bar */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Sidebar Toggle Button + Brand */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
              title="Open Left Side Menu (All Sections)"
              aria-label="Open side menu"
            >
              <Menu className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold">Sections</span>
            </button>

            <div
              onClick={() => onScreenChange("home")}
              className="flex items-center gap-2 cursor-pointer py-0.5 group"
              title="Go to Home"
            >
              <div className="w-8 h-8 rounded-xl bg-stone-900 group-hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="hidden xs:block">
                <div className="text-xs sm:text-sm font-bold text-stone-900 tracking-tight leading-tight">
                  Smart Library
                </div>
                <div className="text-[9px] text-stone-500 font-medium">
                  {currentMeta.category || "Campus Portal"}
                </div>
              </div>
            </div>
          </div>

          {/* Center: Clean Section Stepper & Indicator */}
          <div className="flex items-center gap-1 bg-stone-100 p-0.5 sm:p-1 rounded-xl border border-stone-200/80 shadow-2xs">
            <button
              type="button"
              onClick={handleGoLeftSection}
              disabled={currentIndex <= 0}
              className="p-1.5 rounded-lg text-stone-600 hover:bg-white hover:text-blue-600 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer active:scale-95"
              title={`Previous: ${currentIndex > 0 ? SECTIONS_METADATA[currentIndex - 1].shortTitle : "None"}`}
              aria-label="Previous section"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={onToggleSidebar}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg hover:bg-white/80 transition-colors cursor-pointer text-left"
              title="Click to view all sections in sidebar"
            >
              <CurrentIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <div className="text-xs font-bold text-stone-900 truncate max-w-[95px] xs:max-w-[140px] sm:max-w-[180px]">
                {currentMeta.shortTitle}
              </div>
              <span className="text-[10px] font-extrabold text-blue-600 bg-blue-100/70 px-1 py-0.2 rounded-md hidden sm:inline">
                {currentIndex + 1}/11
              </span>
            </button>

            <button
              type="button"
              onClick={handleGoRightSection}
              disabled={currentIndex >= SECTIONS_METADATA.length - 1}
              className="p-1.5 rounded-lg text-stone-600 hover:bg-white hover:text-blue-600 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer active:scale-95"
              title={`Next: ${currentIndex < SECTIONS_METADATA.length - 1 ? SECTIONS_METADATA[currentIndex + 1].shortTitle : "None"}`}
              aria-label="Next section"
            >
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Streak Quick Pill */}
            <button
              type="button"
              onClick={() => onScreenChange("streak")}
              className="px-2 py-1 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200/70 text-orange-800 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
              title={`Reading streak: ${currentStreak} days`}
            >
              <Flame className="w-3.5 h-3.5 fill-current text-orange-500" />
              <span className="text-xs">{currentStreak}d</span>
            </button>

            {/* Quick Search */}
            <button
              type="button"
              onClick={() => onScreenChange("search")}
              className={`p-1.5 sm:p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer ${
                activeScreen === "search" ? "bg-blue-50 text-blue-600 font-bold" : ""
              }`}
              title="Search Catalog"
              aria-label="Search Catalog"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => onScreenChange("notifications")}
              className={`p-1.5 sm:p-2 rounded-xl text-stone-600 hover:bg-stone-100 relative transition-colors cursor-pointer ${
                activeScreen === "notifications" ? "bg-blue-50 text-blue-600" : ""
              }`}
              title="Alerts & Notifications"
              aria-label="Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              )}
            </button>

            {/* Student Profile Avatar */}
            <button
              type="button"
              onClick={() => onScreenChange("profile")}
              className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-blue-400 transition-all shrink-0 cursor-pointer"
              title={`Student: ${student.name}`}
            >
              <img
                src={student.avatarUrl}
                alt={student.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-stone-200"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export const Header = React.memo(HeaderComponent);
