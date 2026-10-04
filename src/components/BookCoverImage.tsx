import React, { useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";

interface BookCoverImageProps {
  src?: string;
  alt?: string;
  title?: string;
  author?: string;
  category?: string;
  className?: string;
  showSpineCrease?: boolean;
  aspectRatio?: "aspect-3/4" | "aspect-2/3" | "aspect-square";
  badge?: React.ReactNode;
}

// Category-based color accents for fallback covers
const CATEGORY_STYLES: Record<string, { bg: string; text: string; accent: string }> = {
  "Software Engineering": {
    bg: "from-blue-950 via-indigo-900 to-slate-950",
    text: "text-blue-100",
    accent: "bg-blue-500/30 border-blue-400/40 text-blue-200",
  },
  "Computer Science & AI": {
    bg: "from-indigo-950 via-purple-950 to-slate-950",
    text: "text-indigo-100",
    accent: "bg-purple-500/30 border-purple-400/40 text-purple-200",
  },
  "Psychology & Neuroscience": {
    bg: "from-emerald-950 via-teal-900 to-stone-950",
    text: "text-emerald-100",
    accent: "bg-emerald-500/30 border-emerald-400/40 text-emerald-200",
  },
  "Literature & Fiction": {
    bg: "from-amber-950 via-stone-900 to-amber-950",
    text: "text-amber-100",
    accent: "bg-amber-500/30 border-amber-400/40 text-amber-200",
  },
  "Data Science & Mathematics": {
    bg: "from-cyan-950 via-blue-950 to-slate-950",
    text: "text-cyan-100",
    accent: "bg-cyan-500/30 border-cyan-400/40 text-cyan-200",
  },
};

const DEFAULT_STYLE = {
  bg: "from-stone-900 via-stone-800 to-stone-950",
  text: "text-stone-100",
  accent: "bg-stone-700/50 border-stone-500/40 text-stone-200",
};

export const BookCoverImage: React.FC<BookCoverImageProps> = ({
  src,
  alt,
  title = "Library Book",
  author = "Author",
  category = "",
  className = "",
  showSpineCrease = true,
  aspectRatio = "aspect-3/4",
  badge,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const style = CATEGORY_STYLES[category] || DEFAULT_STYLE;

  return (
    <div
      className={`relative ${aspectRatio} rounded-xl overflow-hidden bg-stone-100 shadow-sm select-none ${className}`}
    >
      {/* Primary Image if available and not error */}
      {src && !hasError ? (
        <>
          <img
            src={src}
            alt={alt || title || "Book Cover"}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => setHasError(true)}
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          />
          {/* Skeleton placeholder while loading */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-stone-200 animate-pulse flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-stone-400" />
            </div>
          )}
        </>
      ) : (
        /* Fallback High-Craft Stylized Hardcover Book Jacket */
        <div
          className={`w-full h-full bg-gradient-to-br ${style.bg} p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden border border-white/10`}
        >
          {/* Ambient background pattern */}
          <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-white/5 blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-black/40 blur-lg pointer-events-none" />

          {/* Top header on book jacket */}
          <div className="relative z-10 space-y-1">
            {category && (
              <span
                className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${style.accent}`}
              >
                {category}
              </span>
            )}
            <div className="text-[9px] text-white/50 tracking-widest uppercase font-serif">
              University Press
            </div>
          </div>

          {/* Book Title & Author Typography */}
          <div className="relative z-10 my-auto py-1">
            <h4
              className={`font-serif font-black text-xs sm:text-sm line-clamp-3 leading-tight ${style.text} drop-shadow-sm`}
            >
              {title}
            </h4>
            <p className="text-[10px] text-white/75 font-medium mt-1 truncate">
              {author}
            </p>
          </div>

          {/* Bottom library seal */}
          <div className="relative z-10 flex items-center justify-between pt-1 border-t border-white/15">
            <div className="flex items-center gap-1 text-[9px] text-white/60 font-mono">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              <span>Edition Special</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
        </div>
      )}

      {/* Realistic physical book spine left crease & gloss reflection */}
      {showSpineCrease && (
        <>
          <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/35 via-black/15 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 left-2 w-[1px] bg-white/20 pointer-events-none z-10" />
        </>
      )}

      {/* Badge container slot if provided */}
      {badge && <div className="absolute z-20">{badge}</div>}
    </div>
  );
};
