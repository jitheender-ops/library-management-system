import React, { useState } from "react";
import { Book, Reservation } from "../types";
import { haptic } from "../utils/haptics";
import { BarcodeDisplay } from "./BarcodeDisplay";
import { BookCoverImage } from "./BookCoverImage";
import {
  X,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  Star,
  Layers,
  Copy,
  Check,
  Building2,
  Navigation,
  Bookmark,
} from "lucide-react";

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onReserve: (bookId: string, pickupLocation: string) => Reservation | null;
  isReservedByStudent: boolean;
  isBorrowedByStudent: boolean;
  activeReservation?: Reservation;
  catalog?: Book[];
  onSelectBook?: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  isOpen,
  onClose,
  onReserve,
  isReservedByStudent,
  isBorrowedByStudent,
  activeReservation,
  catalog = [],
  onSelectBook,
}) => {
  const [selectedPickup, setSelectedPickup] = useState<string>(
    "Central Library Circulation Desk - 1st Floor"
  );
  const [justReserved, setJustReserved] = useState<Reservation | null>(null);
  const [copiedCallNumber, setCopiedCallNumber] = useState(false);
  const [addedToReadingList, setAddedToReadingList] = useState(false);

  if (!isOpen || !book) return null;

  const similarBooks = catalog
    .filter((b) => b.id !== book.id && (b.category === book.category || b.tags.some((t) => book.tags.includes(t))))
    .slice(0, 4);

  const handleReserveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    haptic.success();
    const res = onReserve(book.id, selectedPickup);
    if (res) {
      setJustReserved(res);
    }
  };

  const copyCallNumber = () => {
    haptic.light();
    navigator.clipboard.writeText(book.shelfLocation.callNumber);
    setCopiedCallNumber(true);
    setTimeout(() => setCopiedCallNumber(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/80 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-stone-200 text-stone-700">
              {book.category}
            </span>
            <span className="text-xs text-stone-500 font-mono">
              ISBN: {book.isbn}
            </span>
          </div>
          <button
            onClick={() => {
              setJustReserved(null);
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/60 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Book Overview */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-36 sm:w-44 shrink-0 mx-auto sm:mx-0">
              <div className="aspect-2/3 rounded-2xl overflow-hidden shadow-xl border border-stone-200/90 relative group">
                <BookCoverImage
                  src={book.coverUrl}
                  title={book.title}
                  author={book.author}
                  category={book.category}
                  className="w-full h-full"
                />
                <div className="absolute top-2 right-2 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full z-10">
                  {book.format}
                </div>
              </div>

              {/* Barcode preview */}
              <div className="mt-3 text-center">
                <p className="text-[10px] text-stone-500 font-medium uppercase tracking-wider mb-1">Catalog Barcode</p>
                <BarcodeDisplay value={book.barcode} height={40} showText={true} className="w-full" />
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
                  {book.title}
                </h2>
                <p className="text-sm font-medium text-stone-600 mt-1">
                  by <span className="text-stone-900 font-semibold">{book.author}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
                <div className="flex items-center text-amber-500 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                  <span>{book.rating}</span>
                </div>
                <span>•</span>
                <span>{book.year}</span>
                <span>•</span>
                <span>{book.pages} pages</span>
                <span>•</span>
                <span>{book.publisher}</span>
                {book.edition && (
                  <>
                    <span>•</span>
                    <span className="font-medium text-stone-700">{book.edition}</span>
                  </>
                )}
              </div>

              {/* Availability Chip */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between">
                <div>
                  <p className="text-xs text-stone-500 font-medium">Shelf Availability</p>
                  <p className="text-sm font-bold text-stone-900 mt-0.5">
                    {book.availableCopies > 0 ? (
                      <span className="text-emerald-600">
                        {book.availableCopies} of {book.totalCopies} copies available
                      </span>
                    ) : (
                      <span className="text-amber-600">
                        All {book.totalCopies} copies currently checked out
                      </span>
                    )}
                  </p>
                </div>
                <div
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    book.availableCopies > 0
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {book.availableCopies > 0 ? "Ready on Shelf" : "Hold Queue Open"}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {book.description}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {book.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full border border-stone-200/60"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Physical Shelf Locator Map Box */}
          <div className="bg-stone-900 text-stone-100 p-4 rounded-xl border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Library Shelf Location</h3>
              </div>
              <button
                onClick={copyCallNumber}
                className="flex items-center gap-1 text-xs text-stone-400 hover:text-emerald-300 bg-stone-800 px-2.5 py-1 rounded-md transition-colors"
                title="Copy Call Number"
              >
                {copiedCallNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{book.shelfLocation.callNumber}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-stone-800/80 p-2.5 rounded-lg">
                <span className="text-stone-400 block text-[10px] uppercase">Floor</span>
                <span className="font-bold text-white text-sm">Level {book.shelfLocation.floor}</span>
              </div>
              <div className="bg-stone-800/80 p-2.5 rounded-lg">
                <span className="text-stone-400 block text-[10px] uppercase">Section</span>
                <span className="font-bold text-white text-sm truncate">{book.shelfLocation.section}</span>
              </div>
              <div className="bg-stone-800/80 p-2.5 rounded-lg">
                <span className="text-stone-400 block text-[10px] uppercase">Shelf Row</span>
                <span className="font-bold text-emerald-400 text-sm">{book.shelfLocation.shelfNumber}</span>
              </div>
              <div className="bg-stone-800/80 p-2.5 rounded-lg">
                <span className="text-stone-400 block text-[10px] uppercase">Aisle</span>
                <span className="font-bold text-white text-sm truncate">{book.shelfLocation.aisleName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-stone-400 bg-stone-800/40 p-2.5 rounded-lg">
              <Navigation className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Directions:</strong> Take elevator to <strong>Floor {book.shelfLocation.floor}</strong>, locate{" "}
                <strong>{book.shelfLocation.section}</strong>, follow aisle markers to <strong>Shelf {book.shelfLocation.shelfNumber}</strong>.
              </span>
            </div>
          </div>

          {/* Reservation / Hold Section */}
          <div className="border-t border-stone-200 pt-5">
            <h3 className="text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Student Reservation & Pickup
            </h3>

            {isBorrowedByStudent ? (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="text-xs sm:text-sm text-blue-900">
                  <p className="font-semibold">You currently have this book checked out</p>
                  <p className="text-blue-700 text-xs mt-0.5">
                    Manage return date or renewal in your <strong>My Loans & Holds</strong> dashboard.
                  </p>
                </div>
              </div>
            ) : isReservedByStudent || justReserved ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Book Reserved Successfully!</span>
                </div>
                <p className="text-xs text-emerald-800">
                  Your reservation is active. You will be notified as soon as it is placed at the pickup desk.
                </p>
                <div className="bg-white p-3 rounded-lg border border-emerald-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase font-semibold">Pickup Ticket Code</span>
                    <span className="font-mono font-bold text-stone-900 text-sm">
                      {justReserved?.pickupPassCode || activeReservation?.pickupPassCode || "RES-HOLD-7712"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-stone-500 block text-[10px] uppercase font-semibold">Pickup Spot</span>
                    <span className="text-stone-800 font-medium">
                      {justReserved?.pickupLocation || activeReservation?.pickupLocation || selectedPickup}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReserveSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Select Your Preferred Pickup Station
                  </label>
                  <select
                    value={selectedPickup}
                    onChange={(e) => setSelectedPickup(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
                  >
                    <option value="Central Library Circulation Desk - 1st Floor">
                      Central Library Circulation Desk - 1st Floor (Staffed)
                    </option>
                    <option value="24/7 Smart Automated Locker #B4 - Library Foyer">
                      24/7 Smart Automated Locker #B4 - Library Foyer (Contactless)
                    </option>
                    <option value="Science & Engineering Annex - 2nd Floor">
                      Science & Engineering Annex - 2nd Floor (Quiet Wing)
                    </option>
                    <option value="Graduate Study Center Desk - 3rd Floor">
                      Graduate Study Center Desk - 3rd Floor
                    </option>
                  </select>
                </div>

                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1">
                  <div className="flex items-center gap-1.5 font-medium text-stone-700">
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                    <span>Reservation Hold Period: 5 Business Days</span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Once reserved, library staff will pull the copy and hold it for you. You will receive an email notice when ready.
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    {book.availableCopies > 0
                      ? "Reserve Book"
                      : "Join Hold Waitlist (Queue #1)"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddedToReadingList(true)}
                    className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    {addedToReadingList ? "Added to Reading List ✓" : "Add to Reading List"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Similar Books Section matching Screen 3 in image */}
          {similarBooks.length > 0 && (
            <div className="border-t border-stone-200 pt-5 space-y-3">
              <h3 className="text-sm font-bold text-stone-900 tracking-tight">Similar Books</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {similarBooks.map((simBook) => (
                  <div
                    key={simBook.id}
                    onClick={() => onSelectBook && onSelectBook(simBook)}
                    className="group cursor-pointer bg-stone-50 p-2 rounded-2xl border border-stone-200/80 hover:border-blue-400 transition-all text-left active:scale-[0.97]"
                  >
                    <div className="aspect-3/4 rounded-xl overflow-hidden shadow-xs mb-1.5 border border-stone-200/80">
                      <BookCoverImage
                        src={simBook.coverUrl}
                        title={simBook.title}
                        author={simBook.author}
                        category={simBook.category}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <div className="text-[11px] font-bold text-stone-900 line-clamp-1 group-hover:text-blue-600">
                      {simBook.title}
                    </div>
                    <div className="text-[10px] text-stone-500 truncate">{simBook.author}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
