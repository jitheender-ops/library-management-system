import React, { useState } from "react";
import { Book, Loan, Reservation, ReadingHistoryItem } from "../types";
import { BarcodeDisplay } from "./BarcodeDisplay";
import { BookCoverImage } from "./BookCoverImage";
import { formatDate, getDaysRemaining } from "../utils/barcode";
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  XCircle,
  QrCode,
  Star,
  MapPin,
  Bookmark,
  Check,
  Building,
  Flame,
  ChevronRight,
} from "lucide-react";

interface MyReservationsViewProps {
  loans: Loan[];
  reservations: Reservation[];
  readingHistory: ReadingHistoryItem[];
  catalog: Book[];
  onRenewLoan: (loanId: string) => void;
  onReturnLoan: (loanId: string) => void;
  onCancelReservation: (reservationId: string) => void;
  onSelectBook: (book: Book) => void;
  onNavigateToStreak?: () => void;
  currentStreak?: number;
  initialSubTab?: "loans" | "reservations" | "history";
}

const MyReservationsViewComponent: React.FC<MyReservationsViewProps> = ({
  loans,
  reservations,
  readingHistory,
  catalog,
  onRenewLoan,
  onReturnLoan,
  onCancelReservation,
  onSelectBook,
  onNavigateToStreak,
  currentStreak = 4,
  initialSubTab = "loans",
}) => {
  const [activeTab, setActiveTab] = useState<"loans" | "reservations" | "history">(initialSubTab);

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [selectedPickupTicket, setSelectedPickupTicket] = useState<Reservation | null>(null);
  const [renewNotification, setRenewNotification] = useState<string | null>(null);

  const getBook = (bookId: string) => catalog.find((b) => b.id === bookId);

  const urgentLoans = loans.filter((l) => {
    const days = getDaysRemaining(l.dueDate);
    return days < 3; // fewer than 3 days remaining before due date
  });

  const handleRenew = (loanId: string, title: string) => {
    onRenewLoan(loanId);
    setRenewNotification(`Successfully renewed "${title}" for +14 days!`);
    setTimeout(() => setRenewNotification(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "loans"}
            data-haptic="selection"
            onClick={() => setActiveTab("loans")}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "loans"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <span>Active Loans ({loans.length})</span>
            {urgentLoans.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                <span>{urgentLoans.length} Due Soon</span>
              </span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "reservations"}
            data-haptic="selection"
            onClick={() => setActiveTab("reservations")}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "reservations"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Holds & Reservations ({reservations.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "history"}
            data-haptic="selection"
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Reading History ({readingHistory.length})
          </button>
        </div>

        <div className="text-xs text-stone-500 font-medium">
          Borrowing Allowance: <strong className="text-stone-800">{loans.length} / 5</strong> books checked out
        </div>
      </div>

      {renewNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{renewNotification}</span>
        </div>
      )}

      {/* Reading Streak Quick Card */}
      {onNavigateToStreak && (
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900">
                  Daily Reading Streak: {currentStreak} Days
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                  Keep it going!
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Reading one of your borrowed books today? Snap & upload the front cover to count your streak.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateToStreak}
            className="px-3.5 py-1.5 bg-white hover:bg-orange-50 text-orange-700 border border-orange-300 rounded-xl text-xs font-bold shrink-0 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>Log Front Photo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tab 1: Active Loans */}
      {activeTab === "loans" && (
        <div className="space-y-4">
          {/* Visual Warning Banner for loans with fewer than 3 days remaining */}
          {urgentLoans.length > 0 && (
            <div className="p-4 bg-amber-50/90 border-2 border-amber-400/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <AlertTriangle className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-amber-950">
                      Due Date Alert: {urgentLoans.length} {urgentLoans.length === 1 ? "Book has" : "Books have"} fewer than 3 days remaining!
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300 uppercase tracking-wide">
                      Warning
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Loans highlighted in amber require immediate attention. Renew now to add +14 days or drop off at any library return kiosk.
                  </p>
                </div>
              </div>
              {urgentLoans.some((l) => l.renewalCount < l.maxRenewals) && (
                <button
                  onClick={() => {
                    urgentLoans.forEach((l) => {
                      if (l.renewalCount < l.maxRenewals) {
                        onRenewLoan(l.id);
                      }
                    });
                    setRenewNotification(`Renewed ${urgentLoans.filter((l) => l.renewalCount < l.maxRenewals).length} urgent loan(s) for +14 days!`);
                    setTimeout(() => setRenewNotification(null), 3500);
                  }}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-xs flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Renew All Urgent (+14 Days)</span>
                </button>
              )}
            </div>
          )}

          {loans.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
              <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-stone-800">No Books Currently Checked Out</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Explore the library catalog to find books for your courses and research.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loans.map((loan) => {
                const book = getBook(loan.bookId);
                const daysLeft = getDaysRemaining(loan.dueDate);
                const isUrgent = daysLeft < 3 && daysLeft >= 0; // fewer than 3 days remaining
                const isOverdue = daysLeft < 0;

                const cardBackground = isOverdue
                  ? "bg-gradient-to-br from-rose-50/95 via-rose-50/60 to-red-50/30 border-2 border-red-400 ring-2 ring-red-400/20 shadow-md"
                  : isUrgent
                  ? "bg-gradient-to-br from-amber-50/95 via-amber-50/60 to-orange-50/30 border-2 border-amber-400 ring-2 ring-amber-400/30 shadow-md"
                  : "bg-white border border-stone-200 shadow-xs hover:border-stone-300";

                return (
                  <div
                    key={loan.id}
                    className={`${cardBackground} rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all relative overflow-hidden`}
                  >
                    {/* Top Alert Accent Stripe */}
                    {isUrgent && (
                      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400" />
                    )}
                    {isOverdue && (
                      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-500 to-rose-600" />
                    )}

                    <div>
                      {/* Warning Badges Header */}
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                        {isOverdue ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-red-600 text-white shadow-xs">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>OVERDUE BY {Math.abs(daysLeft)} {Math.abs(daysLeft) === 1 ? "DAY" : "DAYS"}</span>
                          </span>
                        ) : isUrgent ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500 text-white shadow-xs animate-pulse">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>
                                {daysLeft === 0
                                  ? "DUE TODAY"
                                  : daysLeft === 1
                                  ? "DUE TOMORROW (1 DAY LEFT)"
                                  : `DUE IN ${daysLeft} DAYS`}
                              </span>
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-950 border border-amber-300 uppercase tracking-wide">
                              &lt; 3 Days Left
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Check className="w-3 h-3" />
                            <span>On Loan ({daysLeft} days left)</span>
                          </span>
                        )}

                        {isUrgent && (
                          <span className="text-[11px] font-bold text-amber-900 bg-amber-100/90 border border-amber-200 px-2 py-0.5 rounded-full">
                            Warning: Return Soon
                          </span>
                        )}
                      </div>

                      <div className="flex gap-4">
                        {book && (
                          <div
                            className={`relative w-16 h-22 shrink-0 rounded-xl overflow-hidden border shadow-sm cursor-pointer hover:opacity-90 active:scale-95 transition-transform ${
                              isUrgent
                                ? "border-amber-400 shadow-amber-200/50"
                                : isOverdue
                                ? "border-red-400 shadow-red-200/50"
                                : "border-stone-200"
                            }`}
                            onClick={() => onSelectBook(book)}
                          >
                            <BookCoverImage
                              src={book.coverUrl}
                              title={book.title}
                              author={book.author}
                              category={book.category}
                              className="w-full h-full"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4
                            onClick={() => book && onSelectBook(book)}
                            className="text-sm font-bold text-stone-900 truncate hover:text-emerald-700 cursor-pointer"
                          >
                            {book ? book.title : "Library Book"}
                          </h4>
                          <p className="text-xs text-stone-600 truncate">
                            {book ? `by ${book.author}` : ""}
                          </p>

                          <div className="mt-2 text-[11px] text-stone-500 font-mono flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            <span>Call No: {loan.callNumber}</span>
                          </div>
                        </div>
                      </div>

                      {/* Warning Alert Note inside the card */}
                      {isUrgent && (
                        <div className="mt-3 bg-amber-100/90 border border-amber-300/80 rounded-xl p-2.5 flex items-start gap-2 text-xs text-amber-950">
                          <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <p className="font-bold">Fewer than 3 days remaining on loan!</p>
                            <p className="text-amber-800 text-[11px] leading-snug">
                              Renew now (+14 days) or return at a kiosk before the due date to avoid late fines ($0.50/day).
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div
                      className={`p-3 rounded-xl text-xs space-y-1.5 border ${
                        isUrgent
                          ? "bg-amber-100/70 border-amber-300/80 text-amber-950"
                          : isOverdue
                          ? "bg-red-100/70 border-red-300/80 text-red-950"
                          : "bg-stone-50 border-stone-200/80 text-stone-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={isUrgent ? "text-amber-900 font-medium" : ""}>Due Date:</span>
                        <strong
                          className={
                            isUrgent
                              ? "text-amber-950 font-bold"
                              : isOverdue
                              ? "text-red-700 font-bold"
                              : "text-stone-900 font-semibold"
                          }
                        >
                          {formatDate(loan.dueDate)} ({daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d remaining`})
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={isUrgent ? "text-amber-900 font-medium" : ""}>Renewals:</span>
                        <span className={loan.renewalCount >= loan.maxRenewals ? "text-amber-800 font-bold" : ""}>
                          {loan.renewalCount} of {loan.maxRenewals} used
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleRenew(loan.id, book?.title || "Book")}
                        disabled={loan.renewalCount >= loan.maxRenewals}
                        className={`flex-1 py-2 px-3 disabled:opacity-50 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                          isUrgent && loan.renewalCount < loan.maxRenewals
                            ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                            : "bg-stone-100 hover:bg-stone-200 text-stone-800"
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Renew (+14 Days)</span>
                      </button>
                      <button
                        onClick={() => onReturnLoan(loan.id)}
                        className={`py-2 px-3 font-semibold text-xs rounded-xl transition-colors ${
                          isUrgent
                            ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300/80"
                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800"
                        }`}
                        title="Simulate self-checkout kiosk dropoff return"
                      >
                        Return at Kiosk
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Holds & Reservations */}
      {activeTab === "reservations" && (
        <div className="space-y-4">
          {reservations.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
              <Bookmark className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-stone-800">No Active Holds or Reservations</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                When you reserve a book from the catalog, you can track its queue position and pickup pass here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservations.map((res) => {
                const book = getBook(res.bookId);

                return (
                  <div
                    key={res.id}
                    className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-stone-300 transition-colors"
                  >
                    <div className="flex gap-4">
                      {book && (
                        <div
                          className="relative w-16 h-22 shrink-0 rounded-xl overflow-hidden border border-stone-200/90 shadow-sm cursor-pointer hover:opacity-90 active:scale-95 transition-transform"
                          onClick={() => onSelectBook(book)}
                        >
                          <BookCoverImage
                            src={book.coverUrl}
                            title={book.title}
                            author={book.author}
                            category={book.category}
                            className="w-full h-full"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                            Queue: {res.queuePosition} / 5
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              res.queuePosition === 0 || res.status === "ready"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-amber-100 text-amber-800 border border-amber-300"
                            }`}
                          >
                            {res.queuePosition === 0 || res.status === "ready"
                              ? "Your Turn"
                              : "In Queue"}
                          </span>
                        </div>

                        <h4
                          onClick={() => book && onSelectBook(book)}
                          className="text-sm font-bold text-stone-900 truncate hover:text-emerald-700 cursor-pointer"
                        >
                          {book ? book.title : "Library Book"}
                        </h4>
                        <p className="text-xs text-stone-600 truncate">
                          {book ? `by ${book.author}` : ""}
                        </p>
                        <p className="text-[11px] text-stone-500 mt-1">
                          Reserved on: {formatDate(res.reservedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80 text-xs space-y-1.5">
                      <div className="flex items-start gap-1.5 text-stone-700">
                        <Building className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{res.pickupLocation}</span>
                      </div>
                      <div className="flex items-center justify-between text-stone-600 pt-1 border-t border-stone-200/60">
                        <span>Pickup Pass:</span>
                        <strong className="font-mono text-emerald-800">{res.pickupPassCode}</strong>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setSelectedPickupTicket(res)}
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View Pickup Pass</span>
                      </button>
                      <button
                        onClick={() => onCancelReservation(res.id)}
                        className="py-2 px-3 bg-stone-100 hover:bg-red-50 hover:text-red-700 text-stone-600 font-semibold text-xs rounded-xl transition-colors"
                        title="Cancel hold"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Reading History */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {readingHistory.map((item) => {
              const book = getBook(item.bookId);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span>Completed {formatDate(item.completedAt)}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-stone-900 leading-snug">{item.title}</h4>
                    <p className="text-xs text-stone-600 mt-0.5">by {item.author}</p>
                  </div>

                  <div className="flex items-center text-amber-500 gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < item.rating ? "fill-amber-400 text-amber-400" : "text-stone-200"
                        }`}
                      />
                    ))}
                  </div>

                  {item.notes && (
                    <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200/70 text-[11px] text-stone-600 italic">
                      "{item.notes}"
                    </div>
                  )}

                  {book && (
                    <button
                      onClick={() => onSelectBook(book)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      View in Catalog →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal for Pickup Barcode Pass */}
      {selectedPickupTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-stone-200 space-y-4 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <QrCode className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-stone-900">Digital Pickup Pass</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Scan this barcode at the circulation desk or automated locker
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
              <p className="text-[11px] text-stone-500 uppercase font-semibold mb-2">Reservation Pass Code</p>
              <BarcodeDisplay value={selectedPickupTicket.pickupPassCode} showText={true} className="w-full justify-center" />
            </div>

            <div className="text-xs text-left bg-stone-50 p-3 rounded-lg border border-stone-200 space-y-1">
              <p className="text-stone-600">
                <strong>Pickup Location:</strong> {selectedPickupTicket.pickupLocation}
              </p>
              <p className="text-stone-600">
                <strong>Hold Deadline:</strong> {formatDate(selectedPickupTicket.pickupDeadline)}
              </p>
            </div>

            <button
              onClick={() => setSelectedPickupTicket(null)}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const MyReservationsView = React.memo(MyReservationsViewComponent);
