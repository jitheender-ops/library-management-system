import React, { useState } from "react";
import { Book, Loan, Reservation, StudentProfile } from "../types";
import {
  Search,
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
  Flame,
  CreditCard,
  Bookmark,
  ChevronRight,
  QrCode,
  X,
} from "lucide-react";
import { BookCoverImage } from "./BookCoverImage";

interface HomeDashboardViewProps {
  student: StudentProfile;
  availableBooks: Book[];
  loans: Loan[];
  reservations: Reservation[];
  currentStreak: number;
  onSelectBook: (book: Book) => void;
  onNavigate: (screen: string) => void;
  onQuickSearch: (query: string) => void;
}

const HomeDashboardViewComponent: React.FC<HomeDashboardViewProps> = ({
  student,
  availableBooks,
  loans,
  reservations,
  currentStreak,
  onSelectBook,
  onNavigate,
  onQuickSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const samplePrompts = [
    "machine learning & AI systems",
    "clean architecture & refactoring",
    "psychology & high performance habits",
  ];

  const dueSoonCount = loans.filter((l) => {
    const days = Math.ceil(
      (new Date(l.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days < 3;
  }).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onQuickSearch(searchQuery.trim());
      onNavigate("search");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-6">
      {/* Top Greeting & Student Avatar - iOS Navigation Bar Style */}
      <div className="flex items-center justify-between pt-0.5">
        <div>
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
            Campus Library
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-1.5">
            Hi, {student.name} <span className="inline-block animate-wave text-base">👋</span>
          </h1>
          <p className="text-xs text-stone-500 font-medium">
            {student.major} • Year 3
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("profile")}
          className="relative group rounded-full p-0.5 hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
          title="Open Profile & Student Card"
        >
          <img
            src={student.avatarUrl}
            alt={student.name}
            className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
        </button>
      </div>

      {/* Global iOS Search Field */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search books, authors, call numbers..."
          className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-stone-100/90 hover:bg-stone-100 border border-stone-200/80 rounded-2xl placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-stone-300 hover:bg-stone-400 text-white transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </form>

      {/* My Library Overview Stats - iOS Inset Grouped Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            My Library Status
          </span>
          <button
            type="button"
            onClick={() => onNavigate("borrowed")}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            View Loans
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div
            onClick={() => onNavigate("borrowed")}
            className="bg-white p-3 rounded-2xl border border-stone-200/80 hover:border-blue-400 cursor-pointer transition-all shadow-[0_2px_8px_rgba(0,0,0,0.03)] active:scale-[0.98]"
          >
            <div className="flex items-center gap-1.5 text-blue-600 mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="text-[10px] sm:text-[11px] font-bold text-stone-600 truncate">Borrowed</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-stone-900 font-mono">{loans.length}</div>
            <div className="text-[9px] text-stone-400 font-medium">active books</div>
          </div>

          <div
            onClick={() => onNavigate("borrowed")}
            className="bg-white p-3 rounded-2xl border border-stone-200/80 hover:border-amber-400 cursor-pointer transition-all shadow-[0_2px_8px_rgba(0,0,0,0.03)] active:scale-[0.98]"
          >
            <div className="flex items-center gap-1.5 text-amber-600 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[10px] sm:text-[11px] font-bold text-stone-600 truncate">Due Soon</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono">{dueSoonCount}</div>
            <div className="text-[9px] text-stone-400 font-medium">&lt; 3 days</div>
          </div>

          <div
            onClick={() => onNavigate("streak")}
            className="bg-white p-3 rounded-2xl border border-stone-200/80 hover:border-orange-400 cursor-pointer transition-all shadow-[0_2px_8px_rgba(0,0,0,0.03)] active:scale-[0.98]"
          >
            <div className="flex items-center gap-1.5 text-orange-500 mb-1">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span className="text-[10px] sm:text-[11px] font-bold text-stone-600 truncate">Streak</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-orange-500 font-mono">{currentStreak}d</div>
            <div className="text-[9px] text-stone-400 font-medium">days active</div>
          </div>
        </div>
      </div>

      {/* AI Book Finder Banner - iOS Frosted Glass */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white p-4 sm:p-5 shadow-sm">
        <div className="relative z-10 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-blue-100" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold tracking-tight block">AI Library Advisor</span>
                <span className="text-[10px] text-blue-200">Natural language recommendation engine</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("ai-advisor")}
              className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
              title="Open AI Advisor"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onQuickSearch(prompt);
                  onNavigate("search");
                }}
                className="text-left px-2.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-[11px] text-blue-50 font-medium flex items-center justify-between transition-all group cursor-pointer"
              >
                <span className="truncate">"{prompt}"</span>
                <ChevronRight className="w-3 h-3 text-blue-200 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Available Books - High Definition Covers with BookCoverImage */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <div>
            <h2 className="text-sm font-bold text-stone-900 tracking-tight">Available Books</h2>
            <p className="text-[10px] text-stone-500">Ready for instant checkout or reservation</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("search")}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            See all ({availableBooks.length})
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {availableBooks.slice(0, 4).map((book) => (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className="group cursor-pointer flex flex-col bg-white p-2.5 rounded-2xl border border-stone-200/80 hover:border-blue-400 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-all active:scale-[0.97]"
            >
              <div className="relative mb-2">
                <BookCoverImage
                  src={book.coverUrl}
                  alt={book.title}
                  title={book.title}
                  author={book.author}
                  category={book.category}
                  aspectRatio="aspect-3/4"
                  className="rounded-xl shadow-2xs group-hover:shadow-sm transition-shadow"
                  badge={
                    <span className="top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-600/90 text-white shadow-xs backdrop-blur-md">
                      {book.availableCopies} Left
                    </span>
                  }
                />
              </div>

              <h3 className="text-xs font-bold text-stone-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {book.title}
              </h3>
              <p className="text-[10px] text-stone-500 truncate mt-0.5">{book.author}</p>
              <div className="mt-1.5 flex items-center justify-between text-[10px]">
                <span className="text-stone-400 font-mono text-[9px] truncate">{book.shelfLocation.shelfNumber}</span>
                <span className="font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center">
                  View <ChevronRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions iOS Grid */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider px-0.5">
          Quick Actions
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => onNavigate("search")}
            className="flex items-center p-3 bg-white hover:bg-blue-50/70 border border-stone-200/80 rounded-2xl transition-all group shadow-2xs gap-2.5 cursor-pointer active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-stone-800 leading-tight">Search</div>
              <div className="text-[10px] text-stone-400">All catalog</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("scan")}
            className="flex items-center p-3 bg-white hover:bg-blue-50/70 border border-stone-200/80 rounded-2xl transition-colors group shadow-2xs gap-2.5 cursor-pointer active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-stone-800 leading-tight">Barcode</div>
              <div className="text-[10px] text-stone-400">Scan book</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("reservations")}
            className="flex items-center p-3 bg-white hover:bg-blue-50/70 border border-stone-200/80 rounded-2xl transition-colors group shadow-2xs gap-2.5 cursor-pointer active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <Bookmark className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-stone-800 leading-tight">Holdings</div>
              <div className="text-[10px] text-stone-400">Reservations</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("fines")}
            className="flex items-center p-3 bg-white hover:bg-blue-50/70 border border-stone-200/80 rounded-2xl transition-colors group shadow-2xs gap-2.5 cursor-pointer active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-stone-800 leading-tight">Pay Fines</div>
              <div className="text-[10px] text-stone-400">Instant UPI</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export const HomeDashboardView = React.memo(HomeDashboardViewComponent);

