import React, { useState, useMemo, useDeferredValue } from "react";
import { Book } from "../types";
import { BookCoverImage } from "./BookCoverImage";
import { Search, Filter, X, Check, BookOpen, MapPin } from "lucide-react";

interface SearchBooksViewProps {
  catalog: Book[];
  onSelectBook: (book: Book) => void;
  initialQuery?: string;
}

const SearchBooksViewComponent: React.FC<SearchBooksViewProps> = ({
  catalog,
  onSelectBook,
  initialQuery = "",
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [authorQuery, setAuthorQuery] = useState("");
  const [availability, setAvailability] = useState<"All" | "Available" | "Borrowed" | "Reserved">("All");

  // Defer query filtering so user typing is instant and 60fps
  const deferredQuery = useDeferredValue(query);
  const deferredAuthor = useDeferredValue(authorQuery);

  const subjects = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Management",
    "Literature",
    "Others",
  ];

  const categories = [
    "Textbook",
    "Reference",
    "Fiction",
    "Non-Fiction",
    "Research",
    "Others",
  ];

  const handleClearAll = () => {
    setQuery("");
    setSelectedSubject("All");
    setSelectedCategory("All");
    setAuthorQuery("");
    setAvailability("All");
  };

  const filteredBooks = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const a = deferredAuthor.trim().toLowerCase();
    const sub = selectedSubject !== "All" ? selectedSubject.toLowerCase() : null;
    const cat = selectedCategory !== "All" ? selectedCategory.toLowerCase() : null;

    return catalog.filter((book) => {
      // Query filter
      if (q) {
        const matchesTitle = book.title.toLowerCase().includes(q);
        const matchesAuthor = book.author.toLowerCase().includes(q);
        const matchesTags = book.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCategory = book.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAuthor && !matchesTags && !matchesCategory) {
          return false;
        }
      }

      // Author filter
      if (a) {
        if (!book.author.toLowerCase().includes(a)) {
          return false;
        }
      }

      // Subject filter
      if (sub) {
        const matchesCat = book.category.toLowerCase().includes(sub);
        const matchesTag = book.tags.some((t) => t.toLowerCase().includes(sub));
        if (!matchesCat && !matchesTag) {
          return false;
        }
      }

      // Category filter
      if (cat) {
        const matchesFormat = book.format.toLowerCase().includes(cat);
        const matchesTag = book.tags.some((t) => t.toLowerCase().includes(cat));
        const matchesCategory = book.category.toLowerCase().includes(cat);
        if (!matchesFormat && !matchesTag && !matchesCategory) {
          return false;
        }
      }

      // Availability filter
      if (availability === "Available") {
        if (book.availableCopies <= 0) return false;
      } else if (availability === "Borrowed") {
        if (book.availableCopies === book.totalCopies) return false;
      }

      return true;
    });
  }, [catalog, deferredQuery, deferredAuthor, selectedSubject, selectedCategory, availability]);

  return (
    <div className="space-y-5 pb-6">
      {/* Search Header */}
      <div className="space-y-3">
        <h1 className="text-xl font-bold text-stone-900 tracking-tight">Search Books</h1>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, authors, categories..."
            className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors shadow-xs"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            Filters
          </span>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Clear all
          </button>
        </div>

        {/* Subject Filter */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
            Subject
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedSubject("All")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedSubject === "All"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              All
            </button>
            {subjects.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubject(selectedSubject === sub ? "All" : sub)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedSubject === sub
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
            Category
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === "All"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === cat ? "All" : cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Author Input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
            Author
          </label>
          <div className="relative">
            <input
              type="text"
              value={authorQuery}
              onChange={(e) => setAuthorQuery(e.target.value)}
              placeholder="Enter author name..."
              className="w-full pl-3 pr-8 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Availability Filter */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
            Availability
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(["All", "Available", "Borrowed", "Reserved"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setAvailability(opt)}
                className={`py-1.5 text-xs font-medium rounded-xl text-center transition-colors ${
                  availability === opt
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-bold text-stone-700">
          Showing {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Results List / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            onClick={() => onSelectBook(book)}
            data-haptic="selection"
            role="button"
            tabIndex={0}
            className="flex gap-3 bg-white p-3 rounded-2xl border border-stone-200/80 hover:border-blue-400 hover:shadow-xs cursor-pointer transition-[border-color,box-shadow] active:scale-[0.99] group"
          >
            <div className="w-20 aspect-3/4 rounded-xl overflow-hidden shrink-0 shadow-xs border border-stone-200/80">
              <BookCoverImage
                src={book.coverUrl}
                title={book.title}
                author={book.author}
                category={book.category}
                className="w-full h-full group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 mb-1">
                  {book.category}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {book.title}
                </h3>
                <p className="text-[11px] text-stone-500 truncate mt-0.5">{book.author}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[10px]">
                <span className="flex items-center gap-1 text-stone-500">
                  <MapPin className="w-3 h-3 text-stone-400" />
                  {book.shelfLocation.shelfNumber}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold ${
                    book.availableCopies > 0
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {book.availableCopies > 0
                    ? `${book.availableCopies} available`
                    : "Reserved"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SearchBooksView = React.memo(SearchBooksViewComponent);
