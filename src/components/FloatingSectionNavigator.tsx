import React, { useState } from "react";
import { ScreenId, SECTIONS_METADATA } from "./Header";
import { ChevronLeft, ChevronRight, Menu, Compass, X } from "lucide-react";

interface FloatingSectionNavigatorProps {
  activeScreen: ScreenId;
  onScreenChange: (screen: ScreenId) => void;
  onOpenSidebar?: () => void;
}

const FloatingSectionNavigatorComponent: React.FC<FloatingSectionNavigatorProps> = ({
  activeScreen,
  onScreenChange,
  onOpenSidebar,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const currentIndex = SECTIONS_METADATA.findIndex((s) => s.id === activeScreen);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onScreenChange(SECTIONS_METADATA[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < SECTIONS_METADATA.length - 1) {
      onScreenChange(SECTIONS_METADATA[currentIndex + 1].id);
    }
  };

  const currentMeta = SECTIONS_METADATA[currentIndex] || SECTIONS_METADATA[0];

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-30 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-xl hover:scale-105 transition-transform flex items-center justify-center cursor-pointer border border-blue-400/40"
        title="Open Section Navigator"
      >
        <Compass className="w-5 h-5" />
      </button>
    );
  }

  return (
    <aside
      aria-label="Section navigation tool"
      className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-30 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-stone-200 p-1.5 flex items-center gap-1.5 text-stone-900 transition-shadow hover:shadow-2xl ring-1 ring-black/5"
    >
      {/* Left Arrow Button */}
      <button
        type="button"
        onClick={handlePrev}
        disabled={currentIndex <= 0}
        className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-stone-100 hover:bg-blue-50 text-stone-700 hover:text-blue-600 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 font-bold text-xs cursor-pointer active:scale-95"
        title={`Go to left section (${currentIndex > 0 ? SECTIONS_METADATA[currentIndex - 1].shortTitle : "First"})`}
        aria-label="Previous section"
      >
        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        <span className="hidden sm:inline">Left</span>
      </button>

      {/* Center Section Indicator - Clicking opens Left Side Section */}
      <button
        type="button"
        onClick={onOpenSidebar}
        className="px-2 py-0.5 text-center min-w-[100px] sm:min-w-[125px] hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
        title="Click to open Side Section directory"
      >
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md flex items-center gap-1">
            <Menu className="w-2.5 h-2.5" />
            <span>{currentIndex + 1}/11</span>
          </span>
        </div>
        <div className="text-xs font-bold text-stone-800 truncate max-w-[120px] sm:max-w-[140px]">
          {currentMeta.label}
        </div>
      </button>

      {/* Right Arrow Button */}
      <button
        type="button"
        onClick={handleNext}
        disabled={currentIndex >= SECTIONS_METADATA.length - 1}
        className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-stone-100 hover:bg-blue-50 text-stone-700 hover:text-blue-600 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 font-bold text-xs cursor-pointer active:scale-95"
        title={`Go to right section (${currentIndex < SECTIONS_METADATA.length - 1 ? SECTIONS_METADATA[currentIndex + 1].shortTitle : "Last"})`}
        aria-label="Next section"
      >
        <span className="hidden sm:inline">Right</span>
        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
      </button>

      {/* Minimize */}
      <button
        type="button"
        onClick={() => setIsExpanded(false)}
        className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors ml-0.5"
        title="Minimize navigator"
        aria-label="Minimize navigator"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
};

export const FloatingSectionNavigator = React.memo(FloatingSectionNavigatorComponent);

