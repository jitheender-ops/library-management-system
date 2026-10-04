import React from "react";
import { Book } from "../types";
import { Star, MapPin, ArrowRight } from "lucide-react";
import { BookCoverImage } from "./BookCoverImage";

interface BookCardProps {
  book: Book;
  onSelect: (book: Book) => void;
  onQuickReserve?: (book: Book) => void;
  isReserved?: boolean;
  isBorrowed?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onSelect,
  isReserved = false,
  isBorrowed = false,
}) => {
  const isAvailable = book.availableCopies > 0;

  return (
    <div
      id={`book-card-${book.id}`}
      onClick={() => onSelect(book)}
      data-haptic="selection"
      role="button"
      tabIndex={0}
      className="group relative bg-white rounded-2xl border border-stone-200/75 p-3.5 sm:p-4 hover:border-blue-500/50 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.98]"
    >
      <div>
        {/* Authentic Book Front Cover with Dynamic Fallback & Spine Crease */}
        <div className="relative mb-3">
          <BookCoverImage
            src={book.coverUrl}
            alt={`Front cover of ${book.title}`}
            title={book.title}
            author={book.author}
            category={book.category}
            aspectRatio="aspect-3/4"
            className="rounded-xl shadow-sm group-hover:shadow-md transition-shadow"
            badge={
              <div className="top-2 left-2 flex flex-col gap-1 items-start">
                <span
                  className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs backdrop-blur-md ${
                    isAvailable
                      ? "bg-emerald-600/95 text-white"
                      : "bg-amber-600/95 text-white"
                  }`}
                >
                  {isAvailable ? `${book.availableCopies} Available` : "Waitlist Only"}
                </span>

                {isReserved && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-600/95 text-white shadow-xs backdrop-blur-md">
                    Reserved
                  </span>
                )}
                {isBorrowed && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-600/95 text-white shadow-xs backdrop-blur-md">
                    On Loan
                  </span>
                )}
              </div>
            }
          />

          <div className="absolute bottom-2 right-2 bg-stone-900/80 backdrop-blur-md text-white text-[9px] font-semibold px-2 py-0.5 rounded-md z-20">
            {book.format}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-stone-500">
            <span className="font-semibold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md truncate max-w-[130px]">
              {book.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold shrink-0">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{book.rating}</span>
            </div>
          </div>

          <h3 className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
            {book.title}
          </h3>

          <p className="text-[11px] sm:text-xs text-stone-600 truncate">
            by <span className="text-stone-800 font-medium">{book.author}</span>
          </p>

          <p className="text-[10px] sm:text-[11px] text-stone-500 line-clamp-2 pt-0.5">
            {book.description}
          </p>
        </div>
      </div>

      {/* Footer info & iOS Action */}
      <div className="mt-3.5 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-stone-500 text-[10px] sm:text-[11px] truncate max-w-[150px]" title={book.shelfLocation.callNumber}>
          <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
          <span className="font-mono truncate">{book.shelfLocation.callNumber}</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(book);
          }}
          className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 text-xs py-1 px-2 rounded-lg hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
        >
          <span>View</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

