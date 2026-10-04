import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { haptic, initGlobalHapticFeedback } from "./utils/haptics";
import {
  INITIAL_BOOKS,
  INITIAL_STUDENT,
  INITIAL_LOANS,
  INITIAL_RESERVATIONS,
  INITIAL_READING_HISTORY,
  INITIAL_STREAK_DATA,
  INITIAL_NOTIFICATIONS,
  INITIAL_FINE_SUMMARY,
  INITIAL_ADMIN_STATS,
} from "./data/initialData";
import {
  Book,
  Loan,
  Reservation,
  ReadingHistoryItem,
  StudentProfile,
  ReadingStreakData,
  ReadingStreakCheckIn,
  LibraryNotification,
  LibraryFineSummary,
  AdminCirculationStats,
} from "./types";
import { getDaysRemaining } from "./utils/barcode";
import { toLocalDateStr } from "./utils/date";
import { usePersistedState } from "./hooks/usePersistedState";
import { Header, ScreenId } from "./components/Header";
import { MobileBottomBar } from "./components/MobileBottomBar";
import { HomeDashboardView } from "./components/HomeDashboardView";
import { SearchBooksView } from "./components/SearchBooksView";
import { MyReservationsView } from "./components/MyReservationsView";
import { NotificationsView } from "./components/NotificationsView";
import { FinesPaymentsView } from "./components/FinesPaymentsView";
import { ScanBookView } from "./components/ScanBookView";
import { StudentProfileView } from "./components/StudentProfileView";
import { AdminDashboardView } from "./components/AdminDashboardView";
import { RecommendationsView } from "./components/RecommendationsView";
import { StreakView } from "./components/StreakView";
import { BookDetailModal } from "./components/BookDetailModal";
import { BarcodeScannerModal } from "./components/BarcodeScannerModal";
import { StudentCardModal } from "./components/StudentCardModal";
import { ToastBanner } from "./components/ToastBanner";
import { AiFeaturesBanner } from "./components/AiFeaturesBanner";
import { FloatingSectionNavigator } from "./components/FloatingSectionNavigator";
import { IPhoneProMaxShell } from "./components/IPhoneProMaxShell";
import { SideSectionNavigation } from "./components/SideSectionNavigation";
import { SECTIONS_METADATA } from "./components/Header";

export default function App() {
  const [catalog, setCatalog] = usePersistedState<Book[]>("catalog", INITIAL_BOOKS);
  const [student, setStudent] = usePersistedState<StudentProfile>("student", INITIAL_STUDENT);
  const [loans, setLoans] = usePersistedState<Loan[]>("loans", INITIAL_LOANS);
  const [reservations, setReservations] = usePersistedState<Reservation[]>("reservations", INITIAL_RESERVATIONS);
  const [readingHistory, setReadingHistory] = usePersistedState<ReadingHistoryItem[]>("history", INITIAL_READING_HISTORY);
  const [streakData, setStreakData] = usePersistedState<ReadingStreakData>("streak", INITIAL_STREAK_DATA);
  const [notifications, setNotifications] = usePersistedState<LibraryNotification[]>("notifications", INITIAL_NOTIFICATIONS);
  const [fineSummary, setFineSummary] = usePersistedState<LibraryFineSummary>("fines", INITIAL_FINE_SUMMARY);
  const [adminStats, setAdminStats] = useState<AdminCirculationStats>(INITIAL_ADMIN_STATS);

  // Screen selection & Left Side Section state
  const [activeScreen, setActiveScreen] = useState<ScreenId>("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState("");

  // Optional keyboard navigation (Left/Right arrow keys when not typing) and Global Haptics initialization
  useEffect(() => {
    const cleanupHaptics = initGlobalHapticFeedback();

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") return;

      if (e.key === "ArrowLeft") {
        const curIdx = SECTIONS_METADATA.findIndex((s) => s.id === activeScreen);
        if (curIdx > 0) {
          haptic.selection();
          setActiveScreen(SECTIONS_METADATA[curIdx - 1].id);
        }
      } else if (e.key === "ArrowRight") {
        const curIdx = SECTIONS_METADATA.findIndex((s) => s.id === activeScreen);
        if (curIdx < SECTIONS_METADATA.length - 1) {
          haptic.selection();
          setActiveScreen(SECTIONS_METADATA[curIdx + 1].id);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      cleanupHaptics();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeScreen]);

  // Modals
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [studentCardOpen, setStudentCardOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    haptic.light();
    setToastMessage(msg);
    // Reset any pending timer so an older toast can't dismiss a newer one early
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 4000);
  }, []);
  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  // Sets for rapid lookups
  const reservedBookIds = useMemo(
    () => new Set(reservations.map((r) => r.bookId)),
    [reservations]
  );
  const borrowedBookIds = useMemo(
    () => new Set(loans.map((l) => l.bookId)),
    [loans]
  );
  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // iOS Live Activity timer state
  const [isReadingTimerActive, setIsReadingTimerActive] = useState<boolean>(false);
  const [readingTimerSeconds, setReadingTimerSeconds] = useState<number>(0);

  const handleTimerTick = useCallback((seconds: number, isRunning: boolean) => {
    setReadingTimerSeconds(seconds);
    setIsReadingTimerActive(isRunning);
  }, []);

  const todayStr = toLocalDateStr();
  const todayMinutesRead = useMemo(() => {
    return streakData.history
      .filter((h) => h.date === todayStr)
      .reduce((acc, h) => acc + (h.readingDurationMinutes || 0), 0);
  }, [streakData.history, todayStr]);

  // Reserve a book action
  const handleReserve = useCallback((bookId: string, pickupLocation: string): Reservation | null => {
    const book = catalog.find((b) => b.id === bookId);
    if (!book) return null;

    if (reservedBookIds.has(bookId)) {
      haptic.warning();
      showToast(`You already have an active hold on "${book.title}".`);
      return null;
    }

    haptic.medium();
    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      bookId,
      studentId: student.id,
      studentName: student.name,
      reservedAt: new Date().toISOString(),
      status: book.availableCopies > 0 ? "ready" : "pending",
      pickupLocation,
      pickupDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      queuePosition: book.availableCopies > 0 ? 1 : 2,
      pickupPassCode: `RES-${book.barcode.slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setReservations((prev) => [newReservation, ...prev]);

    // If available copy was present, hold it
    if (book.availableCopies > 0) {
      setCatalog((prev) =>
        prev.map((b) =>
          b.id === bookId ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) } : b
        )
      );
    }

    showToast(`Reservation confirmed for "${book.title}"! Check Reservations screen.`);
    return newReservation;
  }, [catalog, reservedBookIds, student.id, student.name]);

  // Renew loan
  const handleRenewLoan = useCallback((loanId: string) => {
    haptic.medium();
    setLoans((prev) =>
      prev.map((loan) => {
        if (loan.id === loanId && loan.renewalCount < loan.maxRenewals) {
          const currentDue = new Date(loan.dueDate).getTime();
          const extendedDue = new Date(currentDue + 14 * 24 * 60 * 60 * 1000).toISOString();
          return {
            ...loan,
            dueDate: extendedDue,
            renewalCount: loan.renewalCount + 1,
            status: "active",
          };
        }
        return loan;
      })
    );
    showToast("Loan renewed successfully for +14 days!");
  }, []);

  // Return loan
  const handleReturnLoan = useCallback((loanId: string) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan) return;

    const book = catalog.find((b) => b.id === targetLoan.bookId);

    haptic.success();
    setLoans((prev) => prev.filter((l) => l.id !== loanId));

    if (book) {
      setCatalog((prev) =>
        prev.map((b) =>
          b.id === book.id ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) } : b
        )
      );

      const newHistory: ReadingHistoryItem = {
        id: `hist-${Date.now()}`,
        bookId: book.id,
        title: book.title,
        author: book.author,
        category: book.category,
        completedAt: toLocalDateStr(),
        rating: 5,
        notes: `Returned on ${new Date().toLocaleDateString()}. Completed loan.`,
      };
      setReadingHistory((prev) => [newHistory, ...prev]);
    }

    showToast(`Returned "${book?.title || "Book"}" successfully to library.`);
  }, [loans, catalog]);

  // Cancel reservation
  const handleCancelReservation = useCallback((resId: string) => {
    const targetRes = reservations.find((r) => r.id === resId);
    if (!targetRes) return;

    haptic.light();
    const book = catalog.find((b) => b.id === targetRes.bookId);
    setReservations((prev) => prev.filter((r) => r.id !== resId));

    if (book && targetRes.status === "ready") {
      setCatalog((prev) =>
        prev.map((b) =>
          b.id === book.id ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) } : b
        )
      );
    }

    showToast(`Reservation cancelled.`);
  }, [reservations, catalog]);

  // Quick Check-out via Scanner
  const handleCheckOutBook = useCallback((book: Book) => {
    if (borrowedBookIds.has(book.id)) {
      haptic.warning();
      showToast(`You already have "${book.title}" borrowed.`);
      return;
    }

    haptic.success();
    const newLoan: Loan = {
      id: `ln-${Date.now()}`,
      bookId: book.id,
      studentId: student.id,
      studentName: student.name,
      borrowedAt: toLocalDateStr(),
      dueDate: toLocalDateStr(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
      status: "active",
      renewalCount: 0,
      maxRenewals: 2,
      callNumber: book.shelfLocation.callNumber,
    };

    setLoans((prev) => [newLoan, ...prev]);
    setCatalog((prev) =>
      prev.map((b) =>
        b.id === book.id ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) } : b
      )
    );
    showToast(`Successfully checked out "${book.title}"! Due in 14 days.`);
  }, [borrowedBookIds, student.id, student.name]);

  // Quick Check-in via Scanner
  const handleCheckInBook = useCallback((book: Book) => {
    const activeLoan = loans.find((l) => l.bookId === book.id);
    if (activeLoan) {
      handleReturnLoan(activeLoan.id);
    } else {
      haptic.success();
      showToast(`Book "${book.title}" checked in and restocked to shelf ${book.shelfLocation.shelfNumber}.`);
    }
  }, [loans, handleReturnLoan]);

  // Pay fines action
  const handlePayFines = useCallback((amount: number, method: string) => {
    haptic.success();
    setFineSummary((prev) => ({
      ...prev,
      totalDue: 0,
      overdueCount: 0,
      bookFines: 0,
      lostDamagedFines: 0,
      otherCharges: 0,
      transactions: [
        {
          id: `tx-${Date.now()}`,
          type: "payment",
          title: `Online Payment via ${method.toUpperCase()}`,
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          amount,
          status: "paid",
        },
        ...prev.transactions.map((t) => (t.status === "pending" ? { ...t, status: "paid" as const } : t)),
      ],
    }));

    showToast(`Payment of ₹${amount.toFixed(2)} successful! All fines cleared.`);
  }, []);

  // Notifications
  const handleMarkAsRead = useCallback((id: string) => {
    haptic.light();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    haptic.medium();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast("All notifications marked as read.");
  }, []);

  // Reading Streak Check-in
  const handleLogStreakCheckIn = useCallback((
    newCheckIn: Omit<ReadingStreakCheckIn, "id" | "timestamp" | "verified">
  ) => {
    haptic.success();
    const todayStr = toLocalDateStr();
    const isAlreadyLoggedToday = streakData.lastCheckInDate === todayStr;

    const fullCheckIn: ReadingStreakCheckIn = {
      ...newCheckIn,
      id: `chk-${Date.now()}`,
      timestamp: new Date().toISOString(),
      verified: true,
    };

    const nextStreak = isAlreadyLoggedToday
      ? streakData.currentStreak
      : streakData.currentStreak + 1;

    const nextLongest = Math.max(streakData.longestStreak, nextStreak);

    setStreakData((prev) => ({
      ...prev,
      currentStreak: nextStreak,
      longestStreak: nextLongest,
      totalCheckIns: prev.totalCheckIns + 1,
      lastCheckInDate: todayStr,
      totalPagesRead: prev.totalPagesRead + fullCheckIn.pagesRead,
      totalHoursRead:
        Math.round(
          (prev.totalHoursRead + (fullCheckIn.readingDurationMinutes || 30) / 60) * 10
        ) / 10,
      history: [fullCheckIn, ...prev.history],
    }));

    showToast(
      isAlreadyLoggedToday
        ? `Reading session recorded for "${fullCheckIn.bookTitle}"! Current streak: ${streakData.currentStreak}d.`
        : `🔥 Front book photo verified! Reading streak increased to ${nextStreak} days!`
    );
  }, [streakData.lastCheckInDate, streakData.currentStreak, streakData.longestStreak]);

  // Daily Reading Goal Handlers
  const handleUpdateDailyGoal = useCallback((newGoalMinutes: number) => {
    haptic.medium();
    setStreakData((prev) => ({
      ...prev,
      dailyGoalMinutes: newGoalMinutes,
    }));
    showToast(`Daily reading goal set to ${newGoalMinutes} minutes!`);
  }, []);

  const handleQuickAddReadingTime = useCallback((addedMinutes: number) => {
    haptic.medium();
    const todayStr = toLocalDateStr();
    const isAlreadyLoggedToday = streakData.lastCheckInDate === todayStr;
    const nextStreak = isAlreadyLoggedToday ? streakData.currentStreak : streakData.currentStreak + 1;
    const nextLongest = Math.max(streakData.longestStreak, nextStreak);

    const activeBook = loans[0]
      ? catalog.find((b) => b.id === loans[0].bookId)
      : catalog[0];

    const quickEntry: ReadingStreakCheckIn = {
      id: `chk-${Date.now()}`,
      bookTitle: activeBook?.title || "Daily Study Session",
      bookAuthor: activeBook?.author || "University Scholar",
      coverPhotoUrl: activeBook?.coverUrl || "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg",
      pagesRead: Math.max(1, Math.round(addedMinutes * 0.8)),
      readingDurationMinutes: addedMinutes,
      date: todayStr,
      timestamp: new Date().toISOString(),
      verified: true,
      reflectionNotes: `Quick-logged ${addedMinutes}m toward today's reading goal.`,
    };

    setStreakData((prev) => ({
      ...prev,
      currentStreak: nextStreak,
      longestStreak: nextLongest,
      totalCheckIns: prev.totalCheckIns + 1,
      lastCheckInDate: todayStr,
      totalHoursRead: Math.round((prev.totalHoursRead + addedMinutes / 60) * 10) / 10,
      totalPagesRead: prev.totalPagesRead + quickEntry.pagesRead,
      history: [quickEntry, ...prev.history],
    }));

    showToast(`Logged ${addedMinutes}m toward your daily reading goal!`);
  }, [streakData.lastCheckInDate, streakData.currentStreak, streakData.longestStreak, loans, catalog]);

  // Reset all persisted demo data back to the initial dataset
  const handleResetData = useCallback(() => {
    if (!window.confirm("Reset all saved data (loans, reservations, streaks, fines)?")) return;
    try {
      Object.keys(window.localStorage)
        .filter((k) => k.startsWith("lms:"))
        .forEach((k) => window.localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
    window.location.reload();
  }, []);

  // Quick navigation
  const handleNavigate = useCallback((screen: string) => {
    haptic.selection();
    setActiveScreen(screen as ScreenId);
  }, []);

  const handleQuickSearch = useCallback((query: string) => {
    haptic.selection();
    setSearchInitialQuery(query);
    setActiveScreen("search");
  }, []);

  // Render the active view content
  const renderScreenContent = () => {
    switch (activeScreen) {
      case "home":
        return (
          <HomeDashboardView
            student={student}
            availableBooks={catalog.filter((b) => b.availableCopies > 0)}
            loans={loans}
            reservations={reservations}
            currentStreak={streakData.currentStreak}
            onSelectBook={(b) => setSelectedBook(b)}
            onNavigate={handleNavigate}
            onQuickSearch={handleQuickSearch}
          />
        );

      case "search":
        return (
          <SearchBooksView
            catalog={catalog}
            onSelectBook={(b) => setSelectedBook(b)}
            initialQuery={searchInitialQuery}
          />
        );

      case "borrowed":
        return (
          <MyReservationsView
            loans={loans}
            reservations={reservations}
            readingHistory={readingHistory}
            catalog={catalog}
            onRenewLoan={handleRenewLoan}
            onReturnLoan={handleReturnLoan}
            onCancelReservation={handleCancelReservation}
            onSelectBook={(b) => setSelectedBook(b)}
            onNavigateToStreak={() => setActiveScreen("streak")}
            currentStreak={streakData.currentStreak}
            initialSubTab="loans"
          />
        );

      case "reservations":
        return (
          <MyReservationsView
            loans={loans}
            reservations={reservations}
            readingHistory={readingHistory}
            catalog={catalog}
            onRenewLoan={handleRenewLoan}
            onReturnLoan={handleReturnLoan}
            onCancelReservation={handleCancelReservation}
            onSelectBook={(b) => setSelectedBook(b)}
            onNavigateToStreak={() => setActiveScreen("streak")}
            currentStreak={streakData.currentStreak}
            initialSubTab="reservations"
          />
        );

      case "notifications":
        return (
          <NotificationsView
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onNavigate={handleNavigate}
          />
        );

      case "fines":
        return (
          <FinesPaymentsView
            fineSummary={fineSummary}
            onPayFines={handlePayFines}
          />
        );

      case "scan":
        return (
          <ScanBookView
            catalog={catalog}
            onSelectBook={(b) => setSelectedBook(b)}
            onCheckOutBook={handleCheckOutBook}
            onCheckInBook={handleCheckInBook}
            onOpenCamera={() => setScannerOpen(true)}
          />
        );

      case "profile":
        return (
          <StudentProfileView
            student={student}
            loans={loans}
            reservations={reservations}
            readingHistory={readingHistory}
            currentStreak={streakData.currentStreak}
            onNavigate={handleNavigate}
            onOpenStudentCard={() => setStudentCardOpen(true)}
            onResetData={handleResetData}
          />
        );

      case "admin":
        return (
          <AdminDashboardView
            stats={adminStats}
            catalog={catalog}
            onNavigate={handleNavigate}
          />
        );

      case "streak":
        return (
          <StreakView
            streakData={streakData}
            loans={loans}
            catalog={catalog}
            onLogCheckIn={handleLogStreakCheckIn}
            onSelectBook={(b) => setSelectedBook(b)}
            onUpdateDailyGoal={handleUpdateDailyGoal}
            onQuickAddReadingMinutes={handleQuickAddReadingTime}
            onTimerTick={handleTimerTick}
          />
        );

      case "ai-advisor":
        return (
          <RecommendationsView
            student={student}
            catalog={catalog}
            onUpdateInterests={(topics) => {
              setStudent((prev) => ({ ...prev, readingInterests: topics }));
              showToast(`Updated reading interests profile.`);
            }}
            onSelectBook={(b) => setSelectedBook(b)}
            onReserveBookId={(bookId) => {
              const b = catalog.find((x) => x.id === bookId);
              if (b) setSelectedBook(b);
            }}
            reservedBookIds={reservedBookIds}
          />
        );

      default:
        return null;
    }
  };

  return (
    <IPhoneProMaxShell
      activeScreen={activeScreen}
      onNavigate={handleNavigate}
      isReadingTimerActive={isReadingTimerActive}
      readingTimerSeconds={readingTimerSeconds}
      dailyGoalMinutes={streakData.dailyGoalMinutes || 30}
      todayMinutesRead={todayMinutesRead}
    >
      <div className="min-h-full flex flex-col font-sans selection:bg-blue-200">
        {/* Top Header */}
        <Header
          activeScreen={activeScreen}
          onScreenChange={(s) => {
            setActiveScreen(s);
            if (s !== "search") setSearchInitialQuery("");
          }}
          student={student}
          activeLoansCount={loans.length}
          activeReservationsCount={reservations.length}
          unreadNotificationsCount={unreadNotificationsCount}
          finesTotal={fineSummary.totalDue}
          currentStreak={streakData.currentStreak}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* Unified Left Side Section Drawer (Lists all 11 sections with clarity) */}
        <SideSectionNavigation
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeScreen={activeScreen}
          onSelectScreen={(s) => {
            setActiveScreen(s);
            if (s !== "search") setSearchInitialQuery("");
            setIsSidebarOpen(false);
          }}
          student={student}
          activeLoansCount={loans.length}
          activeReservationsCount={reservations.length}
          unreadNotificationsCount={unreadNotificationsCount}
          finesTotal={fineSummary.totalDue}
          currentStreak={streakData.currentStreak}
          onOpenStudentCard={() => {
            setIsSidebarOpen(false);
            setStudentCardOpen(true);
          }}
        />

        {/* Main View Area (Mobile-First iOS Responsive Layout) */}
        <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-5 py-3 sm:py-5 pb-24 sm:pb-16 space-y-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-7 border border-stone-200/90 shadow-xs">
            {renderScreenContent()}
          </div>

          {/* Bottom AI Features Banner (Displayed on Home view) */}
          {activeScreen === "home" && (
            <AiFeaturesBanner
              catalog={catalog}
              onSelectBook={(b) => setSelectedBook(b)}
              onNavigate={handleNavigate}
              onQuickQuery={handleQuickSearch}
            />
          )}
        </main>

        {/* Native Sticky Mobile Bottom Navigation Bar (Visible on mobile screens < 640px) */}
        <MobileBottomBar
          activeScreen={activeScreen}
          onScreenChange={(s) => {
            setActiveScreen(s);
            if (s !== "search") setSearchInitialQuery("");
          }}
          activeLoansCount={loans.length}
          unreadNotificationsCount={unreadNotificationsCount}
          finesTotal={fineSummary.totalDue}
          currentStreak={streakData.currentStreak}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />

        {/* Book Detail & Reservation Modal matching Screen 3 in image */}
        <BookDetailModal
          book={selectedBook}
          isOpen={Boolean(selectedBook)}
          onClose={() => setSelectedBook(null)}
          onReserve={handleReserve}
          isReservedByStudent={Boolean(selectedBook && reservedBookIds.has(selectedBook.id))}
          isBorrowedByStudent={Boolean(selectedBook && borrowedBookIds.has(selectedBook.id))}
          activeReservation={reservations.find((r) => r.bookId === selectedBook?.id)}
          catalog={catalog}
          onSelectBook={(b) => setSelectedBook(b)}
        />

        {/* Barcode Camera Scanner Modal */}
        <BarcodeScannerModal
          isOpen={scannerOpen}
          onClose={() => setScannerOpen(false)}
          catalog={catalog}
          onSelectBook={(b) => setSelectedBook(b)}
        />

        {/* Digital Student Library Card Modal */}
        <StudentCardModal
          student={student}
          isOpen={studentCardOpen}
          onClose={() => setStudentCardOpen(false)}
          activeLoansCount={loans.length}
        />

        {/* Floating Section Tool: Quick jump to Left / Right Section from anywhere */}
        <FloatingSectionNavigator
          activeScreen={activeScreen}
          onScreenChange={setActiveScreen}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />

        {/* Toast notifications */}
        {toastMessage && <ToastBanner message={toastMessage} onClose={() => setToastMessage(null)} />}
      </div>
    </IPhoneProMaxShell>
  );
}
