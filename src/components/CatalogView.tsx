import React, { useState, useMemo } from "react";
import { Book } from "../types";
import { BookCard } from "./BookCard";
import { Search, Filter, SlidersHorizontal, BookOpen, Layers, Check } from "lucide-react";

interface CatalogViewProps {
  catalog: Book[];
  onSelectBook: (book: Book) => void;
  reservedBookIds: Set<string>;
  borrowedBookIds: Set<string>;
  onOpenScanner: () => void;
}

const CATEGORIES = [
  "All Categories",
  "Computer Science & AI",
  "Software Engineering",
  "Psychology & Neuroscience",
  "Literature & Fiction",
  "Philosophy & Ethics",
  "Physics & Natural Science",
  "Design & Architecture",
];

export const CatalogView: React.FC<CatalogViewProps> = ({
  catalog,
  onSelectBook,
  reservedBookIds,
  borrowedBookIds,
  onOpenScanner,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<"popular" | "rating" | "year" | "title">("popular");

  const filteredBooks = useMemo(() => {
    return catalog
      .filter((book) => {
        // Category filter
        if (selectedCategory !== "All Categories" && book.category !== selectedCategory) {
          return false;
        }

        // Availability filter
        if (onlyAvailable && book.availableCopies <= 0) {
          return false;
        }

        // Search query filter (title, author, isbn, barcode, tags)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesTitle = book.title.toLowerCase().includes(q);
          const matchesAuthor = book.author.toLowerCase().includes(q);
          const matchesIsbn = book.isbn.toLowerCase().includes(q);
          const matchesBarcode = book.barcode.toLowerCase().includes(q);
          const matchesCallNumber = book.shelfLocation.callNumber.toLowerCase().includes(q);
          const matchesTags = book.tags.some((t) => t.toLowerCase().includes(q));

          return (
            matchesTitle ||
            matchesAuthor ||
            matchesIsbn ||
            matchesBarcode ||
            matchesCallNumber ||
            matchesTags
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "popular") return b.popularityScore - a.popularityScore;
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "year") return b.year - a.year;
        if (sortBy === "title") return a.title.localeCompare(b.title);
        return 0;
      });
  }, [catalog, selectedCategory, onlyAvailable, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by book title, author, ISBN, barcode, or call number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs sm:text-sm px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="popular">Sort: Most Popular</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="year">Sort: Publication Year</option>
              <option value="title">Sort: Title (A-Z)</option>
            </select>

            <button
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border transition-all flex items-center gap-1.5 shrink-0 ${
                onlyAvailable
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
              }`}
            >
              {onlyAvailable && <Check className="w-3.5 h-3.5" />}
              <span>Available Now</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-stone-900 text-white shadow-xs"
                    : "bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/70"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog Results Header */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-stone-600 px-1">
        <div>
          Showing <strong className="text-stone-900 font-bold">{filteredBooks.length}</strong> books in library catalog
          {selectedCategory !== "All Categories" && <span> in <strong>{selectedCategory}</strong></span>}
          {onlyAvailable && <span> (available copies only)</span>}
        </div>

        <button
          onClick={onOpenScanner}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Scan Physical Book Barcode</span>
        </button>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No matching books found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search keywords, clearing availability filters, or scanning a barcode directly.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All Categories");
              setOnlyAvailable(false);
            }}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Reset all catalog filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onSelect={onSelectBook}
              isReserved={reservedBookIds.has(book.id)}
              isBorrowed={borrowedBookIds.has(book.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
