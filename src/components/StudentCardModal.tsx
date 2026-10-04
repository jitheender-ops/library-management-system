import React from "react";
import { StudentProfile } from "../types";
import { BarcodeDisplay } from "./BarcodeDisplay";
import { X, BookOpen, ShieldCheck, GraduationCap, Calendar } from "lucide-react";

interface StudentCardModalProps {
  student: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
  activeLoansCount: number;
}

export const StudentCardModal: React.FC<StudentCardModalProps> = ({
  student,
  isOpen,
  onClose,
  activeLoansCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-stone-900 text-stone-100 rounded-2xl shadow-2xl border border-stone-800 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide text-white uppercase">University Library</h3>
              <p className="text-[11px] text-stone-400">Digital Student Pass & Kiosk ID</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-5">
          {/* Profile snippet */}
          <div className="flex items-center gap-4 bg-stone-800/60 p-3.5 rounded-xl border border-stone-700/60">
            <img
              src={student.avatarUrl}
              alt={student.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/50"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-semibold text-white truncate">{student.name}</h4>
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
              <p className="text-xs text-stone-300 font-mono">{student.studentNumber}</p>
              <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-1">
                <GraduationCap className="w-3.5 h-3.5 text-stone-400" />
                <span className="truncate">{student.major}</span>
              </div>
            </div>
          </div>

          {/* Library Stats */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-stone-800/40 p-3 rounded-lg border border-stone-700/50">
              <p className="text-[11px] text-stone-400">Active Borrowed Books</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">
                {activeLoansCount} <span className="text-xs text-stone-400 font-normal">/ {student.maxLoansLimit} max</span>
              </p>
            </div>
            <div className="bg-stone-800/40 p-3 rounded-lg border border-stone-700/50">
              <p className="text-[11px] text-stone-400">Card Status</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mt-1">
                Active & Good Standing
              </span>
            </div>
          </div>

          {/* Barcode section for Self-Checkout Kiosk */}
          <div className="bg-white p-4 rounded-xl text-center shadow-inner">
            <p className="text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
              Scan at Circulation Desk & Lockers
            </p>
            <BarcodeDisplay value={student.libraryBarcode} showText={true} className="w-full justify-center" />
            <p className="text-[10px] text-stone-500 mt-2 font-mono">
              BARCODE ID: {student.libraryBarcode}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-400 pt-1 border-t border-stone-800">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Valid Thru: June 2027
            </span>
            <span>{student.yearLevel}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
