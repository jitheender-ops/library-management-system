import React, { useState, useMemo } from "react";
import { ScreenId, SectionMeta, SECTIONS_METADATA } from "./Header";
import { StudentProfile } from "../types";
import {
  X,
  Search,
  BookOpen,
  Bookmark,
  Bell,
  CreditCard,
  QrCode,
  User,
  ShieldCheck,
  Flame,
  Sparkles,
  IdCard,
  ChevronRight,
  Sparkle,
} from "lucide-react";

export interface SideSectionNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  student: StudentProfile;
  activeLoansCount: number;
  activeReservationsCount: number;
  unreadNotificationsCount: number;
  finesTotal: number;
  currentStreak: number;
  onOpenStudentCard?: () => void;
  isPermanentDesktop?: boolean;
}

interface SectionCategoryGroup {
  name: string;
  description: string;
  items: {
    id: ScreenId;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number | null;
    badgeVariant?: "blue" | "rose" | "orange" | "amber" | "emerald" | "indigo";
  }[];
}

const SideSectionNavigationComponent: React.FC<SideSectionNavigationProps> = ({
  isOpen,
  onClose,
  activeScreen,
  onSelectScreen,
  student,
  activeLoansCount,
  activeReservationsCount,
  unreadNotificationsCount,
  finesTotal,
  currentStreak,
  onOpenStudentCard,
  isPermanentDesktop = false,
}) => {
  const [filterQuery, setFilterQuery] = useState("");

  const groups: SectionCategoryGroup[] = useMemo(
    () => [
      {
        name: "Discover & Catalog",
        description: "Books, explore and AI recommendations",
        items: [
          {
            id: "home",
            title: "Home",
            subtitle: "Dashboard & Quick Stats",
            icon: BookOpen,
          },
          {
            id: "search",
            title: "Search Catalog",
            subtitle: "Browse & Find Books",
            icon: Search,
          },
          {
            id: "ai-advisor",
            title: "AI Reading Advisor",
            subtitle: "Smart Recommendations",
            icon: Sparkles,
            badge: "AI",
            badgeVariant: "indigo" as any,
          },
        ],
      },
      {
        name: "My Library & Reading",
        description: "Personal loans, reservations & streak",
        items: [
          {
            id: "borrowed",
            title: "Borrowed Books",
            subtitle: "Active Loans & Renewals",
            icon: BookOpen,
            badge: activeLoansCount > 0 ? activeLoansCount : null,
            badgeVariant: "blue",
          },
          {
            id: "reservations",
            title: "Reservations",
            subtitle: "Hold Queue & Locker Pickups",
            icon: Bookmark,
            badge: activeReservationsCount > 0 ? activeReservationsCount : null,
            badgeVariant: "blue",
          },
          {
            id: "streak",
            title: "Reading Streak & Timer",
            subtitle: "Daily Target & Live Timer",
            icon: Flame,
            badge: currentStreak > 0 ? `${currentStreak}d` : null,
            badgeVariant: "orange",
          },
          {
            id: "fines",
            title: "Fines & Payments",
            subtitle: "Balance & Late Dues",
            icon: CreditCard,
            badge: finesTotal > 0 ? `₹${finesTotal}` : null,
            badgeVariant: finesTotal > 0 ? "rose" : undefined,
          },
        ],
      },
      {
        name: "Services & Tools",
        description: "Scanning, alerts, profile & admin",
        items: [
          {
            id: "scan",
            title: "Barcode Scanner",
            subtitle: "Self-Checkout & ISBN",
            icon: QrCode,
          },
          {
            id: "notifications",
            title: "Alerts & Notices",
            subtitle: "Due Dates & Hold Ready",
            icon: Bell,
            badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
            badgeVariant: "rose",
          },
          {
            id: "profile",
            title: "Student Profile",
            subtitle: "Digital ID & Card",
            icon: User,
          },
          {
            id: "admin",
            title: "Admin & Circulation",
            subtitle: "Staff Management Desk",
            icon: ShieldCheck,
          },
        ],
      },
    ],
    [
      activeLoansCount,
      activeReservationsCount,
      unreadNotificationsCount,
      finesTotal,
      currentStreak,
    ]
  );

  // Filter items if query exists
  const filteredGroups = useMemo(() => {
    if (!filterQuery.trim()) return groups;
    const query = filterQuery.toLowerCase();
    return groups
      .map((group) => {
        const matchingItems = group.items.filter(
          (item) =>
            item.title.toLowerCase().includes(query) ||
            item.subtitle.toLowerCase().includes(query) ||
            group.name.toLowerCase().includes(query)
        );
        return {
          ...group,
          items: matchingItems,
        };
      })
      .filter((group) => group.items.length > 0);
  }, [groups, filterQuery]);

  const handleItemClick = (screenId: ScreenId) => {
    onSelectScreen(screenId);
    if (!isPermanentDesktop) {
      onClose();
    }
  };

  const content = (
    <aside
      aria-label="Library Navigation Menu"
      className="h-full w-full bg-stone-50 border-r border-stone-200/90 flex flex-col justify-between select-none"
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-stone-200/80 bg-white">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900 leading-tight">
                Smart Library
              </div>
              <div className="text-[10px] text-stone-500 font-medium">
                Campus Portal Navigation
              </div>
            </div>
          </div>

          {!isPermanentDesktop && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Close Menu"
              aria-label="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Search */}
        <div className="mt-3 relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Quick find section..."
            className="w-full pl-8 pr-7 py-1.5 bg-stone-100 text-xs rounded-xl border border-stone-200/80 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-stone-800 placeholder-stone-400 transition-all"
          />
          {filterQuery && (
            <button
              type="button"
              onClick={() => setFilterQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Groups List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin">
        {filteredGroups.length === 0 ? (
          <div className="p-4 text-center text-stone-400 text-xs">
            No sections match "{filterQuery}"
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.name} className="space-y-1">
              <div className="px-2 pb-1 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {group.name}
                </span>
                <span className="text-[9px] text-stone-400 font-medium">
                  {group.items.length}
                </span>
              </div>

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeScreen === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-xl transition-all flex items-center justify-between group cursor-pointer ${
                        isActive
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-stone-700 hover:bg-stone-200/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-white text-stone-600 border border-stone-200/60 group-hover:text-blue-600"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div
                            className={`text-xs font-bold leading-tight truncate ${
                              isActive ? "text-white" : "text-stone-900"
                            }`}
                          >
                            {item.title}
                          </div>
                          <div
                            className={`text-[10px] leading-tight truncate ${
                              isActive ? "text-blue-100" : "text-stone-500"
                            }`}
                          >
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-1">
                        {item.badge !== undefined && item.badge !== null && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full leading-tight ${
                              isActive
                                ? "bg-white text-blue-700"
                                : item.badgeVariant === "rose"
                                ? "bg-rose-100 text-rose-700 font-extrabold"
                                : item.badgeVariant === "orange"
                                ? "bg-orange-100 text-orange-700 font-extrabold"
                                : item.badgeVariant === "indigo"
                                ? "bg-indigo-100 text-indigo-700 font-extrabold"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform ${
                            isActive
                              ? "text-white/80"
                              : "text-stone-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sidebar Footer: Student Profile & ID Card Quick Access */}
      <div className="p-3 border-t border-stone-200/80 bg-white">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-50 border border-stone-200/60">
          <img
            src={student.avatarUrl}
            alt={student.name}
            className="w-9 h-9 rounded-xl object-cover border border-stone-200 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-stone-900 truncate">
              {student.name}
            </div>
            <div className="text-[10px] text-stone-500 truncate">
              {student.yearLevel || "Student"} • #{student.studentNumber || student.id}
            </div>
          </div>

          {onOpenStudentCard && (
            <button
              type="button"
              onClick={onOpenStudentCard}
              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors shrink-0 cursor-pointer"
              title="Open Digital Student Library Card"
              aria-label="Digital Library Card"
            >
              <IdCard className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );

  // If permanent desktop sidebar
  if (isPermanentDesktop) {
    return <div className="w-64 shrink-0 h-full">{content}</div>;
  }

  // If closed and not permanent desktop, do not render heavy DOM tree
  if (!isOpen) {
    return null;
  }

  // Slide-out Drawer mode (for mobile / simulator frame or when overlay is requested)
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-200 opacity-100 pointer-events-auto"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Drawer */}
      <div
        className="fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[82vw] bg-white shadow-2xl transition-transform duration-200 ease-out transform translate-x-0"
      >
        {content}
      </div>
    </>
  );
};

export const SideSectionNavigation = React.memo(SideSectionNavigationComponent);

