export type BookCategory =
  | "Computer Science & AI"
  | "Software Engineering"
  | "Data Science & Mathematics"
  | "Physics & Natural Science"
  | "Psychology & Neuroscience"
  | "Philosophy & Ethics"
  | "Literature & Fiction"
  | "Design & Architecture";

export interface ShelfLocation {
  floor: number;
  section: string;
  shelfNumber: string;
  callNumber: string;
  aisleName: string;
}

export interface Book {
  id: string;
  isbn: string;
  barcode: string;
  title: string;
  author: string;
  category: BookCategory;
  tags: string[];
  coverUrl: string;
  description: string;
  rating: number;
  pages: number;
  year: number;
  publisher: string;
  edition?: string;
  shelfLocation: ShelfLocation;
  totalCopies: number;
  availableCopies: number;
  format: "Hardcover" | "Paperback" | "E-Book" | "Reserve Reference";
  popularityScore: number;
  language: string;
}

export type ReservationStatus = "ready" | "pending" | "expired" | "cancelled" | "fulfilled";

export interface Reservation {
  id: string;
  bookId: string;
  studentId: string;
  studentName: string;
  reservedAt: string;
  status: ReservationStatus;
  pickupLocation: string;
  pickupDeadline: string;
  queuePosition: number;
  pickupPassCode: string;
}

export type LoanStatus = "active" | "due-soon" | "overdue" | "returned";

export interface Loan {
  id: string;
  bookId: string;
  studentId: string;
  studentName: string;
  borrowedAt: string;
  dueDate: string;
  status: LoanStatus;
  renewalCount: number;
  maxRenewals: number;
  callNumber: string;
}

export interface ReadingHistoryItem {
  id: string;
  bookId: string;
  title: string;
  author: string;
  category: string;
  completedAt: string;
  rating: number;
  notes?: string;
}

export interface StudentProfile {
  id: string;
  studentNumber: string;
  name: string;
  email: string;
  major: string;
  department: string;
  yearLevel: string;
  readingInterests: string[];
  maxLoansLimit: number;
  avatarUrl: string;
  libraryBarcode: string;
  joinedDate: string;
}

export interface BookRecommendation {
  bookId?: string | null;
  title: string;
  author: string;
  category?: string;
  matchScore: number;
  reasoning: string;
  keyTakeaways?: string[];
  suggestedNextSteps?: string;
  inCatalog?: boolean;
}

export interface ReadingStreakCheckIn {
  id: string;
  bookId?: string;
  bookTitle: string;
  bookAuthor: string;
  coverPhotoUrl: string;
  pagesRead: number;
  readingDurationMinutes?: number;
  reflectionNotes?: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO string
  verified: boolean;
}

export interface ReadingStreakData {
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  lastCheckInDate: string; // YYYY-MM-DD
  streakGoal: number;
  dailyGoalMinutes?: number; // Daily reading time goal in minutes
  totalHoursRead: number;
  totalPagesRead: number;
  history: ReadingStreakCheckIn[];
}

export interface LibraryNotification {
  id: string;
  type: "due-date" | "return" | "reservation" | "fine" | "new-book";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  bookId?: string;
  actionText?: string;
}

export interface FineTransaction {
  id: string;
  type: "fine" | "payment";
  title: string;
  bookTitle?: string;
  date: string;
  amount: number;
  status: "paid" | "pending";
}

export interface LibraryFineSummary {
  totalDue: number;
  overdueCount: number;
  bookFines: number;
  lostDamagedFines: number;
  otherCharges: number;
  transactions: FineTransaction[];
}

export interface AdminCirculationStats {
  totalBooks: number;
  availableBooks: number;
  issuedBooks: number;
  reservedBooks: number;
}
