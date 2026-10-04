import React from "react";
import { StudentProfile, Loan, Reservation, ReadingHistoryItem } from "../types";
import {
  User,
  History,
  Target,
  Sparkles,
  Settings,
  QrCode,
  Flame,
  ChevronRight,
  BookOpen,
  Bookmark,
  CheckCircle2,
} from "lucide-react";

interface StudentProfileViewProps {
  student: StudentProfile;
  loans: Loan[];
  reservations: Reservation[];
  readingHistory: ReadingHistoryItem[];
  currentStreak: number;
  onNavigate: (screen: string) => void;
  onOpenStudentCard: () => void;
}

const StudentProfileViewComponent: React.FC<StudentProfileViewProps> = ({
  student,
  loans,
  reservations,
  readingHistory,
  currentStreak,
  onNavigate,
  onOpenStudentCard,
}) => {
  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-xl font-bold text-stone-900 tracking-tight">My Profile</h1>

      {/* Profile Card matching Screen 9 in image */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs text-center space-y-3">
        <div className="relative inline-block mx-auto">
          <img
            src={student.avatarUrl}
            alt={student.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm ring-2 ring-blue-500/20"
          />
          <div className="absolute bottom-1 right-1 p-1 bg-blue-600 text-white rounded-full shadow-xs">
            <User className="w-3 h-3" />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight">{student.name}</h2>
          <div className="text-xs font-mono font-semibold text-blue-600 mt-0.5">
            {student.studentNumber}
          </div>
          <div className="text-xs text-stone-500 font-medium">{student.major}</div>
        </div>

        <div className="pt-2 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onOpenStudentCard}
            className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Digital Library Pass</span>
          </button>
        </div>
      </div>

      {/* Menu Options matching Screen 9 in image */}
      <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => onNavigate("borrowed")}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-stone-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900 group-hover:text-blue-600 transition-colors">
                Library History
              </div>
              <div className="text-[11px] text-stone-500">View your past transactions & loans</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate("streak")}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-stone-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900 group-hover:text-orange-600 transition-colors flex items-center gap-1.5">
                <span>Reading Goals & Streak</span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 text-orange-800">
                  {currentStreak}d Active
                </span>
              </div>
              <div className="text-[11px] text-stone-500">Set, track goals & upload book covers</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate("ai-advisor")}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-stone-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900 group-hover:text-indigo-600 transition-colors">
                Personalized Recommendations
              </div>
              <div className="text-[11px] text-stone-500">AI picks based on your reading interests</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          type="button"
          onClick={onOpenStudentCard}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-stone-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-600 transition-colors">
                Digital Library Barcode Pass
              </div>
              <div className="text-[11px] text-stone-500">Fast scan barcode at campus turnstiles</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Recent Activity List matching Screen 9 in image */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">Recent Activity</h3>

        <div className="space-y-2">
          <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900">Borrowed Atomic Habits</div>
                <div className="text-[10px] text-stone-500">Sep 14, 2026 • 10:30 AM</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
              Active
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Bookmark className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900">Reserved Sapiens</div>
                <div className="text-[10px] text-stone-500">Sep 12, 2026 • 09:15 AM</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
              Queue: 1/3
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900">Returned Clean Code</div>
                <div className="text-[10px] text-stone-500">Aug 20, 2026 • 04:00 PM</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
              Returned
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StudentProfileView = React.memo(StudentProfileViewComponent);
