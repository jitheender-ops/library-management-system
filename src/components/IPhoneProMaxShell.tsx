import React, { useState } from "react";
import {
  Wifi,
  Battery,
  Flame,
  Clock,
  Sparkles,
  Smartphone,
  Maximize2,
  Minimize2,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { ScreenId } from "./Header";

interface IPhoneProMaxShellProps {
  children: React.ReactNode;
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  isReadingTimerActive?: boolean;
  readingTimerSeconds?: number;
  dailyGoalMinutes?: number;
  todayMinutesRead?: number;
}

export const IPhoneProMaxShell: React.FC<IPhoneProMaxShellProps> = ({
  children,
  activeScreen,
  onNavigate,
  isReadingTimerActive = false,
  readingTimerSeconds = 0,
  dailyGoalMinutes = 30,
  todayMinutesRead = 0,
}) => {
  const [isSimulatorMode, setIsSimulatorMode] = useState<boolean>(true);
  const [isIslandExpanded, setIsIslandExpanded] = useState<boolean>(false);

  // Format timer seconds into MM:SS
  const mins = Math.floor(readingTimerSeconds / 60);
  const secs = readingTimerSeconds % 60;
  const timeFormatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  return (
    <div className="w-full min-h-screen bg-stone-900/90 text-stone-900 flex flex-col items-center justify-start p-0 sm:py-6 selection:bg-blue-200">
      {/* Top Floating Control Bar for switching between iPhone 18 Pro Max Frame and Full Width Mode */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-4xl px-4 py-2.5 mb-3 bg-stone-800/80 backdrop-blur-md rounded-2xl border border-stone-700/50 text-white shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>iPhone 18 Pro Max iOS Interface</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono">
                Super Retina XDR • 6.9"
              </span>
            </div>
            <div className="text-[10px] text-stone-400">
              Interactive Dynamic Island • iOS Safe Area • Native Tab Bar
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSimulatorMode(!isSimulatorMode)}
            className="px-3 py-1.5 rounded-xl bg-stone-700 hover:bg-stone-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-stone-200"
            title={isSimulatorMode ? "Switch to fluid full-width layout" : "Switch to iPhone 18 Pro Max device preview"}
          >
            {isSimulatorMode ? (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full Width Mode</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>iPhone 18 Pro Max Frame</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Simulator Device Frame or Fluid Container */}
      <div
        className={
          isSimulatorMode
            ? "relative w-full max-w-[432px] min-h-[932px] bg-white rounded-none sm:rounded-[56px] shadow-2xl border-0 sm:border-[10px] sm:border-stone-800 ring-0 sm:ring-1 sm:ring-white/20 flex flex-col overflow-hidden transition-[max-width,border-radius] duration-200"
            : "w-full max-w-5xl bg-white rounded-none sm:rounded-3xl shadow-xl flex flex-col overflow-hidden transition-[max-width,border-radius] duration-200"
        }
      >
        {/* Dynamic Island & iOS Status Bar (Visible on mobile or in Simulator Mode) */}
        <div className="sticky top-0 z-50 bg-stone-900 text-white select-none pt-2.5 pb-2 px-6">
          {/* iOS Top Status Line */}
          <div className="flex items-center justify-between text-[13px] font-semibold tracking-tight">
            {/* Left Clock */}
            <div className="flex items-center gap-1.5 w-20">
              <span className="font-semibold text-[13px]">9:41</span>
            </div>

            {/* Center Dynamic Island Pill */}
            <div
              onClick={() => setIsIslandExpanded(!isIslandExpanded)}
              className={`cursor-pointer transition-[width,height] duration-200 ease-out bg-black rounded-full flex items-center justify-between px-3 py-1 shadow-lg ring-1 ring-white/10 hover:ring-white/25 ${
                isReadingTimerActive || isIslandExpanded
                  ? "w-48 sm:w-56 h-8 text-xs"
                  : "w-28 sm:w-32 h-6 text-[10px]"
              }`}
            >
              {isReadingTimerActive ? (
                /* Live Activity: Active Reading Session */
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 text-orange-400">
                    <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
                    <span className="font-mono font-bold text-white text-[11px]">{timeFormatted}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[10px] font-bold text-emerald-300">Reading</span>
                  </div>
                </div>
              ) : (
                /* Standard Dynamic Island with Camera & Sensor Dots */
                <div className="flex items-center justify-between w-full px-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-900 ring-1 ring-stone-800" />
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400/80" />
                    <span className="text-[9px] font-bold text-stone-300 tracking-wider">SMART LIB</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              )}
            </div>

            {/* Right Status Icons: 5G, Wi-Fi, Battery */}
            <div className="flex items-center justify-end gap-1.5 w-20">
              <span className="text-[11px] font-bold tracking-tighter">5G</span>
              <Wifi className="w-3.5 h-3.5 stroke-[2.2]" />
              <div className="flex items-center">
                <div className="w-5 h-2.5 rounded-[4px] border border-white/80 p-0.5 flex items-center">
                  <div className="h-full w-4 bg-white rounded-[2px]" />
                </div>
                <div className="w-0.5 h-1 bg-white/80 rounded-r-xs -ml-px" />
              </div>
            </div>
          </div>

          {/* Expanded Dynamic Island Dropdown Card */}
          {isIslandExpanded && (
            <div className="mt-2.5 p-3 rounded-2xl bg-black border border-stone-800 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="text-xs font-bold text-white">Daily Reading Activity</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate("streak");
                    setIsIslandExpanded(false);
                  }}
                  className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                >
                  <span>Open Streak</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-stone-400">Today's Progress:</span>
                <span className="font-mono font-bold text-white">
                  {todayMinutesRead}m / {dailyGoalMinutes}m
                </span>
              </div>

              {/* Mini progress bar */}
              <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-emerald-400 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round((todayMinutesRead / Math.max(1, dailyGoalMinutes)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Core Scrollable Content */}
        <div className="flex-1 flex flex-col overflow-y-auto overscroll-contain bg-[#F2F2F7]">
          {children}
        </div>

        {/* iOS Native Home Indicator Pill Bar */}
        <div className="sticky bottom-0 z-50 bg-white/90 backdrop-blur-xl pt-1 pb-1.5 flex justify-center pointer-events-none">
          <div className="w-36 h-1 bg-stone-900/40 rounded-full" />
        </div>
      </div>
    </div>
  );
};
