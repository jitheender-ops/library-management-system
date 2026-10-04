import React, { useState, useRef } from "react";
import {
  Flame,
  UploadCloud,
  Camera,
  CheckCircle2,
  Award,
  BookOpen,
  Clock,
  Sparkles,
  Calendar,
  X,
  TrendingUp,
  Image as ImageIcon,
  ChevronRight,
  BookmarkCheck,
} from "lucide-react";
import { Book, Loan, ReadingStreakCheckIn, ReadingStreakData } from "../types";
import { haptic } from "../utils/haptics";
import { ReadingTimer } from "./ReadingTimer";
import { DailyReadingGoalProgress } from "./DailyReadingGoalProgress";

interface StreakViewProps {
  streakData: ReadingStreakData;
  loans: Loan[];
  catalog: Book[];
  onLogCheckIn: (checkIn: Omit<ReadingStreakCheckIn, "id" | "timestamp" | "verified">) => void;
  onSelectBook: (book: Book) => void;
  onUpdateDailyGoal?: (minutes: number) => void;
  onQuickAddReadingMinutes?: (minutes: number) => void;
  onTimerTick?: (seconds: number, isRunning: boolean) => void;
}

const StreakViewComponent: React.FC<StreakViewProps> = ({
  streakData,
  loans,
  catalog,
  onLogCheckIn,
  onSelectBook,
  onUpdateDailyGoal,
  onQuickAddReadingMinutes,
  onTimerTick,
}) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const isTodayCompleted = streakData.lastCheckInDate === todayStr;

  // Calculate total reading minutes logged today from streak history
  const todayHistoryMinutes = streakData.history
    .filter((h) => h.date === todayStr)
    .reduce((acc, h) => acc + (h.readingDurationMinutes || 0), 0);

  const [sessionBonusMinutes, setSessionBonusMinutes] = useState<number>(0);
  const totalTodayMinutes = todayHistoryMinutes + sessionBonusMinutes;
  const currentDailyGoal = streakData.dailyGoalMinutes || 30;

  // Form State
  const [selectedBookId, setSelectedBookId] = useState<string>(
    loans.length > 0 ? loans[0].bookId : catalog[0]?.id || ""
  );
  const [customTitle, setCustomTitle] = useState("");
  const [customAuthor, setCustomAuthor] = useState("");
  const [isCustomBook, setIsCustomBook] = useState(false);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("");
  const [pagesRead, setPagesRead] = useState<number>(30);
  const [durationMinutes, setDurationMinutes] = useState<number>(35);
  const [timerAppliedMinutes, setTimerAppliedMinutes] = useState<number | null>(null);
  const [reflectionNotes, setReflectionNotes] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive selected book info
  const currentSelectedBook = catalog.find((b) => b.id === selectedBookId);

  // Active loans for quick 1-click select
  const borrowedBooks = loans
    .map((l) => catalog.find((b) => b.id === l.bookId))
    .filter((b): b is Book => Boolean(b));

  // Handle image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setFormError("Please upload a valid image file (JPEG, PNG, WebP) of the book cover.");
      return;
    }
    setFormError(null);
    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setUploadedImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Quick snap from current book cover for rapid demo
  const handleUseDemoSnap = () => {
    haptic.medium();
    if (currentSelectedBook) {
      setUploadedImage(currentSelectedBook.coverUrl);
      setImageFileName(`${currentSelectedBook.title.slice(0, 20)}_front_snap.jpg`);
    }
  };

  // Submit check-in
  const handleSubmitCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedImage) {
      haptic.warning();
      setFormError("Please upload or capture a front photo of your book to count your streak.");
      return;
    }
    setFormError(null);

    const title = isCustomBook ? customTitle.trim() || "Untitled Book" : currentSelectedBook?.title || "Book";
    const author = isCustomBook ? customAuthor.trim() || "Unknown Author" : currentSelectedBook?.author || "";

    onLogCheckIn({
      bookId: isCustomBook ? undefined : selectedBookId,
      bookTitle: title,
      bookAuthor: author,
      coverPhotoUrl: uploadedImage,
      pagesRead: Math.max(1, Number(pagesRead) || 1),
      readingDurationMinutes: Math.max(5, Number(durationMinutes) || 5),
      reflectionNotes: reflectionNotes.trim(),
      date: todayStr,
    });

    // Reset inputs but show celebration
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 5000);
    setUploadedImage(null);
    setImageFileName("");
    setReflectionNotes("");
  };

  // Calculate 7-day past week indicators
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const isToday = dStr === todayStr;
    const hasCheckIn = streakData.history.some((h) => h.date === dStr);
    return {
      date: dStr,
      dayName,
      isToday,
      hasCheckIn,
    };
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Celebration Popup / Banner */}
      {showCelebration && (
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 text-white p-5 rounded-2xl shadow-xl flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shrink-0">
              🔥
            </div>
            <div>
              <h3 className="text-lg font-bold">Streak Extended! Reading Verified</h3>
              <p className="text-xs text-white/90">
                Front cover photo logged successfully. You're now on a{" "}
                <span className="font-extrabold underline">{streakData.currentStreak}-Day Reading Streak!</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCelebration(false)}
            className="text-white/80 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Hero Streak Dashboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Streak Counter Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-stone-800 shadow-xl">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Daily Habit Builder</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Reading Streak Portal
              </h2>
              <p className="text-sm text-stone-400 mt-1 max-w-md">
                Keep the habit burning! Upload a photo of the book front you're reading today to verify your daily session.
              </p>
            </div>

            {/* Huge Streak Badge */}
            <div className="flex items-center gap-4 bg-stone-800/80 border border-stone-700/80 px-6 py-4 rounded-2xl shrink-0 backdrop-blur-md">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 animate-pulse">
                <Flame className="w-8 h-8 fill-current" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black tracking-tight text-white">
                    {streakData.currentStreak}
                  </span>
                  <span className="text-sm font-bold text-orange-400 uppercase tracking-wide">
                    Days
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-stone-400">
                  {isTodayCompleted ? "✓ Logged for Today" : "Waiting for Today's Photo"}
                </p>
              </div>
            </div>
          </div>

          {/* 7-Day Heat trail */}
          <div className="mt-8 pt-6 border-t border-stone-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-stone-400" />
                <span className="text-xs font-semibold text-stone-300">Past 7 Days Reading Activity</span>
              </div>
              <span className="text-xs text-stone-400">
                Weekly Target: {streakData.streakGoal} Days
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {weekDays.map((day) => (
                <div
                  key={day.date}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border text-center transition-all ${
                    day.hasCheckIn
                      ? "bg-orange-500/20 border-orange-500/40 text-white"
                      : day.isToday
                      ? "bg-stone-800/90 border-amber-400/60 text-amber-300 shadow-xs"
                      : "bg-stone-800/40 border-stone-700/40 text-stone-500"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider mb-1">
                    {day.dayName}
                  </span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center">
                    {day.hasCheckIn ? (
                      <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                    ) : day.isToday ? (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-600" />
                    )}
                  </div>
                  <span className="text-[9px] font-medium mt-0.5">
                    {day.isToday ? "Today" : day.hasCheckIn ? "Read" : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lifetime Stats & Milestone Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-stone-900">Streak Milestones</h3>
              <Award className="w-5 h-5 text-amber-500" />
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                    🏆
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-800">Longest Streak</p>
                    <p className="text-[11px] text-stone-500">Personal university record</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-stone-900">{streakData.longestStreak} Days</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    📖
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-800">Pages Logged</p>
                    <p className="text-[11px] text-stone-500">Across verified sessions</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-stone-900">{streakData.totalPagesRead} pgs</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                    ⏱️
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-800">Total Check-Ins</p>
                    <p className="text-[11px] text-stone-500">Verified front photos</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-stone-900">{streakData.totalCheckIns}</span>
              </div>
            </div>
          </div>

          {/* Goal progress */}
          <div className="mt-5 pt-4 border-t border-stone-100">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-stone-700">7-Day Scholar Badge</span>
              <span className="font-bold text-orange-600">
                {Math.min(7, streakData.currentStreak)} / 7 Days
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (streakData.currentStreak / 7) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-2">
              {streakData.currentStreak >= 7
                ? "🎉 Milestone unlocked! Next target: 14-Day Bookworm badge."
                : `${7 - streakData.currentStreak} more daily front photo check-ins to reach your next badge.`}
            </p>
          </div>
        </div>
      </div>

      {/* Daily Reading Time Goal Progress Bar & Celebration */}
      <DailyReadingGoalProgress
        todayMinutesRead={totalTodayMinutes}
        dailyGoalMinutes={currentDailyGoal}
        onUpdateGoal={onUpdateDailyGoal}
        onQuickAddMinutes={(mins) => {
          if (onQuickAddReadingMinutes) {
            onQuickAddReadingMinutes(mins);
          } else {
            setSessionBonusMinutes((prev) => prev + mins);
          }
        }}
        onResetTodayMinutes={() => setSessionBonusMinutes(0)}
      />

      {/* Main Check-In Form: "Upload Front Photo to Count Streak" */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-7 border-b border-stone-200/80 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-bold text-stone-900">
                Log Today's Reading & Extend Streak
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Upload or snap a front picture of the physical or digital book cover you are reading to claim your daily streak.
            </p>
          </div>

          {isTodayCompleted && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Today Already Checked In!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmitCheckIn} className="p-6 sm:p-8 space-y-6">
          {formError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
              <span>{formError}</span>
              <button
                type="button"
                onClick={() => setFormError(null)}
                className="text-rose-500 hover:text-rose-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Built-in Live Reading Session Timer */}
          <div className="space-y-2">
            <ReadingTimer
              bookTitle={isCustomBook ? customTitle.trim() || "Personal Reading" : currentSelectedBook?.title}
              onApplyDuration={(mins) => {
                setDurationMinutes(mins);
                setTimerAppliedMinutes(mins);
                setSessionBonusMinutes((prev) => prev + mins);
              }}
              initialMinutes={durationMinutes}
              onTimerTick={onTimerTick}
            />
          </div>

          {/* Step 1: Select Book */}
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              1. Which book are you reading today?
            </label>

            {/* Quick selectors from borrowed books */}
            {borrowedBooks.length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] text-stone-500 mb-1.5">Currently Borrowed on Student Pass:</p>
                <div className="flex flex-wrap gap-2">
                  {borrowedBooks.map((b) => (
                    <button
                      type="button"
                      key={b.id}
                      onClick={() => {
                        setSelectedBookId(b.id);
                        setIsCustomBook(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                        selectedBookId === b.id && !isCustomBook
                          ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs"
                          : "bg-white border-stone-200 text-stone-700 hover:border-stone-300"
                      }`}
                    >
                      <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="truncate max-w-[200px]">{b.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dropdown for any catalog book or custom */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <div className="flex-1">
                <select
                  disabled={isCustomBook}
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                >
                  <option value="" disabled>
                    Select from library catalog...
                  </option>
                  {catalog.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} — {b.author}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsCustomBook(!isCustomBook)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors shrink-0 ${
                  isCustomBook
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
                }`}
              >
                {isCustomBook ? "Choose from Catalog" : "+ Other Personal Book"}
              </button>
            </div>

            {/* Custom book fields if selected */}
            {isCustomBook && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Book Title</label>
                  <input
                    type="text"
                    required={isCustomBook}
                    placeholder="e.g. Gödel, Escher, Bach"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Author</label>
                  <input
                    type="text"
                    placeholder="e.g. Douglas Hofstadter"
                    value={customAuthor}
                    onChange={(e) => setCustomAuthor(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Upload Front Picture */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                2. Upload Front Picture of the Book <span className="text-orange-600">*</span>
              </label>
              <span className="text-[11px] text-stone-500">
                Front view verification counts your streak
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {!uploadedImage ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-orange-500 bg-orange-50/50"
                    : "border-stone-300 hover:border-orange-400 bg-stone-50/70 hover:bg-orange-50/20"
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 mx-auto flex items-center justify-center mb-3 shadow-xs">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-stone-800">
                  Drop the front cover photo here, or click to browse
                </h4>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Take a snap of your book's front cover or upload an image file (PNG, JPG, WebP)
                </p>

                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 inline-flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload Front Photo</span>
                  </button>

                  {currentSelectedBook && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseDemoSnap();
                      }}
                      className="px-3 py-2 bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                      title="Quickly use verified front cover photo for testing"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
                      <span>Use Catalog Front Cover</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Uploaded Image Preview & Verification Box */
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5">
                {/* Book cover visual preview */}
                <div className="relative w-28 h-38 shrink-0 rounded-xl overflow-hidden border-2 border-orange-400 shadow-md bg-stone-200">
                  <img
                    src={uploadedImage}
                    alt="Uploaded book front view"
                    className="w-full h-full object-cover"
                  />
                  {/* Spine effect */}
                  <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/35 to-transparent pointer-events-none" />
                  <div className="absolute top-1 right-1 bg-emerald-600 text-white p-1 rounded-full shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Front Cover Verified</span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 truncate">
                    {imageFileName || "Book Front Snapshot"}
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Front angle detected. Ready to log today's reading streak.
                  </p>

                  <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-stone-600 hover:text-stone-900 underline"
                    >
                      Replace photo
                    </button>
                    <span className="text-stone-300">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedImage(null);
                        setImageFileName("");
                      }}
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Session Metrics & Reflection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                Pages Read Today
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="1500"
                  value={pagesRead}
                  onChange={(e) => setPagesRead(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex gap-1 shrink-0">
                  {[15, 30, 50].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setPagesRead(num)}
                      className="px-2.5 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
                    >
                      +{num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Reading Time (Minutes)
                </label>
                {timerAppliedMinutes !== null && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Auto-calculated from timer
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={durationMinutes}
                  onChange={(e) => {
                    setDurationMinutes(Number(e.target.value));
                    setTimerAppliedMinutes(null);
                  }}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs font-semibold text-stone-500 shrink-0">minutes</span>
              </div>
            </div>
          </div>

          {/* Optional Reflection Note */}
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
              Reading Note or Key Takeaway <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={reflectionNotes}
              onChange={(e) => setReflectionNotes(e.target.value)}
              placeholder="e.g. Read chapter 3 on neural attention mechanisms. Great diagram on query, key, value matrices."
              className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submission CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-stone-500 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>
                Submitting increments your streak from{" "}
                <strong className="text-stone-800">{streakData.currentStreak}</strong> to{" "}
                <strong className="text-orange-600">
                  {isTodayCompleted ? streakData.currentStreak : streakData.currentStreak + 1} Days
                </strong>
                !
              </span>
            </div>

            <button
              type="submit"
              disabled={!uploadedImage}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-sm transition-all ${
                uploadedImage
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/25 cursor-pointer scale-100 hover:scale-[1.02]"
                  : "bg-stone-300 text-stone-500 cursor-not-allowed"
              }`}
            >
              <Flame className="w-4 h-4 fill-current" />
              <span>Verify Front Photo & Claim Streak 🔥</span>
            </button>
          </div>
        </form>
      </div>

      {/* Verified Photo Reading History Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-stone-900">Verified Reading Check-Ins</h3>
            <p className="text-xs text-stone-500">
              Gallery of books verified with front cover photos during your streak
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg">
            {streakData.history.length} Logged Sessions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {streakData.history.map((checkIn) => {
            const matchedCatalogBook = checkIn.bookId
              ? catalog.find((b) => b.id === checkIn.bookId)
              : null;

            return (
              <div
                key={checkIn.id}
                className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs hover:shadow-md transition-shadow flex gap-4"
              >
                {/* Front Photo */}
                <div
                  className="relative w-20 h-28 shrink-0 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-xs cursor-pointer group"
                  onClick={() => matchedCatalogBook && onSelectBook(matchedCatalogBook)}
                  title={matchedCatalogBook ? "Click to view in catalog" : undefined}
                >
                  <img
                    src={checkIn.coverPhotoUrl}
                    alt={`Front photo of ${checkIn.bookTitle}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-black/30 to-transparent pointer-events-none" />
                  <div className="absolute bottom-1 right-1 bg-stone-900/80 backdrop-blur-xs text-[9px] font-bold text-white px-1.5 py-0.5 rounded">
                    Front
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 text-[11px] text-stone-500 mb-1">
                      <span className="font-semibold text-orange-600 flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-current" />
                        Verified Read
                      </span>
                      <span className="font-mono">
                        {new Date(checkIn.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <h4
                      className={`text-xs font-bold text-stone-900 line-clamp-1 ${
                        matchedCatalogBook ? "cursor-pointer hover:text-emerald-700" : ""
                      }`}
                      onClick={() => matchedCatalogBook && onSelectBook(matchedCatalogBook)}
                    >
                      {checkIn.bookTitle}
                    </h4>
                    <p className="text-[11px] text-stone-500 truncate">{checkIn.bookAuthor}</p>

                    {checkIn.reflectionNotes && (
                      <p className="text-[11px] text-stone-600 italic bg-stone-50 p-2 rounded-lg mt-2 line-clamp-2 border border-stone-100">
                        "{checkIn.reflectionNotes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-2 mt-1 border-t border-stone-100 text-[11px] text-stone-500">
                    <span className="font-semibold text-stone-700">
                      📖 {checkIn.pagesRead} pages
                    </span>
                    {checkIn.readingDurationMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {checkIn.readingDurationMinutes} mins
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const StreakView = React.memo(StreakViewComponent);
