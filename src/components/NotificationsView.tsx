import React, { useState } from "react";
import { LibraryNotification } from "../types";
import {
  Bell,
  Clock,
  CheckCircle2,
  Calendar,
  CreditCard,
  Sparkles,
  ChevronRight,
  CheckCheck,
} from "lucide-react";

interface NotificationsViewProps {
  notifications: LibraryNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigate: (screen: string) => void;
}

const NotificationsViewComponent: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigate,
}) => {
  const [filter, setFilter] = useState<"All" | "Due Dates" | "Returns" | "Reservations">("All");

  const filteredNotifs = notifications.filter((n) => {
    if (filter === "Due Dates") return n.type === "due-date";
    if (filter === "Returns") return n.type === "return";
    if (filter === "Reservations") return n.type === "reservation";
    return true;
  });

  const getIcon = (type: LibraryNotification["type"]) => {
    switch (type) {
      case "due-date":
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case "return":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "reservation":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "fine":
        return <CreditCard className="w-4 h-4 text-rose-600" />;
      case "new-book":
        return <Sparkles className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getBgColor = (type: LibraryNotification["type"]) => {
    switch (type) {
      case "due-date":
        return "bg-amber-50";
      case "return":
        return "bg-emerald-50";
      case "reservation":
        return "bg-blue-50";
      case "fine":
        return "bg-rose-50";
      case "new-book":
        return "bg-indigo-50";
    }
  };

  const handleAction = (notif: LibraryNotification) => {
    onMarkAsRead(notif.id);
    if (notif.type === "due-date" || notif.type === "return") {
      onNavigate("borrowed");
    } else if (notif.type === "reservation") {
      onNavigate("reservations");
    } else if (notif.type === "fine") {
      onNavigate("fines");
    } else if (notif.type === "new-book") {
      onNavigate("search");
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Notifications
        </h1>
        <button
          type="button"
          onClick={onMarkAllAsRead}
          className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-1"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Mark all as read
        </button>
      </div>

      {/* Filter Tabs matching Screen 6 in image */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(["All", "Due Dates", "Returns", "Reservations"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filter === tab
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-2.5">
        {filteredNotifs.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-2">
            <Bell className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-xs font-medium text-stone-500">No notifications in this category.</p>
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleAction(notif)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                notif.read
                  ? "bg-white border-stone-200/80 hover:border-stone-300"
                  : "bg-blue-50/40 border-blue-200 hover:border-blue-400"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl ${getBgColor(
                  notif.type
                )} flex items-center justify-center shrink-0 shadow-xs`}
              >
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-stone-900 tracking-tight">
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-stone-400 shrink-0 font-medium">
                    {notif.timestamp}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                  {notif.description}
                </p>

                {notif.actionText && (
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700">
                    <span>{notif.actionText}</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                )}
              </div>

              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1"></span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const NotificationsView = React.memo(NotificationsViewComponent);
