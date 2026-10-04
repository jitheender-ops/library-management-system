import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  Sparkles,
  Trophy,
  Flame,
  ChevronRight,
  Settings2,
  Plus,
  RotateCcw,
} from "lucide-react";
import { CelebrationConfetti } from "./CelebrationConfetti";

interface DailyReadingGoalProgressProps {
  todayMinutesRead: number;
  dailyGoalMinutes: number;
  onUpdateGoal?: (minutes: number) => void;
  onQuickAddMinutes?: (minutes: number) => void;
  onResetTodayMinutes?: () => void;
}

const DailyReadingGoalProgressComponent: React.FC<DailyReadingGoalProgressProps> = ({
  todayMinutesRead,
  dailyGoalMinutes,
  onUpdateGoal,
  onQuickAddMinutes,
  onResetTodayMinutes,
}) => {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState(dailyGoalMinutes.toString());
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [hasCelebratedThisSession, setHasCelebratedThisSession] = useState(false);

  const percentage = Math.min(100, Math.round((todayMinutesRead / Math.max(1, dailyGoalMinutes)) * 100));
  const rawPercentage = Math.round((todayMinutesRead / Math.max(1, dailyGoalMinutes)) * 100);
  const isGoalMet = todayMinutesRead >= dailyGoalMinutes && dailyGoalMinutes > 0;
  const minutesRemaining = Math.max(0, dailyGoalMinutes - todayMinutesRead);
  const overtimeMinutes = Math.max(0, todayMinutesRead - dailyGoalMinutes);

  // Trigger celebratory animation automatically the first time the goal is met in this session
  useEffect(() => {
    if (isGoalMet && !hasCelebratedThisSession && todayMinutesRead > 0) {
      setIsCelebrationOpen(true);
      setHasCelebratedThisSession(true);
    }
  }, [isGoalMet, hasCelebratedThisSession, todayMinutesRead]);

  const handleSaveGoal = (goal: number) => {
    if (goal > 0 && onUpdateGoal) {
      onUpdateGoal(goal);
      setShowGoalModal(false);
    }
  };

  const handleTriggerCelebration = () => {
    setIsCelebrationOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-sm relative overflow-hidden">
        {/* Subtle background gradient glow depending on goal status */}
        <div
          className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-xl pointer-events-none transition-colors duration-500 ${
            isGoalMet ? "bg-emerald-500/10" : "bg-orange-500/10"
          }`}
        />

        {/* Header Row */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm transition-colors duration-300 ${
                isGoalMet
                  ? "bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-emerald-500/20"
                  : "bg-gradient-to-tr from-amber-500 to-orange-500 shadow-orange-500/20"
              }`}
            >
              {isGoalMet ? (
                <Trophy className="w-5 h-5 animate-bounce" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                  Daily Reading Goal
                </h3>
                {isGoalMet && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold animate-pulse">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Goal Met!
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {isGoalMet
                  ? `Spectacular work! You surpassed today's goal by ${overtimeMinutes > 0 ? `${overtimeMinutes}m` : "completing it"}!`
                  : `${minutesRemaining} more minutes of reading needed to hit your target today.`}
              </p>
            </div>
          </div>

          {/* Goal adjustment action & replay celebration */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isGoalMet && (
              <button
                type="button"
                onClick={handleTriggerCelebration}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer"
                title="Replay the victory celebration animation"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Replay Celebration</span>
              </button>
            )}

            {onUpdateGoal && (
              <button
                type="button"
                onClick={() => setShowGoalModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Change your daily reading minutes target"
              >
                <Settings2 className="w-3.5 h-3.5 text-stone-500" />
                <span>Set Goal ({dailyGoalMinutes}m)</span>
              </button>
            )}
          </div>
        </div>

        {/* Big Progress Counter & Goal Stat */}
        <div className="relative z-10 pt-5 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight font-mono">
                {todayMinutesRead}
              </span>
              <span className="text-sm font-bold text-stone-400">
                / {dailyGoalMinutes} minutes read today
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-sm sm:text-base font-black px-2.5 py-0.5 rounded-lg ${
                  isGoalMet
                    ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                    : "text-orange-600 bg-orange-50 border border-orange-200"
                }`}
              >
                {rawPercentage}%
              </span>
              {isGoalMet && (
                <span className="text-xs font-bold text-emerald-600">
                  🎉 Completed
                </span>
              )}
            </div>
          </div>

          {/* Animated Visual Progress Bar */}
          <div className="relative w-full h-4 sm:h-5 rounded-full bg-stone-100 overflow-hidden p-0.5 border border-stone-200 shadow-inner">
            {/* Background ticks at 25%, 50%, 75% */}
            <div className="absolute inset-0 flex justify-between pointer-events-none px-4 opacity-25">
              <div className="w-0.5 h-full bg-stone-400" />
              <div className="w-0.5 h-full bg-stone-400" />
              <div className="w-0.5 h-full bg-stone-400" />
            </div>

            {/* Gradient Fill with Shimmer */}
            <div
              className={`h-full rounded-full transition-[width] duration-500 ease-out relative overflow-hidden ${
                isGoalMet
                  ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 shadow-md shadow-emerald-500/25"
                  : percentage > 50
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-md shadow-orange-500/20"
                  : "bg-gradient-to-r from-blue-500 to-amber-500"
              }`}
              style={{ width: `${percentage}%` }}
            >
              {/* Subtle light shimmer sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          </div>

          {/* Goal Milestones scale labels */}
          <div className="flex justify-between items-center text-[10px] font-semibold text-stone-400 mt-1.5 px-0.5">
            <span>0m (Start)</span>
            <span>{Math.round(dailyGoalMinutes * 0.5)}m (Halfway)</span>
            <span>{dailyGoalMinutes}m (Target)</span>
          </div>
        </div>

        {/* Quick Booster Chips for Logging Reading Time */}
        <div className="relative z-10 mt-4 pt-3.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-medium">
            <span>Quick Log Past Reading:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onQuickAddMinutes && (
              <>
                <button
                  type="button"
                  onClick={() => onQuickAddMinutes(10)}
                  className="px-2.5 py-1 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer active:scale-95"
                  title="Add 10 minutes to today's reading"
                >
                  <Plus className="w-3 h-3 text-orange-500" />
                  <span>10m</span>
                </button>

                <button
                  type="button"
                  onClick={() => onQuickAddMinutes(20)}
                  className="px-2.5 py-1 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer active:scale-95"
                  title="Add 20 minutes to today's reading"
                >
                  <Plus className="w-3 h-3 text-orange-500" />
                  <span>20m</span>
                </button>

                <button
                  type="button"
                  onClick={() => onQuickAddMinutes(30)}
                  className="px-2.5 py-1 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer active:scale-95"
                  title="Add 30 minutes to today's reading"
                >
                  <Plus className="w-3 h-3 text-orange-500" />
                  <span>30m</span>
                </button>
              </>
            )}

            {/* Test Celebration button so the user can easily see the requested celebratory animation right away */}
            <button
              type="button"
              onClick={handleTriggerCelebration}
              className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer active:scale-95"
              title="Preview the celebration animation"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Test Celebration</span>
            </button>
          </div>
        </div>
      </div>

      {/* Goal Customization Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-stone-200 animate-in zoom-in-95">
            <h4 className="text-base font-bold text-stone-900">
              Set Daily Reading Goal
            </h4>
            <p className="text-xs text-stone-500 mt-1">
              Select how many minutes you want to read every day to build your scholar streak.
            </p>

            {/* Preset Buttons */}
            <div className="grid grid-cols-4 gap-2 my-4">
              {[15, 20, 30, 45].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSaveGoal(preset)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    dailyGoalMinutes === preset
                      ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                      : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                  }`}
                >
                  {preset}m
                </button>
              ))}
            </div>

            {/* Custom Minutes Input */}
            <div className="space-y-1.5 mb-5">
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                Or Enter Custom Minutes
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="360"
                  value={customGoalInput}
                  onChange={(e) => setCustomGoalInput(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-xs font-medium text-stone-500">mins</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = parseInt(customGoalInput, 10);
                  if (val > 0) handleSaveGoal(val);
                }}
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Save Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebratory Animation (Confetti + Audio chime + Triumph Modal) */}
      <CelebrationConfetti
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        title="Daily Reading Goal Achieved!"
        subtitle={`Congratulations! You've logged ${todayMinutesRead} minutes, surpassing your ${dailyGoalMinutes}-minute daily reading goal.`}
        minutesAchieved={todayMinutesRead}
        goalMinutes={dailyGoalMinutes}
      />
    </>
  );
};

export const DailyReadingGoalProgress = React.memo(DailyReadingGoalProgressComponent);
