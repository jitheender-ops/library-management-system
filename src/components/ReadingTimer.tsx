import React, { useState, useEffect, useRef } from "react";
import { haptic } from "../utils/haptics";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Clock,
  Sparkles,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

interface ReadingTimerProps {
  bookTitle?: string;
  onApplyDuration: (minutes: number) => void;
  initialMinutes?: number;
  onTimerTick?: (seconds: number, isRunning: boolean) => void;
}

export const ReadingTimer: React.FC<ReadingTimerProps> = ({
  bookTitle,
  onApplyDuration,
  initialMinutes = 0,
  onTimerTick,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lastLoggedTime, setLastLoggedTime] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);

  // Notify parent on state change
  useEffect(() => {
    if (onTimerTick) {
      onTimerTick(seconds, isRunning && !isPaused);
    }
  }, [seconds, isRunning, isPaused, onTimerTick]);

  // Timer interval
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, isPaused]);

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    haptic.medium();
    setIsRunning(true);
    setIsPaused(false);
    setLastLoggedTime(null);
  };

  const handlePause = () => {
    haptic.light();
    setIsPaused(true);
  };

  const handleResume = () => {
    haptic.medium();
    setIsPaused(false);
  };

  const handleStopAndLog = () => {
    haptic.success();
    setIsRunning(false);
    setIsPaused(false);

    // Calculate duration in minutes (minimum 1 minute if timer ran at least 15 seconds)
    const calculatedMinutes = Math.max(1, Math.round(seconds / 60));
    setLastLoggedTime(calculatedMinutes);
    onApplyDuration(calculatedMinutes);
  };

  const handleReset = () => {
    haptic.light();
    setIsRunning(false);
    setIsPaused(false);
    setSeconds(0);
    setLastLoggedTime(null);
  };

  // Quick preset starters
  const handleQuickAdd = (presetMinutes: number) => {
    haptic.selection();
    setIsRunning(false);
    setIsPaused(false);
    setSeconds(presetMinutes * 60);
    setLastLoggedTime(presetMinutes);
    onApplyDuration(presetMinutes);
  };

  return (
    <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 rounded-2xl p-4 sm:p-5 text-white border border-stone-700/80 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-700/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Live Reading Timer</h4>
              {isRunning && !isPaused && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Active Reading
                </span>
              )}
              {isPaused && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  Paused
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-400">
              Start when you open your book, stop when finished to auto-log your minutes.
            </p>
          </div>
        </div>

        {bookTitle && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800/80 border border-stone-700 text-xs text-stone-300 max-w-[220px]">
            <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">{bookTitle}</span>
          </div>
        )}
      </div>

      {/* Main Timer Display & Action Row */}
      <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Digits Display */}
        <div className="flex items-baseline gap-2">
          <div className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-white select-none">
            {formatTime(seconds)}
          </div>
          <span className="text-xs text-stone-400 font-medium">
            {seconds >= 60 ? `(~${Math.max(1, Math.round(seconds / 60))} min)` : "(seconds)"}
          </span>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {!isRunning ? (
            <button
              type="button"
              onClick={handleStart}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Reading</span>
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  type="button"
                  onClick={handleResume}
                  className="min-h-[42px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  className="min-h-[42px] px-3.5 py-2 rounded-xl bg-stone-700 hover:bg-stone-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleStopAndLog}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                title="Stop timer and apply minutes to today's streak entry"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop & Log Duration</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="min-h-[42px] px-2.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Banner when time is logged */}
      {lastLoggedTime !== null && (
        <div className="mt-3 py-2 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Recorded <strong>{lastLoggedTime} minutes</strong> into your session form below!
            </span>
          </div>
          <button
            type="button"
            onClick={() => setLastLoggedTime(null)}
            className="text-stone-400 hover:text-white text-[11px] underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick preset durations if student read offline */}
      <div className="mt-3 pt-2.5 border-t border-stone-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <span className="text-stone-400">Quick Duration Presets:</span>
        <div className="flex items-center gap-1.5">
          {[15, 25, 30, 45, 60].map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => handleQuickAdd(mins)}
              className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700/80 font-medium transition-colors cursor-pointer"
            >
              {mins}m
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
